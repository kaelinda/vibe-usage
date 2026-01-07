# Data Model: AI Token Usage Monitor

**Date**: 2026-01-05  
**Feature**: AI Token Usage Monitor  
**Based on**: [spec.md](./spec.md), [research.md](./research.md)

---

## Entity Relationship Diagram

```text
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│  platforms  │──────▶│   models    │──────▶│  usage_records  │
│             │       │             │       │                 │
│ id          │       │ id          │       │ id (auto)       │
│ name        │       │ platform_id │       │ model_id        │
│ api_endpoint│       │ name        │       │ timestamp       │
│ created_at  │       │ display_name│       │ tokens_used     │
│ updated_at  │       │ quota_total │       │ tokens_remaining│
└─────────────┘       │ created_at  │       │ quota_total     │
                      └─────────────┘       │ cost_estimate   │
                                            │ created_at      │
                                            └─────────────────┘
                             
┌─────────────┐
│ alert_rules │       ┌─────────────────┐
│             │       │  user_prefs     │
│ id          │       │                 │
│ model_id    │       │ id              │
│ threshold_type│     │ refresh_interval│
│ threshold_value│    │ theme           │
│ is_enabled  │       │ notifications   │
│ last_triggered│     │ tray_config     │
│ created_at  │       └─────────────────┘
└─────────────┘
```

---

## TypeScript Interfaces

### Core Types

```typescript
// src/shared/types/index.ts

/**
 * Platform Configuration Entity
 * Represents an AI service provider (OpenAI, Anthropic, etc.)
 */
export interface PlatformConfig {
  /** Unique identifier for the platform */
  id: string;
  /** Display name (e.g., "OpenAI", "Anthropic") */
  name: string;
  /** API base URL endpoint */
  apiEndpoint: string;
  /** Human-readable description */
  description?: string;
  /** Platform-specific configuration */
  options?: PlatformOptions;
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

/**
 * Platform-specific options for API requests
 */
export interface PlatformOptions {
  /** Authentication type (api_key, bearer, etc.) */
  authType: 'api_key' | 'bearer' | 'oauth2';
  /** Whether to use organization header */
  requiresOrg?: boolean;
  /** Custom headers to include with every request */
  customHeaders?: Record<string, string>;
}

/**
 * Model Entity
 * Represents a specific AI model within a platform
 */
export interface ModelConfig {
  /** Unique identifier for the model */
  id: string;
  /** Parent platform ID */
  platformId: string;
  /** Internal model identifier (e.g., "gpt-4") */
  name: string;
  /** Display name shown in UI (e.g., "GPT-4 Turbo") */
  displayName: string;
  /** Total quota in tokens (-1 for unlimited) */
  quotaTotal: number;
  /** Optional: Quota reset period ("monthly", "daily") */
  quotaPeriod?: 'monthly' | 'daily' | 'rolling';
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

/**
 * Usage Record Entity
 * Represents a point-in-time snapshot of token usage
 */
export interface UsageRecord {
  /** Auto-increment ID for internal reference */
  id: number;
  /** Reference to the model */
  modelId: string;
  /** Timestamp of the record */
  timestamp: string;
  /** Tokens consumed in this period */
  tokensUsed: number;
  /** Tokens remaining in quota */
  tokensRemaining: number;
  /** Total quota allocated */
  quotaTotal: number;
  /** Optional: Cost estimate in USD */
  costEstimate?: number;
  /** Metadata */
  metadata?: UsageMetadata;
}

/**
 * Additional usage metadata
 */
export interface UsageMetadata {
  /** Request ID if available */
  requestId?: string;
  /** Number of API calls made */
  apiCalls?: number;
  /** Average tokens per request */
  avgTokensPerRequest?: number;
  /** Response generation tokens */
  promptTokens?: number;
  /** Prompt tokens component */
  completionTokens?: number;
}

/**
 * Alert Rule Entity
 * Represents a user-configured usage threshold
 */
export interface AlertRule {
  /** Unique identifier */
  id: string;
  /** Reference to the model */
  modelId: string;
  /** Threshold type */
  thresholdType: 'percentage' | 'absolute';
  /** Threshold value (percentage 0-100 or absolute token count) */
  thresholdValue: number;
  /** Whether the rule is active */
  isEnabled: boolean;
  /** Timestamp of last trigger */
  lastTriggered?: string;
  /** Notification method */
  notificationMethod: 'system' | 'tray' | 'both';
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

/**
 * User Preferences Entity
 * Application-wide settings
 */
export interface UserPreferences {
  /** Single row ID (always "default") */
  id: string;
  /** Polling interval in seconds (30-300) */
  refreshInterval: number;
  /** UI theme ("light", "dark", "system") */
  theme: 'light' | 'dark' | 'system';
  /** Enable system notifications */
  notificationsEnabled: boolean;
  /** Show in system tray on startup */
  startWithSystem: boolean;
  /** Default view after launch */
  defaultView: 'dashboard' | 'history' | 'settings';
  /** Data retention period in days */
  dataRetentionDays: number;
  /** Show cost estimates */
  showCosts: boolean;
  /** Currency for cost display */
  currency: string;
  /** Tray configuration */
  trayConfig: TrayConfig;
  /** Timestamps */
  updatedAt: string;
}

/**
 * System tray configuration
 */
export interface TrayConfig {
  /** Show usage summary on icon hover */
  showOnHover: boolean;
  /** Number of items to show in summary */
  summaryItems: number;
  /** Show usage percentage badge */
  showBadge: boolean;
  /** Badge color scheme */
  badgeColor: 'percentage' | 'threshold' | 'fixed';
  /** Fixed badge color if applicable */
  fixedBadgeColor?: string;
}

/**
 * Usage Summary (for UI display)
 */
export interface UsageSummary {
  platformId: string;
  platformName: string;
  totalUsed: number;
  totalQuota: number;
  percentageUsed: number;
  models: ModelUsageSummary[];
  lastUpdated: string;
}

/**
 * Per-model usage summary
 */
export interface ModelUsageSummary {
  modelId: string;
  modelName: string;
  displayName: string;
  tokensUsed: number;
  tokensRemaining: number;
  quotaTotal: number;
  percentageUsed: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

/**
 * Historical usage data for charts
 */
export interface HistoricalUsage {
  modelId: string;
  modelName: string;
  dataPoints: UsageDataPoint[];
  aggregations: UsageAggregations;
}

/**
 * Single data point for charting
 */
export interface UsageDataPoint {
  timestamp: string;
  tokens: number;
  cost?: number;
}

/**
 * Aggregated statistics
 */
export interface UsageAggregations {
  totalTokens: number;
  averageDaily: number;
  peakDaily: number;
  totalCost: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}
```

---

## Database Schema (SQLite)

### Core Tables

```sql
-- src/main/services/schema.sql

-- Enable WAL mode for concurrent reads
PRAGMA journal_mode = WAL;

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  description TEXT,
  auth_type TEXT NOT NULL DEFAULT 'api_key',
  requires_org INTEGER DEFAULT 0,
  custom_headers TEXT,  -- JSON object
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_platforms PRIMARY KEY (id)
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  quota_total INTEGER DEFAULT -1,
  quota_period TEXT DEFAULT 'monthly',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_models PRIMARY KEY (id),
  CONSTRAINT fk_models_platform 
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Usage records table (time-series)
CREATE TABLE IF NOT EXISTS usage_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  tokens_used INTEGER NOT NULL,
  tokens_remaining INTEGER,
  quota_total INTEGER,
  cost_estimate REAL,
  api_calls INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  metadata TEXT,  -- JSON object
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usage_model 
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Alert rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  threshold_type TEXT NOT NULL CHECK(threshold_type IN ('percentage', 'absolute')),
  threshold_value REAL NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  notification_method TEXT DEFAULT 'both',
  last_triggered TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_alert_rules PRIMARY KEY (id),
  CONSTRAINT fk_alerts_model 
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- User preferences table (single row)
CREATE TABLE IF NOT EXISTS user_prefs (
  id TEXT PRIMARY KEY DEFAULT 'default',
  refresh_interval INTEGER DEFAULT 60,
  theme TEXT DEFAULT 'system',
  notifications_enabled INTEGER DEFAULT 1,
  start_with_system INTEGER DEFAULT 0,
  default_view TEXT DEFAULT 'dashboard',
  data_retention_days INTEGER DEFAULT 30,
  show_costs INTEGER DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  tray_config TEXT,  -- JSON object
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_user_prefs PRIMARY KEY (id)
);

-- Insert default preferences if not exists
INSERT OR IGNORE INTO user_prefs (id) VALUES ('default');
```

### Indexes for Performance

```sql
-- Optimize time-series queries
CREATE INDEX IF NOT EXISTS idx_usage_model_time 
  ON usage_records(model_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_usage_timestamp 
  ON usage_records(timestamp DESC);

-- Optimize alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_enabled 
  ON alert_rules(model_id, is_enabled) 
  WHERE is_enabled = 1;

-- Optimize platform lookups
CREATE INDEX IF NOT EXISTS idx_models_platform 
  ON models(platform_id);

-- Delete old usage records (data retention)
CREATE INDEX IF NOT EXISTS idx_usage_old_records 
  ON usage_records(timestamp) 
  WHERE timestamp < datetime('now', '-30 days');
```

### Triggers for Timestamps

```sql
-- Auto-update updated_at on platform changes
CREATE TRIGGER IF NOT EXISTS trigger_platform_updated
  AFTER UPDATE ON platforms
BEGIN
  UPDATE platforms SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Auto-update updated_at on model changes
CREATE TRIGGER IF NOT EXISTS trigger_model_updated
  AFTER UPDATE ON models
BEGIN
  UPDATE models SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Auto-update updated_at on alert changes
CREATE TRIGGER IF NOT EXISTS trigger_alert_updated
  AFTER UPDATE ON alert_rules
BEGIN
  UPDATE alert_rules SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;
```

---

## Validation Rules

### Platform Configuration
```typescript
const PlatformValidation = {
  id: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]{1,64}$/,
    message: 'ID must be 1-64 alphanumeric characters, underscores, or hyphens'
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 128,
    message: 'Name must be between 1 and 128 characters'
  },
  apiEndpoint: {
    required: true,
    pattern: /^https:\/\/[^\s]+$/,
    message: 'API endpoint must be a valid HTTPS URL'
  }
};
```

### Model Configuration
```typescript
const ModelValidation = {
  name: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]{1,64}$/,
    message: 'Model name must be 1-64 alphanumeric characters, underscores, or hyphens'
  },
  displayName: {
    required: true,
    minLength: 1,
    maxLength: 128,
    message: 'Display name must be between 1 and 128 characters'
  },
  quotaTotal: {
    required: false,
    min: -1,
    message: 'Quota must be -1 (unlimited) or a positive number'
  }
};
```

### Alert Rules
```typescript
const AlertValidation = {
  thresholdType: {
    required: true,
    enum: ['percentage', 'absolute'],
    message: 'Threshold type must be "percentage" or "absolute"'
  },
  thresholdValue: {
    required: true,
    validate: (value, type) => {
      if (type === 'percentage') {
        return value > 0 && value <= 100;
      }
      return value > 0;
    },
    message: 'Percentage threshold must be 1-100, absolute must be positive'
  }
};
```

---

## Sample Data (Development)

```typescript
// For testing UI components
const samplePlatforms: PlatformConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1',
    description: 'GPT-4, GPT-3.5 Turbo, and other OpenAI models',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1',
    description: 'Claude 3 models',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

const sampleModels: ModelConfig[] = [
  {
    id: 'gpt-4',
    platformId: 'openai',
    name: 'gpt-4',
    displayName: 'GPT-4 Turbo',
    quotaTotal: 1000000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'gpt-3.5-turbo',
    platformId: 'openai',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    quotaTotal: 5000000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'claude-3-opus',
    platformId: 'anthropic',
    name: 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus',
    quotaTotal: 200000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

const sampleUsageRecords: UsageRecord[] = [
  {
    id: 1,
    modelId: 'gpt-4',
    timestamp: '2026-01-05T10:00:00Z',
    tokensUsed: 125000,
    tokensRemaining: 875000,
    quotaTotal: 1000000,
    costEstimate: 3.75
  },
  // ... more records for charts
];
```

---

## API Contracts

### Internal IPC API

The renderer process communicates with the main process via these IPC channels:

```typescript
// src/shared/constants/ipc-channels.ts

export const IpcChannels = {
  // Platform management
  PLATFORM_GET_ALL: 'platform:getAll',
  PLATFORM_GET_BY_ID: 'platform:getById',
  PLATFORM_ADD: 'platform:add',
  PLATFORM_UPDATE: 'platform:update',
  PLATFORM_REMOVE: 'platform:remove',
  PLATFORM_VALIDATE: 'platform:validate',
  
  // Model management
  MODEL_GET_ALL: 'model:getAll',
  MODEL_GET_BY_PLATFORM: 'model:getByPlatform',
  MODEL_ADD: 'model:add',
  MODEL_UPDATE: 'model:update',
  MODEL_REMOVE: 'model:remove',
  
  // Usage data
  USAGE_GET_CURRENT: 'usage:getCurrent',
  USAGE_GET_HISTORY: 'usage:getHistory',
  USAGE_GET_SUMMARY: 'usage:getSummary',
  USAGE_REFRESH: 'usage:refresh',
  
  // Alert rules
  ALERT_GET_ALL: 'alert:getAll',
  ALERT_GET_BY_MODEL: 'alert:getByModel',
  ALERT_ADD: 'alert:add',
  ALERT_UPDATE: 'alert:update',
  ALERT_REMOVE: 'alert:remove',
  
  // Preferences
  PREFS_GET: 'prefs:get',
  PREFS_UPDATE: 'prefs:update',
  
  // Window control
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',
  WINDOW_CLOSE: 'window:close'
};
```

### Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

---

## State Management (Pinia Stores)

### Platform Store

```typescript
// src/renderer/stores/platforms.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PlatformConfig } from '@shared/types';

export const usePlatformStore = defineStore('platforms', () => {
  const platforms = ref<PlatformConfig[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const platformCount = computed(() => platforms.value.length);
  const platformMap = computed(() => 
    new Map(platforms.value.map(p => [p.id, p]))
  );
  
  async function fetchPlatforms() {
    loading.value = true;
    try {
      const response = await window.VibeUsageAPI.platform.getAll();
      if (response.success) {
        platforms.value = response.data;
      }
    } catch (e) {
      error.value = 'Failed to fetch platforms';
    } finally {
      loading.value = false;
    }
  }
  
  async function addPlatform(config: Omit<PlatformConfig, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    try {
      const response = await window.VibeUsageAPI.platform.add(config);
      if (response.success) {
        platforms.value.push(response.data);
        return true;
      }
      error.value = response.error?.message;
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    platforms,
    loading,
    error,
    platformCount,
    platformMap,
    fetchPlatforms,
    addPlatform
  };
});
```

---

## Next Steps

1. Create quickstart.md with development setup guide
2. Generate platform-specific client implementations
3. Set up unit tests for data layer
4. Create database migration utilities
