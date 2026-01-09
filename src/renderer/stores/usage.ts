import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UsageRecord, PlatformUsage, DashboardSummary, ModelUsage, ModelConfig } from '../../shared/types'

export const useUsageStore = defineStore('usage', () => {
  const usageRecords = ref<UsageRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const totalTokens = computed(() => {
    return usageRecords.value.reduce((sum: number, r: UsageRecord) => sum + r.tokensUsed, 0)
  })

  const totalCost = computed(() => {
    return usageRecords.value.reduce((sum: number, r: UsageRecord) => sum + (r.costEstimate || 0), 0)
  })

  async function fetchUsageHistory(modelId: string, days: number = 30) {
    loading.value = true
    error.value = null
    try {
      const records = await window.VibeUsageAPI.usage.getHistory(modelId, days)
      usageRecords.value = records
      lastUpdated.value = new Date()
      return records
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch usage'
      return []
    } finally {
      loading.value = false
    }
  }

  async function getLatestUsage(modelId: string): Promise<UsageRecord | undefined> {
    try {
      return await window.VibeUsageAPI.usage.getLatest(modelId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch latest usage'
      return undefined
    }
  }

  async function addUsageRecord(record: Omit<UsageRecord, 'id'>): Promise<number | null> {
    try {
      const id = await window.VibeUsageAPI.usage.addRecord(record)
      if (id) {
        usageRecords.value.unshift({ ...record, id } as UsageRecord)
      }
      return id
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add usage record'
      return null
    }
  }

  async function forceRefresh() {
    loading.value = true
    error.value = null
    try {
      await window.VibeUsageAPI.usage.forceRefresh()
      lastUpdated.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to force refresh'
    } finally {
      loading.value = false
    }
  }

  function calculatePlatformUsage(
    platforms: Array<{ id: string; name: string }>,
    models: ModelConfig[]
  ): PlatformUsage[] {
    return platforms.map(platform => {
      const platformModels = models.filter(m => m.platformId === platform.id)
      const modelUsage: ModelUsage[] = platformModels.map(model => {
        const latestRecord = usageRecords.value.find((r: UsageRecord) => r.modelId === model.id)
        const percentage = model.quotaTotal > 0
          ? ((latestRecord?.tokensUsed || 0) / model.quotaTotal) * 100
          : 0

        return {
          model,
          latestRecord,
          percentage: Math.min(percentage, 100),
          isNearLimit: percentage >= 80 && percentage < 100,
          isOverLimit: percentage >= 100,
        }
      })

      const totalTokens = modelUsage.reduce((sum: number, m: ModelUsage) => sum + (m.latestRecord?.tokensUsed || 0), 0)
      const totalCost = modelUsage.reduce((sum: number, m: ModelUsage) => sum + (m.latestRecord?.costEstimate || 0), 0)
      const overallPercentage = modelUsage.length > 0
        ? modelUsage.reduce((sum: number, m: ModelUsage) => sum + m.percentage, 0) / modelUsage.length
        : 0

      return {
        platform,
        models: modelUsage,
        totalTokens,
        totalCost,
        overallPercentage,
      }
    })
  }

  function calculateSummary(
    platforms: Array<{ id: string }>,
    models: ModelConfig[]
  ): DashboardSummary {
    const platformCount = platforms.length
    const activeModels = new Set(usageRecords.value.map((r: UsageRecord) => r.modelId)).size

    const nearLimitAlerts = models.filter(model => {
      const record = usageRecords.value.find((r: UsageRecord) => r.modelId === model.id)
      const percentage = model.quotaTotal > 0 && record
        ? (record.tokensUsed / model.quotaTotal) * 100
        : 0
      return percentage >= 80 && percentage < 100
    }).length

    const overLimitAlerts = models.filter(model => {
      const record = usageRecords.value.find((r: UsageRecord) => r.modelId === model.id)
      const percentage = model.quotaTotal > 0 && record
        ? (record.tokensUsed / model.quotaTotal) * 100
        : 0
      return percentage >= 100
    }).length

    return {
      totalTokens: totalTokens.value,
      totalCost: totalCost.value,
      platformCount,
      activeModels,
      nearLimitAlerts,
      overLimitAlerts,
    }
  }

  return {
    usageRecords,
    loading,
    error,
    lastUpdated,
    totalTokens,
    totalCost,
    fetchUsageHistory,
    getLatestUsage,
    addUsageRecord,
    forceRefresh,
    calculatePlatformUsage,
    calculateSummary,
  }
})
