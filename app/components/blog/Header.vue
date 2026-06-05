<script setup lang="ts">
interface Props {
  title?: string
  image?: string
  alt?: string
  description?: string
  date?: string
  tags?: Array<string>
  readingTime?: string
}

withDefaults(defineProps<Props>(), {
  title: 'no-title',
  image: '#',
  alt: 'no-img',
  description: 'no description',
  date: 'no-date',
  tags: () => [],
  readingTime: '',
})
</script>

<template>
  <header>
    <h1 class="text-xl dark:text-zinc-300 md:text-3xl lg:text-4xl m-7 font-bold text-left">
      {{ title || '' }}
    </h1>
    <NuxtImg
      :src="image || ''"
      :alt="alt || ''"
      width="600"
      class="rounded-2xl shadow-lg h-48 md:h-96 w-auto max-w-full object-contain"
    />
    <p class="text-xs sm:text-sm my-3 max-w-xl text-left text-zinc-600 dark:text-zinc-400">
      {{ description }}
    </p>
    <div class="flex w-full justify-start text-xs md:text-base my-8">
      <div class="md:flex text-black dark:text-zinc-300 content-center gap-8 text-xs sm:text-sm">
        <div class="flex items-center font-semibold">
          <LogoDate />
          <p>{{ date || '' }}</p>
        </div>
        <div v-if="readingTime" class="flex items-center font-semibold gap-2">
          <Icon name="mdi:clock-outline" size="20" />
          <p>{{ readingTime }}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap my-5">
          <LogoTag />
          <template v-for="tag in tags" :key="tag">
            <NuxtLink :to="`/categories/${tag.toLocaleLowerCase()}`">
              <span
                class="bg-gray-200 dark:bg-slate-900 rounded-md px-2 py-1 font-semibold hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors duration-200"
                >{{ tag }}</span
              >
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
