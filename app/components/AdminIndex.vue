<script setup lang="ts">
defineProps<{
  demo?: boolean
}>()

const { loggedIn } = useUserSession()

const LIMIT = 36
const { photos, hasMore, loadMore, loading } = usePhotosInfinite({
  hidden: false,
}, LIMIT)

useInfiniteScroll(window, loadMore, { distance: 320, canLoadMore: () => hasMore.value })

function getPhotoThumbnail(photo: IPhoto) {
  const path = photo.thumbnail || photo.jpeg || photo.webp || photo.avif
  if (!path)
    throw new Error('Photo has no Image File')
  return path
}

const { deletingPhoto, deletePhoto: _deletePhoto } = useDeletePhoto()
function deletePhoto(id: string) {
  _deletePhoto(id).then(() =>
    photos.value = photos.value.filter(photo => photo.id !== id),
  )
}

const selectedPhoto = ref<IPhoto>()

function openEditDialog(photo: IPhoto) {
  selectedPhoto.value = photo
}
</script>

<template>
  <div class="p-4 space-y-4">
    <NuxtLinkLocale :to="demo ? '/admin/demo/upload' : '/admin/upload'">
      <div class="group relative w-full flex flex-col items-center justify-center overflow-hidden border border-muted rounded-lg bg-background p-4 md:shadow-xl">
        <span class="pointer-events-none my-8 whitespace-pre-wrap from-black to-gray-300/80 bg-gradient-to-b bg-clip-text text-center text-5xl text-transparent font-semibold leading-none dark:from-white dark:to-slate-900/10">
          {{ $t('go_to_upload') }}
        </span>
        <BorderBeam
          color-from="oklch(var(--primary))"
          color-to="oklch(var(--primary-foreground))"
          :duration="2"
          :border-width="4"
        />
      </div>
    </NuxtLinkLocale>
    <div
      v-if="photos && photos.length"
      class="grid grid-cols-3 border-l border-t 2xl:grid-cols-8 lg:grid-cols-5 sm:grid-cols-4 xl:grid-cols-6"
    >
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="group relative border-b border-r p-2 hover:bg-muted"
      >
        <div class="aspect-[4/3] h-auto w-full flex rounded-lg">
          <div class="absolute right--0 top--0 z-[9999] hidden gap-1 sm:right-1 sm:top-1 group-hover:flex lt-md:translate-y--100%">
            <EditPhotoDialog
              :photo="selectedPhoto"
            >
              <TooltipIconButton
                :label="$t('button.edit')"
                icon="i-lucide-edit"
                variant="default"
                @click="openEditDialog(photo)"
              />
            </EditPhotoDialog>
            <TooltipIconButton
              :loading="deletingPhoto === photo.id"
              :label="$t('button.delete')"
              :disabled="!loggedIn"
              icon="i-lucide-trash"
              variant="default"
              @click="loggedIn && deletePhoto(photo.id)"
            />
          </div>
          <img
            v-if="photo"
            :src="`/photos/${getPhotoThumbnail(photo)}`"
            class="m-auto rounded-lg object-cover shadow-black/50 shadow-lg"
            :class="photo.aspectRatio ? photo.aspectRatio > (4 / 3) ? 'w-full h-auto' : 'h-full w-auto' : 'h-full w-full'"
          >
        </div>
        <div class="mt-2">
          <div class="flex items-center justify-center gap-2">
            <span> {{ photo.title }}</span>
          </div>
          <div class="flex items-center justify-center gap-2">
            <span class="text-sm text-muted-foreground">{{ photo.caption }}</span>
          </div>
          <div class="flex flex-wrap justify-center gap-x-1 gap-y-0">
            <Tag
              v-for="tag in photo.tags?.split(',') || []"
              :key="tag" :label="tag"
              class="text-sm text-muted-foreground"
            />
          </div>
        </div>
      </div>
      <template v-if="loading">
        <div v-for="i in LIMIT" :key="i">
          <Skeleton class="aspect-[4/3] w-full rounded-lg" />
        </div>
      </template>
    </div>
  </div>
</template>
