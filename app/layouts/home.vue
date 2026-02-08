<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const links = computed(() => [
  {
    icon: 'i-lucide-gallery-vertical',
    to: localePath('/'),
    tooltip: t('header.gallery_view'),
  },
  {
    icon: 'i-lucide-layout-grid',
    to: localePath('/grid'),
    tooltip: t('header.grid_view'),
  },
])
</script>

<template>
  <Header
    :links="links"
    :show-admin="true"
  />
  <slot />
</template>
