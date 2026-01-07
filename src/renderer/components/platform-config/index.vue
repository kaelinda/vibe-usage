<template>
  <div class="platform-config">
    <div class="config-header">
      <h2>Platform Configuration</h2>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        Add Platform
      </el-button>
    </div>

    <PlatformList
      :platforms="platforms"
      :loading="loading"
      :model-counts="modelCounts"
      @add="showAddDialog"
      @edit="handleEdit"
      @configure="handleConfigure"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="editingPlatform ? 'Edit Platform' : 'Add Platform'"
      width="500px"
      :close-on-click-modal="false"
    >
      <PlatformForm
        :platform="editingPlatform"
        :loading="submitting"
        @submit="handleSubmit"
        @cancel="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import PlatformList from './PlatformList.vue'
import PlatformForm from './PlatformForm.vue'
import { usePlatformsStore } from '../../stores/platforms'
import { useModelsStore } from '../../stores/models'
import type { PlatformConfig } from '../../../../shared/types'

const platformsStore = usePlatformsStore()
const modelsStore = useModelsStore()

const loading = computed(() => platformsStore.loading)
const platforms = computed(() => platformsStore.platforms)
const submitting = computed(() => platformsStore.loading)

const dialogVisible = ref(false)
const editingPlatform = ref<PlatformConfig | null>(null)

const modelCounts = computed(() => {
  const counts: Record<string, number> = {}
  platforms.value.forEach(p => {
    counts[p.id] = modelsStore.models.filter(m => m.platformId === p.id).length
  })
  return counts
})

onMounted(async () => {
  await Promise.all([
    platformsStore.fetchPlatforms(),
    modelsStore.fetchModels(),
  ])
})

function showAddDialog() {
  editingPlatform.value = null
  dialogVisible.value = true
}

function handleEdit(platform: PlatformConfig) {
  editingPlatform.value = platform
  dialogVisible.value = true
}

function handleConfigure(platform: PlatformConfig) {
  console.log('Configure models for:', platform.id)
}

async function handleSubmit(data: { config: Partial<PlatformConfig>; apiKey: string }) {
  if (editingPlatform.value) {
    await platformsStore.updatePlatform(editingPlatform.value.id, data.config)
  } else {
    await platformsStore.addPlatform(data.config as any)
    if (data.apiKey) {
      await window.VibeUsageAPI.credentials.set(data.config.id!, data.apiKey)
    }
  }
  closeDialog()
}

function closeDialog() {
  dialogVisible.value = false
  editingPlatform.value = null
}
</script>

<style scoped>
.platform-config {
  padding: 24px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.config-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
</style>
