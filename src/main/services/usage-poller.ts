// @ts-nocheck
import type { PlatformRegistry } from './platform-registry'
import type { StorageService } from './storage-service'
import type { CredentialManager } from './credential-manager'

export class UsagePoller {
  private platformRegistry: PlatformRegistry
  private storageService: StorageService
  private credentialManager: CredentialManager
  private intervalId: ReturnType<typeof setInterval> | null = null
  private interval = 300000 // Default 5 minutes

  constructor(
    platformRegistry: PlatformRegistry,
    storageService: StorageService,
    credentialManager: CredentialManager
  ) {
    this.platformRegistry = platformRegistry
    this.storageService = storageService
    this.credentialManager = credentialManager
  }

  startPolling() {
    if (this.intervalId) {
      return
    }
    console.log(`[UsagePoller] Starting polling with ${this.interval}ms interval`)
    this.intervalId = setInterval(() => this.pollAll(), this.interval)
    // Do an immediate poll on start
    this.pollAll().catch(err => {
      console.error('[UsagePoller] Initial poll failed:', err)
    })
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('[UsagePoller] Stopped polling')
    }
  }

  setInterval(ms: number) {
    this.interval = ms
    console.log(`[UsagePoller] Interval set to ${ms}ms`)
    if (this.intervalId) {
      this.stopPolling()
      this.startPolling()
    }
  }

  private async pollAll() {
    const platforms = this.storageService.getAllPlatforms()
    console.log(`[UsagePoller] Polling ${platforms.length} platforms...`)

    for (const platform of platforms) {
      try {
        const credential = await this.credentialManager.getPassword(platform.id)
        if (!credential) {
          console.warn(`[UsagePoller] No credential found for platform: ${platform.id}`)
          continue
        }

        const models = this.storageService.getModelsByPlatform(platform.id)
        for (const model of models) {
          const client = this.platformRegistry.getClient(platform.id, credential)
          if (!client) {
            console.warn(`[UsagePoller] No client available for platform: ${platform.id}`)
            continue
          }

          const result = await client.fetchUsage(model.id)
          if (result.success && result.data) {
            this.storageService.addUsageRecord({
              ...result.data,
              modelId: model.id
            })
            console.log(`[UsagePoller] Recorded usage for ${platform.id}/${model.name}: ${result.data.tokensUsed} tokens`)
          } else if (result.error) {
            console.warn(`[UsagePoller] Error fetching usage for ${platform.id}/${model.name}: ${result.error}`)
          }
        }
      } catch (error) {
        console.error(`[UsagePoller] Failed to poll platform ${platform.id}:`, error)
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
    let totalCost = 0
    platforms.forEach(p => {
      p.models.forEach(m => {
        if (m.latest) {
          totalTokens += m.latest.tokensUsed
          totalCost += m.latest.costEstimate || 0
        }
      })
    })
    return { totalTokens, totalCost, platformCount: platforms.length }
  }

  async forceRefresh() {
    console.log('[UsagePoller] Force refresh triggered')
    await this.pollAll()
    return this.getSummary()
  }
}
