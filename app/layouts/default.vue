<script setup>
// 路由预加载 - 智能预加载可见链接和悬停链接
const { preloadCriticalRoutes } = useRoutePreload({
  delay: 100,
  threshold: 0.1,
})

onMounted(() => {
  // 预加载关键路由
  preloadCriticalRoutes(['/', '/blogs'])
})
</script>

<template>
  <div class="gd-container font-spacegrotesk">
    <header class="fixed w-full bg-[#F1F2F4] dark:bg-slate-950 z-10">
      <MainHeader />
    </header>
    <main>
      <div class="p-9" />
      <slot />
    </main>
    <footer>
      <MainFooter />
    </footer>
  </div>
</template>

<style scoped>
.gd-container {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
}
</style>
