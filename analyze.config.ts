import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

/**
 * 打包分析配置
 * 
 * 使用方法：
 * npm run build -- --analyze
 * 
 * 功能：
 * 1. 可视化分析包体积
 * 2. 识别重复依赖
 * 3. 找出大体积模块
 */
export default defineConfig({
  plugins: [
    visualizer({
      filename: './.nuxt/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // treemap, sunburst, network
    }),
  ],
})
