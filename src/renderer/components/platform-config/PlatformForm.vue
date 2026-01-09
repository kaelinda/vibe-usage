<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="Platform Name" prop="name">
      <el-input v-model="form.name" placeholder="e.g., OpenAI API" />
    </el-form-item>

    <el-form-item label="Platform ID" prop="id" v-if="!isEditing">
      <el-input v-model="form.id" placeholder="e.g., openai" :disabled="isEditing">
        <template #prefix>
          <el-icon><Link /></el-icon>
        </template>
      </el-input>
      <div class="form-tip">Unique identifier for this platform</div>
    </el-form-item>

    <el-form-item label="API Endpoint" prop="apiEndpoint">
      <el-input v-model="form.apiEndpoint" placeholder="https://api.openai.com/v1">
        <template #prefix>
          <el-icon><Connection /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="Description" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="2"
        placeholder="Optional description..."
      />
    </el-form-item>

    <el-form-item label="Authentication Type" prop="authType">
      <el-select v-model="form.authType" placeholder="Select auth type">
        <el-option label="API Key" value="api_key" />
        <el-option label="Bearer Token" value="bearer" />
        <el-option label="OAuth 2.0" value="oauth2" />
      </el-select>
    </el-form-item>

    <el-form-item label="API Key" prop="apiKey" v-if="!isEditing">
      <el-input
        v-model="form.apiKey"
        type="password"
        show-password
        placeholder="Enter your API key"
      >
        <template #prefix>
          <el-icon><Lock /></el-icon>
        </template>
      </el-input>
      <div class="form-tip">API key is required to validate and fetch usage</div>
    </el-form-item>

    <el-form-item label="Requires Organization ID">
      <el-switch v-model="form.requiresOrg" />
      <span class="switch-label">Some platforms require org ID for usage tracking</span>
    </el-form-item>

    <el-alert
      v-if="validationError"
      type="error"
      :closable="false"
      show-icon
      class="validation-alert"
    >
      {{ validationError }}
    </el-alert>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">Cancel</el-button>
      <el-button type="primary" :loading="loading || validating" @click="handleSubmit">
        {{ isEditing ? 'Update Platform' : 'Add Platform' }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Link, Connection, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PlatformConfig } from '../../../../shared/types'

const props = withDefaults(defineProps<{
  platform?: PlatformConfig | null
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: { config: Partial<PlatformConfig>; apiKey: string }]
  cancel: []
}>()

const formRef = ref<FormInstance>()
const isEditing = computed(() => !!props.platform)
const validating = ref(false)
const validationError = ref<string | null>(null)

const form = reactive({
  id: '',
  name: '',
  apiEndpoint: '',
  description: '',
  authType: 'api_key' as const,
  apiKey: '',
  requiresOrg: false,
})

const rules: FormRules = {
  id: [
    { required: true, message: 'Platform ID is required', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: 'ID must be lowercase with hyphens', trigger: 'blur' },
  ],
  name: [
    { required: true, message: 'Platform name is required', trigger: 'blur' },
  ],
  apiEndpoint: [
    { required: true, message: 'API endpoint is required', trigger: 'blur' },
    { type: 'url', message: 'Must be a valid URL', trigger: 'blur' },
  ],
  apiKey: [
    { required: true, message: 'API key is required', trigger: 'blur' },
  ],
}

onMounted(() => {
  if (props.platform) {
    form.id = props.platform.id
    form.name = props.platform.name
    form.apiEndpoint = props.platform.apiEndpoint
    form.description = props.platform.description || ''
    form.authType = props.platform.options?.authType || 'api_key'
    form.requiresOrg = props.platform.options?.requiresOrg || false
  }
})

async function handleSubmit() {
  if (!formRef.value) return

  validationError.value = null

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // Skip credential validation for editing mode
    if (isEditing.value) {
      const config: Partial<PlatformConfig> = {
        id: form.id,
        name: form.name,
        apiEndpoint: form.apiEndpoint,
        description: form.description,
        options: {
          authType: form.authType,
          requiresOrg: form.requiresOrg,
        },
      }
      emit('submit', { config, apiKey: '' })
      return
    }

    // Validate credentials before submitting
    validating.value = true
    try {
      const config: Partial<PlatformConfig> = {
        id: form.id,
        name: form.name,
        apiEndpoint: form.apiEndpoint,
        description: form.description,
        options: {
          authType: form.authType,
          requiresOrg: form.requiresOrg,
        },
      }

      // Emit submit event with config - parent component handles credential validation
      emit('submit', { config, apiKey: form.apiKey })
    } finally {
      validating.value = false
    }
  })
}
</script>

<style scoped>
.validation-alert {
  margin-bottom: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.switch-label {
  margin-left: 8px;
  font-size: 13px;
  color: #606266;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
