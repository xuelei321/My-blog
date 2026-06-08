<script setup lang="ts">
/**
 * 通用骨架屏组件
 *
 * 功能特性：
 * 1. 多种预设类型 - 文本、图片、卡片、列表、文章
 * 2. 动画效果 - 闪烁动画、波浪动画
 * 3. 自定义尺寸 - 支持宽高自定义
 * 4. 暗色模式适配
 * 5. 客户端渲染避免 hydration mismatch
 */

interface Props {
  // 预设类型
  type?: 'text' | 'title' | 'image' | 'card' | 'list' | 'article' | 'avatar' | 'button'
  // 自定义宽高（优先级高于预设）
  width?: string
  height?: string
  // 行数（用于文本类型）
  rows?: number
  // 动画类型
  animation?: 'shimmer' | 'pulse'
  // 圆角
  rounded?: boolean | string
  // 自定义类名
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  width: undefined,
  height: undefined,
  rows: 3,
  animation: 'shimmer',
  rounded: true,
  class: '',
})

// 客户端挂载标记，避免 hydration mismatch
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// 预设尺寸配置
const presetSizes: Record<string, { width: string; height: string }> = {
  text: { width: '100%', height: '16px' },
  title: { width: '60%', height: '24px' },
  image: { width: '100%', height: '200px' },
  card: { width: '100%', height: '320px' },
  list: { width: '100%', height: '80px' },
  article: { width: '100%', height: '400px' },
  avatar: { width: '48px', height: '48px' },
  button: { width: '120px', height: '40px' },
}

// 计算实际尺寸
const actualWidth = computed(() => props.width || presetSizes[props.type]?.width || '100%')
const actualHeight = computed(() => props.height || presetSizes[props.type]?.height || '16px')

// 计算圆角
const borderRadius = computed(() => {
  if (props.rounded === false) return '0'
  if (props.rounded === true) {
    // 根据类型返回默认圆角
    if (props.type === 'avatar') return '50%'
    if (props.type === 'button') return '8px'
    if (props.type === 'card' || props.type === 'image') return '12px'
    return '4px'
  }
  return props.rounded
})

// 动画类名
const animationClass = computed(() => {
  return props.animation === 'pulse' ? 'skeleton-pulse' : 'skeleton-shimmer'
})
</script>

<template>
  <!-- 服务端渲染简单占位，避免 hydration mismatch -->
  <div
    v-if="!isMounted"
    class="skeleton-wrapper"
    :class="class"
  >
    <div
      class="skeleton-item skeleton-pulse"
      :style="{
        width: actualWidth,
        height: actualHeight,
        borderRadius,
      }"
    />
  </div>

  <!-- 客户端渲染完整骨架屏 -->
  <template v-else>
    <!-- 文本多行模式 -->
    <template v-if="type === 'text' && rows > 1">
      <div class="skeleton-wrapper" :class="class">
        <div
          v-for="i in rows"
          :key="i"
          class="skeleton-item"
          :class="[animationClass]"
          :style="{
            width: i === rows ? '70%' : actualWidth,
            height: actualHeight,
            borderRadius,
            marginBottom: i < rows ? '8px' : '0',
          }"
        />
      </div>
    </template>

    <!-- 列表模式 -->
    <template v-else-if="type === 'list'">
      <div class="skeleton-wrapper flex gap-4" :class="class">
        <div
          class="skeleton-item flex-shrink-0"
          :class="[animationClass]"
          :style="{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
          }"
        />
        <div class="flex-1 space-y-2">
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '40%',
              height: '16px',
              borderRadius: '4px',
            }"
          />
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '80%',
              height: '14px',
              borderRadius: '4px',
            }"
          />
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '60%',
              height: '14px',
              borderRadius: '4px',
            }"
          />
        </div>
      </div>
    </template>

    <!-- 卡片模式 -->
    <template v-else-if="type === 'card'">
      <div class="skeleton-wrapper" :class="class">
        <div
          class="skeleton-item"
          :class="[animationClass]"
          :style="{
            width: '100%',
            height: '180px',
            borderRadius: '12px 12px 0 0',
          }"
        />
        <div class="p-4 space-y-3">
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '70%',
              height: '20px',
              borderRadius: '4px',
            }"
          />
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '100%',
              height: '14px',
              borderRadius: '4px',
            }"
          />
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '80%',
              height: '14px',
              borderRadius: '4px',
            }"
          />
          <div class="flex gap-2 pt-2">
            <div
              class="skeleton-item"
              :class="[animationClass]"
              :style="{
                width: '60px',
                height: '24px',
                borderRadius: '12px',
              }"
            />
            <div
              class="skeleton-item"
              :class="[animationClass]"
              :style="{
                width: '60px',
                height: '24px',
                borderRadius: '12px',
              }"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 文章模式 -->
    <template v-else-if="type === 'article'">
      <div class="skeleton-wrapper max-w-4xl mx-auto" :class="class">
        <!-- 标题 -->
        <div
          class="skeleton-item mx-auto mb-4"
          :class="[animationClass]"
          :style="{
            width: '70%',
            height: '32px',
            borderRadius: '4px',
          }"
        />
        <!-- 元信息 -->
        <div class="flex justify-center gap-4 mb-8">
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '100px',
              height: '16px',
              borderRadius: '4px',
            }"
          />
          <div
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: '80px',
              height: '16px',
              borderRadius: '4px',
            }"
          />
        </div>
        <!-- 封面图 -->
        <div
          class="skeleton-item mb-8"
          :class="[animationClass]"
          :style="{
            width: '100%',
            height: '300px',
            borderRadius: '12px',
          }"
        />
        <!-- 正文 -->
        <div class="space-y-4">
          <div
            v-for="i in 6"
            :key="i"
            class="skeleton-item"
            :class="[animationClass]"
            :style="{
              width: i % 3 === 0 ? '60%' : '100%',
              height: '16px',
              borderRadius: '4px',
            }"
          />
        </div>
      </div>
    </template>

    <!-- 基础单元素模式 -->
    <template v-else>
      <div
        class="skeleton-item"
        :class="[animationClass, props.class]"
        :style="{
          width: actualWidth,
          height: actualHeight,
          borderRadius,
        }"
      />
    </template>
  </template>
</template>

<style scoped>
.skeleton-wrapper {
  display: block;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e8e8e8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
}

.dark .skeleton-item {
  background: linear-gradient(
    90deg,
    #2a2a2a 25%,
    #3a3a3a 50%,
    #2a2a2a 75%
  );
  background-size: 200% 100%;
}

/* 闪烁动画 */
.skeleton-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 脉冲动画 */
.skeleton-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
