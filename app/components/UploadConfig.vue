<script setup lang="ts">
import type { AIProviderConfig } from '../composables/useAIConfig'
import { formatModelName } from '../utils/aiProviders'

defineProps<{
  disabled?: boolean
}>()

const { config: uploadConfig } = useUploadConfig()
const { config: aiConfig, selectedProvider, addProvider, updateProvider, removeProvider, setSelectedProvider } = useAIConfig()

// AI 供应商管理状态
const showProviderDialog = ref(false)
const editingProvider = ref<AIProviderConfig | null>(null)

// 打开添加供应商对话框
function openAddProviderDialog() {
  editingProvider.value = null
  showProviderDialog.value = true
}

// 打开编辑供应商对话框
function openEditProviderDialog(provider: AIProviderConfig) {
  editingProvider.value = provider
  showProviderDialog.value = true
}

// 保存供应商
function handleSaveProvider(providerData: Omit<AIProviderConfig, 'id' | 'createdAt'>) {
  if (editingProvider.value) {
    // 更新现有供应商
    updateProvider(editingProvider.value.id, providerData)
  }
  else {
    // 添加新供应商
    addProvider(providerData)
  }
  editingProvider.value = null
}

// 选择供应商
function selectProvider(providerId: string) {
  setSelectedProvider(providerId)
  // 选中供应商时自动启用该供应商
  updateProvider(providerId, { enabled: true })
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <UploadConfigCard>
      <template #status>
        <ItemStatus :label="$t('compression_config.title')" :checked="uploadConfig.enableCompression" />
        <Card v-if="uploadConfig.enableCompression" class="flex flex-wrap gap-2 px-2">
          <ItemStatus :label="$t('compression_config.jpeg')" :checked="uploadConfig.formats.jpeg" />
          <ItemStatus :label="$t('compression_config.webp')" :checked="uploadConfig.formats.webp" />
          <ItemStatus :label="$t('compression_config.avif')" :checked="uploadConfig.formats.avif" />
        </Card>
        <ItemStatus :label="$t('compression_config.thumbnail')" :checked="uploadConfig.formats.thumbnail" />
      </template>
      <template #config>
        <Collapsible :open="uploadConfig.enableCompression">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="enable-compression"
              v-model="uploadConfig.enableCompression"
            />
            <Label for="enable-compression">{{ $t('compression_config.enable') }}</Label>
            <Tooltip>
              <TooltipTrigger as-child>
                <div class="i-lucide-info cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ $t('compression_config.info') }}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CollapsibleContent>
            <div class="pl-6">
              <Label class="text-muted-foreground font-medium">{{ $t('compression_config.formats') }}</Label>
              <div class="flex flex-wrap gap-2">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="formats-jpeg"
                    v-model="uploadConfig.formats.jpeg"
                  />
                  <Label for="formats-jpeg">{{ $t('compression_config.jpeg') }}</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="formats-webp"
                    v-model="uploadConfig.formats.webp"
                  />
                  <Label for="formats-webp">{{ $t('compression_config.webp') }}</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="formats-avif"
                    v-model="uploadConfig.formats.avif"
                  />
                  <Label for="formats-avif">{{ $t('compression_config.avif') }}</Label>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <div class="i-lucide-info cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ $t('compression_config.avif_info') }}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="formats-thumbnail"
            v-model="uploadConfig.formats.thumbnail"
          />
          <Label for="formats-thumbnail">{{ $t('compression_config.thumbnail') }}</Label>
        </div>
      </template>
    </UploadConfigCard>

    <UploadConfigCard>
      <template #status>
        <ItemStatus :label="$t('ai_config.title')" :checked="aiConfig.enabled">
          <span>{{ $t('ai_config.title') }}</span>
          <Badge v-if="aiConfig.enabled && selectedProvider" variant="outline" class="ml-2 rounded-lg">
            {{ selectedProvider.name }}
          </Badge>
          <Badge v-if="aiConfig.enabled && selectedProvider?.model" variant="outline" class="ml-1 rounded-lg">
            {{ formatModelName(selectedProvider.model) }}
          </Badge>
        </ItemStatus>
      </template>
      <template #config>
        <Collapsible :open="aiConfig.enabled">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="enable-ai"
              v-model="aiConfig.enabled"
            />
            <Label for="enable-ai">{{ $t('ai_config.enable') }}</Label>
          </div>
          <CollapsibleContent>
            <div class="ml-6 space-y-4">
              <!-- 供应商列表 -->
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <Label>{{ $t('ai_config.providers') }}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 text-xs"
                    @click="openAddProviderDialog"
                  >
                    <div class="i-lucide-plus mr-1" />
                    {{ $t('ai_config.add_provider') }}
                  </Button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="provider in Object.values(aiConfig.providers)"
                    :key="provider.id"
                    class="group flex cursor-pointer items-center justify-between gap-2 border rounded-lg p-2 transition-colors hover:bg-muted/50"
                    :class="{ 'border-primary bg-primary/5': aiConfig.selectedProviderId === provider.id }"
                    @click="selectProvider(provider.id)"
                  >
                    <div class="min-w-0 flex flex-1 items-center gap-2">
                      <!-- shadcn 风格的 radio 样式 -->
                      <div
                        class="relative h-4 w-4 flex shrink-0 items-center justify-center border border-primary rounded-full text-primary ring-offset-background transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                      >
                        <div
                          v-if="aiConfig.selectedProviderId === provider.id"
                          class="flex items-center justify-center"
                        >
                          <div class="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="truncate text-sm font-medium">
                          {{ provider.name }}
                        </div>
                        <div class="truncate text-xs text-muted-foreground">
                          {{ provider.type }}
                          <span v-if="provider.model" class="ml-1">• {{ formatModelName(provider.model) }}</span>
                        </div>
                      </div>
                      <Badge
                        v-if="provider.id === aiConfig.selectedProviderId"
                        variant="secondary"
                        class="text-xs"
                      >
                        {{ $t('ai_config.selected') }}
                      </Badge>
                    </div>
                    <div class="flex items-center gap-1" @click.stop>
                      <TooltipIconButton
                        icon="i-lucide-pencil"
                        :label="$t('ai_config.edit')"
                        size="sm"
                        @click="openEditProviderDialog(provider)"
                      />
                      <TooltipIconButton
                        v-if="provider.id !== 'openai' && provider.id !== 'gemini'"
                        icon="i-lucide-trash-2"
                        :label="$t('ai_config.delete')"
                        size="sm"
                        variant="destructive"
                        @click="removeProvider(provider.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </template>
    </UploadConfigCard>
  </div>

  <!-- 供应商编辑对话框 -->
  <ProviderEditDialog
    :provider="editingProvider ?? undefined"
    :open="showProviderDialog"
    @update:open="showProviderDialog = $event"
    @save="handleSaveProvider"
  />
</template>
