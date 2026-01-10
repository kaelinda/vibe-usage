# Proposal: Implement Token Usage Polling

**Change ID:** implement-usage-polling
**Status:** Draft
**Created:** 2026-01-09

## Summary

实现 Token 消耗量监听功能，包括：

## Why

Users need real-time visibility into their AI API token usage and costs, but the current implementation fails because OpenAI's `/usage` endpoint doesn't exist and the UsagePoller service is not initialized, leaving users without usage tracking functionality.

- 支持 1/5/10 分钟的轮询频率选项，用户可自定义
- 同时支持总体消耗和按模型统计
- 在 Dashboard 和 System Tray 显示实时使用量

## Problem Statement

当前存在以下问题：
1. `OpenAIPlatform.fetchUsage()` 调用了不存在的 `/usage` 端点
2. `UsagePoller` 服务未被初始化和使用
3. Credential 无法正确传递给 Poller

## Goals

1. 修复 OpenAI 平台的使用量 API 调用
2. 启动 UsagePoller 并正确传递 credentials
3. 实现可配置的轮询频率
4. 在 Dashboard 显示实时使用量
5. 支持总体和按模型统计

## Technical Approach

### OpenAI Billing API

使用 OpenAI Billing API 获取使用量：
```typescript
// GET https://api.openai.com/v1/billing/usage?start_date=xxx&end_date=xxx
```

返回格式：
```json
{
  "daily_costs": [...],
  "total_usage": 0.0123  // 美元单位
}
```

需要将美元转换为 token 估算，或直接显示成本。

### 轮询架构

```
Main Process:
├── UsagePoller (启动时初始化)
│   ├── interval: 可配置 (1/5/10分钟 或自定义)
│   └── polling loop:
│       ├── 获取所有已配置平台
│       ├── 获取每个平台的 credential
│       └── 调用平台 API 获取使用量 → 存储到 SQLite
│
└── IPC Handlers:
    ├── usage:get-latest (获取最新使用量)
    ├── usage:get-history (获取历史记录)
    └── preferences:update (更新轮询频率)
```

## What Changes

### 1. 修复 OpenAI Platform
- 使用 `/v1/billing/usage` 替代不存在的 `/usage`
- 添加成本估算计算

### 2. 启动 UsagePoller
- 在 `main/index.ts` 中初始化
- 传入 credentialManager 以获取 API keys
- 从 preferences 读取轮询频率

### 3. 轮询频率配置
- 添加到 UserPreferences
- 支持 1/5/10 分钟预设和自定义
- IPC handler 动态更新

### 4. 前端显示
- Dashboard 实时更新使用量
- 进度条显示配额使用百分比
- 成本显示（可选）

## Dependencies

- `UsagePoller` 需要 `CredentialManager` 传递 API keys
- `StorageService` 保存使用量记录
- `UserPreferences` 存储轮询配置

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Rate Limits | 中 | 设置合理轮询间隔 |
| 成本估算不准确 | 低 | 显示原始 API 返回值 |
| Credential 获取失败 | 高 | 添加详细错误日志 |

## Open Questions

1. OpenAI Billing API 返回的是美元金额，是否需要转换为 token 估算？
2. 历史数据保留多久？
