# Model Type Detection Specification

## Purpose
Define requirements for fetching platform models with type information and displaying model types in the dashboard.

## ADDED Requirements

### Requirement: Model Type System

The system **SHALL** support three model types: general, vision, and thinking.

#### Scenario: Model Type Classification
**Given** a platform client with model information
**When** `getModelsWithTypes()` is called
**Then** each model **SHALL** include a type property
**And** the type **SHALL** be one of: `general`, `vision`, `thinking`

#### Scenario: Unknown Model Type Defaults to General
**Given** a model without explicit type information
**When** the model type cannot be determined
**Then** the system **SHALL** default the type to `general`

---

### Requirement: Platform Model Fetching

The system **SHALL** fetch model information from the platform API.

#### Scenario: Fetch Models from OpenAI
**Given** an OpenAI platform with valid API key
**When** the system requests model list
**Then** it **SHALL** return models with their types
**Example model types:**
- `gpt-4` → `general`
- `gpt-4o` → `general`
- `gpt-4o` with vision capabilities → `vision`

#### Scenario: Fetch Models from Anthropic
**Given** an Anthropic platform with valid API key
**When** the system requests model list
**Then** it **SHALL** return models with their types

#### Scenario: Fallback to Hardcoded Models
**Given** a platform where API is unavailable
**When** fetching models fails
**Then** the system **SHALL** use hardcoded model list as fallback

---

### Requirement: User Custom Model Type

The system **SHALL** allow users to override model types.

#### Scenario: User Overrides Model Type
**Given** a model with default type `general`
**When** the user changes the type to `thinking`
**Then** the system **SHALL** save the user's preference
**And** subsequent displays **SHALL** use the user-defined type

#### Scenario: User Override Persists After Platform Update
**Given** a user who has overridden model types
**When** the platform updates its model information
**Then** the user-defined types **SHALL** be preserved
**And** only new models **SHALL** use default types

---

### Requirement: Dashboard Model Type Display

The dashboard **SHALL** display model type information.

#### Scenario: Display Model Type in Usage Card
**Given** a usage card showing model information
**When** the model has a type defined
**Then** the card **SHALL** display a type indicator
**And** the indicator color **SHALL** correspond to the type:
- `general` → default color (blue)
- `vision` → success color (green)
- `thinking` → warning color (orange)

#### Scenario: Display Multiple Model Types
**Given** a platform with multiple models of different types
**When** viewing the platform usage
**Then** each model **SHALL** show its respective type
**And** the types **SHALL** be clearly distinguishable

---

### Requirement: Token Usage Aggregation

The system **SHALL** fetch and display token usage for each model.

#### Scenario: Fetch Token Usage for Platform
**Given** a configured platform with models
**When** the user views the dashboard
**Then** the system **SHALL** fetch token usage for each model
**And** display the usage in the model card

#### Scenario: Aggregate Usage by Model Type
**Given** platform usage data with typed models
**When** viewing platform summary
**Then** the system **SHALL** optionally group usage by type
**Example:**
- Total tokens from general models: 100K
- Total tokens from vision models: 50K
- Total tokens from thinking models: 25K

---

## MODIFIED Requirements

### Requirement: Platform Client Interface

The `PlatformInterface` **SHALL** be extended with new method.

#### Scenario: Get Models with Types
**Given** a platform client implementation
**When** `getModelsWithTypes()` is called
**Then** it **SHALL** return an array of `ModelInfo` objects
**Each `ModelInfo` SHALL contain:**
- `id`: unique model identifier
- `name`: model display name
- `type`: model type enum value

---

## ADDED Requirements: Implementation Notes

### Type Color Mapping

| Type | Element Plus Tag Type | Color |
|------|----------------------|-------|
| `general` | default | #409eff (Blue) |
| `vision` | success | #67c23a (Green) |
| `thinking` | warning | #e6a23c (Orange) |

### Fallback Model Lists

For platforms without API support, hardcoded lists with types:

```typescript
const OPENAI_MODELS: ModelInfo[] = [
  { id: 'gpt-4', name: 'GPT-4', displayName: 'GPT-4', type: 'general' },
  { id: 'gpt-4o', name: 'GPT-4o', displayName: 'GPT-4o', type: 'general' },
  { id: 'gpt-4o', name: 'GPT-4o', displayName: 'GPT-4o Vision', type: 'vision' },
]
```
