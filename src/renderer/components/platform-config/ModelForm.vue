<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-tabs v-model="activeTab">
      <!-- Tab 1: Select from Platform Models -->
      <el-tab-pane label="Select from List" name="select">
        <div class="platform-models-section">
          <p class="section-description">Choose from the models supported by {{ platform.name }}:</p>
          <el-select
            v-model="selectedModelId"
            placeholder="Select a model"
            filterable
            clearable
            class="model-select"
            @change="onModelSelect"
          >
            <el-option
              v-for="model in availableModels"
              :key="model.id"
              :value="model.id"
              :label="model.displayName"
            >
              <div class="model-option">
                <span>{{ model.displayName }}</span>
                <el-tag :type="getTypeTagType(model.type)" size="small">
                  {{ getTypeLabel(model.type) }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
          <div v-if="selectedModelInfo" class="selected-model-info">
            <el-tag :type="getTypeTagType(selectedModelInfo.type)" size="small">
              {{ getTypeLabel(selectedModelInfo.type) }}
            </el-tag>
            <span class="model-id">ID: {{ selectedModelInfo.id }}</span>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Manual Input -->
      <el-tab-pane label="Manual Input" name="manual">
        <el-form-item label="Model ID" prop="name">
          <el-input
            v-model="form.name"
            placeholder="e.g., gpt-4, claude-3-opus"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">The actual model ID used in API calls</div>
        </el-form-item>
      </el-tab-pane>
    </el-tabs>

    <el-divider />

    <!-- Common fields for both tabs -->
    <el-form-item label="Display Name" prop="displayName">
      <el-input
        v-model="form.displayName"
        placeholder="e.g., GPT-4, Claude 3 Opus"
      >
        <template #prefix>
          <el-icon><Edit /></el-icon>
        </template>
      </el-input>
      <div class="form-tip">Friendly name shown in the dashboard</div>
    </el-form-item>

    <el-form-item label="Monthly Quota (Tokens)" prop="quotaTotal">
      <el-input-number
        v-model="form.quotaTotal"
        :min="0"
        :step="10000"
        placeholder="Leave empty for unlimited"
        style="width: 100%"
      />
      <div class="form-tip">Set to 0 or leave empty for unlimited usage</div>
    </el-form-item>

    <el-form-item label="Model Type">
      <el-select v-model="form.type" placeholder="Select type" style="width: 100%">
        <el-option label="General" value="general">
          <el-tag type="primary" size="small">General</el-tag>
        </el-option>
        <el-option label="Vision" value="vision">
          <el-tag type="success" size="small">Vision</el-tag>
        </el-option>
        <el-option label="Thinking" value="thinking">
          <el-tag type="warning" size="small">Thinking</el-tag>
        </el-option>
      </el-select>
      <div class="form-tip">Helps categorize models in usage reports</div>
    </el-form-item>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">Cancel</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEditing ? 'Update Model' : 'Add Model' }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Link, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PlatformConfig, ModelConfig, ModelInfo, ModelType } from '../../../../shared/types'

const props = withDefaults(defineProps<{
  model?: ModelConfig | null
  platform: PlatformConfig
  availableModels: ModelInfo[]
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: { config: Partial<ModelConfig> }]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const activeTab = ref('select')
const selectedModelId = ref('')

const isEditing = computed(() => !!props.model)

const form = reactive({
  name: '',
  displayName: '',
  quotaTotal: 0 as number | undefined,
  type: undefined as ModelType | undefined,
})

const rules: FormRules = {
  name: [
    { required: true, message: 'Model ID is required', trigger: 'blur' },
    { pattern: /^[a-z0-9_-]+$/, message: 'ID must be lowercase with numbers, hyphens, underscores', trigger: 'blur' },
  ],
  displayName: [
    { required: true, message: 'Display name is required', trigger: 'blur' },
  ],
}

const selectedModelInfo = computed(() => {
  return props.availableModels.find(m => m.id === selectedModelId.value)
})

onMounted(() => {
  if (props.model) {
    form.name = props.model.name
    form.displayName = props.model.displayName
    form.quotaTotal = props.model.quotaTotal || undefined
    form.type = props.model.type

    // If editing, try to find the model in available list
    const found = props.availableModels.find(m => m.id === props.model?.name)
    if (found) {
      activeTab.value = 'select'
      selectedModelId.value = found.id
    } else {
      activeTab.value = 'manual'
    }
  }
})

watch(activeTab, (tab) => {
  if (tab === 'select' && !selectedModelId.value && props.availableModels.length > 0) {
    // Auto-select first model if available
    selectedModelId.value = props.availableModels[0].id
    onModelSelect(selectedModelId.value)
  }
})

function onModelSelect(modelId: string) {
  const model = props.availableModels.find(m => m.id === modelId)
  if (model) {
    form.name = model.id
    form.displayName = model.displayName
    form.type = model.type
  }
}

function getTypeTagType(type?: ModelType): string {
  const typeMap: Record<string, string> = {
    general: 'primary',
    vision: 'success',
    thinking: 'warning',
  }
  return typeMap[type || 'general'] || 'info'
}

function getTypeLabel(type?: ModelType): string {
  const labelMap: Record<string, string> = {
    general: 'General',
    vision: 'Vision',
    thinking: 'Thinking',
  }
  return labelMap[type || 'general'] || type || '-'
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    const config: Partial<ModelConfig> = {
      name: form.name,
      displayName: form.displayName,
      quotaTotal: form.quotaTotal || undefined,
      type: form.type,
    }

    emit('submit', { config })
  })
}
</script>

<style scoped>
.platform-models-section {
  padding: 8px 0;
}

.section-description {
  margin: 0 0 12px;
  color: #606266;
  font-size: 14px;
}

.model-select {
  width: 100%;
}

.model-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.selected-model-info {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.selected-model-info .model-id {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-divider) {
  margin: 16px 0 24px;
}
</style>
