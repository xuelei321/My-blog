<template>
  <div ref="videoContainer" class="lazy-video-wrapper">
    <!-- 封面图/占位符 -->
    <div 
      v-if="!isLoaded" 
      class="video-placeholder"
      @click="loadVideo"
    >
      <img 
        v-if="poster" 
        :src="poster" 
        class="video-poster"
        alt="视频封面"
        loading="lazy"
      />
      <div v-else class="video-placeholder-bg">
        <div class="play-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </div>
      </div>
      
      <!-- 播放按钮 -->
      <div class="play-button" :class="{ 'loading': isLoading }">
        <div v-if="isLoading" class="spinner"></div>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)" stroke="none"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
      </div>
      
      <!-- 加载进度 -->
      <div v-if="isLoading && loadProgress > 0" class="load-progress">
        <div class="progress-bar" :style="{ width: loadProgress + '%' }"></div>
        <span class="progress-text">{{ loadProgress }}%</span>
      </div>
    </div>
    
    <!-- 真实视频 -->
    <video
      v-show="isLoaded"
      ref="videoElement"
      :src="videoSrc"
      :poster="poster"
      controls
      preload="metadata"
      playsinline
      class="lazy-video"
      @loadeddata="onVideoLoaded"
      @loadstart="onLoadStart"
      @progress="onProgress"
      @error="onVideoError"
      @waiting="onWaiting"
      @playing="onPlaying"
    >
      <p>您的浏览器不支持视频播放。</p>
    </video>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  poster?: string
}

const props = defineProps<Props>()

const videoContainer = ref<HTMLDivElement>()
const videoElement = ref<HTMLVideoElement>()
const isLoaded = ref(false)
const isLoading = ref(false)
const loadProgress = ref(0)
const videoSrc = ref('')

// Intersection Observer 懒加载
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!videoContainer.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoaded.value && !isLoading.value) {
          // 自动预加载（静默加载，不显示加载状态）
          preloadVideo()
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '200px 0px', // 提前 200px 开始预加载
      threshold: 0.05
    }
  )
  
  observer.observe(videoContainer.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

// 预加载视频（静默）
const preloadVideo = () => {
  if (!videoElement.value) return
  
  videoSrc.value = props.src
  videoElement.value.src = props.src
  videoElement.value.preload = 'metadata'
  videoElement.value.load()
}

// 用户点击播放
const loadVideo = () => {
  if (isLoading.value || isLoaded.value) return
  
  isLoading.value = true
  loadProgress.value = 0
  
  if (!videoElement.value) return
  
  videoSrc.value = props.src
  videoElement.value.src = props.src
  videoElement.value.preload = 'auto'
  videoElement.value.load()
  
  // 自动播放
  videoElement.value.play().catch(() => {
    // 自动播放被阻止，等待用户交互
  })
}

const onLoadStart = () => {
  isLoading.value = true
}

const onProgress = () => {
  if (!videoElement.value) return
  
  const buffered = videoElement.value.buffered
  if (buffered.length > 0) {
    const loaded = buffered.end(buffered.length - 1)
    const duration = videoElement.value.duration
    if (duration > 0) {
      loadProgress.value = Math.round((loaded / duration) * 100)
    }
  }
}

const onVideoLoaded = () => {
  isLoaded.value = true
  isLoading.value = false
  loadProgress.value = 100
  console.log('[LazyVideo] 视频加载完成:', props.src)
}

const onVideoError = (e: Event) => {
  console.error('[LazyVideo] 视频加载失败:', props.src, e)
  isLoading.value = false
  loadProgress.value = 0
}

const onWaiting = () => {
  isLoading.value = true
}

const onPlaying = () => {
  isLoading.value = false
}
</script>

<style scoped>
.lazy-video-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
  cursor: pointer;
}

.video-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.video-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-placeholder:hover .video-poster {
  transform: scale(1.05);
}

.video-placeholder-bg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #888;
}

.play-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

/* 播放按钮 */
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.play-button.loading {
  opacity: 0.8;
}

/* 加载动画 */
.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 加载进度 */
.load-progress {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #ff6b6b;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: white;
  opacity: 0.8;
}

/* 视频元素 */
.lazy-video {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 16/9;
}

/* 淡入动画 */
.lazy-video {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .video-placeholder {
    aspect-ratio: 16/9;
  }
  
  .play-button svg {
    width: 40px;
    height: 40px;
  }
}
</style>
