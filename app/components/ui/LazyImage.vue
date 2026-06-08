<script setup lang="ts">
/**
 * 懒加载图片组件
 * 
 * 功能特性：
 * 1. 自动懒加载 - 进入视口才加载
 * 2. 渐进式显示 - 模糊 → 清晰
 * 3. 骨架屏占位 - 避免 CLS
 * 4. 错误降级 - 加载失败显示占位图
 * 5. 响应式支持 - 适配不同屏幕
 */

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  placeholder?: string
  rootMargin?: string
  threshold?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: undefined,
  height: undefined,
  placeholder: undefined,
  rootMargin: '50px 0px',
  threshold: 0.01,
  class: '',
})

const imageRef = ref<HTMLImageElement | null>(null)

const { isLoaded, isInViewport, hasError, currentSrc } = useLazyImage(
  imageRef,
  props.src,
  {
    rootMargin: props.rootMargin,
    threshold: props.threshold,
    placeholder: props.placeholder,
  }
)

// 计算图片容器样式，避免布局抖动
const aspectRatio = computed(() => {
  if (props.width && props.height) {
    return `${props.width} / ${props.height}`
  }
  return 'auto'
})
</script>

<template>
  <div 
    class="lazy-image-container relative overflow-hidden"
    :style="{ aspectRatio }"
    :class="props.class"
  >
    <!-- 骨架屏占位 -->
    <div 
      v-if="!isLoaded"
      class="skeleton absolute inset-0 bg-gray-200 dark:bg-gray-700"
    >
      <div class="absolute inset-0 skeleton-shimmer"></div>
    </div>
    
    <!-- 错误状态 -->
    <div 
      v-else-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    
    <!-- 实际图片 -->
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :width="width"
      :height="height"
      class="w-full h-full object-cover transition-opacity duration-500"
      :class="{ 
        'opacity-0': !isLoaded,
        'opacity-100': isLoaded,
        'blur-sm': !isLoaded && isInViewport,
      }"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.dark .skeleton {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

.dark .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.lazy-image-container {
  contain: layout style;
}
</style>
