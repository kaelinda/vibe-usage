<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>Settings</h2>
      <p>Configure application preferences</p>
    </div>

    <div class="settings-sections">
      <!-- Polling Settings -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon><Timer /></el-icon>
              <span>Usage Polling</span>
            </div>
          </div>
        </template>

        <div class="setting-item">
          <div class="setting-info">
            <label>Polling Interval</label>
            <p class="setting-description">
              How often to fetch usage data from your configured platforms
            </p>
          </div>
          <div class="setting-control">
            <el-select
              v-model="selectedInterval"
              @change="handleIntervalChange"
              :loading="saving"
              placeholder="Select interval"
            >
              <el-option label="1 minute" :value="60000" />
              <el-option label="5 minutes" :value="300000" />
              <el-option label="10 minutes" :value="600000" />
              <el-option label="15 minutes" :value="900000" />
              <el-option label="30 minutes" :value="1800000" />
              <el-option label="Custom" value="custom" />
            </el-select>
          </div>
        </div>

        <div v-if="selectedInterval === 'custom'" class="custom-interval">
          <el-input-number
            v-model="customIntervalMinutes"
            :min="1"
            :max="1440"
            :step="1"
          />
          <span class="unit">minutes</span>
          <el-button
            type="primary"
            :loading="saving"
            @click="applyCustomInterval"
            :disabled="customIntervalMinutes < 1"
          >
            Apply
          </el-button>
        </div>

        <div class="setting-status">
          <el-tag :type="pollingActive ? 'success' : 'info'" size="small">
            {{ pollingActive ? 'Polling Active' : 'Polling Inactive' }}
          </el-tag>
          <span class="status-text">
            {{ nextPollText }}
          </span>
        </div>
      </el-card>

      <!-- Refresh Settings -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon><Refresh /></el-icon>
              <span>Data Refresh</span>
            </div>
          </div>
        </template>

        <div class="setting-item">
          <div class="setting-info">
            <label>Manual Refresh</label>
            <p class="setting-description">
              Force refresh usage data from all platforms
            </p>
          </div>
          <div class="setting-control">
            <el-button
              type="primary"
              :loading="refreshing"
              @click="handleForceRefresh"
            >
              <el-icon><Refresh /></el-icon>
              Refresh Now
            </el-button>
          </div>
        </div>

        <div v-if="refreshResult" class="refresh-result">
          <el-alert
            :title="`Refreshed ${refreshResult.platformCount} platforms`"
            :description="`Total: ${formatNumber(refreshResult.totalTokens)} tokens, $${refreshResult.totalCost.toFixed(4)}`"
            type="success"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>

      <!-- Notifications -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon><Bell /></el-icon>
              <span>Notifications</span>
            </div>
          </div>
        </template>

        <div class="setting-item">
          <div class="setting-info">
            <label>Usage Alerts</label>
            <p class="setting-description">
              Get notified when usage exceeds thresholds
            </p>
          </div>
          <div class="setting-control">
            <el-switch v-model="alertsEnabled" />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label>Low Balance Warning</label>
            <p class="setting-description">
              Alert when account balance is running low
            </p>
          </div>
          <div class="setting-control">
            <el-switch v-model="lowBalanceAlert" />
          </div>
        </div>
      </el-card>

      <!-- Appearance -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon><Brush /></el-icon>
              <span>Appearance</span>
            </div>
          </div>
        </template>

        <div class="setting-item">
          <div class="setting-info">
            <label>Theme</label>
            <p class="setting-description">
              Choose your preferred color theme
            </p>
          </div>
          <div class="setting-control">
            <el-select v-model="theme" placeholder="Select theme">
              <el-option label="System" value="system" />
              <el-option label="Light" value="light" />
              <el-option label="Dark" value="dark" />
            </el-select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label>Compact Mode</label>
            <p class="setting-description">
              Use smaller spacing for more data density
            </p>
          </div>
          <div class="setting-control">
            <el-switch v-model="compactMode" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Timer, Refresh, Bell, Brush } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const POLLING_INTERVAL_KEY = 'vibeusage_polling_interval'

// State
const selectedInterval = ref<number | 'custom'>(300000)
const customIntervalMinutes = ref(5)
const saving = ref(false)
const refreshing = ref(false)
const refreshResult = ref<{ totalTokens: number; totalCost: number; platformCount: number } | null>(null)
const pollingActive = ref(true)
const alertsEnabled = ref(true)
const lowBalanceAlert = ref(true)
const theme = ref('system')
const compactMode = ref(false)

let nextPollTime: Date | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null

// Computed
const nextPollText = computed(() => {
  if (!nextPollTime) return 'Calculating...'
  const now = new Date()
  const diff = nextPollTime.getTime() - now.getTime()
  if (diff <= 0) return 'Refreshing soon...'
  const minutes = Math.ceil(diff / 60000)
  return `Next poll in ${minutes} minute${minutes !== 1 ? 's' : ''}`
})

// Methods
function loadSavedInterval() {
  const saved = localStorage.getItem(POLLING_INTERVAL_KEY)
  if (saved) {
    const interval = parseInt(saved, 10)
    if ([60000, 300000, 600000, 900000, 1800000].includes(interval)) {
      selectedInterval.value = interval
      customIntervalMinutes.value = interval / 60000
    } else {
      selectedInterval.value = 'custom'
      customIntervalMinutes.value = Math.max(1, Math.round(interval / 60000))
    }
  }
}

async function handleIntervalChange(value: number | 'custom') {
  if (value === 'custom') return

  saving.value = true
  try {
    await window.VibeUsageAPI.preferences.setPollingInterval(value)
    localStorage.setItem(POLLING_INTERVAL_KEY, String(value))
    ElMessage.success('Polling interval updated')
    updateNextPollTime(value)
  } catch (error) {
    ElMessage.error('Failed to update polling interval')
    loadSavedInterval()
  } finally {
    saving.value = false
  }
}

function applyCustomInterval() {
  const intervalMs = customIntervalMinutes.value * 60000
  saving.value = true
  window.VibeUsageAPI.preferences.setPollingInterval(intervalMs)
    .then(() => {
      localStorage.setItem(POLLING_INTERVAL_KEY, String(intervalMs))
      ElMessage.success('Custom interval applied')
      updateNextPollTime(intervalMs)
    })
    .catch(() => {
      ElMessage.error('Failed to apply custom interval')
      loadSavedInterval()
    })
    .finally(() => {
      saving.value = false
    })
}

async function handleForceRefresh() {
  refreshing.value = true
  refreshResult.value = null
  try {
    refreshResult.value = await window.VibeUsageAPI.usage.forceRefresh()
    ElMessage.success('Usage data refreshed')
  } catch (error) {
    ElMessage.error('Failed to refresh usage data')
  } finally {
    refreshing.value = false
  }
}

function updateNextPollTime(intervalMs: number) {
  nextPollTime = new Date(Date.now() + intervalMs)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

function startTimer() {
  timerInterval = setInterval(() => {
    const currentInterval = selectedInterval.value === 'custom'
      ? customIntervalMinutes.value * 60000
      : selectedInterval.value
    updateNextPollTime(currentInterval)
  }, 30000) // Update every 30 seconds
}

onMounted(() => {
  loadSavedInterval()
  startTimer()
  updateNextPollTime(
    selectedInterval.value === 'custom'
      ? customIntervalMinutes.value * 60000
      : selectedInterval.value
  )
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.settings-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.settings-header p {
  margin: 8px 0 0;
  color: #909399;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-title .el-icon {
  font-size: 20px;
  color: #6366f1;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.setting-description {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.custom-interval {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.custom-interval .unit {
  font-size: 14px;
  color: #606266;
}

.setting-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.status-text {
  font-size: 13px;
  color: #909399;
}

.refresh-result {
  margin-top: 16px;
}
</style>
