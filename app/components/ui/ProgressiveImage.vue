<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  class?: string
  loading?: 'lazy' | 'eager'
}

withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  loading: 'lazy',
})

const hasError = ref(false)
const isLoaded = ref(false)

function handleError() {
  hasError.value = true
}

function handleLoad() {
  isLoaded.value = true
}
</script>

<template>
  <div
    class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg"
    :style="{ aspectRatio: `${width} / ${height}` }"
    :class="$props.class"
  >
    <!-- 加载占位 -->
    <div
      v-if="!isLoaded && !hasError"
      class="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700"
    />

    <!-- 图片 -->
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 错误提示 -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800"
    >
      <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm text-gray-500">图片加载失败</p>
      <p class="text-xs text-gray-400 mt-1">{{ src }}</p>
    </div>
  </div>
</template>
