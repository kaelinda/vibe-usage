# Model Type Detection Specification

## Requirements

### Requirement: Model Type Classification

The system **SHALL** classify models by type (general, vision, thinking) for better usage organization.

#### Scenario: Fetch Models with Types from API
**Given** a configured platform with valid credentials
**When** the platform client fetches available models
**Then** the system **SHALL** return model info including type
**And** each model **SHALL** have one of: `general`, `vision`, or `thinking`

#### Scenario: Display Model Type on Usage Card
**Given** a model displayed on the dashboard
**When** the usage card renders
**Then** the system **SHALL** show a type tag
**And** the tag color **SHALL** indicate type: blue=general, green=vision, orange=thinking

#### Scenario: User Override Model Type
**Given** a model configuration form
**When** the user selects a custom type
**Then** the system **SHALL** persist the custom type
**And** the custom type **SHALL** take precedence over API-detected type

---

### Requirement: Platform Model Discovery

The system **SHALL** automatically fetch available models when a platform is added.

#### Scenario: Fetch OpenAI Models
**Given** an OpenAI platform with valid API key
**When** models are fetched
**Then** the system **SHALL** call OpenAI's models endpoint
**And** return all available GPT models with correct types
**And** GPT-4o variants **SHALL** be marked as `vision`

#### Scenario: Fetch Anthropic Models
**Given** an Anthropic platform with valid API key
**When** models are fetched
**Then** the system **SHALL** return Claude models
**And** Claude models **SHALL** be marked with appropriate types

#### Scenario: Handle API Failure Gracefully
**Given** a platform fetch attempt fails
**When** the API call errors
**Then** the system **SHALL** log the error
**And** allow manual model entry
**And** not block platform addition

---

### Requirement: Type Selector in Model Form

The system **SHALL** provide a type selector in the model configuration form.

#### Scenario: Type Dropdown Options
**Given** the model configuration form
**When** viewing the type selector
**Then** the system **SHALL** show three options:
- General (primary/blue tag)
- Vision (success/green tag)
- Thinking (warning/orange tag)

#### Scenario: Type Persistence
**Given** a model with custom type selected
**When** the form is submitted
**Then** the system **SHALL** save the type to ModelConfig
**And** display the saved type on dashboard

---

## Implementation Notes

### Type Definition

```typescript
// src/shared/types/index.ts
export type ModelType = 'general' | 'vision' | 'thinking'

export interface ModelInfo {
  id: string
  name: string
  displayName: string
  type: ModelType
}

export interface ModelConfig {
  // ... existing fields
  type?: ModelType
}
```

### Platform Interface Extension

```typescript
// platforms/base/platform-interface.ts
interface PlatformInterface {
  getModelsWithTypes(): Promise<ModelInfo[]>
}
```

### IPC Channels

```typescript
Channel.Platforms.GetModels  // Fetch models with types for a platform
```

### UI Components

- `src/renderer/components/usage-dashboard/UsageCard.vue` - Shows type tags
- `src/renderer/components/platform-config/ModelForm.vue` - Type selector
