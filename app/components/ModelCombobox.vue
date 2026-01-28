<script setup lang="ts">
import { cn } from '~/lib/utils'
import { formatModelName } from '~/utils/aiProviders'

const props = defineProps<{
  models: string[]
  placeholder?: string
}>()

const modelValue = defineModel<string>({ default: undefined })

const open = ref(false)
const searchQuery = ref('')

const selectedModel = computed<{ id: string, name: string, isCustom: boolean } | null>(() => {
  const currentValue = modelValue.value
  if (!currentValue)
    return null
  const found = props.models.find(m => m === currentValue)
  if (found) {
    return { id: found, name: formatModelName(found), isCustom: false }
  }
  return { id: currentValue, name: formatModelName(currentValue), isCustom: true }
})

// 获取搜索后的模型列表
const filteredModels = computed(() => {
  if (!searchQuery.value)
    return props.models
  const search = searchQuery.value.toLowerCase()
  return props.models.filter(m => m.toLowerCase().includes(search))
})

function selectModel(selectedValue: string) {
  modelValue.value = selectedValue
  open.value = false
  searchQuery.value = ''
}

function useCustomInput() {
  if (searchQuery.value.trim()) {
    modelValue.value = searchQuery.value.trim()
    open.value = false
    searchQuery.value = ''
  }
}

function handleSearchInput(newQuery: string) {
  searchQuery.value = newQuery
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-full justify-between"
      >
        <span class="truncate">
          {{ selectedModel?.name || placeholder }}
        </span>
        <div class="i-lucide-chevron-down ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[300px] p-0">
      <Command>
        <CommandInput
          class="h-9"
          :placeholder="placeholder"
          :model-value="searchQuery"
          @update:model-value="handleSearchInput"
          @keydown.enter.prevent="useCustomInput"
        />
        <CommandList>
          <CommandGroupFixed>
            <CommandItemFixed
              v-if="searchQuery.trim()"
              :value="searchQuery"
              @select="selectModel(searchQuery)"
            >
              <div class="i-lucide-plus mr-2 h-4 w-4" />
              <span>{{ $t('ai_config.use_custom_model', { model: searchQuery }) }}</span>
            </CommandItemFixed>
            <div v-else class="py-3 text-center text-sm text-muted-foreground">
              <div>{{ $t('ai_config.search_to_add_custom_model') }}</div>
            </div>
          </CommandGroupFixed>

          <!-- 推荐模型列表 -->
          <CommandGroup :heading="$t('ai_config.available_models')">
            <CommandItem
              v-for="modelItem in filteredModels"
              :key="modelItem"
              :value="modelItem"
              @select="selectModel(modelItem)"
            >
              <div
                :class="cn(
                  'mr-2 h-4 w-4',
                  modelValue === modelItem ? 'opacity-100' : 'opacity-0',
                )"
                class="i-lucide-check"
              />
              {{ formatModelName(modelItem) }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
