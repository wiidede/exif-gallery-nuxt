<script setup lang="ts">
const {
  showAdmin = false,
  showLogout = false,
} = defineProps<{
  links: { icon: string, to: string, tooltip: string }[]
  showAdmin?: boolean
  showLogout?: boolean
}>()

const config = useRuntimeConfig()
const { path } = toRefs(useRoute())
const localePath = useLocalePath()

const disconnect = ref(false)
const { loggedIn, clear } = useUserSession()

async function clearSession() {
  disconnect.value = true
  await clear().finally(() => disconnect.value = false)
  navigateTo(localePath('/admin/login'))
}
</script>

<template>
  <header class="sticky top-0 z-50 h-12 w-full flex items-center justify-between border-b border-dashed bg-background/60 px-4 backdrop-blur">
    <nav div class="min-w-0 flex flex-auto items-center justify-items-start">
      <NuxtLinkLocale to="/" class="me-2 min-w-0 flex-[0_1_auto] truncate font-medium">
        <Logo class="size-6 text-primary op-80" />
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/" class="min-w-0 flex-[0_1_auto] truncate font-medium lt-md:hidden">
        {{ config.public.title || $t('title') }}
      </NuxtLinkLocale>
    </nav>
    <nav div class="min-w-0 flex flex-auto items-center justify-items-start">
      <TooltipIconButton
        v-for="link in links"
        :key="link.to"
        :label="link.tooltip"
      >
        <NuxtLink
          :to="link.to"
          class="h-7 flex items-center justify-center rounded-md px-4 text-center text-sm font-medium transition-colors data-[active=true]:bg-muted data-[active=true]:text-primary hover:text-primary"
          :data-active="path === link.to"
        >
          <div :class="link.icon" />
        </NuxtLink>
      </TooltipIconButton>
    </nav>
    <nav class="flex items-center">
      <NuxtLinkLocale to="https://github.com/wiidede/exif-gallery-nuxt" target="_blank">
        <TooltipIconButton :label="$t('header.github')" icon="i-lucide-github op-50" />
      </NuxtLinkLocale>
      <NuxtLinkLocale v-if="showAdmin" to="/admin">
        <TooltipIconButton :label="$t('header.admin')" icon="i-lucide-server-cog op-50" />
      </NuxtLinkLocale>
      <TooltipIconButton
        v-if="showLogout && loggedIn"
        :loading="disconnect"
        :label="$t('header.logout')"
        icon="i-lucide-power text-red"
        @click="clearSession()"
      />
      <ThemePopover class="flex-shrink-0" />
    </nav>
  </header>
</template>
