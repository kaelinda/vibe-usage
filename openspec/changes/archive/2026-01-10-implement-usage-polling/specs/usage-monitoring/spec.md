# Usage Monitoring Specification

## Purpose
Define requirements for token usage polling and monitoring system.

## ADDED Requirements

### Requirement: Polling Configuration

The system **SHALL** support configurable polling intervals for usage monitoring.

#### Scenario: Default Polling Intervals
**Given** the application preferences
**When** the user views polling settings
**Then** the system **SHALL** offer preset intervals: 1 minute, 5 minutes, 10 minutes

#### Scenario: Custom Polling Interval
**Given** the polling interval setting
**When** the user enters a custom value in minutes
**Then** the system **SHALL** accept values between 1 and 1440 minutes
**And** the system **SHALL** validate input is a positive integer

#### Scenario: Polling Interval Persistence
**Given** a configured polling interval
**When** the application restarts
**Then** the system **SHALL** restore the previous interval setting

---

### Requirement: Usage Data Collection

The system **SHALL** collect token usage data at configured intervals.

#### Scenario: OpenAI Usage Fetching
**Given** an OpenAI platform with valid API key
**When** the poller runs
**Then** the system **SHALL** call `/v1/billing/usage` endpoint
**And** the system **SHALL** fetch usage for the current billing period
**And** the system **SHALL** store the total usage in USD

#### Scenario: Per-Model Usage Calculation
**Given** total platform usage from billing API
**When** multiple models are configured
**Then** the system **SHALL** calculate per-model usage based on:
- Proportional distribution of total cost
- Manual model quota tracking

#### Scenario: Usage Record Storage
**Given** successful usage data fetch
**When** data is available
**Then** the system **SHALL** create a usage record with:
- timestamp
- tokens_used (estimated or from API)
- cost_estimate
- platform_id
- model_id (if available)

#### Scenario: Polling Error Handling
**Given** a platform polling attempt
**When** the API call fails
**Then** the system **SHALL** log the error
**And** the system **SHALL** retry on next polling cycle
**And** the system **SHALL** not crash the poller

---

### Requirement: Usage Display

The system **SHALL** display token usage on Dashboard.

#### Scenario: Dashboard Total Usage
**Given** the dashboard view
**When** usage data is available
**Then** the system **SHALL** display total tokens used across all platforms

#### Scenario: Platform Usage Card
**Given** a platform with configured models
**When** viewing the platform section
**Then** the system **SHALL** display:
- Total tokens used by the platform
- Cost estimate (if available)
- Progress bar showing usage vs quota

#### Scenario: Model Usage Detail
**Given** a configured model with quota
**When** viewing model details
**Then** the system **SHALL** display:
- Tokens used in current period
- Remaining quota
- Percentage used

#### Scenario: Real-time Usage Update
**Given** a running polling service
**When** new usage data is collected
**Then** the dashboard **SHALL** update within 5 seconds

---

### Requirement: Tray Icon Summary

The system **SHALL** display usage summary in system tray.

#### Scenario: Tray Tooltip Shows Usage
**Given** the application is running
**When** user hovers over tray icon
**Then** the tooltip **SHALL** show total tokens used today

#### Scenario: Tray Badge Shows Alert
**Given** a model approaching quota limit
**When** usage exceeds 80% of quota
**Then** the tray icon **SHALL** show a warning badge

---

## MODIFIED Requirements

### Requirement: User Preferences Extension

The `UserPreferences` interface **SHALL** be extended with polling settings.

#### Scenario: Polling Settings in Preferences
**Given** the UserPreferences type definition
**When** extending for polling
**Then** it **SHALL** include:
```typescript
{
  pollingInterval: number  // in minutes, default 5
  pollingEnabled: boolean  // default true
}
```

---

## ADDED Requirements: Cost Estimation

### Cost Calculation Logic

OpenAI API returns usage in USD cents. Conversion to tokens:

```typescript
// Approximate costs (as of 2024)
// GPT-4: $0.03/1K tokens input, $0.06/1K tokens output
// GPT-3.5-Turbo: $0.0005/1K tokens input, $0.0015/1K tokens output

function estimateTokensFromCost(costUSD: number, modelId: string): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  }
  // Default to average rate if model unknown
  const rate = rates[modelId] || { input: 0.01, output: 0.03 }
  const avgRate = (rate.input + rate.output) / 2
  return Math.round((costUSD * 100) / avgRate)
}
```

**Note**: This is an estimation. For accurate token counts, use OpenAI's Tokenizer API.
