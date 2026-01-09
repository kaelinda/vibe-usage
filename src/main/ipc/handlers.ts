// @ts-nocheck
import { ipcMain, BrowserWindow } from 'electron'
import { Channel } from '../../shared/constants/ipc-channels'
import type { StorageService } from '../services/storage-service'
import type { CredentialManager } from '../services/credential-manager'
import type { PlatformRegistry } from '../services/platform-registry'
import type { UsagePoller } from '../services/usage-poller'
import type { UsageRecord } from '../../shared/types'

interface Services {
  storageService: StorageService
  credentialManager: CredentialManager
  platformRegistry: PlatformRegistry
  usagePoller?: UsagePoller
}

export function setupIpcHandlers(services: Services) {
  const { storageService, credentialManager, platformRegistry, usagePoller } = services

  // Platform handlers
  ipcMain.handle(Channel.Platforms.GetAll, async () => {
    return storageService.getAllPlatforms()
  })

  ipcMain.handle(Channel.Platforms.GetById, async (_: unknown, id: string) => {
    return storageService.getPlatformById(id) ?? null
  })

  ipcMain.handle(Channel.Platforms.GetModels, async (_: unknown, platformId: string) => {
    const platform = storageService.getPlatformById(platformId)
    if (!platform) {
      return []
    }

    const apiKey = await credentialManager.getPassword(platformId)
    if (!apiKey) {
      return []
    }

    return platformRegistry.getModelsWithTypes(platform, apiKey)
  })

  ipcMain.handle(Channel.Platforms.Add, async (_: unknown, config) => {
    const platform = storageService.addPlatform(config)
    if (platform) {
      await credentialManager.setPassword(platform.id, config.apiKey)
    }
    return platform
  })

  ipcMain.handle(Channel.Platforms.Update, async (_: unknown, id: string, updates) => {
    return storageService.updatePlatform(id, updates)
  })

  ipcMain.handle(Channel.Platforms.Remove, async (_: unknown, id: string) => {
    const result = storageService.removePlatform(id)
    if (result) {
      await credentialManager.deletePassword(id)
    }
    return result
  })

  ipcMain.handle(Channel.Platforms.FetchUsage, async (_: unknown, platformId: string, modelId: string) => {
    const platform = storageService.getPlatformById(platformId)
    if (!platform) {
      return { success: false, error: 'Platform not found' }
    }

    const apiKey = await credentialManager.getPassword(platformId)
    if (!apiKey) {
      return { success: false, error: 'API key not found' }
    }

    const client = platformRegistry.getClient(platformId, apiKey)
    if (!client) {
      return { success: false, error: 'Platform client not available' }
    }

    try {
      const result = await client.getUsage()

      // Save usage record to storage
      const usageRecord: Omit<UsageRecord, 'id'> = {
        modelId,
        timestamp: new Date().toISOString(),
        tokensUsed: result.tokensUsed,
        tokensRemaining: result.tokensRemaining,
        quotaTotal: result.quotaTotal,
        costEstimate: result.costEstimate,
      }

      const recordId = storageService.addUsageRecord(usageRecord)

      return {
        success: true,
        data: {
          id: recordId,
          ...usageRecord,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // Model handlers
  ipcMain.handle(Channel.Models.GetAll, async () => {
    return storageService.getAllModels()
  })

  ipcMain.handle(Channel.Models.GetByPlatform, async (_: unknown, platformId: string) => {
    return storageService.getModelsByPlatform(platformId)
  })

  ipcMain.handle(Channel.Models.GetById, async (_: unknown, id: string) => {
    return storageService.getModelById(id) ?? null
  })

  ipcMain.handle(Channel.Models.Add, async (_: unknown, config) => {
    return storageService.addModel(config)
  })

  ipcMain.handle(Channel.Models.Update, async (_: unknown, id: string, updates) => {
    return storageService.updateModel(id, updates)
  })

  ipcMain.handle(Channel.Models.Remove, async (_: unknown, id: string) => {
    return storageService.removeModel(id)
  })

  // Usage handlers
  ipcMain.handle(Channel.Usage.GetHistory, async (_: unknown, modelId: string, days: number) => {
    return storageService.getUsageHistory(modelId, days)
  })

  ipcMain.handle(Channel.Usage.GetLatest, async (_: unknown, modelId: string) => {
    return storageService.getLatestUsage(modelId)
  })

  ipcMain.handle(Channel.Usage.AddRecord, async (_: unknown, record) => {
    return storageService.addUsageRecord(record)
  })

  ipcMain.handle(Channel.Usage.ForceRefresh, async () => {
    if (!usagePoller) {
      return { totalTokens: 0, totalCost: 0, platformCount: 0 }
    }
    return usagePoller.forceRefresh()
  })

  ipcMain.handle(Channel.Preferences.SetPollingInterval, async (_: unknown, intervalMs: number) => {
    if (!usagePoller) {
      return false
    }
    usagePoller.setInterval(intervalMs)
    return true
  })

  // Alert handlers
  ipcMain.handle(Channel.Alerts.GetAll, async () => {
    return storageService.getAllAlertRules()
  })

  ipcMain.handle(Channel.Alerts.GetByModel, async (_: unknown, modelId: string) => {
    return storageService.getAlertRulesByModel(modelId)
  })

  ipcMain.handle(Channel.Alerts.GetById, async (_: unknown, id: string) => {
    return storageService.getAlertRuleById(id) ?? null
  })

  ipcMain.handle(Channel.Alerts.Add, async (_: unknown, config) => {
    return storageService.addAlertRule(config)
  })

  ipcMain.handle(Channel.Alerts.Update, async (_: unknown, id: string, updates) => {
    return storageService.updateAlertRule(id, updates)
  })

  ipcMain.handle(Channel.Alerts.Remove, async (_: unknown, id: string) => {
    return storageService.removeAlertRule(id)
  })

  // Preferences handlers
  ipcMain.handle(Channel.Preferences.Get, async () => {
    return storageService.getUserPreferences()
  })

  ipcMain.handle(Channel.Preferences.Update, async (_: unknown, prefs) => {
    return storageService.updateUserPreferences(prefs)
  })

  // Credential handlers
  ipcMain.handle(Channel.Credentials.Get, async (_: unknown, platformId: string) => {
    return credentialManager.getPassword(platformId)
  })

  ipcMain.handle(Channel.Credentials.Set, async (_: unknown, platformId: string, credential: string) => {
    return credentialManager.setPassword(platformId, credential)
  })

  ipcMain.handle(Channel.Credentials.Remove, async (_: unknown, platformId: string) => {
    return credentialManager.deletePassword(platformId)
  })

  // Window control
  ipcMain.handle(Channel.Window.Minimize, async () => {
    BrowserWindow.getAllWindows().forEach(win => win.minimize())
  })

  ipcMain.handle(Channel.Window.Maximize, async () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle(Channel.Window.Close, async () => {
    BrowserWindow.getAllWindows().forEach(win => win.close())
  })
}
