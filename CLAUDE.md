<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeUsage is an Electron + Vue 3 desktop application for monitoring AI API token usage across platforms (OpenAI, Anthropic, etc.). The app features automatic usage polling, model type detection, system tray integration, and alert thresholds.

### Key Features

- **Automatic Polling**: Configurable polling intervals (1/5/10/15/30 minutes or custom) to fetch usage data
- **Model Type Detection**: Automatic classification of models as General/Vision/Thinking with color-coded tags
- **Model Discovery**: Automatically fetch available models from platforms when added
- **Multi-Platform Support**: OpenAI, Anthropic with extensible plugin architecture
- **Secure Storage**: API keys stored in OS keychain (Keychain/Windows Credential Manager)

## Development Commands

```bash
# Development (runs electron-vite dev, copies output to dist/)
npm run dev

# Build for current platform
npm run build

# Preview production build
npm run preview

# Create distributables
npm run make           # All platforms
npm run make:mac       # macOS DMG
npm run make:win       # Windows installer
npm run make:linux     # Linux DEB

# Testing
npm run test           # Run all tests
npm run test:unit      # Unit tests (vitest)
npm run test:e2e       # E2E tests (playwright)
npm run test:coverage  # With coverage report

# Linting
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
npm run typecheck      # TypeScript type checking
```

## Architecture

### Process Model

```
┌─────────────────────────────────────────────────┐
│  Main Process (Electron)                        │
│  src/main/                                      │
│  ├── index.ts           App entry point         │
│  │                      (UsagePoller init)      │
│  ├── window-manager.ts  BrowserWindow lifecycle │
│  ├── tray-manager.ts    System tray integration │
│  ├── ipc/handlers.ts    IPC handler registry    │
│  └── services/                                  │
│      ├── storage-service.ts    SQLite (sql.js)  │
│      ├── credential-manager.ts  keytar secure   │
│      ├── platform-registry.ts   Plugin pattern  │
│      ├── usage-poller.ts        Polling service │
│      └── alert-manager.ts       Alert triggers  │
├─────────────────────────────────────────────────┤
│  Preload Process                                │
│  src/preload/index.ts                           │
│  └── contextBridge.exposeInMainWorld('VibeUsageAPI')
├─────────────────────────────────────────────────┤
│  Renderer Process (Vue 3)                       │
│  src/renderer/                                  │
│  ├── stores/            Pinia state management  │
│  ├── components/        Vue single-file comps   │
│  ├── composables/       Vue composition fns     │
│  └── main.ts            Vue app initialization  │
├─────────────────────────────────────────────────┤
│  Shared                                         │
│  src/shared/                                    │
│  ├── constants/ipc-channels.ts  IPC channel IDs │
│  └── types/index.ts          TypeScript types   │
└─────────────────────────────────────────────────┘
```

### IPC Communication Pattern

1. **Main Process**: Registers handlers in `src/main/ipc/handlers.ts` using `ipcMain.handle()`
2. **Preload**: Exposes typed API via `contextBridge.exposeInMainWorld('VibeUsageAPI', {...})`
3. **Renderer**: Calls `window.VibeUsageAPI.*` methods

Channel names follow the pattern:
```typescript
Channel.{Domain}.{Action}
// Examples:
'platforms:get-all', 'models:add', 'usage:get-history', 'platforms:get-models', 'usage:force-refresh'
```

### State Management (Pinia)

- `usage.ts`: Usage records, calculations, aggregations, force refresh
- `platforms.ts`: Platform configurations, model fetching
- `models.ts`: Model configurations per platform
- `preferences.ts`: User settings (polling interval, UI preferences)

### Platform Plugin System

Platform clients are registered via `PlatformRegistry`:
```typescript
// Register a new platform client
platformRegistry.register('myplatform', MyPlatformClient)
```

Each client implements:
- `getUsage(): Promise<{ tokensUsed, tokensRemaining, quotaTotal, costEstimate }>`
- `getModelsWithTypes(): Promise<ModelInfo[]>` - Returns models with type classification

### Model Type System

Models are classified into three types:
- **`general`**: Standard language models (e.g., GPT-4, Claude 3 Opus)
- **`vision`**: Vision-capable models (e.g., GPT-4o, Claude 3.5 Sonnet)
- **`thinking`**: Enhanced reasoning models (e.g., o1 series)

```typescript
type ModelType = 'general' | 'vision' | 'thinking'

interface ModelInfo {
  id: string
  name: string
  displayName: string
  type: ModelType
}

interface ModelConfig {
  name: string
  displayName: string
  quotaTotal: number
  type?: ModelType  // Optional user override
}
```

### Storage

- **SQLite** via `sql.js` for persistent storage (platforms, models, usage records, alerts)
- **Keychain** via `keytar` for API credentials (OS-specific secure storage)
- **electron-store** for user preferences including polling interval

### Usage Polling

The `UsagePoller` service automatically fetches usage data at configurable intervals:

```typescript
// Initialized in src/main/index.ts
const usagePoller = new UsagePoller(platformRegistry, storageService, credentialManager)
const prefs = storageService.getUserPreferences()
const pollingInterval = prefs.refreshInterval * 1000  // Convert seconds to ms
usagePoller.setInterval(pollingInterval)
usagePoller.startPolling()
```

Features:
- Configurable interval: 1, 5, 10, 15, 30 minutes or custom (1-1440 min)
- Fetches credentials for each platform
- Stores usage records to database
- Graceful error handling (continues on failures)
- Force refresh via IPC

## Key Patterns

### Adding New IPC Channels

1. Add channel constant in `src/shared/constants/ipc-channels.ts`
2. Add handler in `src/main/ipc/handlers.ts`
3. Add method to `VibeUsageAPI` interface in `src/preload/index.ts`
4. Use in renderer via `window.VibeUsageAPI.*`

### Adding New Vue Components

1. Create `.vue` file in `src/renderer/components/{feature}/`
2. Register in parent component or page
3. Use Pinia stores via composable pattern (`const store = useXxxStore()`)

### Adding Platform Support

1. Create client class implementing `PlatformClient` interface
2. Implement `getUsage()` and `getModelsWithTypes()` methods
3. Register in `src/main/services/platform-registry.ts`
4. Add to platform selection UI

### Model Type Display

Components display model types using color-coded tags:
- `src/renderer/components/usage-dashboard/UsageCard.vue` - Shows type tags
- `src/renderer/components/platform-config/ModelForm.vue` - Type selector

```vue
<el-tag :type="modelTypeTagType" size="small">
  {{ modelTypeLabel }}
</el-tag>

<script setup lang="ts">
const modelTypeTagType = computed(() => {
  const typeMap: Record<ModelType, string> = {
    general: 'primary',   // blue
    vision: 'success',    // green
    thinking: 'warning',  // orange
  }
  return typeMap[model.type || 'general'] || 'info'
})
</script>
```

## File Organization

### Platform Clients
- `platforms/base/platform-interface.ts` - Base interface definitions
- `platforms/openai/openai-platform.ts` - OpenAI implementation
- `platforms/anthropic/anthropic-platform.ts` - Anthropic implementation

### Frontend Components
- `src/renderer/components/usage-dashboard/` - Dashboard views
- `src/renderer/components/platform-config/` - Platform/model configuration
- `src/renderer/components/settings/` - Settings page with polling configuration

### Services
- `src/main/services/usage-poller.ts` - Automatic polling service
- `src/main/services/storage-service.ts` - Database operations
- `src/main/services/credential-manager.ts` - Secure credential storage
- `src/main/services/platform-registry.ts` - Platform plugin registry

## Important Notes

- **Polling Settings**: Read from `UserPreferences.refreshInterval` on startup
- **Model Types**: Auto-detected from API, user-overridable via UI
- **Error Handling**: UsagePoller continues polling even if individual platforms fail
- **Security**: API keys never stored in database, always in OS keychain
