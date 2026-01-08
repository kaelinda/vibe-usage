# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeUsage is an Electron + Vue 3 desktop application for monitoring AI API token usage across platforms (OpenAI, Anthropic, etc.). The app features a system tray integration, real-time usage polling, and alert thresholds.

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
│  ├── window-manager.ts  BrowserWindow lifecycle │
│  ├── tray-manager.ts    System tray integration │
│  ├── ipc/handlers.ts    IPC handler registry    │
│  └── services/                                  │
│      ├── storage-service.ts    SQLite (sql.js)  │
│      ├── credential-manager.ts  keytar secure   │
│      ├── platform-registry.ts   Plugin pattern  │
│      ├── usage-poller.ts        Polling logic   │
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
'platforms:get-all', 'models:add', 'usage:get-history'
```

### State Management (Pinia)

- `usage.ts`: Usage records, calculations, aggregations
- `platforms.ts`: Platform configurations
- `models.ts`: Model configurations per platform
- `preferences.ts`: User settings and UI preferences

### Platform Plugin System

Platform clients are registered via `PlatformRegistry`:
```typescript
// Register a new platform client
platformRegistry.register('myplatform', MyPlatformClient)
```

Each client implements `getUsage(): Promise<{ tokensUsed, tokensRemaining, quotaTotal, costEstimate }>`

### Storage

- **SQLite** via `sql.js` for persistent storage (platforms, models, usage records, alerts)
- **Keychain** via `keytar` for API credentials (OS-specific secure storage)
- **electron-store** for user preferences

## Key Patterns

### Adding New IPC Channels

1. Add channel constant in `src/shared/constants/ipc-channels.ts`
2. Add handler in `src/main/ipc/handlers.ts`
3. Add method to `VibeUsageAPI` interface in `src/preload/index.ts`
4. Use in renderer via `window.VibeUsageAPI.*`

### Adding New Vue Components

1. Create `.vue` file in `src/renderer/components/{feature}/`
2. Register in parent component or page
3. Use Pinia stores via composable pattern

### Adding Platform Support

1. Create client class implementing `PlatformClient` interface
2. Register in `src/main/services/platform-registry.ts`
3. Add to platform selection UI
