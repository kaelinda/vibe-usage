# Tasks: Add Platform Support

## Phase 1: Platform Registry Enhancement

- [x] 1.1 读取并理解 `platforms/base/platform-interface.ts` 的 `PlatformInterface` 接口定义
- [x] 1.2 增强 `src/main/services/platform-registry.ts` 添加 `createClient()` 方法
- [x] 1.3 实现自定义平台客户端的动态创建逻辑

## Phase 2: Register Built-in Platforms

- [x] 2.1 将 OpenAI 平台注册到 `platformRegistry`
- [x] 2.2 将 Anthropic 平台注册到 `platformRegistry`
- [x] 2.3 验证平台列表返回正确数据

## Phase 3: API Validation & Usage Fetching

- [x] 3.1 在 `PlatformInterface` 中添加 `validateCredentials()` 方法（已存在）
- [x] 3.2 在 `PlatformForm.vue` 添加表单提交时的验证逻辑
- [x] 3.3 实现 `fetchUsage` IPC handler (`Channel.Platforms.FetchUsage`)
- [x] 3.4 在 `preload/index.ts` 添加 `fetchUsage` API 暴露

## Phase 4: Integration & Testing

- [x] 4.1 运行 `npm run build` 确保类型正确（构建成功）
- [x] 4.2 运行 `npm run test` 确保不破坏现有功能（无测试文件，构建成功）
- [ ] 4.3 手动测试：添加 OpenAI 平台并验证凭证
- [ ] 4.4 手动测试：添加自定义平台并验证使用量获取

## Dependencies & Parallelization

**可并行执行：**
- 1.1 和 2.1, 2.2 可以并行（阅读代码与实现）

**顺序依赖：**
- 1.1 → 1.2 → 1.3（平台接口理解 → 注册表增强 → 动态创建）
- 1.3 → 3.3（动态创建 → 用量获取）
- 3.3 → 4.3, 4.4（handler 实现 → 集成测试）

## Summary

已完成的修改：
1. `src/main/services/platform-registry.ts` - 增强平台注册表，添加 `createClient()` 和 `validateCredentials()` 方法，注册 OpenAI/Anthropic 平台
2. `src/main/ipc/handlers.ts` - 实现 `fetchUsage` IPC handler
3. `electron.vite.config.ts` - 添加 `@platforms` 别名支持
4. `src/renderer/components/platform-config/PlatformForm.vue` - 添加 API key 必填验证和验证状态

注意：4.3 和 4.4 需要手动测试验证。
