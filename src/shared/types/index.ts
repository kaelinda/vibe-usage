// Platform configuration types
export interface PlatformConfig {
  id: string
  name: string
  apiEndpoint: string
  description?: string
  options?: {
    authType: 'api_key' | 'bearer' | 'oauth2'
    requiresOrg?: boolean
    customHeaders?: Record<string, string>
  }
  createdAt: string
  updatedAt: string
}

// Model type enum
export type ModelType = 'general' | 'vision' | 'thinking'

// Model information from platform API
export interface ModelInfo {
  id: string
  name: string
  displayName: string
  type: ModelType
}

// Model configuration types
export interface ModelConfig {
  id: string
  platformId: string
  name: string
  displayName: string
  quotaTotal: number
  quotaPeriod?: 'monthly' | 'daily' | 'rolling'
  type?: ModelType  // User can override model type
  createdAt: string
  updatedAt: string
}

// Usage record types
export interface UsageRecord {
  id: number
  modelId: string
  timestamp: string
  tokensUsed: number
  tokensRemaining?: number
  quotaTotal?: number
  costEstimate?: number
  metadata?: {
    apiCalls?: number
    promptTokens?: number
    completionTokens?: number
  }
}

// Alert rule types
export interface AlertRule {
  id: string
  modelId: string
  thresholdType: 'percentage' | 'absolute'
  thresholdValue: number
  isEnabled: boolean
  notificationMethod: 'system' | 'tray' | 'both'
  lastTriggered?: string
  createdAt: string
  updatedAt: string
}

// User preferences types
export interface UserPreferences {
  id: string
  refreshInterval: number
  theme: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  startWithSystem: boolean
  defaultView: 'dashboard' | 'history' | 'settings'
  dataRetentionDays: number
  showCosts: boolean
  currency: string
  trayConfig: {
    showOnHover: boolean
    summaryItems: number
    showBadge: boolean
    badgeColor: 'percentage' | 'threshold' | 'fixed'
    fixedBadgeColor?: string
  }
  updatedAt: string
}

// Dashboard types
export interface ModelUsage {
  model: ModelConfig
  latestRecord?: UsageRecord
  percentage: number
  isNearLimit: boolean
  isOverLimit: boolean
}

export interface PlatformUsage {
  platform: PlatformConfig
  models: ModelUsage[]
  totalTokens: number
  totalCost: number
  overallPercentage: number
}

export interface DashboardSummary {
  totalTokens: number
  totalCost: number
  platformCount: number
  activeModels: number
  nearLimitAlerts: number
  overLimitAlerts: number
}
