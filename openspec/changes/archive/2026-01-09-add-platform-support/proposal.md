# Add Platform Support

**Change ID:** add-platform-support
**Author:** Claude
**Created:** 2026-01-09
**Status:** Draft

## Overview

实现完整的平台添加功能，包括：
1. 硬编码平台（OpenAI、Anthropic）注册到平台注册表
2. 自定义平台的动态客户端支持
3. API 凭证验证
4. 用量获取功能

## Problem Statement

当前平台系统存在以下问题：
- `platformRegistry` 已定义但硬编码平台未注册
- 新添加的自定义平台无法获取使用量
- 缺少 API key 验证逻辑
- `fetchUsage` IPC handler 未实现

## Goals

1. 平台注册表与硬编码平台客户端正确集成
2. 支持动态创建自定义平台的客户端实例
3. 添加 API 凭证验证功能
4. 完成用量获取的完整 IPC 链路

## Out of Scope

- 新增除 OpenAI/Anthropic 外的第三方平台支持
- OAuth 认证流程实现
- 用量历史图表展示

## Technical Approach

### 方案 A：增强 platformRegistry（推荐）

扩展 `platformRegistry` 使其支持：
- 预注册的内置平台客户端
- 运行时注册的自定义平台客户端
- 统一的 `createClient()` 方法

### 方案 B：工厂模式

创建独立的 `PlatformClientFactory` 负责客户端创建。

**选择方案 A**，因为它更符合现有架构，最小化代码变更。

## Dependencies

- 无外部依赖
- 基于现有 `PlatformInterface` 和 `PlatformConfig` 类型

## Risks

- 自定义平台的 API 响应格式可能不统一
- 凭证验证可能需要针对不同平台定制

## Validation

- 运行现有测试确保不破坏功能
- 手动测试添加 OpenAI/Anthropic 平台
- 手动测试添加自定义平台并验证使用量获取
