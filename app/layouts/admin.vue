<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const links = computed(() => [{
  icon: 'i-lucide-layout-grid',
  to: localePath('/admin'),
  tooltip: t('header.admin_dashboard'),
}, {
  icon: 'i-lucide-upload',
  to: localePath('/admin/upload'),
  tooltip: t('header.admin_upload'),
}])
</script>

<template>
  <Header
    :links="links"
    :show-logout="true"
  />
  <slot />
</template>
