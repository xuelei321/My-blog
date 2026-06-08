/**
 * CDN 加速插件
 * 
 * 核心功能：
 * 1. 静态资源自动上传 CDN
 * 2. 生产环境使用 CDN 域名
 * 3. 图片/字体/JS/CSS 资源 CDN 化
 * 4. 支持多 CDN 提供商（阿里云、腾讯云、Cloudflare 等）
 */

export default defineNuxtPlugin(() => {
  // 仅在生产环境启用 CDN
  if (process.dev) return

  const config = useRuntimeConfig()
  
  // CDN 配置
  const cdnConfig = {
    // CDN 基础域名
    baseURL: config.public.cdnBaseURL || '',
    // 启用 CDN 的资源类型
    enabledTypes: ['images', 'fonts', 'js', 'css'],
    // 缓存策略
    cacheControl: 'public, max-age=31536000, immutable',
  }

  // 如果没有配置 CDN，直接返回
  if (!cdnConfig.baseURL) {
    console.warn('[CDN] CDN baseURL not configured, skipping CDN optimization')
    return
  }

  // 资源 URL 转换函数
  function transformToCDN(url: string): string {
    // 已经是完整 URL，直接返回
    if (url.startsWith('http')) return url
    
    // 转换为 CDN URL
    const cleanPath = url.startsWith('/') ? url.slice(1) : url
    return `${cdnConfig.baseURL}/${cleanPath}`
  }

  // 拦截图片加载
  if (process.client) {
    // 重写 Nuxt Image 组件的 provider
    const originalImageSrc = (window as any).$img
    
    // 监听动态加载的图片
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // 处理图片元素
            const images = node.querySelectorAll('img[data-src]')
            images.forEach((img) => {
              const src = img.getAttribute('data-src')
              if (src && !src.startsWith('http')) {
                img.setAttribute('data-src', transformToCDN(src))
              }
            })

            // 处理背景图片
            const elementsWithBg = node.querySelectorAll('[data-bg]')
            elementsWithBg.forEach((el) => {
              const bg = el.getAttribute('data-bg')
              if (bg && !bg.startsWith('http')) {
                el.setAttribute('data-bg', transformToCDN(bg))
              }
            })
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // 预连接 CDN 域名
    if (cdnConfig.baseURL) {
      try {
        const cdnOrigin = new URL(cdnConfig.baseURL as string).origin
        
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = cdnOrigin
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)

        // DNS 预解析
        const dnsLink = document.createElement('link')
        dnsLink.rel = 'dns-prefetch'
        dnsLink.href = cdnOrigin
        document.head.appendChild(dnsLink)
      } catch (e) {
        console.warn('[CDN] Invalid CDN baseURL:', cdnConfig.baseURL)
      }
    }
  }

  // 提供 CDN 工具函数
  return {
    provide: {
      cdn: {
        transform: transformToCDN,
        getImageURL: (path: string, options: { width?: number; height?: number; quality?: number } = {}) => {
          let url = transformToCDN(path)
          
          // 添加图片处理参数（如果 CDN 支持）
          const params = new URLSearchParams()
          if (options.width) params.append('w', options.width.toString())
          if (options.height) params.append('h', options.height.toString())
          if (options.quality) params.append('q', options.quality.toString())
          
          const queryString = params.toString()
          return queryString ? `${url}?${queryString}` : url
        },
        getFontURL: (path: string) => transformToCDN(`/fonts/${path}`),
        getAssetURL: (path: string) => transformToCDN(path),
      },
    },
  }
})

/**
 * CDN 上传脚本（构建时执行）
 * 
 * 使用方式：
 * 1. 配置环境变量：
 *    - CDN_PROVIDER: aliyun | tencent | cloudflare | aws
 *    - CDN_ACCESS_KEY: 访问密钥
 *    - CDN_SECRET_KEY: 密钥
 *    - CDN_BUCKET: 存储桶名称
 *    - CDN_REGION: 区域
 * 
 * 2. 在 package.json 中添加：
 *    "scripts": {
 *      "build": "nuxt build && npm run upload:cdn",
 *      "upload:cdn": "node scripts/upload-to-cdn.js"
 *    }
 */

// CDN 上传配置类型
export interface CDNUploadConfig {
  provider: 'aliyun' | 'tencent' | 'cloudflare' | 'aws' | 'vercel'
  accessKey: string
  secretKey: string
  bucket: string
  region: string
  basePath?: string
}

// 示例：阿里云 OSS 上传脚本
export const aliyunOSSUploadScript = `
const OSS = require('ali-oss')
const path = require('path')
const fs = require('fs')
const glob = require('glob')

async function uploadToAliyunOSS() {
  const client = new OSS({
    region: process.env.CDN_REGION,
    accessKeyId: process.env.CDN_ACCESS_KEY,
    accessKeySecret: process.env.CDN_SECRET_KEY,
    bucket: process.env.CDN_BUCKET,
  })

  const distPath = path.resolve('.output/public')
  const files = glob.sync('**/*', { cwd: distPath, nodir: true })

  console.log('[CDN] Starting upload to Aliyun OSS...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    const cdnPath = file
    
    try {
      await client.put(cdnPath, localPath)
      console.log('[CDN] Uploaded:', cdnPath)
    } catch (error) {
      console.error('[CDN] Failed to upload:', cdnPath, error)
    }
  }
  
  console.log('[CDN] Upload completed!')
}

uploadToAliyunOSS()
`

// 示例：腾讯云 COS 上传脚本
export const tencentCOSUploadScript = `
const COS = require('cos-nodejs-sdk-v5')
const path = require('path')
const fs = require('fs')
const glob = require('glob')

async function uploadToTencentCOS() {
  const cos = new COS({
    SecretId: process.env.CDN_ACCESS_KEY,
    SecretKey: process.env.CDN_SECRET_KEY,
  })

  const distPath = path.resolve('.output/public')
  const files = glob.sync('**/*', { cwd: distPath, nodir: true })

  console.log('[CDN] Starting upload to Tencent COS...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    
    try {
      await cos.putObject({
        Bucket: process.env.CDN_BUCKET,
        Region: process.env.CDN_REGION,
        Key: file,
        Body: fs.createReadStream(localPath),
      })
      console.log('[CDN] Uploaded:', file)
    } catch (error) {
      console.error('[CDN] Failed to upload:', file, error)
    }
  }
  
  console.log('[CDN] Upload completed!')
}

uploadToTencentCOS()
`
