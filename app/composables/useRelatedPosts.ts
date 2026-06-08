import type { Collections } from '@nuxt/content'

export interface RelatedPost {
  title: string
  path: string
  description: string
  similarity: number
}

/**
 * 计算两个标签数组的 Jaccard 相似度
 * Jaccard = |A ∩ B| / |A ∪ B|
 */
function calculateJaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  if (!tagsA?.length || !tagsB?.length) return 0
  
  const setA = new Set(tagsA.map(t => t.toLowerCase()))
  const setB = new Set(tagsB.map(t => t.toLowerCase()))
  
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  
  return intersection.size / union.size
}

/**
 * 获取相关文章推荐
 * @param currentTags 当前文章的标签
 * @param currentPath 当前文章路径（用于排除自身）
 * @param limit 返回数量限制
 */
export async function useRelatedPosts(
  currentTags: string[], 
  currentPath: string,
  limit: number = 3
): Promise<RelatedPost[]> {
  // 获取所有博客文章
  const { data: allBlogs } = await useAsyncData('all-blogs-related', () => 
    queryCollection('content').all()
  )
  
  if (!allBlogs.value) return []
  
  // 计算每篇文章的相似度并排序
  const relatedPosts = allBlogs.value
    .filter((post: Collections['content']) => post.path !== currentPath) // 排除当前文章
    .map((post: Collections['content']) => {
      const postTags = post.tags || []
      const similarity = calculateJaccardSimilarity(currentTags, postTags)
      
      return {
        title: post.title || 'Untitled',
        path: post.path,
        description: post.description || '',
        similarity
      }
    })
    .filter((post: RelatedPost) => post.similarity > 0) // 只保留有相似度的
    .sort((a: RelatedPost, b: RelatedPost) => b.similarity - a.similarity) // 按相似度降序
    .slice(0, limit) // 取前 N 个
  
  return relatedPosts
}

/**
 * Composable 版本 - 在 Vue 组件中使用
 */
export function useRelatedPostsComposable(
  currentTags: Ref<string[]>, 
  currentPath: Ref<string>,
  limit: number = 3
) {
  const relatedPosts = ref<RelatedPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const fetchRelated = async () => {
    loading.value = true
    error.value = null
    
    try {
      relatedPosts.value = await useRelatedPosts(
        currentTags.value, 
        currentPath.value,
        limit
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch related posts'
      console.error('Error fetching related posts:', err)
    } finally {
      loading.value = false
    }
  }
  
  // 当标签或路径变化时重新获取
  watch([currentTags, currentPath], fetchRelated, { immediate: true })
  
  return {
    relatedPosts,
    loading,
    error,
    refresh: fetchRelated
  }
}
