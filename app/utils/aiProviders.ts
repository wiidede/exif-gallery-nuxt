import type { LanguageModelV3 } from '@ai-sdk/provider'
import type { AIProviderConfig } from '../composables/useAIConfig'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

// 模型信息接口
export interface AIModel {
  id: string
  name?: string
  description?: string
  created?: number
  owned_by?: string
}

/**
 * 创建 AI 客户端实例
 */
export function createAIClient(provider: AIProviderConfig): LanguageModelV3 | null {
  if (!provider.apiKey) {
    console.error('[AI] API key is missing for provider:', provider.id)
    return null
  }

  try {
    switch (provider.type) {
      case 'openai': {
        const client = createOpenAI({
          baseURL: provider.baseURL || 'https://api.openai.com/v1',
          apiKey: provider.apiKey,
        })
        // 使用自定义模型或默认模型
        const modelId = provider.model || 'gpt-4o'
        return client(modelId)
      }
      case 'gemini': {
        const client = createGoogleGenerativeAI({
          baseURL: provider.baseURL || undefined,
          apiKey: provider.apiKey,
        })
        // 使用自定义模型或默认模型
        const modelId = provider.model || 'gemini-2.0-flash'
        return client(modelId)
      }
      default:
        console.error('[AI] Unsupported provider type:', provider.type)
        return null
    }
  }
  catch (error) {
    console.error('[AI] Failed to create client for provider:', provider.id, error)
    return null
  }
}

/**
 * 从供应商获取模型列表
 * 支持不同供应商的模型获取方式：
 * - OpenAI: 使用 /models 端点
 * - Gemini: 使用 models.list 端点 https://generativelanguage.googleapis.com/v1beta/models
 */
export async function fetchModels(
  provider: AIProviderConfig,
): Promise<AIModel[]> {
  if (!provider.apiKey) {
    console.error('[AI] API key is missing for provider:', provider.id)
    return []
  }

  try {
    // Gemini 使用 models.list 端点
    if (provider.type === 'gemini') {
      const url = new URL('https://generativelanguage.googleapis.com/v1beta/models')
      url.searchParams.append('key', provider.apiKey)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('[AI] Failed to fetch Gemini models:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('[AI] Error response:', errorText)
        return []
      }

      const data = await response.json()

      // Gemini 响应格式: { models: [{ name: "models/gemini-1.5-flash-001", baseModelId: "gemini-1.5-flash", ... }] }
      if (data.models && Array.isArray(data.models)) {
        return data.models.map((m: any) => ({
          id: m.baseModelId || m.name,
          name: m.displayName || m.baseModelId,
          description: m.description,
        }))
      }

      console.error('[AI] Unexpected Gemini response format')
      return []
    }

    // OpenAI 兼容的 API 使用 /models 端点
    if (provider.type === 'openai') {
      if (!provider.baseURL) {
        console.error('[AI] Base URL is missing for provider:', provider.id)
        return []
      }

      // 确保 baseURL 以 / 结尾，避免 URL 拼接问题
      const normalizedBaseURL = provider.baseURL.endsWith('/') ? provider.baseURL : `${provider.baseURL}/`
      const url = new URL(`${normalizedBaseURL}models`)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('[AI] Failed to fetch OpenAI models:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('[AI] Error response:', errorText)
        return []
      }

      const data = await response.json()

      // OpenAI 响应格式: { object: "list", data: [{ id: "gpt-4o", object: "model", ... }] }
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description,
          created: m.created,
          owned_by: m.owned_by,
        }))
      }

      console.error('[AI] Unexpected OpenAI response format')
      return []
    }

    console.error('[AI] Unsupported provider type for fetching models:', provider.type)
    return []
  }
  catch (error) {
    console.error('[AI] Error fetching models:', error)
    return []
  }
}

/**
 * 测试供应商连接
 */
export async function testProviderConnection(
  provider: AIProviderConfig,
): Promise<{ success: boolean, error?: string }> {
  if (!provider.apiKey) {
    return { success: false, error: 'API key is missing' }
  }

  if (!provider.baseURL) {
    return { success: false, error: 'Base URL is missing' }
  }

  try {
    // 尝试获取模型列表来测试连接
    await fetchModels(provider)
    return { success: true }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * 格式化模型名称用于显示
 */
export function formatModelName(modelId: string | undefined): string {
  if (!modelId)
    return ''
  return modelId
    .split('/')
    .pop() || modelId
}
