/**
 * 视频压缩脚本
 * 使用 FFmpeg 压缩视频，减小文件大小
 * 
 * 使用方法:
 * node scripts/compress-video.js [输入文件] [输出文件]
 * 或批量压缩:
 * node scripts/compress-video.js --batch
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 压缩配置
const COMPRESS_CONFIG = {
  // 分辨率: 720p (1280x720)，适合网页播放
  resolution: '1280x720',
  // 视频码率: 1.5Mbps
  videoBitrate: '1500k',
  // 音频码率: 128k
  audioBitrate: '128k',
  // 帧率: 30fps
  frameRate: 30,
  // 编码器: H.264 (兼容性好)
  videoCodec: 'libx264',
  // 预设: fast (平衡速度和质量)
  preset: 'fast',
  // CRF: 28 (质量与大小平衡，0-51，越小质量越好)
  crf: 28
}

// 检查 FFmpeg 是否安装
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' })
    return true
  } catch {
    console.error('❌ FFmpeg 未安装！')
    console.log('请安装 FFmpeg:')
    console.log('  Windows: choco install ffmpeg')
    console.log('  Mac: brew install ffmpeg')
    console.log('  Linux: sudo apt install ffmpeg')
    return false
  }
}

// 压缩单个视频
function compressVideo(inputPath, outputPath) {
  console.log(`\n🎬 压缩视频: ${path.basename(inputPath)}`)
  
  const inputSize = fs.statSync(inputPath).size
  console.log(`📦 原始大小: ${(inputSize / 1024 / 1024).toFixed(2)} MB`)
  
  const cmd = `ffmpeg -i "${inputPath}" ` +
    `-c:v ${COMPRESS_CONFIG.videoCodec} ` +
    `-preset ${COMPRESS_CONFIG.preset} ` +
    `-crf ${COMPRESS_CONFIG.crf} ` +
    `-b:v ${COMPRESS_CONFIG.videoBitrate} ` +
    `-maxrate ${COMPRESS_CONFIG.videoBitrate} ` +
    `-bufsize ${COMPRESS_CONFIG.videoBitrate} ` +
    `-r ${COMPRESS_CONFIG.frameRate} ` +
    `-s ${COMPRESS_CONFIG.resolution} ` +
    `-c:a aac ` +
    `-b:a ${COMPRESS_CONFIG.audioBitrate} ` +
    `-movflags +faststart ` +  // 优化网络播放
    `-y "${outputPath}"`
  
  try {
    execSync(cmd, { stdio: 'inherit' })
    
    const outputSize = fs.statSync(outputPath).size
    const ratio = ((1 - outputSize / inputSize) * 100).toFixed(1)
    
    console.log(`✅ 压缩完成: ${path.basename(outputPath)}`)
    console.log(`📦 压缩后大小: ${(outputSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📉 压缩率: ${ratio}%`)
    
    return true
  } catch (error) {
    console.error(`❌ 压缩失败: ${error.message}`)
    return false
  }
}

// 批量压缩目录下的所有视频
function batchCompress(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.mp4'))
    .map(f => path.join(inputDir, f))
  
  console.log(`\n🎯 找到 ${files.length} 个视频文件`)
  
  let success = 0
  let failed = 0
  
  for (const file of files) {
    const outputPath = path.join(outputDir, path.basename(file))
    if (compressVideo(file, outputPath)) {
      success++
    } else {
      failed++
    }
  }
  
  console.log(`\n📊 批量压缩完成:`)
  console.log(`  ✅ 成功: ${success}`)
  console.log(`  ❌ 失败: ${failed}`)
}

// 主函数
function main() {
  if (!checkFFmpeg()) {
    process.exit(1)
  }
  
  const args = process.argv.slice(2)
  
  if (args.includes('--batch')) {
    // 批量压缩
    const inputDir = path.join(__dirname, '../public/videos/zibo-trip')
    const outputDir = path.join(__dirname, '../public/videos/zibo-trip/compressed')
    batchCompress(inputDir, outputDir)
  } else if (args.length >= 2) {
    // 单个文件压缩
    const [input, output] = args
    compressVideo(input, output)
  } else {
    console.log('使用方法:')
    console.log('  批量压缩: node scripts/compress-video.js --batch')
    console.log('  单个压缩: node scripts/compress-video.js 输入.mp4 输出.mp4')
  }
}

main()
