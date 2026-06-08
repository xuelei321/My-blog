import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { error: 'Slug is required', views: 0 }
  }
  
  // 基于 Nitro Storage 实现简单的 KV 计数
  const storageKey = `views:${slug}`
  const currentViews = await useStorage().getItem<number>(storageKey) || 0
  
  // 每次访问 +1
  const newViews = currentViews + 1
  await useStorage().setItem(storageKey, newViews)
  
  return { 
    slug,
    views: newViews,
    message: 'View counted successfully'
  }
})
