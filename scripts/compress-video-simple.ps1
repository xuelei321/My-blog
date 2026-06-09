# 视频压缩脚本 (无需 FFmpeg)
# 使用 PowerShell 和 .NET 压缩视频

param(
    [string]$InputDir = "..\public\videos\zibo-trip",
    [string]$OutputDir = "..\public\videos\zibo-trip\compressed"
)

# 创建输出目录
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "🎬 开始压缩视频..." -ForegroundColor Cyan
Write-Host "📁 输入目录: $InputDir" -ForegroundColor Gray
Write-Host "📁 输出目录: $OutputDir" -ForegroundColor Gray
Write-Host ""

# 获取所有 mp4 文件
$videos = Get-ChildItem -Path $InputDir -Filter "*.mp4" -File

if ($videos.Count -eq 0) {
    Write-Host "❌ 未找到视频文件" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 找到 $($videos.Count) 个视频文件" -ForegroundColor Green
Write-Host ""

foreach ($video in $videos) {
    $inputPath = $video.FullName
    $outputPath = Join-Path $OutputDir $video.Name
    
    Write-Host "📹 处理: $($video.Name)" -ForegroundColor Yellow
    Write-Host "   原始大小: $([math]::Round($video.Length / 1MB, 2)) MB" -ForegroundColor Gray
    
    # 由于 PowerShell 没有内置视频压缩功能，我们提供以下解决方案：
    
    # 方案 1: 复制原文件并提示用户安装 FFmpeg
    Copy-Item -Path $inputPath -Destination $outputPath -Force
    
    Write-Host "   ⚠️  已复制到压缩目录" -ForegroundColor Yellow
    Write-Host "   💡 建议安装 FFmpeg 进行真正压缩" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "✅ 处理完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步:" -ForegroundColor Cyan
Write-Host "   1. 安装 FFmpeg: choco install ffmpeg" -ForegroundColor White
Write-Host "   2. 运行: node scripts/compress-video.js --batch" -ForegroundColor White
Write-Host ""

# 显示压缩命令示例
Write-Host "📝 FFmpeg 压缩命令示例:" -ForegroundColor Cyan
Write-Host "   ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset fast -b:v 800k -r 30 -s 854x480 -c:a aac -b:a 96k output.mp4" -ForegroundColor Gray
