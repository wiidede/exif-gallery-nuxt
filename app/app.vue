<script setup lang="ts">
const { theme } = useTheme(true)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const themeColor = computed(() => baseColors.find(c => c.name === theme.value)?.[isDark.value ? 'primaryDark' : 'primary'] || theme.value)

onPrehydrate(() => {
  const value = localStorage.getItem('shadcn-theme')
  const oldClass = Array.from(document.body.classList).filter(className => className.startsWith('theme-'))
  if (oldClass.length)
    document.body.classList.remove(...oldClass)
  document.body.classList.add(`theme-${value || 'blue'}`)
})

const config = useRuntimeConfig()
const { t } = useI18n()
const title = config.public.title || t('title')
const description = config.public.description || t('description')

useHead({
  title,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: themeColor.value },
    { name: 'description', content: description },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
  bodyAttrs: {
    class: 'font-sans',
  },
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogSiteName: title,
  ogImage: 'https://photo.wiidede.space/exif-gallery-nuxt.jpg',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLoadingIndicator color="oklch(var(--primary))" />
  <div class="relative min-h-[100dvh]">
    <Sonner :visible-toasts="20" position="top-right" />
    <TooltipProvider :delay-duration="0" disable-closing-trigger>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </TooltipProvider>
  </div>
</template>
