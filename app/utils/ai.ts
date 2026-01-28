import { generateObject } from 'ai'
import { z } from 'zod'
import { useAIConfig } from '../composables/useAIConfig'
import { createAIClient } from './aiProviders'

// Helper function to remove base64 prefix
function removeBase64Prefix(base64: string) {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
}

// Helper function to clean up AI response text
function cleanUpAiTextResponse(text: string) {
  return text.trim().replace(/[\n\r]+/g, ' ')
}

/**
 * 初始化 AI 客户端
 * 使用当前选中的供应商配置
 */
function initializeAIClient() {
  const { config, selectedProvider } = useAIConfig()

  if (!config.value.enabled) {
    console.error('[DEV] AI is disabled. Please enable it in the settings.')
    return null
  }

  if (!selectedProvider.value) {
    console.error('[DEV] No provider selected. Please select a provider in the settings.')
    return null
  }

  if (!selectedProvider.value.apiKey) {
    throw new Error('AI secret key is missing. Please provide it in the settings.')
  }

  return createAIClient(selectedProvider.value)
}

/**
 * 获取 AI 图片分析
 * @param imageFile 图片文件
 * @param compress 是否压缩图片
 * @returns 图片分析结果
 */
export async function getAiImageAnalysis(imageFile: File, compress = true) {
  const model = initializeAIClient()
  const { t } = useNuxtApp().$i18n

  const imageAnalysisSchema = z.object({
    title: z.string().max(20).describe(t('ai.title_desc')),
    caption: z.string().max(60).describe(t('ai.caption_desc')),
    tags: z.array(z.string()).max(4).describe(t('ai.tags_desc')),
    semanticDescription: z.string().describe(t('ai.semantic_desc')),
  })

  type ImageAnalysis = z.infer<typeof imageAnalysisSchema>

  const AI_IMAGE_PROMPT = `${t('ai.question')}\n`
    + `- ${t('ai.title')}\n`
    + `- ${t('ai.caption')}\n`
    + `- ${t('ai.tags')}\n`
    + `- ${t('ai.semantic')}`

  if (!model) {
    return {
      title: '',
      caption: '',
      tags: [],
      semanticDescription: '',
    }
  }

  try {
    const base64 = await getCompressedImageBase64(imageFile, compress)
    const { object } = await generateObject({
      model,
      schema: imageAnalysisSchema,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: AI_IMAGE_PROMPT,
          },
          {
            type: 'image',
            image: removeBase64Prefix(base64),
          },
        ],
      }],
    })

    const result: ImageAnalysis = {
      title: cleanUpAiTextResponse(object.title || ''),
      caption: cleanUpAiTextResponse(object.caption || ''),
      tags: (object.tags || []).map((tag: string) => cleanUpAiTextResponse(tag)),
      semanticDescription: cleanUpAiTextResponse(object.semanticDescription || ''),
    }

    return result
  }
  catch (error) {
    console.error('Error generating image analysis:', error)
    return {
      title: '',
      caption: '',
      tags: [],
      semanticDescription: '',
    }
  }
}
