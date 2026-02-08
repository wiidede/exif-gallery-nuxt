<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const links = computed(() => [{
  icon: 'i-lucide-layout-grid',
  to: localePath('/admin/demo'),
  tooltip: t('header.admin_dashboard'),
}, {
  icon: 'i-lucide-upload',
  to: localePath('/admin/demo/upload'),
  tooltip: t('header.admin_upload'),
}])
</script>

<template>
  <Header
    :links="links"
  />
  <slot />
</template>
