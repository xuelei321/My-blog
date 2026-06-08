import { ref, onMounted, onUnmounted } from 'vue'

interface LazyImageOptions {
  rootMargin?: string
  threshold?: number
  placeholder?: string
}

/**
 * 图片懒加载 Composable
 * 
 * 核心优化策略：
 * 1. Intersection Observer - 原生懒加载，性能优于 scroll 监听
 * 2. 占位图/骨架屏 - 避免布局抖动 (CLS)
 * 3. 渐进式加载 - 模糊占位 → 清晰图片
 * 4. 错误处理 - 加载失败降级显示
 */
export function useLazyImage(
  imageRef: Ref<HTMLImageElement | null>,
  src: string,
  options: LazyImageOptions = {}
) {
  const {
    rootMargin = '50px 0px',
    threshold = 0.01,
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  } = options

  const isLoaded = ref(false)
  const isInViewport = ref(false)
  const hasError = ref(false)
  const currentSrc = ref(placeholder)

  let observer: IntersectionObserver | null = null

  const loadImage = () => {
    if (!src || isLoaded.value) return

    const img = new Image()
    
    img.onload = () => {
      currentSrc.value = src
      isLoaded.value = true
      hasError.value = false
    }
    
    img.onerror = () => {
      hasError.value = true
      isLoaded.value = true
      console.warn(`Failed to load image: ${src}`)
    }
    
    img.src = src
  }

  const initObserver = () => {
    if (!imageRef.value || !('IntersectionObserver' in window)) {
      // 不支持 IntersectionObserver，直接加载
      isInViewport.value = true
      loadImage()
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInViewport.value = true
            loadImage()
            // 加载后取消观察
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(imageRef.value)
  }

  onMounted(() => {
    // 延迟初始化，避免阻塞首屏
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initObserver, { timeout: 100 })
    } else {
      setTimeout(initObserver, 0)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    isLoaded,
    isInViewport,
    hasError,
    currentSrc,
  }
}

/**
 * 批量图片懒加载 - 用于列表场景
 */
export function useLazyImageBatch(
  containerRef: Ref<HTMLElement | null>,
  selector: string = '[data-lazy-image]'
) {
  const loadedImages = ref<Set<string>>(new Set())
  let observer: IntersectionObserver | null = null

  const initBatchObserver = () => {
    if (!containerRef.value || !('IntersectionObserver' in window)) return

    const images = containerRef.value.querySelectorAll(selector)
    
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            
            if (src && !loadedImages.value.has(src)) {
              const preloadImg = new Image()
              preloadImg.onload = () => {
                img.src = src
                img.classList.add('lazy-loaded')
                loadedImages.value.add(src)
              }
              preloadImg.src = src
            }
            
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01,
      }
    )

    images.forEach((img) => observer?.observe(img))
  }

  onMounted(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initBatchObserver, { timeout: 200 })
    } else {
      setTimeout(initBatchObserver, 100)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    loadedImages,
  }
}
