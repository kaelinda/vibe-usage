import type { PlatformInterface, PlatformCredentials, UsageResponse } from '../base/platform-interface'
import type { UsageRecord } from '../../src/shared/types'

export class AnthropicPlatform implements PlatformInterface {
  readonly id = 'anthropic'
  readonly name = 'Anthropic'
  readonly authType = 'bearer'
  readonly requiresOrg = false

  private apiKey: string = ''
  private baseUrl = 'https://api.anthropic.com/v1'

  async initialize(credentials: PlatformCredentials): Promise<boolean> {
    this.apiKey = credentials.apiKey
    return this.validateCredentials()
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
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
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
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
        tokensUsed: data.tokens_used || 0,
        metadata: {
          promptTokens: data.input_tokens,
          completionTokens: data.output_tokens,
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
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2',
    ]
  }

  dispose(): void {
    this.apiKey = ''
  }
}

export const anthropicPlatform = new AnthropicPlatform()
