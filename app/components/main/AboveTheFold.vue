<script setup lang="ts">
/**
 * Above The Fold 首屏优化组件
 */

useHead({
  // DNS 预解析
  link: [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  ],
})

// 只在客户端显示骨架屏
const showSkeleton = ref(false)

onMounted(() => {
  // 检查是否已经加载过
  const isLoaded = document.readyState === 'complete'
  if (!isLoaded) {
    showSkeleton.value = true
    // 2秒后隐藏骨架屏
    setTimeout(() => {
      showSkeleton.value = false
    }, 2000)
  }
})
</script>

<template>
  <!-- 首屏骨架屏 - 仅客户端显示 -->
  <div v-if="showSkeleton" class="fixed inset-0 z-50 bg-white dark:bg-gray-900 transition-opacity duration-300">
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
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
.dark .skeleton {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
