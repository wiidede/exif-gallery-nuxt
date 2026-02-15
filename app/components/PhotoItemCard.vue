<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const {
  class: className,
  translateZ = 100,
} = defineProps<{
  photo?: IPhoto
  class?: HTMLAttributes['class']
  imageClass?: HTMLAttributes['class']
  translateZ?: number
  mini?: boolean
  fullscreen?: boolean
  priority?: boolean
}>()

const { disable3DCard } = useTheme()
</script>

<template>
  <slot v-if="disable3DCard || fullscreen">
    <PhotoItemCardDefault :photo="photo" :image-class="imageClass" :mini="mini" :fullscreen="fullscreen" :priority="priority" :class="cn({ 'h-full': mini && !fullscreen }, className)" />
  </slot>
  <ThreeDCardContainer v-else :container-class="cn('z-48 hover:z-49', { 'h-full': mini && !fullscreen }, className)" :class="mini && !fullscreen ? 'h-full' : ''">
    <ThreeDCardItem :translate-z="translateZ" :class="mini && !fullscreen ? 'h-full' : ''">
      <slot>
        <PhotoItemCardDefault :photo="photo" :image-class="imageClass" :mini="mini" :fullscreen="fullscreen" :priority="priority" />
      </slot>
    </ThreeDCardItem>
  </ThreeDCardContainer>
</template>

<style scoped>

</style>
