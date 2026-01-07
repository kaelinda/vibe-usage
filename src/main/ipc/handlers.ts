// @ts-nocheck
import { ipcMain, BrowserWindow } from 'electron'
import { Channel } from '../../shared/constants/ipc-channels'
import type { StorageService } from '../services/storage-service'
import type { CredentialManager } from '../services/credential-manager'
import type { PlatformRegistry } from '../services/platform-registry'

interface Services {
  storageService: StorageService
  credentialManager: CredentialManager
  platformRegistry: PlatformRegistry
}

export function setupIpcHandlers(services: Services) {
  const { storageService, credentialManager, platformRegistry } = services

  // Platform handlers
  ipcMain.handle(Channel.Platforms.GetAll, async () => {
    return storageService.getAllPlatforms()
  })

  ipcMain.handle(Channel.Platforms.GetById, async (_: unknown, id: string) => {
    return storageService.getPlatformById(id) ?? null
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
