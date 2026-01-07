import { ref, computed, watch } from 'vue'
import type { PlatformUsage, DashboardSummary } from '../../shared/types'

export interface TraySummary {
  totalTokens: number
  totalCost: number
  platformCount: number
  activeModels: number
  alerts: {
    nearLimit: number
    overLimit: number
  }
  usageByPlatform: Array<{
    name: string
    percentage: number
  }>
}

export function useTraySummary(
  platforms: Array<{ id: string; name: string }>,
  models: Array<{ id: string; platformId: string; name: string; displayName: string; quotaTotal: number }>,
  usageRecords: Array<{ modelId: string; tokensUsed: number; costEstimate?: number; quotaTotal?: number }>
) {
  const summary = computed((): TraySummary => {
    const platformCount = platforms.length
    const activeModels = new Set(usageRecords.map(r => r.modelId)).size

    const nearLimitAlerts = models.filter(model => {
      const record = usageRecords.find(r => r.modelId === model.id)
      const percentage = model.quotaTotal > 0 && record
        ? (record.tokensUsed / model.quotaTotal) * 100
        : 0
      return percentage >= 80 && percentage < 100
    }).length

    const overLimitAlerts = models.filter(model => {
      const record = usageRecords.find(r => r.modelId === model.id)
      const percentage = model.quotaTotal > 0 && record
        ? (record.tokensUsed / model.quotaTotal) * 100
        : 0
      return percentage >= 100
    }).length

    const totalTokens = usageRecords.reduce((sum, r) => sum + r.tokensUsed, 0)
    const totalCost = usageRecords.reduce((sum, r) => sum + (r.costEstimate || 0), 0)

    const usageByPlatform = platforms.map(platform => {
      const platformModels = models.filter(m => m.platformId === platform.id)
      if (platformModels.length === 0) {
        return { name: platform.name, percentage: 0 }
      }

      const overallPercentage = platformModels.reduce((sum, model) => {
        const record = usageRecords.find(r => r.modelId === model.id)
        const percentage = model.quotaTotal > 0 && record
          ? (record.tokensUsed / model.quotaTotal) * 100
          : 0
        return sum + percentage
      }, 0) / platformModels.length

      return {
        name: platform.name,
        percentage: overallPercentage,
      }
    })

    return {
      totalTokens,
      totalCost,
      platformCount,
      activeModels,
      alerts: {
        nearLimit: nearLimitAlerts,
        overLimit: overLimitAlerts,
      },
      usageByPlatform,
    }
  })

  const badgeText = computed(() => {
    const { totalTokens, alerts } = summary.value
    if (alerts.overLimit > 0) return '!'
    if (alerts.nearLimit > 0) return 'i'
    if (totalTokens > 0) return Math.min(Math.round(totalTokens / 1000000), 99).toString()
    return ''
  })

  const badgeColor = computed(() => {
    const { alerts } = summary.value
    if (alerts.overLimit > 0) return '#f56c6c'
    if (alerts.nearLimit > 0) return '#e6a23c'
    return '#67c23a'
  })

  return {
    summary,
    badgeText,
    badgeColor,
  }
}
