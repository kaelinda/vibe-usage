import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlatformConfig, ModelInfo } from '../../shared/types'

export const usePlatformsStore = defineStore('platforms', () => {
  const platforms = ref<PlatformConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const platformCount = computed(() => platforms.value.length)

  async function fetchPlatforms() {
    loading.value = true
    error.value = null
    try {
      platforms.value = await window.VibeUsageAPI.platforms.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch platforms'
    } finally {
      loading.value = false
    }
  }

  async function getModels(platformId: string): Promise<ModelInfo[]> {
    try {
      return await window.VibeUsageAPI.platforms.getModels(platformId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch models'
      return []
    }
  }

  async function addPlatform(config: Omit<PlatformConfig, 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.VibeUsageAPI.platforms.add(config)
      if (result) {
        platforms.value.push(result)
        return result
      }
      error.value = 'Failed to add platform'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add platform'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updatePlatform(id: string, updates: Partial<PlatformConfig>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.VibeUsageAPI.platforms.update(id, updates)
      if (result) {
        const index = platforms.value.findIndex(p => p.id === id)
        if (index !== -1) {
          platforms.value[index] = result
        }
        return result
      }
      error.value = 'Failed to update platform'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update platform'
      return null
    } finally {
      loading.value = false
    }
  }

  async function removePlatform(id: string) {
    loading.value = true
    error.value = null
    try {
      const success = await window.VibeUsageAPI.platforms.remove(id)
      if (success) {
        platforms.value = platforms.value.filter(p => p.id !== id)
        return true
      }
      error.value = 'Failed to remove platform'
      return false
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove platform'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    platforms,
    loading,
    error,
    platformCount,
    fetchPlatforms,
    getModels,
    addPlatform,
    updatePlatform,
    removePlatform,
  }
})
