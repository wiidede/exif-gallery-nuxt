export function usePhotosInfinite(params?: {
  hidden?: boolean
  orderBy?: string
  order?: string
  tag?: string
}, limit = 12): {
  photos: Ref<IPhoto[]>
  hasMore: Ref<boolean>
  loadMore: () => Promise<void>
  loading: Ref<boolean>
} {
  const pStore = usePhotosStore()
  const photosStore = pStore.photosStore
  const key = JSON.stringify(params)

  if (!photosStore.has(key)) {
    photosStore.set(key, {
      photos: ref([]),
      hasMore: ref(true),
      loading: ref(false),
    })
  }

  const state = photosStore.get(key)!

  const error = ref()

  const loadMore = async () => {
    if (state.loading.value || !state.hasMore.value)
      return

    error.value = undefined

    try {
      state.loading.value = true
      const response = await $fetch('/api/photos', {
        params: {
          ...params,
          limit,
          offset: state.photos.value.length,
        },
      })

      if (response.data.length < limit) {
        state.hasMore.value = false
      }

      state.photos.value.push(...response.data.map(deserializePhoto))
    }
    catch (err: any) {
      console.error(err)
      toast.error('An error occurred', { description: err?.data?.message || err?.message || 'Failed to get photos' })
    }
    finally {
      state.loading.value = false
    }
  }

  return {
    photos: state.photos,
    hasMore: state.hasMore,
    loadMore,
    loading: state.loading,
  }
}

export function usePhoto(id: MaybeRef<string>) {
  const photo = ref<IPhoto | null>(null)
  const loading = ref(false)

  async function fetchPhoto() {
    if (loading.value || !toValue(id))
      return
    try {
      loading.value = true
      const response = await $fetch(`/api/photos/${toValue(id) as ':id'}`, {
        method: 'get',
      })
      photo.value = deserializePhoto(response)
    }
    catch (err: any) {
      console.error(err)
      toast.error('An error occurred', { description: err?.data?.message || err?.message || 'Failed to get photo' })
    }
    finally {
      loading.value = false
    }
  }

  watch(() => toValue(id), () => {
    fetchPhoto()
  }, { immediate: true })

  return {
    photo,
    loading,
    refresh: fetchPhoto,
  }
}

export function useDeletePhoto() {
  const deletingPhoto = ref<string>()
  async function deletePhoto(id: string) {
    deletingPhoto.value = id
    await $fetch(`/api/photos/${id}`, { method: 'DELETE' }).catch((e) => {
      toast.error('An error occurred', { description: e.message || 'Please try again' })
    }).finally(() => {
      deletingPhoto.value = ''
    })
  }
  return { deletingPhoto, deletePhoto }
}
