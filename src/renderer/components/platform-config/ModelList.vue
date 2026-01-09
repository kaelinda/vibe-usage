<template>
  <div class="model-list">
    <div class="model-list-header">
      <h3>{{ platform.name }} - Models</h3>
      <el-button type="primary" size="small" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        Add Model
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <p>Loading models...</p>
    </div>

    <div v-else-if="models.length === 0" class="empty-state">
      <el-icon :size="48"><Box /></el-icon>
      <p>No models configured</p>
      <p class="tip">Click "Add Model" to configure your first model</p>
    </div>

    <el-table v-else :data="models" style="width: 100%">
      <el-table-column prop="displayName" label="Display Name" min-width="120">
        <template #default="{ row }">
          <span class="model-display-name">{{ row.displayName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Model ID" min-width="150">
        <template #default="{ row }">
          <code class="model-id">{{ row.name }}</code>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.type" :type="getTypeTagType(row.type)" size="small">
            {{ getTypeLabel(row.type) }}
          </el-tag>
          <span v-else class="no-type">-</span>
        </template>
      </el-table-column>
      <el-table-column label="Quota" width="120" align="right">
        <template #default="{ row }">
          <span v-if="row.quotaTotal">{{ formatNumber(row.quotaTotal) }}</span>
          <span v-else class="no-quota">Unlimited</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" align="center">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add/Edit Model Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingModel ? 'Edit Model' : 'Add Model'"
      width="500px"
      :close-on-click-modal="false"
    >
      <ModelForm
        :model="editingModel"
        :platform="platform"
        :available-models="availableModels"
        @submit="handleSubmit"
        @cancel="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Loading, Box } from '@element-plus/icons-vue'
import type { PlatformConfig, ModelConfig, ModelInfo, ModelType } from '../../../../shared/types'
import { useModelsStore } from '../../stores/models'
import { usePlatformsStore } from '../../stores/platforms'
import ModelForm from './ModelForm.vue'

const props = defineProps<{
  platform: PlatformConfig
}>()

const emit = defineEmits<{
  close: []
}>()

const modelsStore = useModelsStore()
const platformsStore = usePlatformsStore()

const loading = computed(() => modelsStore.loading)
const models = computed(() => modelsStore.models.filter(m => m.platformId === props.platform.id))
const availableModels = ref<ModelInfo[]>([])

const showAddDialog = ref(false)
const editingModel = ref<ModelConfig | null>(null)

onMounted(async () => {
  await modelsStore.fetchModels()
  // Fetch available models from platform API
  availableModels.value = await platformsStore.getModels(props.platform.id)
})

function getTypeTagType(type: ModelType): string {
  const typeMap: Record<ModelType, string> = {
    general: 'primary',
    vision: 'success',
    thinking: 'warning',
  }
  return typeMap[type] || 'info'
}

function getTypeLabel(type: ModelType): string {
  const labelMap: Record<ModelType, string> = {
    general: 'General',
    vision: 'Vision',
    thinking: 'Thinking',
  }
  return labelMap[type] || type
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function handleEdit(model: ModelConfig) {
  editingModel.value = model
  showAddDialog.value = true
}

async function handleDelete(model: ModelConfig) {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${model.displayName}"?`,
      'Delete Model',
      { type: 'warning' }
    )
    await modelsStore.removeModel(model.id)
  } catch {
    // User cancelled
  }
}

async function handleSubmit(data: { config: Partial<ModelConfig> }) {
  if (editingModel.value) {
    await modelsStore.updateModel(editingModel.value.id, data.config)
  } else {
    await modelsStore.addModel({
      platformId: props.platform.id,
      name: data.config.name!,
      displayName: data.config.displayName || data.config.name!,
      quotaTotal: data.config.quotaTotal || 0,
      type: data.config.type,
    } as any)
  }
  closeDialog()
}

function closeDialog() {
  showAddDialog.value = false
  editingModel.value = null
}
</script>

<style scoped>
.model-list {
  padding: 16px;
}

.model-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.model-list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #909399;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #909399;
  text-align: center;
}

.empty-state .tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

.model-display-name {
  font-weight: 500;
  color: #303133;
}

.model-id {
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
}

.no-type,
.no-quota {
  color: #c0c4cc;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header th) {
  background: #f5f7fa;
}
</style>
