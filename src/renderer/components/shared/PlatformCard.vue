<template>
  <el-card class="platform-card" :body-style="{ padding: '0px' }">
    <div class="platform-header">
      <div class="platform-icon" :class="platform.id">
        <el-icon :size="24"><component :is="getPlatformIcon(platform.id)" /></el-icon>
      </div>
      <div class="platform-info">
        <h3 class="platform-name">{{ platform.name }}</h3>
        <el-tag v-if="platform.options?.authType" size="small" type="info">
          {{ platform.options.authType }}
        </el-tag>
      </div>
      <div class="platform-actions">
        <el-button circle size="small" @click="$emit('edit', platform)">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button circle size="small" type="danger" @click="handleRemove">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="platform-footer">
      <span class="model-count">{{ modelCount }} models</span>
      <el-button link type="primary" size="small" @click="$emit('configure', platform)">
        Configure Models
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { PlatformConfig } from '../../../../shared/types'

const props = defineProps<{
  platform: PlatformConfig
  modelCount?: number
}>()

defineEmits<{
  edit: [platform: PlatformConfig]
  configure: [platform: PlatformConfig]
}>()

const modelCount = computed(() => props.modelCount || 0)

function getPlatformIcon(platformId: string) {
  const icons: Record<string, string> = {
    openai: 'ChatDotRound',
    anthropic: 'Connection',
  }
  return icons[platformId] || 'Platform'
}

async function handleRemove() {
  try {
    await window.VibeUsageAPI.platforms.remove(props.platform.id)
  } catch (error) {
    console.error('Failed to remove platform:', error)
  }
}
</script>

<style scoped>
.platform-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.platform-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.platform-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.platform-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
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

.platform-info {
  flex: 1;
}

.platform-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.platform-actions {
  display: flex;
  gap: 4px;
}

.platform-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.model-count {
  font-size: 13px;
  color: #666;
}
</style>
