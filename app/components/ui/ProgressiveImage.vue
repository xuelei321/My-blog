<script setup lang="ts">
/**
 * 渐进式图片加载组件
 * 
 * 核心功能：
 * 1. 模糊占位图 -> 低清预览图 -> 高清原图 三级渐进加载
 * 2. Intersection Observer 懒加载
 * 3. 加载状态动画过渡
 * 4. 错误重试机制
 */

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  placeholderSrc?: string // 低清预览图 URL
  blurHash?: string // BlurHash 字符串（可选）
  class?: string
  loading?: 'lazy' | 'eager'
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  loading: 'lazy',
})

// 加载状态：'placeholder' | 'preview' | 'full' | 'loaded'
const loadState = ref<'placeholder' | 'preview' | 'full' | 'loaded'>('placeholder')
const isInViewport = ref(false)
const hasError = ref(false)
const retryCount = ref(0)
const maxRetries = 3

// 图片引用
const imageRef = ref<HTMLImageElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// 计算样式
const containerStyle = computed(() => ({
  aspectRatio: `${props.width} / ${props.height}`,
}))

// 是否显示占位图
const showPlaceholder = computed(() => loadState.value === 'placeholder')

// 是否显示预览图
const showPreview = computed(() => loadState.value === 'preview' || loadState.value === 'full')

// 是否显示原图
const showFullImage = computed(() => loadState.value === 'full' || loadState.value === 'loaded')

// 图片透明度（用于过渡动画）
const imageOpacity = computed(() => {
  if (loadState.value === 'loaded') return 1
  if (loadState.value === 'full') return 0.7
  if (loadState.value === 'preview') return 0.5
  return 0
})

// Intersection Observer 懒加载
onMounted(() => {
  if (props.loading === 'eager' || !('IntersectionObserver' in window)) {
    isInViewport.value = true
    startLoading()
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInViewport.value = true
          startLoading()
          observer.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

// 开始加载流程
function startLoading() {
  if (!isInViewport.value) return

  // 如果有预览图，先加载预览图
  if (props.placeholderSrc) {
    loadPreviewImage()
  } else {
    // 直接加载原图
    loadFullImage()
  }
}

// 加载预览图
function loadPreviewImage() {
  const img = new Image()
  img.onload = () => {
    loadState.value = 'preview'
    // 预览图加载完成后，延迟加载原图
    setTimeout(() => {
      loadFullImage()
    }, 100)
  }
  img.onerror = () => {
    // 预览图加载失败，直接尝试原图
    loadFullImage()
  }
  img.src = props.placeholderSrc!
}

// 加载原图
function loadFullImage() {
  if (loadState.value === 'loaded') return

  const img = new Image()
  img.onload = () => {
    loadState.value = 'loaded'
    hasError.value = false
  }
  img.onerror = () => {
    handleError()
  }
  img.src = props.src
}

// 错误处理
function handleError() {
  hasError.value = true
  if (retryCount.value < maxRetries) {
    retryCount.value++
    setTimeout(() => {
      loadFullImage()
    }, 1000 * retryCount.value)
  }
}

// 重试加载
function retry() {
  hasError.value = false
  retryCount.value = 0
  startLoading()
}
</script>

<template>
  <div
    ref="containerRef"
    class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg"
    :style="containerStyle"
    :class="$props.class"
  >
    <!-- 模糊占位背景 -->
    <div
      v-if="showPlaceholder"
      class="absolute inset-0 skeleton animate-pulse"
      :style="{
        background: blurHash 
          ? `url(data:image/svg+xml;base64,${blurHash}) center/cover`
          : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
      }"
    />

    <!-- 预览图（低清） -->
    <img
      v-if="showPreview && placeholderSrc"
      :src="placeholderSrc"
      :alt="alt"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      :style="{ opacity: loadState === 'preview' ? 1 : 0.3 }"
    />

    <!-- 原图（高清） -->
    <img
      v-if="showFullImage"
      ref="imageRef"
      :src="src"
      :alt="alt"
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      :style="{ opacity: imageOpacity }"
      @load="loadState = 'loaded'"
      @error="handleError"
    />

    <!-- 加载动画 -->
    <div
      v-if="loadState !== 'loaded' && !hasError"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- 错误提示 -->
    <div
      v-if="hasError && retryCount >= maxRetries"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <Icon name="heroicons:photo" class="w-12 h-12 text-gray-400 mb-2" />
      <p class="text-sm text-gray-500 mb-2">图片加载失败</p>
      <button
        class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        @click="retry"
      >
        重试
      </button>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
