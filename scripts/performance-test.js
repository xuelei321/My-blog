/**
 * 性能测试脚本
 * 测量 FCP、白屏时间、Lighthouse 评分
 * 
 * 使用方法:
 * node scripts/performance-test.js
 */

const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const { URL } = require('url')

const TEST_URL = 'http://localhost:3000'
const ITERATIONS = 3

async function measureTiming() {
  console.log('📊 开始性能测试...\n')
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const results = []
  
  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`🔄 第 ${i + 1}/${ITERATIONS} 次测试...`)
    
    const page = await browser.newPage()
    
    // 启用性能观测
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {}
      
      // 监听 paint 事件
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
      
      // 记录白屏时间（首次渲染）
      window.addEventListener('load', () => {
        const timing = performance.timing
        window.performanceMetrics.whiteScreen = timing.responseEnd - timing.navigationStart
        window.performanceMetrics.domReady = timing.domContentLoadedEventEnd - timing.navigationStart
        window.performanceMetrics.loadComplete = timing.loadEventEnd - timing.navigationStart
      })
    })
    
    // 清空缓存
    const client = await page.target().createCDPSession()
    await client.send('Network.clearBrowserCache')
    await client.send('Network.clearBrowserCookies')
    
    // 开始计时
    const startTime = Date.now()
    await page.goto(TEST_URL, { waitUntil: 'networkidle0' })
    const loadTime = Date.now() - startTime
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(window.performanceMetrics || {})
        }, 100)
      })
    })
    
    // 获取 Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('web-vitals' in window) {
          // 如果页面已集成 web-vitals
          resolve(window.webVitalsData || {})
        } else {
          // 手动计算
          const timing = performance.timing
          const navigation = performance.getEntriesByType('navigation')[0]
          
          resolve({
            ttfb: timing.responseStart - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            resources: performance.getEntriesByType('resource').length
          })
        }
      })
    })
    
    results.push({
      iteration: i + 1,
      fcp: metrics.fcp || 0,
      whiteScreen: metrics.whiteScreen || webVitals.ttfb || 0,
      domReady: metrics.domReady || webVitals.domReady || 0,
      loadComplete: metrics.loadComplete || webVitals.loadComplete || loadTime,
      resources: webVitals.resources || 0
    })
    
    await page.close()
    
    // 等待一下再下一次测试
    await new Promise(r => setTimeout(r, 1000))
  }
  
  await browser.close()
  
  // 计算平均值
  const avg = {
    fcp: results.reduce((a, b) => a + b.fcp, 0) / results.length,
    whiteScreen: results.reduce((a, b) => a + b.whiteScreen, 0) / results.length,
    domReady: results.reduce((a, b) => a + b.domReady, 0) / results.length,
    loadComplete: results.reduce((a, b) => a + b.loadComplete, 0) / results.length,
    resources: results.reduce((a, b) => a + b.resources, 0) / results.length
  }
  
  console.log('\n📈 测试结果汇总：')
  console.log('===================')
  console.log(`FCP (First Contentful Paint): ${avg.fcp.toFixed(2)} ms`)
  console.log(`白屏时间: ${avg.whiteScreen.toFixed(2)} ms`)
  console.log(`DOM Ready: ${avg.domReady.toFixed(2)} ms`)
  console.log(`加载完成: ${avg.loadComplete.toFixed(2)} ms`)
  console.log(`资源数量: ${avg.resources.toFixed(0)} 个`)
  
  console.log('\n📋 详细数据：')
  results.forEach(r => {
    console.log(`\n第 ${r.iteration} 次:`)
    console.log(`  FCP: ${r.fcp.toFixed(2)} ms`)
    console.log(`  白屏: ${r.whiteScreen.toFixed(2)} ms`)
    console.log(`  DOM Ready: ${r.domReady.toFixed(2)} ms`)
  })
  
  return avg
}

// 运行测试
measureTiming().catch(console.error)
