<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const {
  mini,
  fullscreen = false,
} = defineProps<{
  loggedIn?: boolean
  imageClass?: HTMLAttributes['class']
  hideAction?: boolean
  mini?: boolean
  editable?: boolean
  fullscreen?: boolean
  idle?: boolean
  priority?: boolean
}>()

const emit = defineEmits<{
  deleted: [id: string]
  update: [photo: IPhoto]
}>()

const photo = defineModel<IPhoto>('photo', { required: true })
const photoWithExif = computed(() => photo.value.make || photo.value.model || photo.value.focalLength || photo.value.focalLengthIn35mmFormat || photo.value.fNumber || photo.value.exposureTime || photo.value.iso || photo.value.exposureCompensation)

const isMini = computed(() => mdScreen.value && mini)

const localPath = useLocalePath()

// 使用 localPath 拼接避免编码问题
const cameraLink = computed(() => {
  const p = photo.value
  if (!p.make && !p.model)
    return null
  const make = p.make || ''
  const model = p.model || ''
  return `${localPath('/camera')}/${encodeURIComponent(`${make}|${model}`)}`
})

const lensLink = computed(() => {
  const p = photo.value
  if (!p.lensModel)
    return null
  return `${localPath('/lens')}/${encodeURIComponent(p.lensModel)}`
})

const { deletingPhoto, deletePhoto: _deletePhoto } = useDeletePhoto()
const showDeletePopover = ref(false)
function deletePhoto(id: string) {
  _deletePhoto(id).then(() => emit('deleted', id)).finally(() => showDeletePopover.value = false)
}
</script>

<template>
  <div :class="[fullscreen ? 'h-dvh w-dvw' : 'flex gap-1 lt-md:flex-col lg:gap-8 md:gap-4']">
    <div v-if="isMini" class="relative md:flex-[2] xl:flex-[3]">
      <PhotoItemCard class="h-full w-full inset-0 absolute" :photo="photo" :image-class="imageClass" :priority="priority" mini />
    </div>
    <PhotoItemCard
      v-else
      :photo="photo"
      :image-class="imageClass"
      :fullscreen="fullscreen"
      :priority="priority"
      :class="fullscreen ? 'flex-1' : 'md:flex-[2] xl:flex-[3]'"
    />
    <!-- info outer -->
    <div
      class="color-foreground/67 transition-all duration-300"
      :class="[
        fullscreen
          ? 'absolute z-49 inset-x-0 bottom-2 flex justify-center pointer-events-none'
          : 'h-fit top-16 relative sticky z-1 md:flex-[1]',
        isMini ? 'md:top-0' : '',
        fullscreen ? idle
          ? 'translate-y-full op-0 pointer-events-none'
          : 'translate-y-0 op-100'
        : '',
      ]"
    >
      <!-- info inner -->
      <div
        :class="fullscreen
          ? 'bg-background/30 backdrop-blur shadow-2xl rounded-md w-fit h-fit p-4 pointer-events-auto'
          : 'h-full'"
      >
        <!-- title and action buttons -->
        <div
          class="flex"
          :class="fullscreen ? 'mb-2 justify-between' : 'lt-md:mb-2 md:flex-col lt-md:justify-between'"
        >
          <div>
            <h2 class="text-xl color-foreground">
              {{ photo.title }}
            </h2>
            <p class="text-sm">
              {{ photo.caption }}
            </p>
          </div>
          <div v-if="!hideAction" class="ml--2.4 flex min-h-2 items-center">
            <slot name="action-button" />
            <EditPhotoDialog
              v-if="editable"
              :photo="photo"
            >
              <TooltipIconButton
                v-if="loggedIn"
                :label="$t('button.edit')"
                icon="i-lucide-edit"
                variant="ghost"
                size="icon"
              />
            </EditPhotoDialog>
            <DeleteConfirmPopover
              v-if="loggedIn"
              v-model:open="showDeletePopover"
              :loading="deletingPhoto === photo.id"
              @confirm="loggedIn && deletePhoto(photo.id)"
            >
              <TooltipIconButton
                :label="$t('button.delete')"
                icon="i-lucide-trash"
                variant="ghost"
                size="icon"
                @click="showDeletePopover = true"
              />
            </DeleteConfirmPopover>
          </div>
        </div>

        <div
          class="text-sm flex gap-4"
          :class="fullscreen ? 'justify-between' : 'md:flex-col md:gap-2 lt-md:justify-between'"
        >
          <!-- date and camera/lens info -->
          <div class="flex flex-col gap-2">
            <span class="text-0.8em leading-none op-66" data-allow-mismatch="text">{{ formatDate(photo.takenAt) }}</span>
            <div>
              <NuxtLink
                v-if="photoWithExif && cameraLink"
                :to="cameraLink"
                class="m--1 p-1 rounded-lg op-80 flex gap-1 w-fit transition-colors items-center hover:bg-muted"
              >
                <div class="i-lucide-camera op-70 flex-shrink-0" />
                <span>{{ formatCameraText(photo) }}</span>
              </NuxtLink>
              <div v-else-if="photoWithExif" class="flex gap-1 items-center">
                <div class="i-lucide-camera op-70 flex-shrink-0" />
                <span>{{ formatCameraText(photo) }}</span>
              </div>
              <NuxtLink
                v-if="photoWithExif && lensLink"
                :to="lensLink"
                class="m--1 p-1 rounded-lg op-80 flex gap-1 w-fit transition-colors items-center hover:bg-muted"
              >
                <div class="i-lucide-aperture op-70 flex-shrink-0" />
                <span>{{ formatLensText(photo) }}</span>
              </NuxtLink>
              <div v-else-if="photoWithExif" class="flex gap-1 items-center">
                <div class="i-lucide-aperture op-70 flex-shrink-0" />
                <span>{{ formatLensText(photo) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-x-2 gap-y-1" :class="{ 'md:flex-col': !fullscreen }">
              <NuxtLink
                v-for="tag in (photo.tags ? photo.tags.split(',') : [])"
                :key="tag"
                :to="`${localPath('/tag')}/${encodeURIComponent(tag)}`"
                class="m--1 p-1 rounded-lg op-80 w-fit transition-colors hover:bg-muted"
              >
                <Tag :label="tag" />
              </NuxtLink>
            </div>
          </div>
          <!-- exposure info -->
          <div
            v-if="photoWithExif"
            class="leading-tight font-mono flex flex-col"
          >
            <div class="flex items-baseline">
              <span>{{ photo.focalLength ? toFixed(photo.focalLength, 1) : '--' }}mm</span>
              <span class="mx-1"> · </span>
              <span
                v-if="photo.focalLengthIn35mmFormat"
                :title="$t('camera_lens.focal_length_35mm')"
                class="text-xs op-50"
              >{{ photo.focalLengthIn35mmFormat }}mm</span>
            </div>
            <div class="flex items-baseline">
              <span class="text-1.1em op-60">ƒ</span>
              <span>/{{ photo.fNumber || '--' }}</span>
            </div>
            <div class="flex gap-1 items-baseline">
              <span>{{ photo.exposureTime ? formatExposureTime(photo.exposureTime) : '--' }}</span>
              <span class="text-0.8em op-50">s</span>
            </div>
            <div class="flex gap-1 items-baseline">
              <span class="text-0.8em op-50">ISO</span>
              <span>{{ photo.iso || '--' }}</span>
            </div>
            <div class="flex gap-1 items-baseline">
              <span>{{ photo.exposureCompensation ? `${photo.exposureCompensation > 0 ? '+' : ''}${photo.exposureCompensation.toFixed(1)}` : '0' }}</span>
              <span class="text-0.8em op-50">ev</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
