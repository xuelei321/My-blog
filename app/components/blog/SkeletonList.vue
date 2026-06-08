<script setup lang="ts">
/**
 * 博客列表骨架屏
 * 
 * 用于博客列表加载时的占位显示
 */

interface Props {
  // 卡片数量
  count?: number
  // 列数（响应式）
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  count: 6,
  columns: () => ({
    sm: 1,
    md: 2,
    lg: 3,
  }),
})

const gridClass = computed(() => {
  return `grid grid-cols-1 md:grid-cols-${props.columns.md} lg:grid-cols-${props.columns.lg} gap-6`
})
</script>

<template>
  <div :class="gridClass">
    <div
      v-for="i in count"
      :key="i"
      class="border dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900"
    >
      <Skeleton type="card" animation="shimmer" class="h-full" />
    </div>
  </div>
</template>
