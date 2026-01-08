# VibeUsage

AI Token Usage Monitor - 实时监控跨平台的 AI API token 使用情况。

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-39.2.6-blue)
![Vue](https://img.shields.io/badge/Vue-3.4-green)

## 简介

VibeUsage 是一个桌面应用程序，帮助你实时监控和管理 AI API（OpenAI、Anthropic 等）的 token 使用情况。通过系统托盘集成、实时轮询和阈值告警，让你轻松掌控 API 消耗。

## 功能特性

- **多平台支持**：监控 OpenAI、Anthropic 等主流 AI 提供商的 API 使用
- **系统托盘集成**：最小化到托盘，后台持续监控
- **实时轮询**：自动获取最新使用数据
- **阈值告警**：设置使用上限，超限时自动提醒
- **数据可视化**：图表展示使用趋势和统计分析
- **安全存储**：API 密钥使用系统级安全存储（Keychain/Windows Credential Manager）

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
5. 选择要监控的模型

### 设置告警阈值

1. 进入「设置」→「告警」
2. 设置月度 token 限额或预算上限
3. 启用桌面通知
4. 超过阈值时自动收到提醒

### 查看使用数据

- **仪表盘**：查看当前月份的总体使用情况
- **使用历史**：按日/周/月查看历史数据
- **成本估算**：根据各平台定价计算预估费用

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
npm run make:mac       # macOS
npm run make:win       # Windows
npm run make:linux     # Linux

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
│   │   ├── index.ts        # 应用入口
│   │   ├── window-manager.ts  # 窗口管理
│   │   ├── tray-manager.ts    # 托盘管理
│   │   ├── ipc/
│   │   │   └── handlers.ts    # IPC 处理器
│   │   └── services/
│   │       ├── storage-service.ts    # SQLite 存储
│   │       ├── credential-manager.ts  # 密钥管理
│   │       ├── platform-registry.ts   # 平台插件
│   │       ├── usage-poller.ts        # 轮询服务
│   │       └── alert-manager.ts       # 告警管理
│   ├── preload/        # 预加载脚本
│   │   └── index.ts
│   ├── renderer/       # Vue 渲染进程
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── components/     # Vue 组件
│   │   ├── composables/    # 组合式函数
│   │   └── main.ts
│   └── shared/         # 共享代码
│       ├── constants/      # 常量定义
│       └── types/          # TypeScript 类型
├── electron.vite.config.ts
├── package.json
└── README.md
```

### 添加新平台支持

VibeUsage 采用插件化架构，支持扩展新的 AI 平台：

1. 创建平台客户端类，实现 `PlatformClient` 接口
2. 在 `platform-registry.ts` 中注册
3. 添加到前端平台选择 UI

```typescript
// 示例：自定义平台客户端
class MyPlatformClient implements PlatformClient {
  async getUsage(apiKey: string): Promise<UsageData> {
    // 实现获取使用量的逻辑
  }
}
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 前端框架
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
