<template>
  <div class="platform-usage-row" :class="{ expanded: isExpanded }">
    <div class="row-header" @click="isExpanded = !isExpanded">
      <div class="platform-info">
        <div class="platform-icon" :class="platformUsage.platform.id">
          <el-icon :size="20"><component :is="getPlatformIcon(platformUsage.platform.id)" /></el-icon>
        </div>
        <div class="platform-details">
          <h3 class="platform-name">{{ platformUsage.platform.name }}</h3>
          <span class="model-count">{{ platformUsage.models.length }} models</span>
        </div>
      </div>

      <div class="platform-stats">
        <div class="stat">
          <span class="stat-value">{{ formatNumber(platformUsage.totalTokens) }}</span>
          <span class="stat-label">Tokens</span>
        </div>
        <div class="stat">
          <span class="stat-value">${{ formatCost(platformUsage.totalCost) }}</span>
          <span class="stat-label">Cost</span>
        </div>
        <div class="stat">
          <el-progress
            type="circle"
            :percentage="Math.min(platformUsage.overallPercentage, 100)"
            :width="40"
            :stroke-width="4"
            :status="overallStatus"
          />
        </div>
      </div>

      <el-icon class="expand-icon" :class="{ rotated: isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>

    <el-collapse-transition>
      <div class="row-content" v-show="isExpanded">
        <div class="models-grid">
          <UsageCard
            v-for="modelUsage in platformUsage.models"
            :key="modelUsage.model.id"
            :model="modelUsage.model"
            :latest-record="modelUsage.latestRecord"
          />
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDown, ChatDotRound, Connection } from '@element-plus/icons-vue'
import UsageCard from './UsageCard.vue'
import type { PlatformUsage } from '../../../../shared/types'

const props = defineProps<{
  platformUsage: PlatformUsage
}>()

const isExpanded = ref(false)

const overallStatus = computed(() => {
  if (props.platformUsage.overallPercentage >= 100) return 'exception'
  if (props.platformUsage.overallPercentage >= 80) return 'warning'
  return undefined
})

function getPlatformIcon(platformId: string) {
  const icons: Record<string, any> = {
    openai: ChatDotRound,
    anthropic: Connection,
  }
  return icons[platformId] || Connection
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
</script>

<style scoped>
.platform-usage-row {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.row-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.row-header:hover {
  background: #fafafa;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.platform-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.platform-icon.openai {
  background: linear-gradient(135deg, #10a37f 0%, #1a7f64 100%);
}

.platform-icon.anthropic {
  background: linear-gradient(135deg, #d4a574 0%, #b8956d 100%);
}

.platform-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.model-count {
  font-size: 13px;
  color: #909399;
}

.platform-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
}

.expand-icon {
  margin-left: 16px;
  transition: transform 0.3s;
  color: #909399;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.row-content {
  padding: 0 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
</style>
