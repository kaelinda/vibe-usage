# VibeUsage

AI Token Usage Monitor - 实时监控跨平台的 AI API token 使用情况。

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-33.2.1-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-green)

## 简介

VibeUsage 是一个桌面应用程序，帮助你实时监控和管理 AI API（OpenAI、Anthropic 等）的 token 使用情况。通过系统托盘集成、自动轮询、模型类型分类和阈值告警，让你轻松掌控 API 消耗。

## 功能特性

### 核心功能
- **多平台支持**：监控 OpenAI、Anthropic 等主流 AI 提供商的 API 使用
- **自动轮询**：可配置轮询间隔（1/5/10/15/30 分钟或自定义），自动获取最新使用数据
- **模型类型分类**：自动识别模型类型（General/Vision/Thinking），并在仪表盘显示
- **模型自动发现**：添加平台后自动获取可用模型列表
- **系统托盘集成**：最小化到托盘，后台持续监控
- **阈值告警**：设置使用上限，超限时自动提醒
- **数据可视化**：图表展示使用趋势和统计分析
- **安全存储**：API 密钥使用系统级安全存储（Keychain/Windows Credential Manager）

### 最新更新

#### Token 使用量轮询
- 支持 1/5/10/15/30 分钟的轮询频率预设
- 支持自定义轮询间隔（1-1440 分钟）
- 在设置页面实时配置轮询参数
- 手动刷新功能，立即获取最新数据

#### 模型类型检测
- **General（通用）**：标准语言模型，如 GPT-4、Claude 3 Opus
- **Vision（视觉）**：支持图像处理的模型，如 GPT-4o、Claude 3.5 Sonnet
- **Thinking（推理）**：强化推理模型，如 o1 系列
- 自动从 API 获取模型列表并分类
- 支持用户手动覆盖模型类型

## 截图

> 截图待添加

## 安装

### macOS

```bash
# 使用 Homebrew（待发布）
brew install vibe-usage

# 或下载 DMG 文件
# 访问 https://github.com/code-yeongyu/VibeUsage/releases
```

### Windows

```bash
# 下载安装程序 (.exe)
# 访问 https://github.com/code-yeongyu/VibeUsage/releases
```

### Linux

```bash
# 下载 DEB 包
sudo dpkg -i vibe-usage_*.deb
# 或
sudo apt install ./vibe-usage_*.deb
```

## 使用说明

### 添加平台配置

1. 打开 VibeUsage 应用
2. 点击「添加平台」
3. 选择 AI 提供商（OpenAI / Anthropic 等）
4. 输入 API Key（安全存储在系统凭证管理器中）
5. 从自动获取的模型列表中选择要监控的模型
6. （可选）手动设置模型类型和月度配额

### 配置轮询设置

1. 进入「设置」→「Usage Polling」
2. 选择轮询间隔：
   - 1 分钟：高频更新，适合开发测试
   - 5 分钟：推荐设置
   - 10/15/30 分钟：降低 API 调用频率
3. 或输入自定义分钟数（1-1440）
4. 点击「应用」保存设置

### 设置告警阈值

1. 进入「设置」→「告警」
2. 设置月度 token 限额或预算上限
3. 启用桌面通知
4. 超过阈值时自动收到提醒

### 查看使用数据

- **仪表盘**：查看所有平台的总体使用情况
  - 总 token 消耗
  - 总成本估算
  - 各平台使用占比
  - 模型类型分类显示
- **使用历史**：按日/周/月查看历史数据
- **进度条**：直观显示配额使用百分比
- **类型标签**：彩色标签标识模型类型

## 开发

### 环境要求

- Node.js 18+
- npm 或 pnpm
- 系统级依赖：
  - macOS：Xcode Command Line Tools
  - Windows：Windows Build Tools
  - Linux：`libnss3`, `libatk-bridge2.0`, `libx11`

### 快速开始

```bash
# 克隆项目
git clone https://github.com/code-yeongyu/VibeUsage.git
cd VibeUsage

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 可用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 创建安装包
npm run make           # 所有平台
npm run make:mac       # macOS DMG
npm run make:win       # Windows 安装程序
npm run make:linux     # Linux DEB

# 测试
npm run test           # 运行所有测试
npm run test:unit      # 单元测试
npm run test:e2e       # E2E 测试
npm run test:coverage  # 测试覆盖率

# 代码检查
npm run lint           # 检查问题
npm run lint:fix       # 自动修复
npm run typecheck      # TypeScript 类型检查
```

### 项目结构

```
vibe-usage/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── index.ts        # 应用入口（初始化 UsagePoller）
│   │   ├── window-manager.ts  # 窗口管理
│   │   ├── tray-manager.ts    # 托盘管理
│   │   ├── ipc/
│   │   │   └── handlers.ts    # IPC 处理器（轮询、模型获取）
│   │   └── services/
│   │       ├── storage-service.ts    # SQLite 存储
│   │       ├── credential-manager.ts  # 密钥管理
│   │       ├── platform-registry.ts   # 平台插件注册
│   │       ├── usage-poller.ts        # 轮询服务
│   │       └── alert-manager.ts       # 告警管理
│   ├── preload/        # 预加载脚本
│   │   └── index.ts        # Context Bridge API 暴露
│   ├── renderer/       # Vue 渲染进程
│   │   ├── stores/         # Pinia 状态管理
│   │   │   ├── usage.ts        # 使用量状态
│   │   │   ├── platforms.ts    # 平台状态
│   │   │   └── preferences.ts  # 偏好设置
│   │   ├── components/     # Vue 组件
│   │   │   ├── usage-dashboard/    # 使用量仪表盘
│   │   │   │   ├── index.vue       # 主仪表盘
│   │   │   │   ├── UsageCard.vue   # 使用量卡片（含类型标签）
│   │   │   │   └── DashboardSummary.vue
│   │   │   ├── platform-config/     # 平台配置
│   │   │   │   └── ModelForm.vue    # 模型表单（含类型选择）
│   │   │   └── settings/            # 设置页面
│   │   │       └── index.vue        # 轮询设置 UI
│   │   ├── composables/    # 组合式函数
│   │   └── main.ts
│   └── shared/         # 共享代码
│       ├── constants/ipc-channels.ts  # IPC 通道定义
│       └── types/index.ts             # TypeScript 类型
│           ├── ModelType              # 模型类型枚举
│           ├── ModelInfo              # 模型信息接口
│           └── ModelConfig            # 模型配置
├── platforms/             # 平台客户端
│   ├── base/
│   │   └── platform-interface.ts     # 平台接口定义
│   ├── openai/
│   │   └── openai-platform.ts        # OpenAI 实现（含模型类型）
│   └── anthropic/
│       └── anthropic-platform.ts     # Anthropic 实现
├── electron.vite.config.ts
├── package.json
└── README.md
```

### 添加新平台支持

VibeUsage 采用插件化架构，支持扩展新的 AI 平台：

1. 创建平台客户端类，实现 `PlatformClient` 接口
2. 实现 `getModelsWithTypes()` 方法返回带类型的模型列表
3. 在 `platform-registry.ts` 中注册
4. 添加到前端平台选择 UI

```typescript
// 示例：自定义平台客户端
import type { ModelInfo } from './types'

class MyPlatformClient implements PlatformClient {
  async getUsage(apiKey: string): Promise<UsageData> {
    // 实现获取使用量的逻辑
  }

  async getModelsWithTypes(): Promise<ModelInfo[]> {
    // 返回带类型信息的模型列表
    return [
      { id: 'model-1', name: 'Model 1', displayName: 'Model 1', type: 'general' },
      { id: 'model-2', name: 'Model 2', displayName: 'Model 2', type: 'vision' },
    ]
  }
}
```

### 架构设计

#### 轮询架构

```
┌─────────────────────────────────────────────────────────────┐
│ Main Process                                                │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐ │
│  │ UsagePoller   │────▶│ PlatformClient│────▶│ API        │ │
│  │              │     │              │     │            │ │
│  │ interval:    │     │ OpenAI       │     │ OpenAI     │ │
│  │ configurable │     │ Anthropic    │     │ Anthropic  │ │
│  └──────────────┘     └──────────────┘     └────────────┘ │
│         │                                              │    │
│         │ credentials                                   │    │
│         ▼                                              │    │
│  ┌──────────────┐                                       │    │
│  │CredentialMgr │                                       │    │
│  └──────────────┘                                       │    │
│         │                                              │    │
│         │ usage records                                │    │
│         ▼                                              │    │
│  ┌──────────────┐                                       │    │
│  │StorageSvc    │                                       │    │
│  └──────────────┘                                       │    │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 前端框架（Composition API）
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **sql.js** - SQLite 嵌入式数据库
- **keytar** - 系统级密钥存储
- **electron-store** - 应用配置存储
- **Element Plus** - UI 组件库
- **ECharts** - 数据可视化

## 贡献

欢迎贡献代码！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目地址：https://github.com/code-yeongyu/VibeUsage
- 问题反馈：https://github.com/code-yeongyu/VibeUsage/issues
- 邮箱：support@vibeusage.app
