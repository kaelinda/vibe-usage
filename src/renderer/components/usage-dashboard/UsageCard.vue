<template>
  <div class="usage-card" :class="{ 'near-limit': isNearLimit, 'over-limit': isOverLimit }">
    <div class="card-header">
      <div class="model-info">
        <h4 class="model-name">{{ model.displayName }}</h4>
        <span class="model-id">{{ model.name }}</span>
      </div>
      <div class="model-badges">
        <el-tag v-if="model.type" :type="modelTypeTagType" size="small" class="type-tag">
          {{ modelTypeLabel }}
        </el-tag>
        <el-tag v-if="isOverLimit" type="danger" size="small">Over Limit</el-tag>
        <el-tag v-else-if="isNearLimit" type="warning" size="small">Near Limit</el-tag>
      </div>
    </div>

    <div class="usage-stats">
      <div class="stat">
        <span class="stat-value">{{ formatNumber(latestRecord?.tokensUsed || 0) }}</span>
        <span class="stat-label">Tokens Used</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(model.quotaTotal) }}</span>
        <span class="stat-label">Quota</span>
      </div>
      <div class="stat">
        <span class="stat-value" :class="costClass">${{ formatCost(latestRecord?.costEstimate || 0) }}</span>
        <span class="stat-label">Cost</span>
      </div>
    </div>

    <div class="progress-section">
      <el-progress
        :percentage="Math.min(percentage, 100)"
        :status="progressStatus"
        :stroke-width="8"
        :show-text="false"
      />
      <span class="progress-label">{{ percentage.toFixed(1) }}% used</span>
    </div>

    <div class="card-footer" v-if="latestRecord">
      <span class="last-updated">
        <el-icon><Clock /></el-icon>
        {{ formatTime(latestRecord.timestamp) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import type { ModelConfig, UsageRecord, ModelType } from '../../../../shared/types'

const props = defineProps<{
  model: ModelConfig & { platformName?: string }
  latestRecord?: UsageRecord
}>()

const percentage = computed(() => {
  if (!props.model.quotaTotal) return 0
  return ((props.latestRecord?.tokensUsed || 0) / props.model.quotaTotal) * 100
})

const isNearLimit = computed(() => percentage.value >= 80 && percentage.value < 100)
const isOverLimit = computed(() => percentage.value >= 100)

const progressStatus = computed(() => {
  if (isOverLimit.value) return 'exception'
  if (isNearLimit.value) return 'warning'
  return undefined
})

const costClass = computed(() => {
  if (isOverLimit.value) return 'text-danger'
  if (isNearLimit.value) return 'text-warning'
  return ''
})

const modelTypeTagType = computed(() => {
  const typeMap: Record<ModelType, string> = {
    general: 'primary',
    vision: 'success',
    thinking: 'warning',
  }
  return typeMap[props.model.type || 'general'] || 'info'
})

const modelTypeLabel = computed(() => {
  const labelMap: Record<ModelType, string> = {
    general: 'General',
    vision: 'Vision',
    thinking: 'Thinking',
  }
  return labelMap[props.model.type || 'general'] || 'General'
})

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatCost(cost: number): string {
  if (cost >= 1) return cost.toFixed(2)
  return cost.toFixed(4)
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.usage-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.usage-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.usage-card.near-limit {
  border-color: #e6a23c;
  background: linear-gradient(to right bottom, #fffbf0, #fff);
}

.usage-card.over-limit {
  border-color: #f56c6c;
  background: linear-gradient(to right bottom, #fff5f5, #fff);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.model-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.type-tag {
  text-transform: capitalize;
}

.model-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.model-id {
  font-size: 12px;
  color: #909399;
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-value.text-danger {
  color: #f56c6c;
}

.stat-value.text-warning {
  color: #e6a23c;
}

.stat-label {
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
}

.progress-section {
  margin-bottom: 12px;
}

.progress-label {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.last-updated .el-icon {
  font-size: 12px;
}
</style>
