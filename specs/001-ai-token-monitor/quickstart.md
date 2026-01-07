# Quickstart: AI Token Usage Monitor

**Date**: 2026-01-05  
**Feature**: AI Token Usage Monitor  
**Tech Stack**: Vue 3.0 + Vite + Element UI + Electron Forge

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v18.0.0+ | v20 LTS |
| npm/yarn | Latest | Latest |
| OS | Windows 10, macOS 11, Ubuntu 20.04+ | Same |
| RAM | 4GB | 8GB+ |
| Disk | 500MB | 1GB+ |

### Platform-Specific Dependencies

**macOS**:
- Xcode Command Line Tools: `xcode-select --install`

**Windows**:
- Visual Studio Build Tools 2022
- Python 3.x (for node-gyp)

**Linux**:
- libsecret: `sudo apt-get install libsecret-1-dev` (Debian/Ubuntu)
- Build tools: `sudo apt-get install build-essential`

---

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/vibe-usage.git
cd vibe-usage

# Install Node.js dependencies
npm install

# Install native dependencies (keytar, better-sqlite3)
npm run postinstall
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**`.env.example`**:
```env
# App Configuration
VITE_APP_NAME=VibeUsage
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug

# API Configuration (for development only)
OPENAI_API_KEY=sk-test-key
ANTHROPIC_API_KEY=sk-ant-test-key
```

### 3. Database Setup

```bash
# Initialize SQLite database
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

---

## Development

### Running in Development Mode

```bash
# Start Vue dev server with Electron
npm run dev

# Or with hot reload for renderer only
npm run dev:renderer

# Or main process only with hot reload
npm run dev:main
```

### Accessing the Application

1. The application will open in an Electron window
2. Developer Tools are enabled by default (press F12 to toggle)
3. Changes to renderer code hot-reload automatically
4. Changes to main code restart the application

### Debugging

**Main Process**:
```bash
# Run with Chrome DevTools for Node
npm run debug:main
```

**Renderer Process**:
- Press F12 in the application window
- Use Chrome DevTools as usual

---

## Project Structure

```
vibe-usage/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts         # Entry point
│   │   ├── window-manager.ts
│   │   ├── tray-manager.ts
│   │   ├── ipc/
│   │   │   ├── handlers.ts
│   │   │   └── channels.ts
│   │   └── services/
│   │       ├── database.ts
│   │       ├── poller.ts
│   │       ├── alerts.ts
│   │       └── credentials.ts
│   │
│   ├── renderer/            # Vue 3 application
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── platform-config/
│   │   │   ├── model-list/
│   │   │   ├── alerts-setup/
│   │   │   └── history-view/
│   │   ├── composables/
│   │   ├── stores/
│   │   └── styles/
│   │
│   ├── preload/             # IPC bridge
│   │   └── index.ts
│   │
│   └── shared/              # Shared types
│       ├── types/
│       └── constants/
│
├── platforms/               # AI platform integrations
│   ├── base/
│   ├── openai/
│   ├── anthropic/
│   └── [future platforms]/
│
├── resources/
│   ├── icons/
│   │   ├── icon.png
│   │   ├── icon.ico
│   │   └── iconTemplate.png
│   └── config/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── specs/                   # Specification documents
│   └── 001-ai-token-monitor/
│
├── forge.config.ts          # Electron Forge config
├── vite.config.ts           # Vite config
├── electron.vite.config.ts  # Electron Vite config
└── package.json
```

---

## Key Commands

### Development

```bash
npm run dev              # Start dev mode
npm run dev:renderer     # Renderer hot reload only
npm run dev:main         # Main process hot reload
npm run build:dev        # Development build
```

### Testing

```bash
npm run test             # Run all tests
npm run test:unit        # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
npm run test:coverage    # Coverage report
npm run test:unit:watch  # Watch mode
```

### Building

```bash
# Build for current platform
npm run make

# Build for all platforms
npm run make:all         # macOS, Windows, Linux

# Build specific platform
npm run make:mac         # macOS (.dmg, .zip)
npm run make:win         # Windows (.exe, .zip)
npm run make:linux       # Linux (.deb, .AppImage)

# Build installer
npm run make:installer   # Platform-specific installer
```

### Code Quality

```bash
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier
npm run typecheck        # TypeScript type checking
```

### Database

```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed sample data
npm run db:reset         # Reset database
npm run db:studio        # Open database UI (DBeaver/SQLiteStudio)
```

---

## Adding a New Platform

### 1. Create Platform Directory

```bash
mkdir -p platforms/newplatform
```

### 2. Implement Platform Interface

```typescript
// platforms/newplatform/newplatform-platform.ts
import { BasePlatform, PlatformClient, UsageResponse } from '../base/platform-interface';

export class NewPlatform extends BasePlatform {
  readonly id = 'newplatform';
  readonly name = 'New Platform';
  
  createClient(apiKey: string): PlatformClient {
    return new NewPlatformClient(apiKey);
  }
}

class NewPlatformClient implements PlatformClient {
  constructor(private apiKey: string) {}
  
  async getUsage(): Promise<UsageResponse> {
    // Implement API call
    const response = await fetch(`${this.apiEndpoint}/usage`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    return this.parseResponse(response);
  }
}
```

### 3. Register Platform

```typescript
// src/main/services/platform-registry.ts
import { NewPlatform } from '../../platforms/newplatform/newplatform-platform';

export const platformRegistry = new Map([
  ['openai', new OpenAIPlatform()],
  ['anthropic', new AnthropicPlatform()],
  ['newplatform', new NewPlatform()],
]);
```

### 4. Create API Contract

```yaml
# contracts/newplatform.yaml
newplatform:
  name: New Platform
  description: Description of the platform
  api_endpoint: https://api.newplatform.com/v1
  # ... see existing contracts for full format
```

### 5. Add Tests

```typescript
// tests/unit/platforms/newplatform.spec.ts
describe('NewPlatform', () => {
  // Unit tests
});
```

---

## Configuration

### Application Config

```typescript
// src/shared/types/config.ts
interface AppConfig {
  // Window settings
  window: {
    width: number;
    height: number;
    resizable: boolean;
  };
  
  // Polling settings
  polling: {
    defaultInterval: number;  // seconds
    minInterval: number;
    maxInterval: number;
  };
  
  // Retention settings
  retention: {
    usageDays: number;
    alertHistoryDays: number;
  };
}
```

### Per-Platform Config

```typescript
// platforms/openai/openai-config.ts
interface OpenAIConfig {
  // Organization ID (optional)
  organizationId?: string;
  
  // Custom API endpoint (for enterprise)
  customEndpoint?: string;
  
  // Models to monitor
  models: string[];
}
```

---

## Testing the Application

### 1. Unit Tests

```typescript
// tests/unit/services/usage-poller.spec.ts
describe('UsagePoller', () => {
  it('should poll at configured interval', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/platform-integration.spec.ts
describe('Platform Integration', () => {
  it('should fetch usage from OpenAI', async () => {
    // Test with real API (requires test key)
  });
});
```

### 3. E2E Tests

```typescript
// tests/e2e/dashboard.spec.ts
describe('Dashboard', () => {
  it('should display usage on load', async () => {
    const page = await electronApp.firstWindow();
    await page.locator('.dashboard').shouldBeVisible();
  });
});
```

### Running Specific Tests

```bash
# Run tests matching pattern
npm run test -- --grep "polling"

# Run with coverage
npm run test:coverage

# Debug single test
npm run test:unit -- --reporter=verbose
```

---

## Troubleshooting

### Common Issues

**Error: `keytar` failed to install**
```bash
# Linux
sudo apt-get install libsecret-1-dev

# macOS
xcode-select --install

# Windows
npm install --global --production windows-build-tools
```

**Error: `better-sqlite3` compilation failed**
```bash
# Try prebuilt binary
npm rebuild better-sqlite3 --build-from-source

# Or install dependencies
npm install -g node-gyp
```

**Error: Electron build failed**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native modules
npm run postinstall
```

**Application won't start**
```bash
# Check for port conflicts
lsof -i :3000

# Clear development cache
rm -rf node_modules/.vite

# Check logs
npm run dev -- --log-level debug
```

### Getting Help

1. Check the [Issues](https://github.com/yourusername/vibe-usage/issues)
2. Search existing discussions
3. Create a new issue with:
   - OS and version
   - Node.js version
   - Full error output
   - Steps to reproduce

---

## Next Steps

1. Complete Phase 2: Create tasks.md with implementation tasks
2. Run `/speckit.tasks` to generate task list
3. Implement features in priority order
4. Test cross-platform compatibility
5. Package and distribute

---

## References

- [Electron Documentation](https://electronjs.org/docs)
- [Vue 3 Documentation](https://vuejs.org/guide)
- [Element Plus](https://element-plus.org/)
- [Electron Forge](https://electronforge.io/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
