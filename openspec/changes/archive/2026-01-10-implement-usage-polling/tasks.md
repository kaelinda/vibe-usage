# Tasks: Implement Token Usage Polling

## Phase 1: Backend - Fix OpenAI API (Day 1)

### Task 1.1: Fix OpenAI Billing API Integration
**Status:** Completed
**Description:** Replace non-existent /usage endpoint with /v1/billing/usage

**Files to modify:**
- `platforms/openai/openai-platform.ts`

**Acceptance criteria:**
- [x] Uses `https://api.openai.com/v1/billing/usage` endpoint
- [x] Accepts start_date and end_date parameters
- [x] Returns cost in USD from response
- [x] Implements token estimation from cost

### Task 1.2: Fix Anthropic Usage API
**Status:** Completed
**Description:** Update Anthropic platform to use correct usage endpoint

**Files to modify:**
- `platforms/anthropic/anthropic-platform.ts`

**Acceptance criteria:**
- [x] Uses Anthropic Messages API for usage
- [x] Returns token counts correctly

---

## Phase 2: Backend - Initialize UsagePoller (Day 2)

### Task 2.1: Pass CredentialManager to UsagePoller
**Status:** Completed
**Description:** Modify UsagePoller to accept credential manager for API key retrieval

**Files to modify:**
- `src/main/services/usage-poller.ts`

**Acceptance criteria:**
- [x] Constructor accepts CredentialManager
- [x] `pollAll()` fetches credentials for each platform
- [x] Handles missing credentials gracefully

### Task 2.2: Initialize UsagePoller in Main Process
**Status:** Completed
**Description:** Create and start UsagePoller in main/index.ts

**Files to modify:**
- `src/main/index.ts`

**Acceptance criteria:**
- [x] Creates UsagePoller instance with required dependencies
- [x] Starts polling on app ready
- [x] Stops polling on app quit

### Task 2.3: Read Polling Settings from Preferences
**Status:** Completed
**Description:** Load polling interval from user preferences

**Files to modify:**
- `src/main/services/usage-poller.ts`
- `src/main/index.ts`

**Acceptance criteria:**
- [x] Reads `pollingInterval` from preferences on startup
- [x] Applies interval to poller

---

## Phase 3: Backend - IPC Handlers (Day 3)

### Task 3.1: Add Force Refresh Handler
**Status:** Completed
**Description:** Allow manual trigger of usage refresh

**Files to modify:**
- `src/main/ipc/handlers.ts`

**Acceptance criteria:**
- [x] New channel `Channel.Usage.ForceRefresh` added
- [x] Handler calls `usagePoller.forceRefresh()`

### Task 3.2: Add Set Polling Interval Handler
**Status:** Completed
**Description:** Allow dynamic update of polling interval

**Files to modify:**
- `src/main/ipc/handlers.ts`
- `src/shared/constants/ipc-channels.ts`

**Acceptance criteria:**
- [x] New channel `Channel.Preferences.SetPollingInterval` added
- [x] Handler updates interval and restarts poller if running

---

## Phase 4: Frontend - Preferences Page (Day 4)

### Task 4.1: Add Polling Settings to Preferences
**Status:** Completed
**Description:** Add polling interval selector to settings page

**Files to create:**
- `src/renderer/components/settings/index.vue` (integrated)

**Acceptance criteria:**
- [x] Radio buttons for 1/5/10 minute presets
- [x] Custom input for minutes
- [x] Enable/disable toggle

### Task 4.2: Update Preferences Store
**Status:** Completed
**Description:** Add polling preferences to store and IPC calls

**Files to modify:**
- `src/renderer/stores/preferences.ts`

**Acceptance criteria:**
- [x] `pollingInterval` and `pollingEnabled` in state
- [x] `updatePollingSettings()` method

---

## Phase 5: Frontend - Dashboard Updates (Day 5)

### Task 5.1: Display Total Usage on Dashboard
**Status:** Completed
**Description:** Show total tokens/cost across all platforms

**Files to modify:**
- `src/renderer/components/usage-dashboard/index.vue`
- `src/renderer/components/usage-dashboard/DashboardSummary.vue`

**Acceptance criteria:**
- [x] Total tokens displayed
- [x] Total cost displayed (if available)
- [x] Auto-refreshes when data changes

### Task 5.2: Display Platform Usage Cards
**Status:** Completed
**Description:** Show per-platform usage with progress bar

**Files to modify:**
- `src/renderer/components/usage-dashboard/PlatformUsageRow.vue`

**Acceptance criteria:**
- [x] Usage progress bar shows percentage
- [x] Tokens used display
- [x] Quota remaining display

### Task 5.3: Add Refresh Button
**Status:** Completed
**Description:** Manual refresh button for immediate update

**Files to modify:**
- `src/renderer/components/usage-dashboard/index.vue`

**Acceptance criteria:**
- [x] Refresh button calls `window.VibeUsageAPI.usage.forceRefresh()`
- [x] Shows loading state during refresh
- [x] Updates display after refresh

---

## Phase 6: Testing & Polish (Day 6)

### Task 6.1: Manual Testing
**Status:** Pending
**Description:** Verify complete polling workflow

**Test scenarios:**
- [ ] OpenAI platform usage displays correctly
- [ ] Polling interval changes take effect
- [ ] Dashboard updates after refresh
- [ ] Tray icon shows summary

### Task 6.2: Error Handling
**Status:** Pending
**Description:** Ensure graceful degradation

**Test scenarios:**
- [ ] Invalid API key → shows error, continues polling
- [ ] Network error → retries on next cycle
- [ ] No platforms configured → no errors

---

## Dependencies

- Task 1.1 must complete before Task 2.2
- Task 2.1 must complete before Task 2.2
- Task 3.2 must complete before Task 4.1
- Task 4.2 must complete before Task 5.1

## Parallelization Opportunities

- Task 1.1 and 1.2 can be done in parallel (separate platforms)
- Task 5.1 and 5.2 can be done in parallel
- Testing tasks (6.1, 6.2) can run in parallel

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 2 | 2 hours |
| Phase 2 | 3 | 3 hours |
| Phase 3 | 2 | 2 hours |
| Phase 4 | 2 | 2 hours |
| Phase 5 | 3 | 4 hours |
| Phase 6 | 2 | 3 hours |
| **Total** | **14** | **~16 hours (2-3 days)** |

## Implementation Summary

All core functionality has been implemented:

1. **OpenAI Billing API** - Uses `/v1/billing/usage` endpoint with proper date range parameters and token estimation
2. **UsagePoller Service** - Initialized with CredentialManager, properly starts/stops with app
3. **IPC Handlers** - Force refresh and polling interval handlers implemented
4. **Settings Page** - Full polling interval configuration with presets and custom input
5. **Dashboard** - Total usage display, platform cards with progress bars, refresh button

**Remaining (Phase 6):**
- Manual testing to verify end-to-end workflow
- Error handling verification
