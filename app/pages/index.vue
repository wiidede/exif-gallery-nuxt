<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const currentPhoto = useState<string>('currentPhoto', () => ref(''))

const { loggedIn } = useUserSession()
const { orderBy, order } = usePhotoSort()

const LIMIT = 12
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

useInfiniteScroll(window, loadMore, { distance: 320, canLoadMore: () => hasMore.value })

// 设置导航上下文
const { setupNavigation } = useNavigationSetup('home', params.value, photos, hasMore, LIMIT)
setupNavigation()
</script>

<template>
  <section class="p-4 relative">
    <div class="flex flex-col gap-4 xl:px-20">
      <PhotoItem
        v-for="(photo, index) in photos"
        :key="photo.id"
        :photo="photo"
        :logged-in="loggedIn"
        :image-class="{ 'current-image': currentPhoto === photo.id }"
        :priority="index === 0"
        editable
        @deleted="photos = photos.filter(p => p.id !== $event)"
      >
        <template #action-button>
          <NuxtLinkLocale
            :to="`/p/${photo.id}`"
          >
            <TooltipIconButton
              :label="$t('button.view_photo')"
              icon="i-lucide-image-upscale text-muted-foreground"
              variant="ghost"
              size="icon"
              @click="currentPhoto = photo.id"
            />
          </NuxtLinkLocale>
        </template>
      </PhotoItem>
      <template v-if="loading">
        <Skeleton
          v-for="i in LIMIT"
          :key="i"
          class="rounded-lg w-full aspect-[4/3]"
        />
      </template>
      <div v-if="!loading && !photos?.length" class="m-auto flex flex-col gap4 h-66vh items-center justify-center">
        <h2>{{ $t('no_photos') }}</h2>
        <NuxtLinkLocale to="/admin">
          <Button>{{ $t('go_to_admin') }}</Button>
        </NuxtLinkLocale>
      </div>
    </div>
  </section>
</template>

<style scoped>
.current-image {
  view-transition-name: vtn-image;
}
</style>
