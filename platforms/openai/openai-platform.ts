import type { PlatformInterface, PlatformCredentials, UsageResponse } from '../base/platform-interface'
import type { UsageRecord } from '../../src/shared/types'

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
      const response = await fetch(`${this.baseUrl}/usage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelId }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `API error: ${response.statusText}`,
        }
      }

      const data = await response.json()

      const usageRecord: UsageRecord = {
        id: 0,
        modelId,
        timestamp: new Date().toISOString(),
        tokensUsed: data.total_tokens || 0,
        metadata: {
          promptTokens: data.prompt_tokens,
          completionTokens: data.completion_tokens,
          apiCalls: 1,
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

  async getModels(): Promise<string[]> {
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'dall-e-3',
      'tts-1',
      'whisper-1',
    ]
  }

  dispose(): void {
    this.apiKey = ''
    this.organizationId = undefined
  }
}

export const openAIPlatform = new OpenAIPlatform()
