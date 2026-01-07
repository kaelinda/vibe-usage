# Research: AI Token Usage Monitor Technical Decisions

**Date**: 2026-01-05  
**Feature**: AI Token Usage Monitor  
**Tech Stack**: Vue 3.0 + Vite + Element UI + Electron Forge

---

## 1. Credential Storage Strategy

### Decision: Use `keytar` for OS-native credential storage

**Rationale**:
- `keytar` is the most widely adopted solution for Electron apps requiring secure credential storage
- Provides native integration with each platform's secure storage:
  - macOS: Keychain
  - Linux: Secret Service API/libsecret
  - Windows: Credential Vault
- Industry-proven (used by Atom editor, VS Code extensions)
- Asynchronous API with Promise support

**Alternatives Considered**:
| Approach | Pros | Cons |
|----------|------|------|
| keytar | Native security, cross-platform, well-maintained | Requires native dependencies |
| electron-store + encryption | Simple, pure JS | Encryption keys stored locally, less secure |
| Custom encrypted file | Full control | Security risks, reinventing the wheel |

**Implementation Pattern**:
```typescript
// Store credential
await keytar.setPassword('VibeUsage', platformId, apiKey);

// Retrieve credential
const apiKey = await keytar.getPassword('VibeUsage', platformId);

// Delete credential
await keytar.deletePassword('VibeUsage', platformId);
```

**Security Best Practices**:
- Never log API keys
- Use platform-specific service name (`VibeUsage-${platformId}`)
- Clear credentials from memory after use
- Validate credentials against API before saving

---

## 2. Polling Strategy for Usage Data

### Decision: Adaptive polling with per-platform intervals and exponential backoff

**Rationale**:
- Different AI platforms have different rate limits (OpenAI: ~3,000 RPM, Anthropic: varies)
- Need to balance data freshness (SC-002: <5s) with API quota preservation
- Adaptive polling allows longer intervals for stable platforms, shorter for volatile ones

**Polling Architecture**:
```typescript
interface PollingConfig {
  intervalMs: number;          // Base polling interval (30s default)
  adaptiveMultiplier: number;  // Adjust based on usage change rate
  maxIntervalMs: number;       // Cap at 5 minutes
  minIntervalMs: number;       // Minimum 5 seconds
}

class UsagePoller {
  private platforms: Map<string, PollingConfig> = new Map();
  
  async startPolling(platformId: string) {
    const config = this.platforms.get(platformId);
    this.scheduleNextFetch(platformId, config.intervalMs);
  }
  
  async onUsageChange(platformId: string, changeRate: number) {
    const config = this.platforms.get(platformId);
    // Adaptive: faster polling when usage is changing rapidly
    const newInterval = Math.max(
      config.minIntervalMs,
      Math.min(config.maxIntervalMs, config.intervalMs / (1 + changeRate))
    );
    config.intervalMs = newInterval;
  }
}
```

**Rate Limiting Strategy**:
- Per-platform rate limit tracking
- Automatic backoff when HTTP 429 received
- Jitter (random 10-20% delay) to prevent thundering herd

**Error Handling**:
- 4xx errors: Credential issues → notify user
- 5xx errors: Retry with exponential backoff (1s, 2s, 4s, 8s, max 60s)
- Network errors: Retry 3 times before marking offline

---

## 3. SQLite Schema for Time-Series Data

### Decision: Use `better-sqlite3` with optimized time-series schema

**Rationale**:
- `better-sqlite3` is the fastest SQLite library for Node.js (11x faster than sqlite3)
- Synchronous API prevents race conditions in desktop app
- Full transaction support and WAL mode for performance
- No build step required (prebuilt binaries available)

**Schema Design**:
```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode = WAL;

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_endpoint TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Models per platform
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  quota_total INTEGER,  -- -1 for unlimited
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Usage records (time-series data)
CREATE TABLE IF NOT EXISTS usage_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  tokens_used INTEGER NOT NULL,
  tokens_remaining INTEGER,
  quota_total INTEGER,
  cost_estimate REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Alert rules
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  threshold_type TEXT NOT NULL,  -- 'percentage' or 'absolute'
  threshold_value REAL NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  last_triggered DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Indexes for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_usage_model_time 
  ON usage_records(model_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_usage_timestamp 
  ON usage_records(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_model 
  ON alert_rules(model_id, is_enabled);
```

**Data Retention Strategy**:
```sql
-- Automatic cleanup of old data (keep 30 days)
DELETE FROM usage_records 
WHERE timestamp < datetime('now', '-30 days');

-- Run cleanup weekly
PRAGMA wal_checkpoint(TRUNCATE);
```

**Query Optimization**:
- Use WAL mode for concurrent reads during polling
- Prepared statements for repeated queries
- Aggregate functions for historical views

---

## 4. System Tray Implementation

### Decision: Native Electron Tray API with cross-platform abstraction

**Rationale**:
- Electron's `Tray` API provides cross-platform support
- Platform-specific behaviors documented and handled
- Native notifications via `electron-notifications` or OS APIs

**Implementation Pattern**:
```typescript
// src/main/tray-manager.ts
import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';

export class TrayManager {
  private tray: Tray | null = null;
  private popupWindow: BrowserWindow | null = null;
  
  constructor() {
    this.createTray();
  }
  
  private createTray() {
    // Load platform-appropriate icon
    const iconPath = this.getIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    
    this.tray = new Tray(icon);
    this.tray.setToolTip('VibeUsage - AI Token Monitor');
    
    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Dashboard', click: () => this.showMainWindow() },
      { label: 'Refresh Now', click: () => this.triggerRefresh() },
      { type: 'separator' },
      { label: 'Quit', click: () => this.quit() }
    ]);
    
    this.tray.setContextMenu(contextMenu);
    
    // Handle click events
    this.tray.on('click', () => this.showPopup());
    this.tray.on('double-click', () => this.showMainWindow());
  }
  
  private getIconPath(): string {
    const iconNames = {
      darwin: 'iconTemplate.png',      // macOS (template image)
      win32: 'icon.ico',               // Windows
      linux: 'icon.png'                // Linux
    };
    return path.join(__dirname, '..', '..', 'resources', 'icons', iconNames[process.platform]);
  }
  
  showPopup() {
    // Create or show popup window with usage summary
    if (!this.popupWindow) {
      this.createPopupWindow();
    }
    this.popupWindow.show();
  }
  
  private createPopupWindow() {
    this.popupWindow = new BrowserWindow({
      width: 350,
      height: 400,
      frame: false,
      show: false,
      skipTaskbar: true,
      resizable: false,
      // Platform-specific: always on top behavior
      alwaysOnTop: process.platform === 'win32',
      // macOS-specific
      parent: process.platform === 'darwin' ? undefined : undefined
    });
    
    this.popupWindow.loadURL(`file://${__dirname}/popup.html`);
    
    // Close on click outside (platform-specific)
    this.popupWindow.on('blur', () => {
      if (process.platform !== 'darwin') {
        this.popupWindow.hide();
      }
    });
  }
}
```

**Platform Considerations**:
| Platform | Tray Location | Icon Format | Special Notes |
|----------|---------------|-------------|---------------|
| macOS | Menu bar (top right) | Template PNG | Dark mode support, transparency |
| Windows | Notification area (taskbar) | ICO | DPI scaling support |
| Linux | Desktop environment dependent | PNG | Depends on DE (GNOME, KDE, etc.) |

**Native Notifications**:
```typescript
// Using electron-notifications or OS APIs
import { Notification } from 'electron';

function showThresholdAlert(platform: string, usage: number, threshold: number) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Usage Threshold Reached',
      body: `${platform} has used ${usage}% of quota (threshold: ${threshold}%)`,
      urgency: 'critical'  // Linux
    });
    notification.show();
  }
}
```

---

## 5. Charting Library for Historical Views

### Decision: Use **ECharts** (Apache ECharts)

**Rationale**:
- Vue 3 compatible (via `vue-echarts` wrapper)
- Excellent performance with large datasets (up to 10 million points)
- 20+ chart types including time-series specific (line, area, bar)
- Canvas and SVG rendering options
- Professional appearance out-of-the-box
- Active Apache project (reliable maintenance)

**Alternatives Comparison**:
| Library | Vue 3 Support | Performance | Bundle Size | Customization |
|---------|---------------|-------------|-------------|---------------|
| ECharts | Excellent (vue-echarts) | Very High (~10M points) | ~420KB gzipped | Extensive |
| Chart.js | Good (vue-chartjs) | Medium (~10K points) | ~200KB gzipped | Good |
| Recharts | Excellent | Medium | ~150KB gzipped | Good |
| ApexCharts | Good | Medium | ~250KB gzipped | Very Good |

**Integration with Vue 3**:
```bash
npm install echarts vue-echarts
```

```typescript
// src/renderer/components/charts/UsageChart.vue
<template>
  <v-chart class="chart" :option="chartOption" autoresize />
</template>

<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { ref, computed } from 'vue';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
]);

const props = defineProps<{
  data: UsageDataPoint[];
  timeRange: 'day' | 'week' | 'month';
}>();

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} tokens'
  },
  xAxis: {
    type: 'time',
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    name: 'Tokens'
  },
  series: [{
    type: 'line',
    smooth: true,
    data: props.data.map(d => [d.timestamp, d.tokens]),
    areaStyle: {
      opacity: 0.3
    }
  }],
  dataZoom: [{
    type: 'slider',
    start: 0,
    end: 100
  }]
}));
```

**Theme Customization for Element Plus**:
```typescript
// Match Element Plus colors
const elementTheme = {
  color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
  // ... more theme variables
};

echarts.registerTheme('element', elementTheme);
```

**Performance Optimization**:
- Use `sampling: 'largest'` for large datasets
- Enable `progressive` rendering for 10K+ points
- Cache chart instances when not changing

---

## 6. Additional Technical Decisions

### State Management: Pinia
- Vue 3's official state management
- Lightweight, type-safe, modular
- Persistent storage via `pinia-plugin-persistedstate`

### IPC Communication: Preload Bridge
```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('VibeUsageAPI', {
  platform: {
    getAll: () => ipcRenderer.invoke('platform:getAll'),
    add: (config: PlatformConfig) => ipcRenderer.invoke('platform:add', config),
    remove: (id: string) => ipcRenderer.invoke('platform:remove', id)
  },
  usage: {
    getCurrent: (platformId: string) => ipcRenderer.invoke('usage:getCurrent', platformId),
    getHistory: (modelId: string, days: number) => ipcRenderer.invoke('usage:getHistory', modelId, days)
  }
});
```

### Build Tool: Electron Forge
- Official Electron tooling
- Handles native module rebuilding
- Cross-platform package signing
- Auto-update support via electron-updater

### CSS Framework: Element Plus
- Vue 3 native UI library
- Desktop-optimized components
- Dark mode support
- Internationalization ready

---

## 7. Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Credentials | keytar | Native OS security |
| Polling | Adaptive + backoff | Balance freshness vs rate limits |
| Database | better-sqlite3 | Fast, simple, no build step |
| Tray | Native Electron API | Cross-platform consistency |
| Charts | ECharts | Performance + features |
| State | Pinia | Vue 3 native, type-safe |
| IPC | Preload bridge | Secure communication |
| Build | Electron Forge | Production-ready |

---

## 8. Next Steps

1. Create data models (data-model.md)
2. Define API contracts for platform integrations
3. Set up Vue 3 + Vite project structure
4. Implement core services (storage, polling, alerts)
5. Build UI components (dashboard, configuration, charts)
6. Integrate system tray
7. Test cross-platform compatibility
