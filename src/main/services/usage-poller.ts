// @ts-nocheck
import type { PlatformRegistry } from './platform-registry'
import type { StorageService } from './storage-service'

export class UsagePoller {
  private platformRegistry: PlatformRegistry
  private storageService: StorageService
  private intervalId: ReturnType<typeof setInterval> | null = null
  private interval = 60000

  constructor(platformRegistry: PlatformRegistry, storageService: StorageService) {
    this.platformRegistry = platformRegistry
    this.storageService = storageService
  }

  startPolling() {
    if (this.intervalId) {
      return
    }
    this.intervalId = setInterval(() => this.pollAll(), this.interval)
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  setInterval(ms: number) {
    this.interval = ms
    if (this.intervalId) {
      this.stopPolling()
      this.startPolling()
    }
  }

  private async pollAll() {
    const platforms = this.storageService.getAllPlatforms()
    for (const platform of platforms) {
      try {
        const models = this.storageService.getModelsByPlatform(platform.id)
        for (const model of models) {
          const credential = '' // Would fetch from credential manager
          const client = this.platformRegistry.getClient(platform.id, credential)
          if (client) {
            const result = await client.fetchUsage(model.id)
            if (result.success && result.data) {
              this.storageService.addUsageRecord({
                ...result.data,
                modelId: model.id
              })
            }
          }
        }
      } catch (error) {
        console.error(`Failed to poll platform ${platform.id}:`, error)
      }
    }
  }

  getCurrentUsage(platformId: string) {
    const models = this.storageService.getModelsByPlatform(platformId)
    return models.map(model => ({
      model,
      latest: this.storageService.getLatestUsage(model.id)
    }))
  }

  getAllCurrentUsage() {
    const platforms = this.storageService.getAllPlatforms()
    return platforms.map(platform => ({
      platform,
      models: this.getCurrentUsage(platform.id)
    }))
  }

  getSummary() {
    const platforms = this.getAllCurrentUsage()
    let totalTokens = 0
    platforms.forEach(p => {
      p.models.forEach(m => {
        if (m.latest) {
          totalTokens += m.latest.tokensUsed
        }
      })
    })
    return { totalTokens, platformCount: platforms.length }
  }

  async forceRefresh() {
    await this.pollAll()
    return this.getSummary()
  }
}
