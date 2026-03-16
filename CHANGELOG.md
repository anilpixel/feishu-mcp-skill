# 更新日志

## [1.0.0] - 2026-03-16

### 新增
- ✨ 初始版本发布
- ✨ 完整的 OAuth 2.0 授权流程
- ✨ 自动 Token 管理和刷新机制
- ✨ 本地 Token 缓存（~/.feishu-mcp/tokens.json）
- ✨ 支持飞书 MCP 远程调用的所有云文档工具
- ✨ 支持国内版飞书和国际版 Lark
- ✨ 完整的错误处理和友好的输出
- ✨ 内置 Node.js 客户端脚本
- ✨ 快速测试脚本
- ✨ 详细的文档和示例

### OAuth 功能
- 本地 HTTP 服务器接收授权回调
- 自动生成授权链接
- 授权码换取 access_token 和 refresh_token
- Token 过期自动刷新（提前 5 分钟）
- 多应用 Token 管理（按 App ID 隔离）
- Refresh token 过期提示重新授权

### 支持的工具
- search-user - 搜索企业用户
- get-user - 获取用户信息
- fetch-file - 获取文件内容
- search-doc - 搜索云文档
- create-doc - 创建云文档
- fetch-doc - 查看云文档
- update-doc - 更新云文档
- list-docs - 列出文档列表
- get-comments - 获取文档评论
- add-comments - 添加文档评论

### 技术特性
- 使用 Node.js 内置模块，无需额外依赖
- 完整的 JSON-RPC 2.0 协议实现
- 支持自定义工具白名单
- 详细的错误码处理
- 支持分页和批量操作
- Token 安全存储和管理

### 文档
- README.md - 完整使用说明
- QUICKSTART.md - 快速开始指南（含 OAuth 流程）
- EXAMPLES.md - 使用示例（含 Token 管理）
- TOOLS.md - 工具配置说明
- Skill.md - Claude Code skill 定义

### 命令
- `auth` - OAuth 授权
- `init` - 初始化连接
- `list-tools` - 列出可用工具
- `call-tool` - 调用工具

## 未来计划

### [1.1.0] - 计划中
- [ ] 支持多维表格工具
- [ ] 支持日历工具
- [ ] 支持自定义回调端口
- [ ] 添加 Token 状态查看命令
- [ ] 支持批量操作优化
- [ ] 添加请求缓存

### [1.2.0] - 计划中
- [ ] 添加 Python 客户端
- [ ] 添加 Web UI 界面
- [ ] 支持 Webhook 回调
- [ ] 添加更多示例和模板
- [ ] 支持企业级 Token 管理

### [2.0.0] - 远期计划
- [ ] 支持更多飞书 MCP 场景
- [ ] 插件化架构
- [ ] 图形化配置工具
- [ ] 多租户支持

## 反馈

如有问题或建议，欢迎反馈：
- 飞书开放平台反馈：https://bytedance.larkoffice.com/share/base/form/shrcnGy0YNaviYYLjAX8zMqIW3f
- GitHub Issues（如果开源）

## 升级说明

### 从旧版本升级

如果你之前使用的是基于 UAT/TAT 的版本，需要：

1. 删除旧的配置
2. 运行新的授权流程：
   ```bash
   node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
   ```
3. 更新调用方式（不再需要 --token 参数）

### 配置迁移

旧版本：
```bash
node feishu-mcp-client.js call-tool --token "u-gxxxxx" --tool-name "search-doc"
```

新版本：
```bash
node feishu-mcp-client.js call-tool --app-id "cli_xxxxx" --tool-name "search-doc"
```
