export type OrderByType = 'takenAt' | 'createdAt'
export type OrderType = 'desc' | 'asc'

export interface SortOption {
  label: string
  orderBy: OrderByType
  order: OrderType
}

export function usePhotoSort() {
  const { t } = useI18n()

  const orderBy = useCookie<OrderByType>('photo-order-by', {
    default: () => 'takenAt',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  const order = useCookie<OrderType>('photo-order', {
    default: () => 'desc',
    maxAge: 60 * 60 * 24 * 365,
  })

  const currentSort = computed(() => ({
    orderBy: orderBy.value,
    order: order.value,
  }))

  function setSort(newOrderBy: OrderByType, newOrder?: OrderType) {
    orderBy.value = newOrderBy
    if (newOrder !== undefined) {
      order.value = newOrder
    }
  }

  function getSortLabel(orderByValue: OrderByType): string {
    return orderByValue === 'takenAt'
      ? t('sort.taken_at')
      : t('sort.created_at')
  }

  return {
    orderBy,
    order,
    currentSort,
    setSort,
    getSortLabel,
  }
}
