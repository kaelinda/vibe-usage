import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModelConfig } from '../../shared/types'

export const useModelsStore = defineStore('models', () => {
  const models = ref<ModelConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const modelCount = computed(() => models.value.length)

  async function fetchModels() {
    loading.value = true
    error.value = null
    try {
      models.value = await window.VibeUsageAPI.models.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch models'
    } finally {
      loading.value = false
    }
  }

  async function fetchModelsByPlatform(platformId: string) {
    loading.value = true
    error.value = null
    try {
      return await window.VibeUsageAPI.models.getByPlatform(platformId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch models'
      return []
    } finally {
      loading.value = false
    }
  }

  async function addModel(config: Omit<ModelConfig, 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.VibeUsageAPI.models.add(config)
      if (result) {
        models.value.push(result)
        return result
      }
      error.value = 'Failed to add model'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add model'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateModel(id: string, updates: Partial<ModelConfig>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.VibeUsageAPI.models.update(id, updates)
      if (result) {
        const index = models.value.findIndex(m => m.id === id)
        if (index !== -1) {
          models.value[index] = result
        }
        return result
      }
      error.value = 'Failed to update model'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update model'
      return null
    } finally {
      loading.value = false
    }
  }

  async function removeModel(id: string) {
    loading.value = true
    error.value = null
    try {
      const success = await window.VibeUsageAPI.models.remove(id)
      if (success) {
        models.value = models.value.filter(m => m.id !== id)
        return true
      }
      error.value = 'Failed to remove model'
      return false
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove model'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    models,
    loading,
    error,
    modelCount,
    fetchModels,
    fetchModelsByPlatform,
    addModel,
    updateModel,
    removeModel,
  }
})
