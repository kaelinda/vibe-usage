# Tasks: Implement Token Usage Polling

## Phase 1: Backend - Fix OpenAI API (Day 1)

### Task 1.1: Fix OpenAI Billing API Integration
**Status:** Pending
**Description:** Replace non-existent /usage endpoint with /v1/billing/usage

**Files to modify:**
- `platforms/openai/openai-platform.ts`

**Acceptance criteria:**
- [ ] Uses `https://api.openai.com/v1/billing/usage` endpoint
- [ ] Accepts start_date and end_date parameters
- [ ] Returns cost in USD from response
- [ ] Implements token estimation from cost

### Task 1.2: Fix Anthropic Usage API
**Status:** Pending
**Description:** Update Anthropic platform to use correct usage endpoint

**Files to modify:**
- `platforms/anthropic/anthropic-platform.ts`

**Acceptance criteria:**
- [ ] Uses Anthropic Messages API for usage
- [ ] Returns token counts correctly

---

## Phase 2: Backend - Initialize UsagePoller (Day 2)

### Task 2.1: Pass CredentialManager to UsagePoller
**Status:** Pending
**Description:** Modify UsagePoller to accept credential manager for API key retrieval

**Files to modify:**
- `src/main/services/usage-poller.ts`

**Acceptance criteria:**
- [ ] Constructor accepts CredentialManager
- [ ] `pollAll()` fetches credentials for each platform
- [ ] Handles missing credentials gracefully

### Task 2.2: Initialize UsagePoller in Main Process
**Status:** Pending
**Description:** Create and start UsagePoller in main/index.ts

**Files to modify:**
- `src/main/index.ts`

**Acceptance criteria:**
- [ ] Creates UsagePoller instance with required dependencies
- [ ] Starts polling on app ready
- [ ] Stops polling on app quit

### Task 2.3: Read Polling Settings from Preferences
**Status:** Pending
**Description:** Load polling interval from user preferences

**Files to modify:**
- `src/main/services/usage-poller.ts`
- `src/main/index.ts`

**Acceptance criteria:**
- [ ] Reads `pollingInterval` from preferences on startup
- [ ] Applies interval to poller

---

## Phase 3: Backend - IPC Handlers (Day 3)

### Task 3.1: Add Force Refresh Handler
**Status:** Pending
**Description:** Allow manual trigger of usage refresh

**Files to modify:**
- `src/main/ipc/handlers.ts`

**Acceptance criteria:**
- [ ] New channel `Channel.Usage.ForceRefresh` added
- [ ] Handler calls `usagePoller.forceRefresh()`

### Task 3.2: Add Set Polling Interval Handler
**Status:** Pending
**Description:** Allow dynamic update of polling interval

**Files to modify:**
- `src/main/ipc/handlers.ts`
- `src/shared/constants/ipc-channels.ts`

**Acceptance criteria:**
- [ ] New channel `Channel.Preferences.SetPollingInterval` added
- [ ] Handler updates interval and restarts poller if running

---

## Phase 4: Frontend - Preferences Page (Day 4)

### Task 4.1: Add Polling Settings to Preferences
**Status:** Pending
**Description:** Add polling interval selector to settings page

**Files to create:**
- `src/renderer/components/settings/PollingSettings.vue` (or add to existing)

**Acceptance criteria:**
- [ ] Radio buttons for 1/5/10 minute presets
- [ ] Custom input for minutes
- [ ] Enable/disable toggle

### Task 4.2: Update Preferences Store
**Status:** Pending
**Description:** Add polling preferences to store and IPC calls

**Files to modify:**
- `src/renderer/stores/preferences.ts`

**Acceptance criteria:**
- [ ] `pollingInterval` and `pollingEnabled` in state
- [ ] `updatePollingSettings()` method

---

## Phase 5: Frontend - Dashboard Updates (Day 5)

### Task 5.1: Display Total Usage on Dashboard
**Status:** Pending
**Description:** Show total tokens/cost across all platforms

**Files to modify:**
- `src/renderer/components/usage-dashboard/index.vue`
- `src/renderer/components/usage-dashboard/DashboardSummary.vue`

**Acceptance criteria:**
- [ ] Total tokens displayed
- [ ] Total cost displayed (if available)
- [ ] Auto-refreshes when data changes

### Task 5.2: Display Platform Usage Cards
**Status:** Pending
**Description:** Show per-platform usage with progress bar

**Files to modify:**
- `src/renderer/components/usage-dashboard/PlatformUsageRow.vue`

**Acceptance criteria:**
- [ ] Usage progress bar shows percentage
- [ ] Tokens used display
- [ ] Quota remaining display

### Task 5.3: Add Refresh Button
**Status:** Pending
**Description:** Manual refresh button for immediate update

**Files to modify:**
- `src/renderer/components/usage-dashboard/index.vue`

**Acceptance criteria:**
- [ ] Refresh button calls `window.VibeUsageAPI.usage.forceRefresh()`
- [ ] Shows loading state during refresh
- [ ] Updates display after refresh

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
