import { useRouter } from 'vue-router'

interface PreloadOptions {
  delay?: number
  threshold?: number
}

/**
 * 路由预加载 Composable
 * 
 * 核心优化策略：
 * 1. 智能预加载 - 鼠标悬停/点击前开始加载
 * 2. 视口内链接预加载 - 可见路由提前加载
 * 3. 优先级控制 - 避免同时加载过多路由
 * 4. 网络感知 - 慢网环境下降级
 */
export function useRoutePreload(options: PreloadOptions = {}) {
  const { delay = 100, threshold = 0.1 } = options
  const router = useRouter()
  const preloadedRoutes = ref<Set<string>>(new Set())
  
  let observer: IntersectionObserver | null = null
  let preloadQueue: string[] = []
  let isProcessing = false

  /**
   * 预加载单个路由组件
   */
  const preloadRoute = async (path: string) => {
    if (preloadedRoutes.value.has(path)) return
    
    // 检查网络状态
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      if (conn.saveData || conn.effectiveType === '2g') {
        // 省流量模式或慢网，跳过预加载
        return
      }
    }

    try {
      const route = router.resolve(path)
      if (route.matched.length > 0) {
        const component = route.matched[0]?.components?.default
        
        // 如果是异步组件，执行加载
        if (typeof component === 'function') {
          await (component as Function)()
          preloadedRoutes.value.add(path)
        }
      }
    } catch (err) {
      console.warn(`Failed to preload route: ${path}`, err)
    }
  }

  /**
   * 处理预加载队列
   */
  const processQueue = async () => {
    if (isProcessing || preloadQueue.length === 0) return
    
    isProcessing = true
    
    while (preloadQueue.length > 0) {
      const path = preloadQueue.shift()
      if (path) {
        await preloadRoute(path)
        // 间隔 100ms，避免阻塞主线程
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    isProcessing = false
  }

  /**
   * 添加到预加载队列
   */
  const queuePreload = (path: string) => {
    if (preloadedRoutes.value.has(path) || preloadQueue.includes(path)) return
    
    preloadQueue.push(path)
    
    // 使用 requestIdleCallback 在空闲时处理
    if ('requestIdleCallback' in window) {
      requestIdleCallback(processQueue, { timeout: 2000 })
    } else {
      setTimeout(processQueue, delay)
    }
  }

  /**
   * 监听链接悬停事件
   */
  const setupHoverPreload = () => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 确保 target 是有效元素
      if (!target || typeof target.closest !== 'function') return
      
      const link = target.closest('a[href^="/"]')
      
      if (link) {
        const href = link.getAttribute('href')
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          queuePreload(href)
        }
      }
    }

    document.addEventListener('mouseover', handleMouseEnter, true)
    
    return () => {
      document.removeEventListener('mouseover', handleMouseEnter, true)
    }
  }

  /**
   * 监听视口内链接
   */
  const setupViewportPreload = () => {
    if (!('IntersectionObserver' in window)) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement
            const href = link.getAttribute('href')
            
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
              queuePreload(href)
            }
            
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '200px 0px',
        threshold,
      }
    )

    // 观察所有内部链接
    const links = document.querySelectorAll('a[href^="/"]')
    links.forEach((link) => observer?.observe(link))
  }

  /**
   * 立即预加载关键路由
   */
  const preloadCriticalRoutes = (paths: string[]) => {
    paths.forEach((path) => queuePreload(path))
  }

  onMounted(() => {
    const cleanupHover = setupHoverPreload()
    setupViewportPreload()
    
    onUnmounted(() => {
      cleanupHover()
      observer?.disconnect()
    })
  })

  return {
    preloadedRoutes,
    preloadRoute,
    queuePreload,
    preloadCriticalRoutes,
  }
}

/**
   * 预加载组件 - 用于模板中
   */
export function useComponentPreload() {
  const preloadComponent = async (loader: () => Promise<any>) => {
    try {
      await loader()
      return true
    } catch (err) {
      console.warn('Failed to preload component:', err)
      return false
    }
  }

  return {
    preloadComponent,
  }
}
