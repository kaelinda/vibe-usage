<template>
  <div class="dashboard-summary">
    <div class="summary-card total-tokens">
      <div class="card-icon">
        <el-icon :size="24"><DataLine /></el-icon>
      </div>
      <div class="card-content">
        <span class="card-value">{{ formatNumber(summary.totalTokens) }}</span>
        <span class="card-label">Total Tokens</span>
      </div>
    </div>

    <div class="summary-card total-cost">
      <div class="card-icon">
        <el-icon :size="24"><Money /></el-icon>
      </div>
      <div class="card-content">
        <span class="card-value">${{ formatCost(summary.totalCost) }}</span>
        <span class="card-label">Total Cost</span>
      </div>
    </div>

    <div class="summary-card platforms">
      <div class="card-icon">
        <el-icon :size="24"><Grid /></el-icon>
      </div>
      <div class="card-content">
        <span class="card-value">{{ summary.platformCount }}</span>
        <span class="card-label">Platforms</span>
      </div>
    </div>

    <div class="summary-card models">
      <div class="card-icon">
        <el-icon :size="24"><Box /></el-icon>
      </div>
      <div class="card-content">
        <span class="card-value">{{ summary.activeModels }}</span>
        <span class="card-label">Active Models</span>
      </div>
    </div>

    <div class="summary-card alerts" v-if="hasAlerts">
      <div class="card-icon warning" v-if="summary.nearLimitAlerts > 0">
        <el-icon :size="24"><Warning /></el-icon>
      </div>
      <div class="card-icon danger" v-if="summary.overLimitAlerts > 0">
        <el-icon :size="24"><CircleClose /></el-icon>
      </div>
      <div class="card-content">
        <span class="card-value alert-count">{{ alertCount }}</span>
        <span class="card-label">Alerts</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DataLine, Money, Grid, Box, Warning, CircleClose } from '@element-plus/icons-vue'
import type { DashboardSummary } from '../../../../shared/types'

const props = defineProps<{
  summary: DashboardSummary
}>()

const hasAlerts = computed(() => props.summary.nearLimitAlerts > 0 || props.summary.overLimitAlerts > 0)

const alertCount = computed(() => {
  const { nearLimitAlerts, overLimitAlerts } = props.summary
  const parts: string[] = []
  if (nearLimitAlerts > 0) parts.push(`${nearLimitAlerts} near limit`)
  if (overLimitAlerts > 0) parts.push(`${overLimitAlerts} over limit`)
  return parts.join(', ')
})

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatCost(cost: number): string {
  if (cost >= 1000) return `${(cost / 1000).toFixed(1)}K`
  if (cost >= 1) return cost.toFixed(2)
  return cost.toFixed(4)
}
</script>

<style scoped>
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon.warning {
  background: linear-gradient(135deg, #f5a623 0%, #f8c471 100%);
}

.card-icon.danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.card-value.alert-count {
  font-size: 20px;
}

.card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>
