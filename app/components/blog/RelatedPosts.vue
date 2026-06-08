<script setup lang="ts">
import type { RelatedPost } from '~/composables/useRelatedPosts'

interface Props {
  tags: string[]
  currentPath: string
}

const props = defineProps<Props>()

const { relatedPosts, loading, error } = useRelatedPostsComposable(
  computed(() => props.tags),
  computed(() => props.currentPath),
  3 // 显示3篇相关文章
)
</script>

<template>
  <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
    <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">
      相关文章
    </h3>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-gray-500 dark:text-gray-400">
      正在加载相关文章...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="text-red-500">
      加载失败: {{ error }}
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="relatedPosts.length === 0" class="text-gray-500 dark:text-gray-400">
      暂无相关文章
    </div>
    
    <!-- 文章列表 -->
    <div v-else class="grid gap-4">
      <NuxtLink
        v-for="post in relatedPosts"
        :key="post.path"
        :to="post.path"
        class="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ post.title }}
            </h4>
            <p v-if="post.description" class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {{ post.description }}
            </p>
          </div>
          <div class="ml-4 text-right">
            <span class="text-xs text-gray-500 dark:text-gray-500">
              相似度: {{ Math.round(post.similarity * 100) }}%
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
