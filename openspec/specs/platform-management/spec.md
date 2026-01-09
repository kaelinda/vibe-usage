# platform-management Specification

## Purpose
TBD - created by archiving change add-platform-support. Update Purpose after archive.
## Requirements
### Requirement: Platform Client Registration

The system **SHALL** support registering platform clients for both built-in and custom platforms.

#### Scenario: Register Built-in Platform
**Given** the OpenAI platform client class
**When** it is registered to `platformRegistry`
**Then** the platform shall appear in `getSupportedPlatforms()`
**And** `getClient('openai', apiKey)` shall return a valid `PlatformClient` instance

#### Scenario: Register Custom Platform
**Given** a custom platform configuration with ID "custom-api"
**When** `createClient()` is called with this configuration
**Then** a `PlatformClient` instance shall be created
**And** the client shall be able to fetch usage data

---

### Requirement: Credential Validation

The system **SHALL** validate API credentials when adding a new platform.

#### Scenario: Validate OpenAI API Key
**Given** the PlatformForm with OpenAI API key input
**When** the user submits the form
**Then** the system shall call `validateCredentials()` on the platform client
**And** if validation fails, display an error message
**And** the platform shall not be saved

#### Scenario: Validate Custom Platform Endpoint
**Given** a custom platform with API endpoint "https://api.example.com/v1"
**When** the user submits the form
**Then** the system shall attempt to authenticate with the provided credentials
**And** display success or error based on the result

---

### Requirement: Usage Fetching

The system **SHALL** fetch usage data from configured platforms.

#### Scenario: Fetch Usage from Platform
**Given** a configured platform with valid credentials
**When** `fetchUsage(platformId, modelId)` is called
**Then** the system shall retrieve usage from the appropriate platform client
**And** return a `UsageRecord` with tokens used

#### Scenario: Handle Usage Fetch Failure
**Given** a platform with invalid or expired credentials
**When** `fetchUsage()` is called
**Then** the system shall return an error response
**And** the error shall be propagated to the caller

---

### Requirement: Supported Platforms List

The system **SHALL** provide a list of all supported platforms.

#### Scenario: Get All Supported Platforms
**When** `getSupportedPlatforms()` is called
**Then** it shall return an array of platform info objects
**Each object shall contain:**
- `id`: unique platform identifier
- `name`: human-readable platform name

#### Scenario: Platform ID Validation
**Given** a platform configuration with ID
**When** the ID contains characters other than lowercase letters, numbers, and hyphens
**Then** the form shall show a validation error
**And** the platform shall not be saved

---

