import { seoData } from './app/data'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-09-30',

  modules: [
    'nuxt-llms',
    '@nuxt/icon',
    '@nuxt/image',
    // '@nuxt/fonts', // 禁用字体模块避免500错误
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@formkit/auto-animate',
    '@stefanobartoletti/nuxt-social-share',
  ],

  llms: {
    domain: seoData.mySite,
    title: seoData.title,
    description: seoData.description,
  },

  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width,initial-scale=1',
      title: seoData.title,
      titleTemplate: `%s - ${seoData.title}`,
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  css: [
    '~/assets/css/main.css',
  ],

  sitemap: {
    sources: [seoData.mySite],
  },

  site: {
    url: seoData.mySite,
    name: 'XUELEI',
  },

  typescript: {
    strict: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/rss.xml'],
    },
    // 资源压缩与优化
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    // 路由规则优化
    routeRules: {
      // 静态资源长期缓存
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      '/images/**': { headers: { 'cache-control': 'public, max-age=86400' } },
      // API 路由不缓存
      '/api/**': { headers: { 'cache-control': 'no-cache' } },
    },
  },

  // 图片优化配置 - 渐进式加载 + CDN 支持
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    // 懒加载占位图
    placeholder: true,
    // 渐进式加载配置
    densities: [1, 2],
    // 外部 CDN 提供商配置（可选）
    // 如果使用自己的 CDN，取消下面注释并配置
    // domains: ['cdn.yourdomain.com'],
    // alias: {
    //   cdn: 'https://cdn.yourdomain.com/images',
    // },
  },

  // Vite 构建优化
  vite: {
    build: {
      // 代码分割
      rollupOptions: {
        output: {
          // 手动分包策略
          manualChunks: {
            // 将 Vue 相关库打包在一起
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将 UI 组件库打包在一起
            'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],
          },
        },
      },
      // chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,
    },
  },

  // 实验性功能
  experimental: {
    // 组件懒加载
    componentIslands: true,
    // 视图过渡
    viewTransition: true,
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'light',
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'dracula',
        },
      },
    },
    experimental: {
      nativeSqlite: true,
    },
  },
})
