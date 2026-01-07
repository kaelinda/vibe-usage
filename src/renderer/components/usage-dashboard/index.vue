<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-left">
        <h2>Usage Dashboard</h2>
        <span class="last-updated" v-if="lastUpdated">
          Last updated: {{ formatTime(lastUpdated) }}
        </span>
      </div>
      <div class="header-actions">
        <el-button :loading="loading" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </div>

    <DashboardSummary :summary="summary" />

    <div v-if="loading && platformUsage.length === 0" class="loading-container">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>Loading usage data...</p>
    </div>

    <div v-else-if="platformUsage.length === 0" class="empty-state">
      <el-icon :size="64"><DataAnalysis /></el-icon>
      <h3>No Usage Data</h3>
      <p>Add platforms and models to start tracking usage</p>
      <el-button type="primary" @click="$emit('navigate', 'platforms')">
        <el-icon><Plus /></el-icon>
        Add Platform
      </el-button>
    </div>

    <div v-else class="usage-content">
      <PlatformUsageRow
        v-for="usage in platformUsage"
        :key="usage.platform.id"
        :platform-usage="usage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Refresh, Loading, Plus, DataAnalysis } from '@element-plus/icons-vue'
import DashboardSummary from './DashboardSummary.vue'
import PlatformUsageRow from './PlatformUsageRow.vue'
import { useUsageStore } from '../../stores/usage'
import { usePlatformsStore } from '../../stores/platforms'
import { useModelsStore } from '../../stores/models'

const emit = defineEmits<{
  navigate: [view: string]
}>()

const usageStore = useUsageStore()
const platformsStore = usePlatformsStore()
const modelsStore = useModelsStore()

const loading = computed(() => usageStore.loading)
const lastUpdated = computed(() => usageStore.lastUpdated)

const platformUsage = computed(() => {
  return usageStore.calculatePlatformUsage(
    platformsStore.platforms,
    modelsStore.models
  )
})

const summary = computed(() => {
  return usageStore.calculateSummary(
    platformsStore.platforms,
    modelsStore.models
  )
})

async function refreshData() {
  await Promise.all([
    platformsStore.fetchPlatforms(),
    modelsStore.fetchModels(),
  ])
}

onMounted(() => {
  refreshData()
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.dashboard-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.last-updated {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #909399;
}

.loading-container p {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px dashed #dcdfe6;
}

.empty-state h3 {
  margin: 24px 0 8px;
  font-size: 18px;
  color: #303133;
}

.empty-state p {
  margin: 0 0 24px;
  color: #909399;
}

.usage-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
