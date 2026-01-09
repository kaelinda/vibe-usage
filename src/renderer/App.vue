<template>
  <el-config-provider :locale="locale">
    <el-container class="app-container">
      <el-aside width="220px" class="sidebar" v-if="!isPopup">
        <div class="logo">
          <img src="/vite.svg" alt="VibeUsage" />
          <span>VibeUsage</span>
        </div>
        <el-menu
          :default-active="currentView"
          @select="handleNavigation"
          class="sidebar-menu"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="platforms">
            <el-icon><Platform /></el-icon>
            <span>Platforms</span>
          </el-menu-item>
          <el-menu-item index="history">
            <el-icon><Clock /></el-icon>
            <span>History</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>Settings</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <component :is="currentViewComponent" />
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DataAnalysis, Platform, Clock, Setting } from '@element-plus/icons-vue'
import en from 'element-plus/es/locale/lang/en'
import PlatformConfig from './components/platform-config/index.vue'
import DashboardView from './components/usage-dashboard/index.vue'
import SettingsView from './components/settings/index.vue'

const locale = ref(en)
const currentView = ref('dashboard')

const isPopup = computed(() => {
  return window.location.pathname.includes('popup')
})

const currentViewComponent = computed(() => {
  const views: Record<string, any> = {
    dashboard: DashboardView,
    platforms: PlatformConfig,
    history: HistoryView,
    settings: SettingsView,
  }
  return views[currentView.value] || DashboardView
})

function handleNavigation(view: string) {
  currentView.value = view
}

onMounted(() => {
  if (!window.VibeUsageAPI) {
    console.warn('VibeUsageAPI not available - running in development mode')
  }
})

const HistoryView = {
  template: `
    <div class="history-placeholder">
      <h2>Usage History</h2>
      <p>Historical charts and exports coming soon...</p>
    </div>
  `
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-container {
  height: 100vh;
}

.sidebar {
  background: #1f2937;
  border-right: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  color: white;
  border-bottom: 1px solid #374151;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo span {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  background: transparent;
  border: none;
  padding: 12px 0;
}

.sidebar-menu .el-menu-item {
  color: #9ca3af;
  margin: 4px 8px;
  border-radius: 8px;
  height: 44px;
  line-height: 44px;
}

.sidebar-menu .el-menu-item:hover {
  background: #374151;
  color: white;
}

.sidebar-menu .el-menu-item.is-active {
  background: #6366f1;
  color: white;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 12px;
}

.main-content {
  padding: 0;
  background: #f5f7fa;
  overflow: auto;
}

.dashboard-placeholder,
.history-placeholder,
.settings-placeholder {
  padding: 24px;
}

.dashboard-placeholder h2,
.history-placeholder h2,
.settings-placeholder h2 {
  margin: 0 0 8px;
  color: #303133;
}

.dashboard-placeholder p,
.history-placeholder p,
.settings-placeholder p {
  color: #909399;
}
</style>
