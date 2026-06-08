<script setup lang="ts">
interface Props {
  slug: string
}

const props = defineProps<Props>()

const views = ref(0)
const loading = ref(true)

// 获取阅读量
const fetchViews = async () => {
  try {
    const data = await $fetch(`/api/views/${props.slug}/total`)
    views.value = data.views || 0
  } catch (err) {
    console.error('Failed to fetch views:', err)
  } finally {
    loading.value = false
  }
}

// 增加阅读量
const incrementViews = async () => {
  try {
    const data = await $fetch(`/api/views/${props.slug}`)
    views.value = data.views || 0
  } catch (err) {
    console.error('Failed to increment views:', err)
  }
}

// 组件挂载时执行
onMounted(() => {
  fetchViews()
  incrementViews()
})
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    <span v-if="loading">加载中...</span>
    <span v-else>{{ views }} 次阅读</span>
  </div>
</template>
