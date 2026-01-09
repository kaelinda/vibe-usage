import type { PlatformInterface, PlatformCredentials, UsageResponse } from '../base/platform-interface'
import type { UsageRecord, ModelInfo, ModelType } from '../../src/shared/types'

// OpenAI model list with types
const OPENAI_MODELS: ModelInfo[] = [
  // GPT-4 Series (General)
  { id: 'gpt-4', name: 'gpt-4', displayName: 'GPT-4', type: 'general' },
  { id: 'gpt-4-turbo', name: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', type: 'general' },
  { id: 'gpt-4o', name: 'gpt-4o', displayName: 'GPT-4o', type: 'general' },
  { id: 'gpt-4o-2024-08-06', name: 'gpt-4o-2024-08-06', displayName: 'GPT-4o (2024-08-06)', type: 'general' },

  // GPT-4o with Vision (Vision)
  { id: 'gpt-4o', name: 'gpt-4o', displayName: 'GPT-4o Vision', type: 'vision' },

  // GPT-3.5 Series (General)
  { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', type: 'general' },
  { id: 'gpt-3.5-turbo-16k', name: 'gpt-3.5-turbo-16k', displayName: 'GPT-3.5 Turbo 16K', type: 'general' },

  // Audio Models (General)
  { id: 'whisper-1', name: 'whisper-1', displayName: 'Whisper-1', type: 'general' },
  { id: 'tts-1', name: 'tts-1', displayName: 'TTS-1', type: 'general' },
  { id: 'tts-1-hd', name: 'tts-1-hd', displayName: 'TTS-1 HD', type: 'general' },

  // Image Generation (Vision)
  { id: 'dall-e-3', name: 'dall-e-3', displayName: 'DALL-E 3', type: 'vision' },
  { id: 'dall-e-2', name: 'dall-e-2', displayName: 'DALL-E 2', type: 'vision' },

  // Embeddings (General)
  { id: 'text-embedding-ada-002', name: 'text-embedding-ada-002', displayName: 'Text Embedding Ada-002', type: 'general' },
  { id: 'text-embedding-3-small', name: 'text-embedding-3-small', displayName: 'Text Embedding 3 Small', type: 'general' },
  { id: 'text-embedding-3-large', name: 'text-embedding-3-large', displayName: 'Text Embedding 3 Large', type: 'general' },

  // Moderation (General)
  { id: 'text-moderation-stable', name: 'text-moderation-stable', displayName: 'Text Moderation Stable', type: 'general' },
  { id: 'text-moderation-latest', name: 'text-moderation-latest', displayName: 'Text Moderation Latest', type: 'general' },
]

export class OpenAIPlatform implements PlatformInterface {
  readonly id = 'openai'
  readonly name = 'OpenAI'
  readonly authType = 'bearer'
  readonly requiresOrg = false

  private apiKey: string = ''
  private organizationId?: string
  private baseUrl = 'https://api.openai.com/v1'

  async initialize(credentials: PlatformCredentials): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.organizationId = credentials.organizationId
    return this.validateCredentials()
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async fetchUsage(modelId: string): Promise<UsageResponse> {
    try {
      // Calculate date range for current billing period
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = now

      const params = new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      })

      const response = await fetch(`${this.baseUrl}/billing/usage?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: `API error: ${response.statusText}`,
        }
      }

      const data = await response.json()

      // OpenAI returns cost in USD (from total_usage in cents)
      const costUSD = (data.total_usage || 0) / 100

      // Estimate tokens from cost using model-specific rates
      const tokensUsed = this.estimateTokensFromCost(costUSD, modelId)

      const usageRecord: UsageRecord = {
        id: 0,
        modelId,
        timestamp: new Date().toISOString(),
        tokensUsed,
        costEstimate: costUSD,
        metadata: {
          promptTokens: undefined, // Billing API doesn't provide breakdown
          completionTokens: undefined,
          apiCalls: undefined,
        },
      }

      return { success: true, data: usageRecord }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Estimate token count from cost (USD)
   * Uses approximate pricing rates for different models
   */
  private estimateTokensFromCost(costUSD: number, modelId: string): number {
    // Approximate pricing (USD per 1K tokens) as of 2024
    const rates: Record<string, number> = {
      // GPT-4 series
      'gpt-4': 0.06,
      'gpt-4-turbo': 0.03,
      'gpt-4o': 0.015,
      'gpt-4o-2024-08-06': 0.015,

      // GPT-3.5 series
      'gpt-3.5-turbo': 0.0015,
      'gpt-3.5-turbo-16k': 0.003,

      // Audio models (per minute)
      'whisper-1': 0.006,
      'tts-1': 0.015,
      'tts-1-hd': 0.030,

      // Image generation (per image)
      'dall-e-3': 0.040,
      'dall-e-2': 0.016,

      // Embeddings
      'text-embedding-ada-002': 0.0001,
      'text-embedding-3-small': 0.00002,
      'text-embedding-3-large': 0.00013,

      // Moderation
      'text-moderation-stable': 0.00004,
      'text-moderation-latest': 0.00004,
    }

    // Default rate for unknown models (average)
    const defaultRate = 0.03

    // Get rate for model, fall back to default
    const rate = rates[modelId.toLowerCase()] || defaultRate

    // Calculate tokens: cost (USD) / rate (USD per token)
    return Math.round((costUSD * 1000) / rate)
  }

  async getModels(): Promise<string[]> {
    return OPENAI_MODELS.map(m => m.id)
  }

  async getModelsWithTypes(): Promise<ModelInfo[]> {
    return OPENAI_MODELS
  }

  dispose(): void {
    this.apiKey = ''
    this.organizationId = undefined
  }
}

export const openAIPlatform = new OpenAIPlatform()
