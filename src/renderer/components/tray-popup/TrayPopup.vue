<template>
  <div class="tray-popup">
    <div class="popup-header">
      <div class="header-left">
        <img src="/vite.svg" alt="VibeUsage" class="logo" />
        <span class="title">VibeUsage</span>
      </div>
      <el-button text circle size="small" @click="refreshData" :loading="loading">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <div class="popup-content" v-if="loading && !summary">
      <el-skeleton :rows="3" animated />
    </div>

    <div class="popup-content" v-else-if="!summary || summary.platformCount === 0">
      <div class="empty-state">
        <el-icon :size="48"><Warning /></el-icon>
        <p>No platforms configured</p>
        <el-button type="primary" size="small" @click="openMainWindow">
          Open App
        </el-button>
      </div>
    </div>

    <div class="popup-content" v-else>
      <div class="summary-row">
        <div class="summary-item">
          <span class="value">{{ formatNumber(summary.totalTokens) }}</span>
          <span class="label">Tokens</span>
        </div>
        <div class="summary-item">
          <span class="value">${{ formatCost(summary.totalCost) }}</span>
          <span class="label">Cost</span>
        </div>
        <div class="summary-item">
          <span class="value">{{ summary.platformCount }}</span>
          <span class="label">Platforms</span>
        </div>
      </div>

      <div class="alerts-section" v-if="summary.nearLimitAlerts > 0 || summary.overLimitAlerts > 0">
        <el-alert
          v-if="summary.overLimitAlerts > 0"
          type="danger"
          :title="`${summary.overLimitAlerts} over limit`"
          :closable="false"
          show-icon
        />
        <el-alert
          v-if="summary.nearLimitAlerts > 0"
          type="warning"
          :title="`${summary.nearLimitAlerts} near limit`"
          :closable="false"
          show-icon
        />
      </div>

      <div class="platforms-list">
        <div
          v-for="usage in platformUsage"
          :key="usage.platform.id"
          class="platform-item"
        >
          <div class="platform-header">
            <span class="platform-name">{{ usage.platform.name }}</span>
            <el-progress
              :percentage="Math.min(usage.overallPercentage, 100)"
              :stroke-width="6"
              :status="getProgressStatus(usage.overallPercentage)"
              :show-text="false"
              style="flex: 1"
            />
            <span class="platform-percent">{{ usage.overallPercentage.toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="popup-footer">
      <el-button text size="small" @click="openMainWindow">
        <el-icon><Setting /></el-icon>
        Settings
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Warning, Setting } from '@element-plus/icons-vue'
import { usePlatformsStore } from '../stores/platforms'
import { useModelsStore } from '../stores/models'
import { useUsageStore } from '../stores/usage'

const platformsStore = usePlatformsStore()
const modelsStore = useModelsStore()
const usageStore = useUsageStore()

const loading = ref(false)

const summary = computed(() => {
  return usageStore.calculateSummary(
    platformsStore.platforms,
    modelsStore.models
  )
})

const platformUsage = computed(() => {
  return usageStore.calculatePlatformUsage(
    platformsStore.platforms,
    modelsStore.models
  ).slice(0, 5)
})

async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      platformsStore.fetchPlatforms(),
      modelsStore.fetchModels(),
    ])
  } finally {
    loading.value = false
  }
}

function openMainWindow() {
  if (window.VibeUsageAPI) {
    window.VibeUsageAPI.window?.show?.()
  }
}

function getProgressStatus(percentage: number): 'success' | 'warning' | 'exception' | undefined {
  if (percentage >= 100) return 'exception'
  if (percentage >= 80) return 'warning'
  return undefined
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatCost(cost: number): string {
  if (cost >= 1) return cost.toFixed(2)
  return cost.toFixed(4)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.tray-popup {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 24px;
  height: 24px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.popup-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: #909399;
}

.empty-state p {
  margin: 12px 0;
}

.summary-row {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.summary-item {
  text-align: center;
}

.summary-item .value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.summary-item .label {
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
}

.alerts-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.platforms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.platform-item {
  background: white;
  border-radius: 6px;
  padding: 10px 12px;
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-name {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  min-width: 80px;
}

.platform-percent {
  font-size: 11px;
  color: #909399;
  min-width: 28px;
  text-align: right;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: white;
  border-top: 1px solid #e4e7ed;
}
</style>
