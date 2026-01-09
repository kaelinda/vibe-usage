import type { PlatformInterface, PlatformCredentials, UsageResponse } from '../base/platform-interface'
import type { UsageRecord, ModelInfo } from '../../src/shared/types'

// Anthropic model list with types
const ANTHROPIC_MODELS: ModelInfo[] = [
  // Claude 3.5 Sonnet (Thinking - high capability)
  { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', type: 'thinking' },
  { id: 'claude-3-5-sonnet-20240620', name: 'claude-3-5-sonnet-20240620', displayName: 'Claude 3.5 Sonnet (2024-06-20)', type: 'thinking' },

  // Claude 3 Opus (Thinking - highest capability)
  { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', type: 'thinking' },

  // Claude 3.5 Haiku (General - fast and efficient)
  { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku', type: 'general' },

  // Claude 3 Haiku (General - fast and efficient)
  { id: 'claude-3-haiku-20240307', name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', type: 'general' },

  // Claude 2 (General)
  { id: 'claude-2.1', name: 'claude-2.1', displayName: 'Claude 2.1', type: 'general' },
  { id: 'claude-2.0', name: 'claude-2.0', displayName: 'Claude 2.0', type: 'general' },

  // Claude Instant (General - fast)
  { id: 'claude-instant-1.2', name: 'claude-instant-1.2', displayName: 'Claude Instant 1.2', type: 'general' },
]

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
      // Anthropic doesn't have a direct billing API for historical usage
      // We'll estimate usage based on cost calculation
      // In production, you would track usage from each API response

      // Get current billing period (current month)
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = now

      // Anthropic API doesn't provide a usage/billing endpoint
      // For now, we return a placeholder that indicates polling is configured
      // In a real implementation, you would:
      // 1. Track usage from each API response (input_tokens + output_tokens)
      // 2. Store cumulative usage in a database
      // 3. Return the stored cumulative value here

      // For now, we return a zero usage record to indicate the platform is configured
      // The actual token tracking would happen when API calls are made
      const usageRecord: UsageRecord = {
        id: 0,
        modelId,
        timestamp: new Date().toISOString(),
        tokensUsed: 0, // Would need to track from actual API calls
        metadata: {
          promptTokens: undefined,
          completionTokens: undefined,
          apiCalls: undefined,
          note: 'Anthropic usage tracking requires API call integration',
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
   * Calculate cost for a given model and token count
   * Anthropic pricing (USD per 1M tokens) as of 2024
   */
  calculateCost(tokensUsed: number, modelId: string): number {
    const rates: Record<string, { input: number; output: number }> = {
      // Claude 3.5 Sonnet
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
      // Claude 3 Opus
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      // Claude 3.5 Haiku
      'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
      // Claude 3 Haiku
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      // Claude 2.x
      'claude-2.1': { input: 8.00, output: 24.00 },
      'claude-2.0': { input: 8.00, output: 24.00 },
      // Claude Instant
      'claude-instant-1.2': { input: 0.80, output: 2.40 },
    }

    // Default to Claude 3.5 Sonnet rates for unknown models
    const rate = rates[modelId.toLowerCase()] || { input: 3.00, output: 15.00 }

    // Assume 30% input, 70% output split (typical for chat)
    const inputTokens = Math.round(tokensUsed * 0.3)
    const outputTokens = Math.round(tokensUsed * 0.7)

    return ((inputTokens / 1000000) * rate.input) + ((outputTokens / 1000000) * rate.output)
  }

  async getModels(): Promise<string[]> {
    return ANTHROPIC_MODELS.map(m => m.id)
  }

  async getModelsWithTypes(): Promise<ModelInfo[]> {
    return ANTHROPIC_MODELS
  }

  dispose(): void {
    this.apiKey = ''
  }
}

export const anthropicPlatform = new AnthropicPlatform()
