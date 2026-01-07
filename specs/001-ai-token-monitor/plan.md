# Implementation Plan: AI Token Usage Monitor

**Branch**: `001-ai-token-monitor` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-token-monitor/spec.md`

**Status**: Phase 1 Complete - Ready for Phase 2

## Summary

Desktop application for real-time monitoring of AI API token usage across multiple platforms. Users can configure platforms (OpenAI, Anthropic, etc.) via API credentials, view usage in a main interface, access quick summaries via system tray icon, set threshold alerts, and track historical trends. Built with Vue 3.0 + Vite + Element UI for the UI, wrapped in Electron for cross-platform desktop capabilities, packaged with Electron Forge.

## Technical Context

**Language/Version**: TypeScript 5.x (Vue 3.0 composition API)  
**Primary Dependencies**: Vue 3.0, Vite 5.x, Element Plus (Vue 3 UI library), Electron 28.x, Electron Forge, electron-store (configuration), node-keytar (credential storage), better-sqlite3 (database)  
**Storage**: SQLite (via better-sqlite3) for historical usage data and local caching  
**Testing**: Vitest (unit testing), Playwright (Electron E2E testing)  
**Target Platform**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)  
**Project Type**: Desktop application (Electron + Vue)  
**Performance Goals**: <200ms UI updates, <5s application startup, <200ms system tray response  
**Constraints**: <200MB memory usage (idle), <300MB (peak), offline-capable with cached data  
**Scale/Scope**: Individual users monitoring 5-10 platforms with 10-50 models, 30 days historical data retention

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **GATES SATISFIED** - All constitutional requirements addressed in design:

| Principle | Implementation |
|-----------|---------------|
| Privacy & Security First | keytar for OS-native credential storage, never log API keys, clear memory after use |
| Cross-Platform Consistency | Native tray API with abstraction layer, platform-specific icon handling |
| Modular Provider Architecture | Platform registry pattern, swappable platform clients, contract-based design |
| Real-Time Responsiveness | Adaptive polling (5s-5min), <200ms UI updates, efficient SQLite queries |
| User Experience Excellence | System tray quick view, Element Plus UI, native notifications |
| Local-First Design | SQLite local database, offline mode with cached data |

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-token-monitor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # ✅ Phase 0 output - Technical decisions complete
├── data-model.md        # ✅ Phase 1 output - Entities, schemas, TypeScript interfaces
├── quickstart.md        # ✅ Phase 1 output - Development setup guide
├── contracts/           # ✅ Phase 1 output - API specifications
│   ├── openai.yaml      # OpenAI API contract
│   └── anthropic.yaml   # Anthropic API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/                      # Electron main process
│   ├── index.ts              # Entry point
│   ├── window-manager.ts      # Window creation and management
│   ├── tray-manager.ts       # System tray icon and menu
│   ├── ipc/                 # Inter-process communication handlers
│   │   ├── handlers.ts
│   │   └── channels.ts
│   └── services/            # Background services
│       ├── platform-registry.ts    # Platform provider registry
│       ├── usage-poller.ts        # Periodic usage fetching
│       ├── alert-manager.ts       # Threshold alert handling
│       ├── storage-service.ts      # SQLite database access
│       └── credential-manager.ts  # OS keychain integration (keytar)
│
├── renderer/                  # Vue renderer process
│   ├── App.vue
│   ├── main.ts
│   ├── components/
│   │   ├── platform-config/      # Platform configuration UI
│   │   ├── usage-dashboard/      # Main usage display
│   │   ├── model-list/           # Model configuration
│   │   ├── alerts-setup/         # Threshold configuration
│   │   ├── history-view/         # Historical data charts
│   │   └── shared/              # Reusable components
│   ├── composables/           # Vue composition API logic
│   │   ├── use-platforms.ts
│   │   ├── use-usage.ts
│   │   ├── use-alerts.ts
│   │   └── use-persistence.ts
│   ├── stores/                # Pinia state management
│   │   ├── platforms.ts
│   │   ├── usage.ts
│   │   └── ui.ts
│   ├── utils/
│   │   └── formatters.ts     # Token/quota formatting
│   └── styles/
│       └── variables.scss     # Element Plus theme customization
│
├── shared/                    # Shared types and utilities
│   ├── types/
│   │   ├── platform.ts
│   │   ├── usage.ts
│   │   ├── alerts.ts
│   │   └── config.ts
│   └── constants/
│       └── platforms.ts      # Supported platform definitions
│
└── preload/                   # Electron preload script
    └── index.ts               # Secure IPC bridge

platforms/                     # AI platform integrations (modular)
├── base/
│   └── platform-interface.ts  # Abstract platform interface
├── openai/
│   ├── openai-platform.ts
│   ├── types.ts
│   └── client.ts
├── anthropic/
│   ├── anthropic-platform.ts
│   ├── types.ts
│   └── client.ts
└── [future-platforms]/

tests/
├── unit/                      # Vitest unit tests
│   ├── main/
│   │   ├── services/
│   │   └── ipc/
│   └── renderer/
│       ├── components/
│       └── composables/
├── integration/               # Integration tests
│   ├── platform-integration.ts
│   └── storage-integration.ts
└── e2e/                      # Playwright Electron tests
    ├── platform-flow.spec.ts
    ├── dashboard-flow.spec.ts
    └── tray-flow.spec.ts

resources/
├── icons/                     # Application icons (Windows, macOS, Linux)
└── config/                    # Default configuration files

forge.config.ts                # Electron Forge configuration
vite.config.ts                # Vite configuration for renderer
tsconfig.json                 # TypeScript configuration
electron.vite.config.ts        # Electron-specific Vite config
package.json
```

**Structure Decision**: Electron + Vue single-application architecture with clear separation between main process (background services, native integration) and renderer process (Vue UI). Modular platform provider pattern enables easy addition of new AI platforms. IPC bridge via preload script ensures secure communication. SQLite for local persistence meets offline and historical data requirements.

## Phase 0: Research Complete

### Research Findings Summary

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Credentials | keytar | Native OS security (Keychain/Credential Vault/libsecret) |
| Polling | Adaptive + exponential backoff | Balance freshness vs rate limits |
| Database | better-sqlite3 | 11x faster than sqlite3, sync API, WAL mode |
| Tray | Native Electron API | Cross-platform consistency, native notifications |
| Charts | Apache ECharts | 10M point rendering, Vue 3 via vue-echarts |
| State | Pinia | Vue 3 native, type-safe, persistent |
| Build | Electron Forge | Production-ready, cross-platform signing |

### Key Technical Decisions (see research.md)

1. **Credential Storage**: Use keytar for OS-native secure storage
2. **Polling Strategy**: Adaptive intervals (5s-5min) with exponential backoff
3. **Database Schema**: Optimized time-series with WAL mode and indexes
4. **Tray Implementation**: Native API with platform abstraction
5. **Charting**: ECharts with vue-echarts wrapper for Vue 3

## Phase 1: Design Complete

### Data Model (see data-model.md)

**Entities**:
- PlatformConfig: AI service provider configuration
- ModelConfig: Per-platform AI model settings
- UsageRecord: Time-series usage snapshots
- AlertRule: Threshold configuration
- UserPreferences: App-wide settings

**Database**: SQLite with optimized indexes for time-series queries, 30-day retention

### API Contracts (see contracts/)

- `openai.yaml`: OpenAI API specification and model pricing
- `anthropic.yaml`: Anthropic API specification and usage tracking

### Quickstart (see quickstart.md)

- Installation and setup guide
- Project structure documentation
- Key commands reference
- Platform integration guide
- Troubleshooting guide

## Phase 2: Ready for Implementation

### Next Steps

1. **Run `/speckit.tasks`** to generate implementation task list
2. Implement features in priority order (P1 → P2 → P3)
3. Set up CI/CD pipeline for testing and building
4. Test cross-platform compatibility
5. Prepare release artifacts

### Implementation Order (from spec)

| Priority | User Story | Key Features |
|----------|------------|--------------|
| P1 | Platform Configuration | Add/manage platforms, credential validation |
| P1 | Real-Time Display | Main dashboard, usage overview |
| P1 | Status Bar Quick View | Tray icon, quick summary popup |
| P2 | Multi-Model Support | Per-model tracking |
| P2 | Threshold Alerts | Notification system |
| P3 | Historical Tracking | Charts, trends, export |

## Complexity Tracking

✅ **No constitutional violations detected**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Generated Artifacts

| Artifact | Status | Path |
|----------|--------|------|
| research.md | ✅ Complete | `/specs/001-ai-token-monitor/research.md` |
| data-model.md | ✅ Complete | `/specs/001-ai-token-monitor/data-model.md` |
| quickstart.md | ✅ Complete | `/specs/001-ai-token-monitor/quickstart.md` |
| contracts/openai.yaml | ✅ Complete | `/specs/001-ai-token-monitor/contracts/openai.yaml` |
| contracts/anthropic.yaml | ✅ Complete | `/specs/001-ai-token-monitor/contracts/anthropic.yaml` |
| tasks.md | ⏳ Pending | `/specs/001-ai-token-monitor/tasks.md` (run `/speckit.tasks`) |
