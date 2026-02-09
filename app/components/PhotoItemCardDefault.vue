<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

defineProps<{
  photo?: IPhoto
  imageClass?: HTMLAttributes['class']
  mini?: boolean
  fullscreen?: boolean
}>()
</script>

<template>
  <div
    :class="[
      fullscreen ? 'h-dvh w-dvw' : 'max-h-[calc(100dvh-5rem)]',
      mini ? 'h-full' : 'w-full',
    ]"
    :style="{ aspectRatio: !mini && photo?.aspectRatio || undefined }"
  >
    <picture v-if="photo">
      <source v-if="photo.avif" :srcset="`/photos/${photo.avif}`" type="image/avif">
      <source v-if="photo.webp" :srcset="`/photos/${photo.webp}`" type="image/webp">
      <img
        :src="`/photos/${photo.jpeg || photo.webp || photo.avif}`"
        :class="cn('h-full m-auto object-contain', fullscreen ? 'rounded-none' : 'rounded-lg', imageClass)"
      >
    </picture>
  </div>
</template>

<style scoped>

</style>
