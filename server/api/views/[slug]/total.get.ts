import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    return { error: 'Slug is required', views: 0 }
  }
  
  // 只获取阅读量，不增加
  const storageKey = `views:${slug}`
  const views = await useStorage().getItem<number>(storageKey) || 0
  
  return { 
    slug,
    views
  }
})
