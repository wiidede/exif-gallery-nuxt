<script setup lang="ts">
import { cn } from '~/lib/utils'

definePageMeta({
  layout: 'home',
})

const currentPhoto = useState<string>('currentPhoto', () => ref(''))
const isDrawerOpen = ref(false)

const LIMIT = 36
const params = {
  hidden: false,
}
const { photos, hasMore, loadMore, loading } = usePhotosInfinite(params, LIMIT)
const { data: initPhotos } = await useFetch('/api/photos', {
  params: {
    ...params,
    limit: LIMIT,
    offset: photos.value.length,
  },
})
if (initPhotos.value) {
  if (initPhotos.value.data.length < LIMIT)
    hasMore.value = false
  photos.value.push(...initPhotos.value.data.map(deserializePhoto))
}

useInfiniteScroll(window, loadMore, { distance: 240, canLoadMore: () => hasMore.value })

function getPhotoThumbnail(photo: IPhoto) {
  const path = photo.thumbnail || photo.jpeg || photo.webp || photo.avif
  if (!path)
    throw new Error('Photo has no Image File')
  return path
}
</script>

<template>
  <section class="relative flex flex-col gap-4 p-4">
    <Button
      class="ml-auto md:hidden"
      size="icon"
      variant="outline"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <div class="i-lucide-tags" />
    </Button>
    <div class="flex gap-4 md:gap-8">
      <div class="z-0 grid grid-cols-3 h-min flex-auto gap-1 2xl:grid-cols-8 lg:grid-cols-5 sm:grid-cols-4 xl:grid-cols-6">
        <PhotoItemCard
          v-for="photo in photos"
          :key="photo.id"
          :photo="photo"
          :translate-z="66"
          :image-class="{ 'current-image': currentPhoto === photo.id }"
        >
          <NuxtLinkLocale
            :to="`/p/${photo.id}`"
          >
            <img
              v-if="photo"
              :src="`/photos/${getPhotoThumbnail(photo)}`"
              :class="{ 'current-image': currentPhoto === photo.id }"
              class="aspect-[4/3] w-full rounded-lg object-cover"
              @click="currentPhoto = photo.id"
            >
          </NuxtLinkLocale>
        </PhotoItemCard>
        <template v-if="loading">
          <Skeleton
            v-for="i in LIMIT"
            :key="i"
            class="aspect-[4/3] w-full rounded-lg"
          />
        </template>
      </div>
      <div class="fixed right-4 top-29 h-min flex-shrink-0 md:sticky md:top-16 lt-md:z-40">
        <ScrollArea
          class="max-h-[calc(100vh-8.25rem)] flex rounded-lg bg-background transition-transform duration-300 ease-in-out md:max-h-[calc(100vh-5rem)] lt-md:p-4"
          viewport-class="h-inherit"
          :class="cn(
            'lt-md:translate-x-full md:shadow-none',
            { 'lt-md:translate-x-0 lt-md:shadow-lg lt-md:border border-input': isDrawerOpen },
          )"
        >
          <Tags />
        </ScrollArea>
      </div>
      <!-- <div class="fixed right-0 top-16 z-40 h-min md:sticky md:flex-shrink-0">
        <div
          :class="cn(
            'h-screen w-280px translate-x-full transform bg-background transition-transform duration-300 ease-in-out',
            'md:h-auto md:w-auto md:transform-none lt-md:p-4 md:shadow-none',
            { 'translate-x-0 shadow-lg': isDrawerOpen },
          )"
        >
          <ScrollArea class="max-h-[calc(100vh-5rem)] flex" viewport-class="h-inherit">
            <Tags />
          </ScrollArea>
        </div>
      </div> -->
    </div>
    <div v-if="!loading && !photos?.length" class="m-auto h-66vh flex flex-col items-center justify-center gap4 p4">
      <h2>{{ $t('no_photos') }}</h2>
      <NuxtLinkLocale to="/admin">
        <Button>{{ $t('go_to_admin') }}</Button>
      </NuxtLinkLocale>
    </div>
  </section>
</template>

<style scoped>
.current-image {
  view-transition-name: vtn-image;
}
</style>
