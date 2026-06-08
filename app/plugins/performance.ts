import { defineNuxtPlugin, useRuntimeConfig } from '#app'

interface PerformanceMetrics {
  // 核心 Web Vitals
  lcp?: number // Largest Contentful Paint
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  cls?: number // Cumulative Layout Shift
  fid?: number // First Input Delay
  inp?: number // Interaction to Next Paint
  
  // 自定义指标
  pageLoadTime?: number
  domReadyTime?: number
  resourceCount?: number
  
  // 元数据
  url: string
  timestamp: number
  userAgent: string
}

export default defineNuxtPlugin(() => {
  // 只在客户端执行
  if (process.server) return
  
  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV === 'development'
  
  // 收集性能指标
  const collectMetrics = (): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    
    const metrics: PerformanceMetrics = {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }
    
    // FCP
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      metrics.fcp = Math.round(fcpEntry.startTime)
    }
    
    // Navigation Timing
    if (navigation) {
      metrics.ttfb = Math.round(navigation.responseStart - navigation.startTime)
      metrics.domReadyTime = Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)
      metrics.pageLoadTime = Math.round(navigation.loadEventEnd - navigation.startTime)
    }
    
    // 资源数量统计
    metrics.resourceCount = performance.getEntriesByType('resource').length
    
    return metrics
  }
  
  // 观察 LCP
  const observeLCP = () => {
    if (!('PerformanceObserver' in window)) return
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry
        
        const metrics = collectMetrics()
        metrics.lcp = Math.round(lastEntry.startTime)
        
        reportMetrics(metrics, 'LCP')
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observation not supported:', e)
    }
  }
  
  // 观察 CLS
  const observeCLS = () => {
    if (!('PerformanceObserver' in window)) return
    
    let clsValue = 0
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      
      // 页面卸载前报告 CLS
      window.addEventListener('beforeunload', () => {
        const metrics = collectMetrics()
        metrics.cls = Math.round(clsValue * 1000) / 1000
        reportMetrics(metrics, 'CLS')
      })
    } catch (e) {
      console.warn('CLS observation not supported:', e)
    }
  }
  
  // 观察 FID
  const observeFID = () => {
    if (!('PerformanceObserver' in window)) return
    
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime
          
          const metrics = collectMetrics()
          metrics.fid = Math.round(fid)
          
          reportMetrics(metrics, 'FID')
        }
      })
      
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID observation not supported:', e)
    }
  }
  
  // 上报性能指标
  const reportMetrics = (metrics: PerformanceMetrics, type: string) => {
    // 开发环境打印到控制台
    if (isDev) {
      console.log(`[Performance] ${type}:`, metrics)
      return
    }
    
    // 生产环境发送到分析服务
    // 这里可以替换为你的实际分析服务，如 Google Analytics、自建服务等
    
    // 示例：发送到本地 API
    const reportToLocal = async () => {
      try {
        await fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            ...metrics
          }),
          // 使用 keepalive 确保页面卸载时也能发送
          keepalive: true
        })
      } catch (err) {
        // 静默失败，不影响用户体验
        console.warn('Failed to report performance metrics:', err)
      }
    }
    
    // 使用 sendBeacon 作为备选方案
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ type, ...metrics })], {
        type: 'application/json'
      })
      navigator.sendBeacon('/api/performance', blob)
    } else {
      reportToLocal()
    }
  }
  
  // 页面加载完成后收集基础指标
  const initPerformanceMonitoring = () => {
    // 等待页面完全加载
    if (document.readyState === 'complete') {
      setTimeout(() => {
        const metrics = collectMetrics()
        reportMetrics(metrics, 'PAGE_LOAD')
      }, 0)
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const metrics = collectMetrics()
          reportMetrics(metrics, 'PAGE_LOAD')
        }, 0)
      })
    }
    
    // 启动各种观察器
    observeLCP()
    observeCLS()
    observeFID()
  }
  
  // 初始化
  initPerformanceMonitoring()
  
  // 提供全局方法供手动触发
  return {
    provide: {
      performance: {
        collect: collectMetrics,
        report: reportMetrics
      }
    }
  }
})
