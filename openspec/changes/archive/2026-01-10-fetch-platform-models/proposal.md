# Proposal: Fetch Platform Models with Type Detection

**Change ID:** fetch-platform-models
**Status:** Draft
**Created:** 2026-01-09

## Summary

在用户添加 Platform 之后，在 Dashboard 页面自动获取该平台的 Token 使用信息，列出支持的模型，并根据 API 返回信息和用户配置显示模型类型（通用模型、视觉模型、Thinking 模型）。

## Why

Users need automatic model discovery with type classification when adding platforms, but the current system requires manual model entry without type visibility, making it difficult to understand available models and their capabilities.

## What Changes

## Problem Statement

当前系统仅支持手动添加模型，用户无法直观了解平台支持哪些模型以及各模型的类型。需要在添加平台后自动获取模型列表并展示模型类型。

## Goals

1. 添加平台后自动获取该平台的模型列表和 Token 使用信息
2. 在 Dashboard 的模型卡片中显示模型类型
3. 支持从 API 获取模型信息 + 用户自定义配置两种来源

## Non-Goals

- 不修改现有的手动添加模型流程
- 不实现模型类型的自动学习功能

## Background

现有架构：
- `platforms/*/platform.ts` 已实现 `getModels()` 方法返回模型 ID 列表
- `PlatformInterface` 定义了平台客户端接口
- Dashboard 通过 `usageStore` 计算平台使用情况

## Technical Approach

### 方案一：扩展 PlatformInterface（推荐）

在 `PlatformInterface` 中添加 `getModelsWithTypes()` 方法，返回包含类型信息的模型列表：

```typescript
interface ModelInfo {
  id: string
  name: string
  type: 'general' | 'vision' | 'thinking'
}
```

优点：
- 类型信息与平台客户端紧耦合，API 变更时易于维护
- 保持接口一致性

### 方案二：混合数据源

1. 优先从 API 获取模型信息
2. 如果 API 不支持，fallback 到硬编码列表
3. 支持用户覆盖（用户自定义配置）

最终选择：**方案二**

## Detailed Design

### 数据流程

```
用户添加平台 → API 验证 → 获取模型列表 → 获取模型类型 → 保存到存储 → Dashboard 展示
```

### 类型定义

```typescript
// src/shared/types/index.ts
export type ModelType = 'general' | 'vision' | 'thinking'

export interface ModelInfo {
  id: string
  name: string
  displayName: string
  type: ModelType
}

// PlatformInterface 扩展
interface PlatformInterface {
  // 现有方法...
  getModelsWithTypes(): Promise<ModelInfo[]>
}
```

### UI 展示

在 `UsageCard.vue` 中添加模型类型标签：

```vue
<div class="model-types">
  <el-tag :type="getTypeTagColor(model.type)" size="small">
    {{ getTypeLabel(model.type) }}
  </el-tag>
</div>
```

### 存储层

- 模型类型信息保存在 `ModelConfig` 中或单独的 `ModelInfo` 表
- 支持用户通过 UI 覆盖模型类型

## Dependencies

- 扩展 `PlatformInterface`（需要修改平台客户端）
- 添加新的 IPC handler：`Channel.Platforms.GetModels`
- 添加新的 types
- 修改 `UsageCard.vue` 组件

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| API 返回格式变化 | 中 | 提供硬编码 fallback |
| 自定义配置冲突 | 低 | 用户覆盖优先级最高 |
| 性能影响 | 低 | 模型列表可缓存 |

## Open Questions

1. 模型类型的 API 端点格式是什么？（需要各平台文档确认）
2. 缓存策略：模型列表缓存多长时间？

## References

- 现有 `PlatformInterface`: `platforms/base/platform-interface.ts`
- 现有 Dashboard: `src/renderer/components/usage-dashboard/`
- 现有 usage store: `src/renderer/stores/usage.ts`
