import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserPreferences } from '../../shared/types'

export const usePreferencesStore = defineStore('preferences', () => {
  const preferences = ref<UserPreferences | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPreferences() {
    loading.value = true
    error.value = null
    try {
      preferences.value = await window.VibeUsageAPI.preferences.get()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch preferences'
    } finally {
      loading.value = false
    }
  }

  async function updatePreferences(updates: Partial<UserPreferences>) {
    loading.value = true
    error.value = null
    try {
      const result = await window.VibeUsageAPI.preferences.update(updates)
      if (result) {
        preferences.value = result
        return result
      }
      error.value = 'Failed to update preferences'
      return null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update preferences'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  }
})
