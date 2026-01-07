import type { PlatformConfig, ModelConfig, UsageRecord, AlertRule, UserPreferences } from './shared/types'

// Re-export types for convenience
export type { PlatformConfig, ModelConfig, UsageRecord, AlertRule, UserPreferences }

declare global {
  interface Window {
    VibeUsageAPI: {
      platforms: {
        getAll: () => Promise<PlatformConfig[]>
        getById: (id: string) => Promise<PlatformConfig | null>
        add: (config: Omit<PlatformConfig, 'createdAt' | 'updatedAt'>) => Promise<PlatformConfig | null>
        update: (id: string, updates: Partial<PlatformConfig>) => Promise<PlatformConfig | null>
        remove: (id: string) => Promise<boolean>
      }
      models: {
        getAll: () => Promise<ModelConfig[]>
        getByPlatform: (platformId: string) => Promise<ModelConfig[]>
        getById: (id: string) => Promise<ModelConfig | null>
        add: (config: Omit<ModelConfig, 'createdAt' | 'updatedAt'>) => Promise<ModelConfig | null>
        update: (id: string, updates: Partial<ModelConfig>) => Promise<ModelConfig | null>
        remove: (id: string) => Promise<boolean>
      }
      usage: {
        getHistory: (modelId: string, days: number) => Promise<UsageRecord[]>
        getLatest: (modelId: string) => Promise<UsageRecord | undefined>
        addRecord: (record: Omit<UsageRecord, 'id'>) => Promise<number>
      }
      alerts: {
        getAll: () => Promise<AlertRule[]>
        getByModel: (modelId: string) => Promise<AlertRule[]>
        getById: (id: string) => Promise<AlertRule | null>
        add: (config: Omit<AlertRule, 'createdAt' | 'updatedAt'>) => Promise<AlertRule | null>
        update: (id: string, updates: Partial<AlertRule>) => Promise<AlertRule | null>
        remove: (id: string) => Promise<boolean>
      }
      preferences: {
        get: () => Promise<UserPreferences>
        update: (prefs: Partial<UserPreferences>) => Promise<UserPreferences | null>
      }
      credentials: {
        get: (platformId: string) => Promise<string | null>
        set: (platformId: string, credential: string) => Promise<boolean>
        remove: (platformId: string) => Promise<boolean>
      }
      fetchUsage: (platformId: string, modelId: string) => Promise<UsageRecord | null>
    }
  }
}

export {}
