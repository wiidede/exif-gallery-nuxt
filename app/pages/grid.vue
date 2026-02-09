<script setup lang="ts">
import { cn } from '~/lib/utils'

definePageMeta({
  layout: 'home',
})

const currentPhoto = useState<string>('currentPhoto', () => ref(''))
const isDrawerOpen = ref(false)
const { orderBy, order } = usePhotoSort()

const LIMIT = 36
const params = computed(() => ({
  hidden: false,
  orderBy: orderBy.value,
  order: order.value,
}))
const { photos, hasMore, loadMore, loading } = usePhotosInfinite(params, LIMIT)

// SSR 初始加载
const { data: initPhotos } = await useFetch('/api/photos', {
  params: {
    ...params.value,
    limit: LIMIT,
    offset: 0,
  },
})
if (initPhotos.value) {
  if (initPhotos.value.data.length < LIMIT)
    hasMore.value = false
  photos.value = initPhotos.value.data.map(deserializePhoto)
}

useInfiniteScroll(window, loadMore, { distance: 240, canLoadMore: () => hasMore.value })

// 设置导航上下文
const { setupNavigation } = useNavigationSetup('grid', params.value, photos, hasMore, LIMIT)
setupNavigation()

function getPhotoThumbnail(photo: IPhoto) {
  const path = photo.thumbnail || photo.jpeg || photo.webp || photo.avif
  if (!path)
    throw new Error('Photo has no Image File')
  return path
}
</script>

<template>
  <section class="p-4 flex flex-col gap-4 relative">
    <Button
      class="ml-auto md:hidden"
      size="icon"
      variant="outline"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <div class="i-lucide-tags" />
    </Button>
    <div class="flex gap-4 md:gap-8">
      <div class="flex-auto gap-1 grid grid-cols-3 h-min z-0 2xl:grid-cols-8 lg:grid-cols-5 sm:grid-cols-4 xl:grid-cols-6">
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
              class="rounded-lg w-full aspect-[4/3] object-cover"
              @click="currentPhoto = photo.id"
            >
          </NuxtLinkLocale>
        </PhotoItemCard>
        <template v-if="loading">
          <Skeleton
            v-for="i in LIMIT"
            :key="i"
            class="rounded-lg w-full aspect-[4/3]"
          />
        </template>
      </div>
      <div class="flex-shrink-0 h-min right-4 top-29 fixed md:top-16 md:sticky lt-md:z-40">
        <ScrollAreaDynamic
          class="rounded-md bg-card flex max-h-[calc(100dvh-8.25rem)] transition-transform duration-300 ease-in-out lt-md:p-4 md:bg-background md:max-h-[calc(100dvh-5rem)]"
          :class="cn(
            'lt-md:translate-x-[calc(100%_+_4rem)] md:shadow-none',
            { 'lt-md:translate-x-0 lt-md:shadow-lg lt-md:border border-input': isDrawerOpen },
          )"
        >
          <Tags />
        </ScrollAreaDynamic>
      </div>
    </div>
    <div v-if="!loading && !photos?.length" class="m-auto p4 flex flex-col gap4 h-66vh items-center justify-center">
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
