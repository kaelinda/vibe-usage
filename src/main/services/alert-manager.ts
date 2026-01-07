// @ts-nocheck
import type { PlatformRegistry } from './platform-registry'
import type { StorageService } from './storage-service'
import { Notification, BrowserWindow } from 'electron'

export class AlertManager {
  private platformRegistry: PlatformRegistry
  private storageService: StorageService
  private checkedIds: Set<string> = new Set()

  constructor(platformRegistry: PlatformRegistry, storageService: StorageService) {
    this.platformRegistry = platformRegistry
    this.storageService = storageService
  }

  async checkAlerts() {
    const alerts = this.storageService.getAllAlertRules()
    const now = Date.now()
    const cooldown = 5 * 60 * 1000 // 5 minutes

    for (const alert of alerts) {
      if (!alert.isEnabled) continue
      if (this.checkedIds.has(alert.id)) continue

      const latest = this.storageService.getLatestUsage(alert.modelId)
      if (!latest) continue

      const quota = latest.quotaTotal ?? 0
      if (quota === 0) continue

      const percentage = (latest.tokensUsed / quota) * 100
      let triggered = false

      if (alert.thresholdType === 'percentage' && percentage >= alert.thresholdValue) {
        triggered = true
      } else if (alert.thresholdType === 'absolute' && latest.tokensUsed >= alert.thresholdValue) {
        triggered = true
      }

      if (triggered) {
        const lastTriggered = alert.lastTriggered ? new Date(alert.lastTriggered).getTime() : 0
        if (now - lastTriggered > cooldown) {
          this.storageService.updateAlertRule(alert.id, { lastTriggered: new Date().toISOString() })
          await this.sendNotification(alert, percentage, latest.tokensUsed)
        }
      }
    }
  }

  private async sendNotification(alert: AlertRule, percentage: number, tokensUsed: number) {
    const title = 'VibeUsage Alert'
    const body = `Usage alert: ${tokensUsed.toLocaleString()} tokens (${percentage.toFixed(1)}%)`

    if (alert.notificationMethod === 'system' || alert.notificationMethod === 'both') {
      if (Notification.isSupported()) {
        new Notification({ title, body }).show()
      }
    }

    if (alert.notificationMethod === 'tray' || alert.notificationMethod === 'both') {
      const win = BrowserWindow.getAllWindows()[0]
      if (win) {
        win.webContents.send('alert:triggered', { alert, percentage, tokensUsed })
      }
    }
  }
}
