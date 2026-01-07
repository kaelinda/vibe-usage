import type { UsageRecord } from '../../src/shared/types'

export interface PlatformCredentials {
  apiKey: string
  organizationId?: string
}

export interface UsageResponse {
  success: boolean
  data?: UsageRecord
  error?: string
}

export interface PlatformInterface {
  readonly id: string
  readonly name: string
  readonly authType: 'api_key' | 'bearer' | 'oauth2'
  readonly requiresOrg: boolean

  initialize(credentials: PlatformCredentials): Promise<boolean>
  validateCredentials(): Promise<boolean>
  fetchUsage(modelId: string): Promise<UsageResponse>
  getModels(): Promise<string[]>
  dispose(): void
}
