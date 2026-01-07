---

description: "Task list template for feature implementation"

---

# Tasks: AI Token Usage Monitor

**Input**: Design documents from `/specs/001-ai-token-monitor/`  
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md

**Tests**: Not requested in specification. Tests can be added per user story if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Electron main process**: `src/main/`
- **Vue renderer**: `src/renderer/`
- **Shared types**: `src/shared/`
- **Platform integrations**: `platforms/`
- **Tests**: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Vue 3 + Vite + TypeScript project with Electron boilerplate in src/
- [X] T002 Configure Vite for Electron renderer in vite.config.ts
- [X] T003 Configure Electron Forge in forge.config.ts
- [X] T004 Configure TypeScript in tsconfig.json and tsconfig.node.json
- [X] T005 [P] Set up Element Plus in src/renderer/main.ts (requires npm install)
- [X] T006 [P] Create shared type definitions in src/shared/types/index.ts
- [X] T007 [P] Create IPC channel constants in src/shared/constants/ipc-channels.ts
- [X] T008 Create preload script for secure IPC bridge in src/preload/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create SQLite database schema in src/main/services/schema.sql
- [ ] T010 Implement database service in src/main/services/storage-service.ts using better-sqlite3
- [ ] T011 Implement credential manager in src/main/services/credential-manager.ts using node-keytar
- [ ] T012 Create platform interface in platforms/base/platform-interface.ts
- [ ] T013 Create OpenAI platform client in platforms/openai/openai-platform.ts
- [ ] T014 Create Anthropic platform client in platforms/anthropic/anthropic-platform.ts
- [ ] T015 Create platform registry in src/main/services/platform-registry.ts
- [ ] T016 Create IPC handlers for platform CRUD in src/main/ipc/handlers.ts
- [ ] T017 Create IPC handlers for credential management in src/main/ipc/handlers.ts
- [ ] T018 Create window manager in src/main/window-manager.ts
- [ ] T019 Create main entry point in src/main/index.ts
- [ ] T020 [P] Set up Pinia stores in src/renderer/stores/
- [ ] T021 [P] Create API bridge in src/preload/index.ts exposing window.VibeUsageAPI

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Platform Configuration (Priority: P1) 🎯 MVP

**Goal**: User can add, edit, and remove AI platform configurations with credential validation

**Independent Test**: User can add a platform, enter credentials, and see the platform appear in the configured list without needing any other features working

- [ ] T022 [US1] Create PlatformConfig type in src/shared/types/platform.ts
- [ ] T023 [US1] Create platform form validation in src/shared/utils/validation.ts
- [ ] T024 [US1] Create IPC handlers for platform CRUD in src/main/ipc/platform-handlers.ts
- [ ] T025 [US1] Create platform store in src/renderer/stores/platforms.ts
- [ ] T026 [US1] [P] Create PlatformCard component in src/renderer/components/shared/PlatformCard.vue
- [ ] T027 [US1] [P] Create platform form component in src/renderer/components/platform-config/PlatformForm.vue
- [ ] T028 [US1] Create platform list component in src/renderer/components/platform-config/PlatformList.vue
- [ ] T029 [US1] Create platform configuration view in src/renderer/components/platform-config/index.vue
- [ ] T030 [US1] Create usePlatforms composable in src/renderer/composables/use-platforms.ts
- [ ] T031 [US1] Add navigation route for platform config in src/renderer/App.vue
- [ ] T032 [US1] Test: Add, edit, remove platform workflows function correctly

**Checkpoint**: User Story 1 complete - platform configuration fully functional

---

## Phase 4: User Story 2 - Real-Time Usage Display (Priority: P1) 🎯 MVP

**Goal**: User can view current token usage across all platforms and models in main dashboard

**Independent Test**: User can open the main interface and see updated usage statistics without interacting with other features

- [ ] T033 [US2] Create UsageRecord type in src/shared/types/usage.ts
- [ ] T034 [US2] Create usage aggregation utilities in src/shared/utils/usage-formatters.ts
- [ ] T035 [US2] Create IPC handlers for usage data in src/main/ipc/usage-handlers.ts
- [ ] T036 [US2] Create usage store in src/renderer/stores/usage.ts
- [ ] T037 [US2] [P] Create UsageCard component in src/renderer/components/usage-dashboard/UsageCard.vue
- [ ] T038 [US2] [P] Create PlatformUsageRow component in src/renderer/components/usage-dashboard/PlatformUsageRow.vue
- [ ] T039 [US2] Create dashboard summary component in src/renderer/components/usage-dashboard/DashboardSummary.vue
- [ ] T040 [US2] Create usage dashboard view in src/renderer/components/usage-dashboard/index.vue
- [ ] T041 [US2] Create useUsage composable in src/renderer/composables/use-usage.ts
- [ ] T042 [US2] Add navigation route for dashboard in src/renderer/App.vue
- [ ] T043 [US2] Test: Dashboard displays current usage within 5 seconds of data

**Checkpoint**: User Story 2 complete - real-time usage display functional

---

## Phase 5: User Story 3 - Status Bar Quick View (Priority: P1) 🎯 MVP

**Goal**: User can click system tray icon to see quick usage summary popup

**Independent Test**: User can click status bar icon and see usage summary without main interface open

- [ ] T044 [US3] Create tray manager in src/main/tray-manager.ts
- [ ] T045 [US3] Create system notification utilities in src/main/services/notification-manager.ts
- [ ] T046 [US3] [P] Create tray popup window in src/renderer/components/tray-popup/index.vue
- [ ] T047 [US3] [P] Create tray popup usage summary in src/renderer/components/tray-popup/UsageSummary.vue
- [ ] T048 [US3] Create tray icon assets in resources/icons/ (PNG, ICO, template)
- [ ] T049 [US3] Integrate tray manager with app lifecycle in src/main/index.ts
- [ ] T050 [US3] Create tray IPC handlers in src/main/ipc/tray-handlers.ts
- [ ] T051 [US3] Test: Tray icon displays and popup opens within 2 seconds

**Checkpoint**: User Story 3 complete - status bar quick view functional

---

## Phase 6: User Story 4 - Multi-Model Support (Priority: P2)

**Goal**: User can configure multiple models per platform with per-model tracking

**Independent Test**: User can add multiple models to a platform and see separate usage for each

- [ ] T052 [US4] Create ModelConfig type in src/shared/types/model.ts
- [ ] T053 [US4] Create model validation in src/shared/utils/validation.ts
- [ ] T054 [US4] Create IPC handlers for model CRUD in src/main/ipc/model-handlers.ts
- [ ] T055 [US4] Create model store in src/renderer/stores/models.ts
- [ ] T056 [US4] [P] Create ModelCard component in src/renderer/components/model-list/ModelCard.vue
- [ ] T057 [US4] [P] Create model form component in src/renderer/components/model-list/ModelForm.vue
- [ ] T058 [US4] Create model list view in src/renderer/components/model-list/index.vue
- [ ] T059 [US4] Create useModels composable in src/renderer/composables/use-models.ts
- [ ] T060 [US4] Update dashboard to show per-model breakdown in src/renderer/components/usage-dashboard/UsageCard.vue
- [ ] T061 [US4] Test: Multiple models display with separate usage tracking

**Checkpoint**: User Story 4 complete - multi-model support functional

---

## Phase 7: User Story 5 - Usage Threshold Alerts (Priority: P2)

**Goal**: User can configure usage thresholds and receive notifications

**Independent Test**: User can configure a threshold and receive alert when threshold is crossed

- [ ] T062 [US5] Create AlertRule type in src/shared/types/alerts.ts
- [ ] T063 [US5] Create alert validation in src/shared/utils/validation.ts
- [ ] T064 [US5] Create alert manager in src/main/services/alert-manager.ts
- [ ] T065 [US5] Create IPC handlers for alert CRUD in src/main/ipc/alert-handlers.ts
- [ ] T066 [US5] Create alert store in src/renderer/stores/alerts.ts
- [ ] T067 [US5] [P] Create AlertRuleForm component in src/renderer/components/alerts-setup/AlertRuleForm.vue
- [ ] T068 [US5] [P] Create AlertList component in src/renderer/components/alerts-setup/AlertList.vue
- [ ] T069 [US5] Create alerts setup view in src/renderer/components/alerts-setup/index.vue
- [ ] T070 [US5] Create useAlerts composable in src/renderer/composables/use-alerts.ts
- [ ] T071 [US5] Test: Alerts trigger within 10 seconds of threshold crossing

**Checkpoint**: User Story 5 complete - threshold alerts functional

---

## Phase 8: User Story 6 - Historical Usage Tracking (Priority: P3)

**Goal**: User can view historical data trends and export usage statistics

**Independent Test**: User can view charts and export data without requiring other features

- [ ] T072 [US6] Create HistoricalUsage type in src/shared/types/historical.ts
- [ ] T073 [US6] Create usage polling service in src/main/services/usage-poller.ts
- [ ] T074 [US6] Create IPC handlers for historical data in src/main/ipc/historical-handlers.ts
- [ ] T075 [US6] Create historical store in src/renderer/stores/historical.ts
- [ ] T076 [US6] [P] Install and configure vue-echarts and echarts
- [ ] T077 [US6] [P] Create UsageLineChart component in src/renderer/components/history-view/UsageLineChart.vue
- [ ] T078 [US6] [P] Create UsageBarChart component in src/renderer/components/history-view/UsageBarChart.vue
- [ ] T079 [US6] [P] Create UsageComparison component in src/renderer/components/history-view/UsageComparison.vue
- [ ] T080 [US6] Create date range picker in src/renderer/components/history-view/DateRangePicker.vue
- [ ] T081 [US6] Create data export utility in src/shared/utils/export.ts
- [ ] T082 [US6] Create history view in src/renderer/components/history-view/index.vue
- [ ] T083 [US6] Create useHistorical composable in src/renderer/composables/use-historical.ts
- [ ] T084 [US6] Test: Historical data displays and exports correctly

**Checkpoint**: User Story 6 complete - historical tracking functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T085 [P] Add unit tests for core services in tests/unit/main/services/
- [ ] T086 [P] Add unit tests for Pinia stores in tests/unit/renderer/stores/
- [ ] T087 [P] Add E2E tests for platform configuration flow in tests/e2e/platform-flow.spec.ts
- [ ] T088 [P] Add E2E tests for dashboard display in tests/e2e/dashboard-flow.spec.ts
- [ ] T089 [P] Add E2E tests for tray functionality in tests/e2e/tray-flow.spec.ts
- [ ] T090 Add dark mode support using Element Plus dark theme
- [ ] T091 Add keyboard shortcuts for common actions
- [ ] T092 Add error boundary and graceful error display in src/renderer/App.vue
- [ ] T093 Create database migration utilities for future schema changes
- [ ] T094 Configure CI/CD pipeline for testing and building
- [ ] T095 Add auto-update support with electron-updater

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Platform Configuration)**: No dependencies on other stories - foundational
- **US2 (Usage Display)**: Depends on US1 (platforms must exist to show usage)
- **US3 (Tray Quick View)**: Depends on US1 (needs platforms) - can start after US1
- **US4 (Multi-Model)**: Depends on US1 (platforms needed for models) - can start after US1
- **US5 (Threshold Alerts)**: Depends on US1 and US4 (needs models for alerts) - can start after US1+US4
- **US6 (Historical)**: Depends on US1 and US2 (needs platforms and usage data) - can start after US1+US2

### Story Completion Order (Recommended)

```
MVP (Single Story Deliverable):
1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1 - Platform Config) → Deployable MVP
4. Complete Phase 4 (US2 - Usage Display) → Value add
5. Complete Phase 5 (US3 - Tray Quick View) → Value add

Full Feature Set:
6. Complete Phase 6 (US4 - Multi-Model) → Required for alerts
7. Complete Phase 7 (US5 - Threshold Alerts) → Value add
8. Complete Phase 8 (US6 - Historical) → Value add
9. Complete Phase 9 (Polish) → Final release
```

---

## Parallel Opportunities

### Within Phase 1 (Setup)
- T005, T006, T007 can run in parallel (different files, no dependencies)

### Within Phase 2 (Foundational)
- T020, T021 can run in parallel (different directories)

### Within Phase 3 (US1)
- T026, T027 can run in parallel (different components)

### Within Phase 4 (US2)
- T037, T038 can run in parallel (different components)

### Within Phase 5 (US3)
- T046, T047 can run in parallel (different components)

### Within Phase 6 (US4)
- T056, T057 can run in parallel (different components)

### Within Phase 7 (US5)
- T067, T068 can run in parallel (different components)

### Within Phase 8 (US6)
- T076, T077, T078, T080 can run in parallel (different chart components)

### Within Phase 9 (Polish)
- T085, T086, T087, T088, T089 can run in parallel (different test files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test platform configuration independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Polish phase → Final release
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Platform Config)
   - Developer B: User Story 2 (Usage Display)
   - Developer C: User Story 3 (Tray Quick View)
3. Stories complete and integrate independently

---

## Notes

- **[P] tasks** = different files, no dependencies
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests not requested in specification - add per story if needed
- All tasks follow the strict checklist format for LLM execution
