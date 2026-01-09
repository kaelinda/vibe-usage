# Tasks: Fetch Platform Models with Type Detection

## Phase 1: Type System & Interface (Day 1)

### Task 1.1: Extend Types
- [x] Status: Completed
**Description:** Add ModelType enum and ModelInfo interface to shared types

**Files to modify:**
- `src/shared/types/index.ts`

**Acceptance criteria:**
- [x] `ModelType` enum added: `'general' | 'vision' | 'thinking'`
- [x] `ModelInfo` interface added with `id`, `name`, `displayName`, `type`
- [x] TypeScript compilation passes

### Task 1.2: Extend PlatformInterface
- [x] Status: Completed
**Description:** Add `getModelsWithTypes()` method to PlatformInterface

**Files to modify:**
- `platforms/base/platform-interface.ts`

**Acceptance criteria:**
- [x] `getModelsWithTypes(): Promise<ModelInfo[]>` method declared
- [x] Existing platforms compile without errors

---

## Phase 2: Platform Client Implementation (Day 2)

### Task 2.1: Implement OpenAI Models with Types
- [x] Status: Completed
**Description:** Update OpenAI platform to return models with type information

**Files to modify:**
- `platforms/openai/openai-platform.ts`

**Acceptance criteria:**
- [x] `getModelsWithTypes()` returns models with correct types
- [x] GPT-4o variants properly typed as `vision` where applicable
- [x] Vision-capable models marked as `vision`

### Task 2.2: Implement Anthropic Models with Types
- [x] Status: Completed
**Description:** Update Anthropic platform to return models with type information

**Files to modify:**
- `platforms/anthropic/anthropic-platform.ts`

**Acceptance criteria:**
- [x] `getModelsWithTypes()` returns models with correct types
- [x] Claude models properly typed

### Task 2.3: Implement Generic Platform Fallback
- [x] Status: Completed
**Description:** Add fallback model list for custom/unknown platforms

**Files to modify:**
- `src/main/services/platform-registry.ts`

**Acceptance criteria:**
- [x] `GenericPlatformClient` implements `getModelsWithTypes()`
- [x] Returns empty list with ability for user to manually add models

---

## Phase 3: Backend IPC Handlers (Day 3)

### Task 3.1: Add GetModels IPC Handler
- [x] Status: Completed
**Description:** Add handler for fetching platform models

**Files to modify:**
- `src/main/ipc/handlers.ts`
- `src/shared/constants/ipc-channels.ts`

**Acceptance criteria:**
- [x] New channel `Channel.Platforms.GetModels` added
- [x] Handler calls platform client's `getModelsWithTypes()`
- [x] Credentials retrieved from credential manager

### Task 3.2: Update Preload API
- [x] Status: Completed
**Description:** Expose new IPC method in context bridge

**Files to modify:**
- `src/preload/index.ts`

**Acceptance criteria:**
- [x] `VibeUsageAPI.platforms.getModels(platformId)` method added
- [x] TypeScript types updated

---

## Phase 4: Frontend Store Integration (Day 4)

### Task 4.1: Add getModels to Platforms Store
- [x] Status: Completed
**Description:** Add method to fetch models for a platform

**Files to modify:**
- `src/renderer/stores/platforms.ts`

**Acceptance criteria:**
- [x] `async function getModels(platformId): Promise<ModelInfo[]>`
- [x] Calls `window.VibeUsageAPI.platforms.getModels()`

### Task 4.2: Update Usage Store
- [x] Status: Completed (Model types in ModelConfig - no changes needed)
**Description:** Include model info in usage calculations

**Files to modify:**
- `src/renderer/stores/usage.ts`

**Acceptance criteria:**
- [x] `calculatePlatformUsage()` accepts model info
- [x] Model types available in computed usage data

---

## Phase 5: UI Updates (Day 5)

### Task 5.1: Update UsageCard with Type Display
- [x] Status: Completed
**Description:** Add model type indicator to usage card

**Files to modify:**
- `src/renderer/components/usage-dashboard/UsageCard.vue`

**Acceptance criteria:**
- [x] Model type tag displayed in card header
- [x] Color coding matches spec (general=blue, vision=green, thinking=orange)
- [x] No type shows as "General" (default)

### Task 5.2: Update UsageCard Types
- [x] Status: Completed (Included in Task 1.1)
**Description:** Extend ModelConfig to include type field

**Files to modify:**
- `src/shared/types/index.ts`

**Acceptance criteria:**
- [x] `ModelConfig.type` optional field added
- [x] Existing code still compiles

### Task 5.3: Add Type Selection to Model Form
- [ ] Status: Pending (Future enhancement)
**Description:** Allow users to override model type

**Files to modify:**
- `src/renderer/components/**/ModelForm.vue` (if exists)

**Acceptance criteria:**
- [ ] Type selector in model configuration form
- [ ] Changes persist to storage

---

## Phase 6: Testing & Polish (Day 6)

### Task 6.1: Manual Testing
- [ ] Status: Pending
**Description:** Verify all user flows work correctly

**Test scenarios:**
- [ ] Add OpenAI platform → models fetch automatically
- [ ] Model types display correctly on dashboard
- [ ] User can override model type
- [ ] Anthropic models display correctly
- [ ] Token usage aggregates correctly

### Task 6.2: Error Handling
- [ ] Status: Pending
**Description:** Ensure graceful degradation on API failures

**Test scenarios:**
- [ ] Invalid API key → fallback models shown
- [ ] Network error → retry UI displayed
- [ ] Unknown model → defaults to general type

---

## Dependencies

- Task 1.1 must complete before Task 2.1
- Task 2.1, 2.2 must complete before Task 3.1
- Task 3.2 must complete before Task 4.1
- Task 4.1 must complete before Task 5.1

## Parallelization Opportunities

- Task 2.1 and 2.2 can be done in parallel (separate files)
- Task 5.1 and 5.2 can be done in parallel
- Testing tasks (6.1, 6.2) can run in parallel

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 2 | 2 hours |
| Phase 2 | 3 | 4 hours |
| Phase 3 | 2 | 2 hours |
| Phase 4 | 2 | 2 hours |
| Phase 5 | 3 | 4 hours |
| Phase 6 | 2 | 4 hours |
| **Total** | **14** | **~18 hours (3 days)** |
