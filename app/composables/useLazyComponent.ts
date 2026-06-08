/**
 * 组件懒加载组合式函数
 * 
 * 核心功能：
 * 1. 路由级组件按需加载
 * 2. 视口内组件预加载
 * 3. 加载状态管理
 * 4. 错误重试机制
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'

interface LazyComponentOptions {
  delay?: number // 延迟加载时间（毫秒）
  timeout?: number // 加载超时时间
  retry?: number // 重试次数
  loadingComponent?: Component // 加载中组件
  errorComponent?: Component // 错误组件
}

/**
 * 创建按需加载的异步组件
 * 
 * 使用示例：
 * const HeavyChart = useLazyComponent(() => import('~/components/HeavyChart.vue'))
 * const HeavyChartWithRetry = useLazyComponent(
 *   () => import('~/components/HeavyChart.vue'),
 *   { retry: 3, delay: 200 }
 * )
 */
export function useLazyComponent(
  loader: AsyncComponentLoader,
  options: LazyComponentOptions = {}
) {
  const {
    delay = 0,
    timeout = 30000,
    retry = 0,
    loadingComponent,
    errorComponent,
  } = options

  return defineAsyncComponent({
    loader,
    loadingComponent,
    errorComponent,
    delay,
    timeout,
    onError(error, retryFn, fail, attempts) {
      if (attempts <= retry) {
        retryFn()
      } else {
        fail()
      }
    },
  })
}

/**
 * 视口内组件懒加载
 * 
 * 使用示例：
 * const { isVisible, LazyWrapper } = useLazyViewport()
 * 
 * <LazyWrapper>
 *   <HeavyComponent v-if="isVisible" />
 * </LazyWrapper>
 */
export function useLazyViewport(options: IntersectionObserverInit = {}) {
  const isVisible = ref(false)
  const hasBeenVisible = ref(false)
  const targetRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    if (!('IntersectionObserver' in window)) {
      isVisible.value = true
      hasBeenVisible.value = true
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            hasBeenVisible.value = true
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01,
        ...options,
      }
    )

    if (targetRef.value) {
      observer.observe(targetRef.value)
    }

    onUnmounted(() => {
      observer.disconnect()
    })
  })

  // 懒加载包装组件
  const LazyWrapper = defineComponent({
    setup(_, { slots }) {
      return () =>
        h(
          'div',
          { ref: targetRef, class: 'lazy-wrapper' },
          slots.default?.()
        )
    },
  })

  return {
    isVisible,
    hasBeenVisible,
    targetRef,
    LazyWrapper,
  }
}

/**
 * 路由级组件懒加载（配合 Nuxt 路由）
 * 
 * 使用示例：
 * // pages/dashboard.vue
 * <script setup>
 * const LazyChart = useLazyRouteComponent('~/components/dashboard/HeavyChart.vue')
 * const LazyMap = useLazyRouteComponent('~/components/dashboard/Map.vue', { delay: 100 })
 * </script>
 * 
 * <template>
 *   <LazyChart />
 *   <LazyMap />
 * </template>
 */
export function useLazyRouteComponent(
  path: string,
  options: LazyComponentOptions = {}
) {
  const isRouteActive = ref(false)

  onMounted(() => {
    // 延迟加载，优先渲染关键内容
    setTimeout(() => {
      isRouteActive.value = true
    }, options.delay || 0)
  })

  const LazyComponent = useLazyComponent(
    () => import(/* @vite-ignore */ path),
    options
  )

  return {
    isRouteActive,
    LazyComponent,
  }
}

/**
 * 批量组件懒加载
 * 
 * 使用示例：
 * const components = useLazyComponentBatch({
 *   Chart: () => import('~/components/Chart.vue'),
 *   Map: () => import('~/components/Map.vue'),
 *   Table: () => import('~/components/Table.vue'),
 * })
 * 
 * <components.Chart />
 * <components.Map />
 */
export function useLazyComponentBatch(
  loaders: Record<string, AsyncComponentLoader>,
  options: LazyComponentOptions = {}
) {
  const components: Record<string, Component> = {}

  for (const [name, loader] of Object.entries(loaders)) {
    components[name] = useLazyComponent(loader, options)
  }

  return components
}
