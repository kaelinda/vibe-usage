import type { PlatformInterface, PlatformCredentials, UsageResponse } from '@platforms/base/platform-interface'
import type { PlatformConfig, ModelInfo } from '../../shared/types'
import { OpenAIPlatform } from '@platforms/openai/openai-platform'
import { AnthropicPlatform } from '@platforms/anthropic/anthropic-platform'

export interface PlatformClient {
  getUsage(): Promise<{
    tokensUsed: number
    tokensRemaining?: number
    quotaTotal?: number
    costEstimate?: number
  }>
  getModelsWithTypes(): Promise<ModelInfo[]>
}

export interface PlatformConfig {
  id: string
  name: string
  apiEndpoint: string
  description?: string
  options?: {
    authType: 'api_key' | 'bearer' | 'oauth2'
    requiresOrg?: boolean
    customHeaders?: Record<string, string>
  }
}

export interface PlatformRegistry {
  getClient(platformId: string, apiKey: string): PlatformClient | null
  hasPlatform(platformId: string): boolean
  getSupportedPlatforms(): Array<{ id: string; name: string }>
  createClient(config: PlatformConfig, apiKey: string): PlatformClient | null
  validateCredentials(config: PlatformConfig, apiKey: string): Promise<boolean>
  getModelsWithTypes(config: PlatformConfig, apiKey: string): Promise<ModelInfo[]>
}

export function createPlatformRegistry(): PlatformRegistry {
  const clients = new Map<string, new (config: PlatformConfig, apiKey: string) => PlatformClient>()

  // Register built-in platforms
  clients.set('openai', OpenAIPlatform)
  clients.set('anthropic', AnthropicPlatform)

  function register(platformId: string, clientClass: new (config: PlatformConfig, apiKey: string) => PlatformClient) {
    clients.set(platformId, clientClass)
  }

  function getClient(platformId: string, apiKey: string): PlatformClient | null {
    const ClientClass = clients.get(platformId)
    if (!ClientClass) return null

    const config: PlatformConfig = {
      id: platformId,
      name: platformId,
      apiEndpoint: '',
      authType: 'bearer'
    }

    return new ClientClass(config, apiKey)
  }

  function hasPlatform(platformId: string): boolean {
    return clients.has(platformId)
  }

  function getSupportedPlatforms(): Array<{ id: string; name: string }> {
    return Array.from(clients.entries()).map(([id, _]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1)
    }))
  }

  function createClient(config: PlatformConfig, apiKey: string): PlatformClient | null {
    // For built-in platforms, use registered client
    if (clients.has(config.id)) {
      return getClient(config.id, apiKey)
    }

    // For custom platforms, create a generic client
    return new GenericPlatformClient(config, apiKey)
  }

  async function validateCredentials(config: PlatformConfig, apiKey: string): Promise<boolean> {
    const client = createClient(config, apiKey)
    if (!client) return false

    try {
      const result = await client.getUsage()
      // If we can get usage without error, credentials are valid
      return typeof result.tokensUsed === 'number'
    } catch {
      return false
    }
  }

  async function getModelsWithTypes(config: PlatformConfig, apiKey: string): Promise<ModelInfo[]> {
    const client = createClient(config, apiKey)
    if (!client) return []

    try {
      return await client.getModelsWithTypes()
    } catch {
      return []
    }
  }

  return {
    register,
    getClient,
    hasPlatform,
    getSupportedPlatforms,
    createClient,
    validateCredentials,
    getModelsWithTypes
  }
}

/**
 * Generic platform client for custom API endpoints
 */
class GenericPlatformClient implements PlatformClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: PlatformConfig, apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = config.apiEndpoint
  }

  async getUsage(): Promise<{
    tokensUsed: number
    tokensRemaining?: number
    quotaTotal?: number
    costEstimate?: number
  }> {
    // Generic implementation - custom platforms need to implement their own
    // This is a placeholder that returns zero usage
    return {
      tokensUsed: 0,
      tokensRemaining: undefined,
      quotaTotal: undefined,
      costEstimate: undefined
    }
  }

  async getModelsWithTypes(): Promise<ModelInfo[]> {
    // Generic platform - return empty list
    // Users need to manually add models for custom platforms
    return []
  }
}

export const platformRegistry = createPlatformRegistry()
