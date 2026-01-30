<script setup lang="ts">
import type { AIProviderConfig, ProviderType } from '../composables/useAIConfig'
import { fetchModels } from '../utils/aiProviders'

interface Props {
  provider?: AIProviderConfig
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  provider: undefined,
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [provider: Omit<AIProviderConfig, 'id' | 'createdAt'>]
}>()

// 表单状态
const isEditing = computed(() => !!props.provider)
const providerId = computed(() => props.provider?.id || `custom-${Date.now()}`)

const name = ref(props.provider?.name || '')
const type = ref<ProviderType>(props.provider?.type || 'openai')
const apiKey = ref(props.provider?.apiKey || '')
const baseUrl = ref(props.provider?.baseURL || getDefaultBaseUrl(type.value))
const model = ref(props.provider?.model || '')
const availableModels = ref<string[]>([])
const isLoadingModels = ref(false)
const testConnectionResult = ref<{ success: boolean, error?: string, modelCount?: number } | null>(null)

// 监听类型变化，自动更新默认 baseURL
watch(type, (newType) => {
  if (!props.provider) {
    baseUrl.value = getDefaultBaseUrl(newType)
  }
})

// 获取默认 baseURL
function getDefaultBaseUrl(providerType: ProviderType): string {
  switch (providerType) {
    case 'openai':
      return 'https://api.openai.com/v1/'
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta'
    default:
      return ''
  }
}

// 标准化 base URL（确保以 / 结尾）
function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

// Fetch 模型列表
async function fetchModelsList() {
  if (!apiKey.value) {
    return
  }

  // Gemini 不需要 base URL，但 OpenAI 需要
  if (type.value === 'openai' && !baseUrl.value) {
    return
  }

  isLoadingModels.value = true
  availableModels.value = []
  testConnectionResult.value = null
  try {
    const tempConfig: AIProviderConfig = {
      id: 'temp',
      name: name.value,
      type: type.value,
      apiKey: apiKey.value,
      baseURL: baseUrl.value ? normalizeBaseUrl(baseUrl.value) : undefined,
      model: model.value,
      enabled: false,
      createdAt: Date.now(),
    }

    const models = await fetchModels(tempConfig)
    availableModels.value = models.map(m => m.id)

    // 如果当前 model 不在列表中且列表不为空，自动选择第一个
    if (availableModels.value.length > 0 && !availableModels.value.includes(model.value!)) {
      model.value = availableModels.value[0]!
    }

    // 显示成功提示，包含模型数量
    if (availableModels.value.length > 0) {
      testConnectionResult.value = {
        success: true,
        error: undefined,
        modelCount: availableModels.value.length,
      }
    }
    else {
      testConnectionResult.value = {
        success: false,
        error: 'No models available',
      }
    }
  }
  catch (error) {
    console.error('Failed to fetch models:', error)
    testConnectionResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models',
    }
  }
  finally {
    isLoadingModels.value = false
  }
}

// 保存
function handleSave() {
  if (!name.value || !apiKey.value) {
    return
  }

  emit('save', {
    name: name.value,
    type: type.value,
    apiKey: apiKey.value,
    baseURL: baseUrl.value ? normalizeBaseUrl(baseUrl.value) : undefined,
    model: model.value!,
    enabled: props.provider?.enabled ?? true,
  })

  // 重置表单
  resetForm()
  emit('update:open', false)
}

// 取消
function handleCancel() {
  resetForm()
  emit('update:open', false)
}

// 重置表单
function resetForm() {
  name.value = ''
  type.value = 'openai'
  apiKey.value = ''
  baseUrl.value = getDefaultBaseUrl('openai')
  model.value = ''
  availableModels.value = []
  testConnectionResult.value = null
}

// 监听 open 变化，重置表单
watch(() => props.open, (isOpen) => {
  if (isOpen && props.provider) {
    // 编辑模式，填充数据
    name.value = props.provider.name
    type.value = props.provider.type
    apiKey.value = props.provider.apiKey
    baseUrl.value = props.provider.baseURL || getDefaultBaseUrl(props.provider.type)
    model.value = props.provider.model || ''
    availableModels.value = []
    testConnectionResult.value = null
  }
  else if (!isOpen) {
    // 关闭时重置
    resetForm()
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? $t('ai_config.edit_provider') : $t('ai_config.add_provider') }}</DialogTitle>
        <DialogDescription>
          {{ isEditing ? $t('ai_config.edit_provider_desc') : $t('ai_config.add_provider_desc') }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4 space-y-4">
        <!-- 供应商名称 -->
        <div>
          <Label for="provider-name">{{ $t('ai_config.provider_name') }}</Label>
          <Input
            id="provider-name"
            v-model="name"
            :placeholder="$t('ai_config.provider_name_placeholder')"
            :disabled="isEditing && providerId === 'openai' || providerId === 'gemini'"
          />
        </div>

        <!-- 供应商类型 -->
        <div>
          <Label for="provider-type">{{ $t('ai_config.provider_type') }}</Label>
          <Select id="provider-type" v-model="type" :disabled="isEditing && (providerId === 'openai' || providerId === 'gemini')">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">
                OpenAI Compatible
              </SelectItem>
              <SelectItem value="gemini">
                Gemini
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Base URL -->
        <div>
          <Label for="provider-base-url">{{ $t('ai_config.base_url') }}</Label>
          <Input
            id="provider-base-url"
            v-model="baseUrl"
            :placeholder="$t('ai_config.base_url_placeholder')"
          />
        </div>

        <!-- API Key -->
        <div>
          <Label for="provider-api-key">{{ $t('ai_config.secret_key') }}</Label>
          <Input
            id="provider-api-key"
            v-model="apiKey"
            type="password"
            :placeholder="$t('ai_config.secret_key_placeholder')"
          />
        </div>

        <!-- 模型 -->
        <div>
          <div class="mb-1 flex items-center justify-between">
            <Label for="provider-model">{{ $t('ai_config.model') }}</Label>
            <Button
              v-if="apiKey"
              variant="ghost"
              size="sm"
              class="h-6 text-xs"
              :disabled="isLoadingModels"
              @click="fetchModelsList"
            >
              <div
                :class="isLoadingModels ? 'i-lucide-loader-2 animate-spin' : 'i-lucide-refresh-cw'"
                class="mr-1"
              />
              {{ $t('ai_config.fetch_models') }}
            </Button>
          </div>
          <ModelCombobox
            v-model="model"
            :models="availableModels"
            :placeholder="$t('ai_config.model_placeholder')"
          />
        </div>

        <!-- 测试连接结果 -->
        <div v-if="testConnectionResult" class="border rounded p-2 text-xs">
          <div v-if="testConnectionResult.success" class="flex items-center text-green-600">
            <div class="i-lucide-check-circle mr-1" />
            {{ $t('ai_config.connection_success') }} ({{ testConnectionResult.modelCount }} {{ $t('ai_config.models') }})
          </div>
          <div v-else class="flex items-center text-red-600">
            <div class="i-lucide-x-circle mr-1" />
            {{ $t('ai_config.connection_failed') }}: {{ testConnectionResult.error }}
          </div>
        </div>
      </div>
      <DialogFooter class="gap-y-2">
        <Button variant="outline" @click="handleCancel">
          {{ $t('ai_config.cancel') }}
        </Button>
        <Button :disabled="!name || !apiKey" @click="handleSave">
          {{ $t('ai_config.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
