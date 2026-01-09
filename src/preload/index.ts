import { contextBridge, ipcRenderer } from 'electron'
import { Channel } from '../shared/constants/ipc-channels'
import type { PlatformConfig, ModelConfig, ModelInfo, UsageRecord, AlertRule, UserPreferences } from '../shared/types'

// Type definitions for the exposed API
export interface VibeUsageAPI {
  // Platform APIs
  platforms: {
    getAll: () => Promise<PlatformConfig[]>
    getById: (id: string) => Promise<PlatformConfig | null>
    getModels: (platformId: string) => Promise<ModelInfo[]>
    add: (config: Omit<PlatformConfig, 'createdAt' | 'updatedAt'>) => Promise<PlatformConfig | null>
    update: (id: string, updates: Partial<PlatformConfig>) => Promise<PlatformConfig | null>
    remove: (id: string) => Promise<boolean>
  }

  // Model APIs
  models: {
    getAll: () => Promise<ModelConfig[]>
    getByPlatform: (platformId: string) => Promise<ModelConfig[]>
    getById: (id: string) => Promise<ModelConfig | null>
    add: (config: Omit<ModelConfig, 'createdAt' | 'updatedAt'>) => Promise<ModelConfig | null>
    update: (id: string, updates: Partial<ModelConfig>) => Promise<ModelConfig | null>
    remove: (id: string) => Promise<boolean>
  }

  // Usage APIs
  usage: {
    getHistory: (modelId: string, days: number) => Promise<UsageRecord[]>
    getLatest: (modelId: string) => Promise<UsageRecord | undefined>
    addRecord: (record: Omit<UsageRecord, 'id'>) => Promise<number>
    forceRefresh: () => Promise<{ totalTokens: number; totalCost: number; platformCount: number }>
  }

  // Alert APIs
  alerts: {
    getAll: () => Promise<AlertRule[]>
    getByModel: (modelId: string) => Promise<AlertRule[]>
    getById: (id: string) => Promise<AlertRule | null>
    add: (config: Omit<AlertRule, 'createdAt' | 'updatedAt'>) => Promise<AlertRule | null>
    update: (id: string, updates: Partial<AlertRule>) => Promise<AlertRule | null>
    remove: (id: string) => Promise<boolean>
  }

  // Preference APIs
  preferences: {
    get: () => Promise<UserPreferences>
    update: (prefs: Partial<UserPreferences>) => Promise<UserPreferences | null>
    setPollingInterval: (intervalMs: number) => Promise<boolean>
  }

  // Credential APIs
  credentials: {
    get: (platformId: string) => Promise<string | null>
    set: (platformId: string, credential: string) => Promise<boolean>
    remove: (platformId: string) => Promise<boolean>
  }

  // Platform-specific usage fetching
  fetchUsage: (platformId: string, modelId: string) => Promise<UsageRecord | null>
}

// Re-export types for renderer process usage
export type { PlatformConfig, ModelConfig, ModelInfo, UsageRecord, AlertRule, UserPreferences }

contextBridge.exposeInMainWorld('VibeUsageAPI', {
  platforms: {
    getAll: () => ipcRenderer.invoke(Channel.Platforms.GetAll),
    getById: (id: string) => ipcRenderer.invoke(Channel.Platforms.GetById, id),
    getModels: (platformId: string) => ipcRenderer.invoke(Channel.Platforms.GetModels, platformId),
    add: (config: Omit<PlatformConfig, 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(Channel.Platforms.Add, config),
    update: (id: string, updates: Partial<PlatformConfig>) =>
      ipcRenderer.invoke(Channel.Platforms.Update, id, updates),
    remove: (id: string) => ipcRenderer.invoke(Channel.Platforms.Remove, id),
  },
  models: {
    getAll: () => ipcRenderer.invoke(Channel.Models.GetAll),
    getByPlatform: (platformId: string) => ipcRenderer.invoke(Channel.Models.GetByPlatform, platformId),
    getById: (id: string) => ipcRenderer.invoke(Channel.Models.GetById, id),
    add: (config: Omit<ModelConfig, 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(Channel.Models.Add, config),
    update: (id: string, updates: Partial<ModelConfig>) =>
      ipcRenderer.invoke(Channel.Models.Update, id, updates),
    remove: (id: string) => ipcRenderer.invoke(Channel.Models.Remove, id),
  },
  usage: {
    getHistory: (modelId: string, days: number) =>
      ipcRenderer.invoke(Channel.Usage.GetHistory, modelId, days),
    getLatest: (modelId: string) => ipcRenderer.invoke(Channel.Usage.GetLatest, modelId),
    addRecord: (record: Omit<UsageRecord, 'id'>) =>
      ipcRenderer.invoke(Channel.Usage.AddRecord, record),
    forceRefresh: () => ipcRenderer.invoke(Channel.Usage.ForceRefresh),
  },
  alerts: {
    getAll: () => ipcRenderer.invoke(Channel.Alerts.GetAll),
    getByModel: (modelId: string) => ipcRenderer.invoke(Channel.Alerts.GetByModel, modelId),
    getById: (id: string) => ipcRenderer.invoke(Channel.Alerts.GetById, id),
    add: (config: Omit<AlertRule, 'createdAt' | 'updatedAt'>) =>
      ipcRenderer.invoke(Channel.Alerts.Add, config),
    update: (id: string, updates: Partial<AlertRule>) =>
      ipcRenderer.invoke(Channel.Alerts.Update, id, updates),
    remove: (id: string) => ipcRenderer.invoke(Channel.Alerts.Remove, id),
  },
  preferences: {
    get: () => ipcRenderer.invoke(Channel.Preferences.Get),
    update: (prefs: Partial<UserPreferences>) =>
      ipcRenderer.invoke(Channel.Preferences.Update, prefs),
    setPollingInterval: (intervalMs: number) =>
      ipcRenderer.invoke(Channel.Preferences.SetPollingInterval, intervalMs),
  },
  credentials: {
    get: (platformId: string) => ipcRenderer.invoke(Channel.Credentials.Get, platformId),
    set: (platformId: string, credential: string) =>
      ipcRenderer.invoke(Channel.Credentials.Set, platformId, credential),
    remove: (platformId: string) => ipcRenderer.invoke(Channel.Credentials.Remove, platformId),
  },
  fetchUsage: (platformId: string, modelId: string) =>
    ipcRenderer.invoke(Channel.Platforms.FetchUsage, platformId, modelId),
} as VibeUsageAPI)
