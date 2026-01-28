// 供应商类型
export type ProviderType = 'openai' | 'gemini'

// 供应商配置接口
export interface AIProviderConfig {
  id: string // 供应商唯一ID
  name: string // 显示名称
  type: ProviderType // 供应商类型
  apiKey: string // API 密钥
  baseURL?: string // 自定义 base URL
  model?: string // 自定义模型名称
  enabled: boolean // 是否启用
  createdAt: number // 创建时间戳
}

// 旧版 AI 配置接口（用于向后兼容）
interface LegacyAIConfig {
  provider: 'gemini' | 'openai'
  baseUrl: string
  secretKey: string
  enabled: boolean
}

// 新版 AI 配置接口
export interface AIConfig {
  enabled: boolean // AI 功能总开关
  selectedProviderId: string // 当前选中的供应商ID
  providers: Record<string, AIProviderConfig> // 所有供应商配置
}

// 默认供应商配置
const defaultProviders: Record<string, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    enabled: false,
    createdAt: Date.now(),
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    type: 'gemini',
    apiKey: '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash',
    enabled: false,
    createdAt: Date.now(),
  },
}

// 迁移旧版配置到新版
function migrateLegacyConfig(legacy: LegacyAIConfig): AIConfig {
  const providers: Record<string, AIProviderConfig> = { ...defaultProviders }

  // 更新旧配置中的供应商
  if (legacy.provider === 'openai') {
    providers.openai!.apiKey = legacy.secretKey
    providers.openai!.enabled = legacy.enabled
    if (legacy.baseUrl) {
      providers.openai!.baseURL = legacy.baseUrl
    }
  }
  else if (legacy.provider === 'gemini') {
    providers.gemini!.apiKey = legacy.secretKey
    providers.gemini!.enabled = legacy.enabled
    if (legacy.baseUrl) {
      providers.gemini!.baseURL = legacy.baseUrl
    }
  }

  return {
    enabled: legacy.enabled,
    selectedProviderId: legacy.provider,
    providers,
  }
}

// 默认新版配置
const defaultConfig: AIConfig = {
  enabled: false,
  selectedProviderId: 'gemini',
  providers: defaultProviders,
}

export function useAIConfig() {
  const config = useLocalStorage<AIConfig>('ai-config', defaultConfig, {
    serializer: {
      read: (value: string) => {
        try {
          const parsed = JSON.parse(value)

          // 检测旧版配置格式
          if ('provider' in parsed && 'secretKey' in parsed && 'baseUrl' in parsed && 'enabled' in parsed) {
            return migrateLegacyConfig(parsed as LegacyAIConfig)
          }

          // 返回新版配置
          return parsed
        }
        catch {
          return defaultConfig
        }
      },
      write: (value: AIConfig) => JSON.stringify(value),
    },
  })

  // 获取当前选中的供应商配置
  const selectedProvider = computed(() => {
    return config.value.providers[config.value.selectedProviderId]
  })

  // 获取所有已启用的供应商
  const enabledProviders = computed(() => {
    return Object.values(config.value.providers).filter(p => p.enabled)
  })

  // 添加自定义供应商
  function addProvider(provider: Omit<AIProviderConfig, 'id' | 'createdAt'>) {
    const id = `custom-${Date.now()}`
    config.value.providers[id] = {
      ...provider,
      id,
      createdAt: Date.now(),
    }
    return id
  }

  // 更新供应商配置
  function updateProvider(id: string, updates: Partial<AIProviderConfig>) {
    if (config.value.providers[id]) {
      config.value.providers[id] = {
        ...config.value.providers[id],
        ...updates,
      }
    }
  }

  // 删除供应商
  function removeProvider(id: string) {
    // 不能删除默认供应商
    if (id !== 'openai' && id !== 'gemini') {
      delete config.value.providers[id]
      // 如果删除的是当前选中的供应商，切换到第一个可用供应商
      if (config.value.selectedProviderId === id) {
        const firstAvailable = Object.keys(config.value.providers)[0]
        if (firstAvailable) {
          config.value.selectedProviderId = firstAvailable
        }
      }
    }
  }

  // 切换当前供应商
  function setSelectedProvider(id: string) {
    if (config.value.providers[id]) {
      config.value.selectedProviderId = id
    }
  }

  // 获取供应商的默认模型
  function getDefaultModelForType(type: ProviderType): string {
    switch (type) {
      case 'openai':
        return 'gpt-4o'
      case 'gemini':
        return 'gemini-3-flash-preview'
      default:
        return ''
    }
  }

  return {
    config,
    selectedProvider,
    enabledProviders,
    addProvider,
    updateProvider,
    removeProvider,
    setSelectedProvider,
    getDefaultModelForType,
  }
}
