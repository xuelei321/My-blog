/**
 * CDN 上传脚本
 * 
 * 支持：阿里云 OSS、腾讯云 COS、Cloudflare R2、AWS S3
 * 
 * 环境变量配置：
 * - CDN_PROVIDER: aliyun | tencent | cloudflare | aws
 * - CDN_ACCESS_KEY: 访问密钥
 * - CDN_SECRET_KEY: 密钥
 * - CDN_BUCKET: 存储桶名称
 * - CDN_REGION: 区域
 * - CDN_BASE_URL: CDN 域名 (https://cdn.yourdomain.com)
 */

const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')

// 获取环境变量
const provider = process.env.CDN_PROVIDER
const accessKey = process.env.CDN_ACCESS_KEY
const secretKey = process.env.CDN_SECRET_KEY
const bucket = process.env.CDN_BUCKET
const region = process.env.CDN_REGION
const baseURL = process.env.CDN_BASE_URL

// 检查必要的环境变量
if (!provider || !accessKey || !secretKey || !bucket || !region) {
  console.error('[CDN] Missing required environment variables:')
  console.error('  - CDN_PROVIDER (aliyun|tencent|cloudflare|aws)')
  console.error('  - CDN_ACCESS_KEY')
  console.error('  - CDN_SECRET_KEY')
  console.error('  - CDN_BUCKET')
  console.error('  - CDN_REGION')
  process.exit(1)
}

// 获取要上传的文件
const distPath = path.resolve('.output/public')
const files = globSync('**/*', { cwd: distPath, nodir: true })

console.log(`[CDN] Provider: ${provider}`)
console.log(`[CDN] Bucket: ${bucket}`)
console.log(`[CDN] Region: ${region}`)
console.log(`[CDN] Files to upload: ${files.length}`)

// 根据提供商选择上传方式
async function upload() {
  switch (provider) {
    case 'aliyun':
      await uploadToAliyunOSS()
      break
    case 'tencent':
      await uploadToTencentCOS()
      break
    case 'cloudflare':
      await uploadToCloudflareR2()
      break
    case 'aws':
      await uploadToAWSS3()
      break
    default:
      console.error(`[CDN] Unknown provider: ${provider}`)
      process.exit(1)
  }
}

// 阿里云 OSS 上传
async function uploadToAliyunOSS() {
  const OSS = require('ali-oss')
  
  const client = new OSS({
    region,
    accessKeyId: accessKey,
    accessKeySecret: secretKey,
    bucket,
  })

  console.log('[CDN] Starting upload to Aliyun OSS...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    const contentType = getContentType(file)
    
    try {
      await client.put(file, localPath, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
      console.log(`[CDN] ✓ ${file}`)
    } catch (error) {
      console.error(`[CDN] ✗ ${file}:`, error.message)
    }
  }
  
  console.log('[CDN] Upload completed!')
  console.log(`[CDN] Base URL: ${baseURL}`)
}

// 腾讯云 COS 上传
async function uploadToTencentCOS() {
  const COS = require('cos-nodejs-sdk-v5')
  
  const cos = new COS({
    SecretId: accessKey,
    SecretKey: secretKey,
  })

  console.log('[CDN] Starting upload to Tencent COS...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    const contentType = getContentType(file)
    
    try {
      await new Promise((resolve, reject) => {
        cos.putObject({
          Bucket: bucket,
          Region: region,
          Key: file,
          Body: fs.createReadStream(localPath),
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })
      console.log(`[CDN] ✓ ${file}`)
    } catch (error) {
      console.error(`[CDN] ✗ ${file}:`, error.message)
    }
  }
  
  console.log('[CDN] Upload completed!')
  console.log(`[CDN] Base URL: ${baseURL}`)
}

// Cloudflare R2 上传
async function uploadToCloudflareR2() {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
  
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  })

  console.log('[CDN] Starting upload to Cloudflare R2...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    const content = fs.readFileSync(localPath)
    const contentType = getContentType(file)
    
    try {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: file,
        Body: content,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }))
      console.log(`[CDN] ✓ ${file}`)
    } catch (error) {
      console.error(`[CDN] ✗ ${file}:`, error.message)
    }
  }
  
  console.log('[CDN] Upload completed!')
  console.log(`[CDN] Base URL: ${baseURL}`)
}

// AWS S3 上传
async function uploadToAWSS3() {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
  
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  })

  console.log('[CDN] Starting upload to AWS S3...')
  
  for (const file of files) {
    const localPath = path.join(distPath, file)
    const content = fs.readFileSync(localPath)
    const contentType = getContentType(file)
    
    try {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: file,
        Body: content,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }))
      console.log(`[CDN] ✓ ${file}`)
    } catch (error) {
      console.error(`[CDN] ✗ ${file}:`, error.message)
    }
  }
  
  console.log('[CDN] Upload completed!')
  console.log(`[CDN] Base URL: ${baseURL}`)
}

// 获取文件 Content-Type
function getContentType(file) {
  const ext = path.extname(file).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// 执行上传
upload().catch(console.error)
