<script setup lang="ts">
/**
 * Above The Fold 首屏优化组件
 * 
 * 核心优化策略：
 * 1. 关键 CSS 内联 - 避免渲染阻塞
 * 2. 关键资源预加载 - DNS/Preconnect/Prefetch
 * 3. 骨架屏占位 - 提升感知性能
 * 4. 字体优化 - font-display: swap 避免 FOIT
 */

useHead({
  // DNS 预解析
  link: [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  ],
  // 关键 CSS 内联
  style: [
    {
      innerHTML: `
        /* Critical CSS - Above the Fold */
        :root { color-scheme: dark light; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        .critical-hide { opacity: 0; }
        .critical-show { opacity: 1; transition: opacity 0.3s ease; }
        
        /* 字体优化 - 避免 FOIT */
        @font-face {
          font-family: 'Inter';
          font-display: swap;
          src: local('Inter'), local('Inter-Regular');
        }
        
        /* 骨架屏动画 */
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }
        .dark .skeleton {
          background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
          background-size: 200% 100%;
        }
      `,
      tagPosition: 'head',
    },
  ],
})

// 首屏加载状态管理 - 使用客户端标记避免 hydration mismatch
const isMounted = ref(false)
const isAboveFoldLoaded = ref(false)

onMounted(() => {
  isMounted.value = true
  
  // 使用 requestIdleCallback 在空闲时标记首屏加载完成
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      isAboveFoldLoaded.value = true
    }, { timeout: 2000 })
  } else {
    setTimeout(() => {
      isAboveFoldLoaded.value = true
    }, 100)
  }
})
</script>

<template>
  <!-- 首屏骨架屏 - 仅客户端显示，避免 hydration mismatch -->
  <ClientOnly>
    <div 
      v-if="!isAboveFoldLoaded" 
      class="fixed inset-0 z-50 bg-white dark:bg-gray-900 transition-opacity duration-300"
      :class="{ 'opacity-0 pointer-events-none': isAboveFoldLoaded }"
    >
      <div class="container mx-auto px-4 py-8">
        <!-- 头部骨架 -->
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton h-8 w-32 rounded"></div>
          <div class="flex gap-4">
            <div class="skeleton h-6 w-16 rounded"></div>
            <div class="skeleton h-6 w-16 rounded"></div>
            <div class="skeleton h-6 w-16 rounded"></div>
          </div>
        </div>
        
        <!-- 主内容骨架 -->
        <div class="max-w-4xl mx-auto">
          <div class="skeleton h-12 w-3/4 rounded mb-4"></div>
          <div class="skeleton h-6 w-1/2 rounded mb-8"></div>
          <div class="skeleton h-64 w-full rounded-lg mb-8"></div>
          <div class="space-y-3">
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-5/6 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
