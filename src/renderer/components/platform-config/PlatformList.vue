<template>
  <div class="platform-list">
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>Loading platforms...</p>
    </div>

    <div v-else-if="platforms.length === 0" class="empty-state">
      <el-icon :size="64"><Box /></el-icon>
      <h3>No Platforms Configured</h3>
      <p>Add your first AI platform to start tracking usage</p>
      <el-button type="primary" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        Add Platform
      </el-button>
    </div>

    <div v-else class="platforms-grid">
      <PlatformCard
        v-for="platform in platforms"
        :key="platform.id"
        :platform="platform"
        :model-count="getModelCount(platform.id)"
        @edit="$emit('edit', $event)"
        @configure="$emit('configure', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading, Box, Plus } from '@element-plus/icons-vue'
import PlatformCard from '../shared/PlatformCard.vue'
import type { PlatformConfig } from '../../../../shared/types'

const props = defineProps<{
  platforms: PlatformConfig[]
  loading: boolean
  modelCounts?: Record<string, number>
}>()

defineEmits<{
  add: []
  edit: [platform: PlatformConfig]
  configure: [platform: PlatformConfig]
}>()

function getModelCount(platformId: string): number {
  return props.modelCounts?.[platformId] || 0
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #909399;
}

.loading-container p {
  margin-top: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  color: #606266;
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

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
</style>
