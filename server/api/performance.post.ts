import { defineEventHandler, readBody } from 'h3'

interface PerformanceReport {
  type: string
  url: string
  timestamp: number
  userAgent: string
  lcp?: number
  fcp?: number
  ttfb?: number
  cls?: number
  fid?: number
  inp?: number
  pageLoadTime?: number
  domReadyTime?: number
  resourceCount?: number
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<PerformanceReport>(event)
    
    // 验证必要字段
    if (!body.type || !body.url) {
      return { 
        success: false, 
        error: 'Missing required fields: type, url' 
      }
    }
    
    // 存储到 Nitro Storage（生产环境可替换为数据库或分析服务）
    const storageKey = `performance:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    
    await useStorage().setItem(storageKey, {
      ...body,
      serverTimestamp: Date.now(),
      ip: getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    })
    
    // 开发环境打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Report]', body.type, {
        url: body.url,
        lcp: body.lcp,
        fcp: body.fcp,
        cls: body.cls,
        fid: body.fid
      })
    }
    
    return { 
      success: true,
      message: 'Performance metrics recorded'
    }
    
  } catch (error) {
    console.error('Failed to process performance report:', error)
    return { 
      success: false, 
      error: 'Internal server error' 
    }
  }
})
