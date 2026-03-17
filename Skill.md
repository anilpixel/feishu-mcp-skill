---
name: feishu-mcp-remote
description: 通过远程 HTTP 调用飞书 MCP 服务，支持云文档创建、查看、更新、搜索等操作。适用于需要集成飞书文档能力的场景。
dependencies: node>=18.0.0
---

# 飞书 MCP 远程调用

通过 HTTP 请求调用飞书官方部署的 MCP 服务，无需本地部署即可使用飞书的云文档、知识库等能力。

## Agent 使用指南

### 执行授权流程的特殊说明

当用户需要授权时，你需要：

1. **执行授权命令**：
   ```bash
   node feishu-mcp-client.js auth --app-id <AppID> --app-secret <AppSecret>
   ```

2. **提取并展示授权 URL**：
   - 命令输出中会包含 "请在浏览器中打开以下 URL 完成授权：" 这行文字
   - **必须**将紧随其后的 URL 明确展示给用户
   - 告知用户需要在浏览器中打开该 URL 完成授权

3. **等待授权完成**：
   - 脚本会持续运行并等待授权回调
   - 当用户在浏览器中完成授权后，脚本会自动接收回调并保存 token
   - 脚本输出 "授权成功！Token 已保存" 表示授权完成
   - **不要**提前终止脚本，需要等待授权完成的信号

4. **处理授权失败**：
   - 如果长时间没有响应，询问用户是否已在浏览器中完成授权
   - 如果出现错误，检查 App ID、App Secret 和重定向 URL 配置

## 初始化配置

### 1. 准备飞书应用凭证

- 访问 [飞书开放平台](https://open.feishu.cn/) 创建自建应用
- 获取 **App ID** 和 **App Secret**
- 在安全设置中配置重定向 URL：`http://localhost:3000/callback`

### 2. 执行 OAuth 授权

首次使用时运行授权命令：

```bash
node feishu-mcp-client.js auth --app-id <你的AppID> --app-secret <你的AppSecret>
```

授权流程：
1. 自动保存应用凭证到本地
2. 启动本地回调服务器
3. 在浏览器中完成授权
4. 自动获取并保存 token

完成后，配置和 token 会保存到 `~/.feishu-mcp/`，后续使用无需再提供凭证。

## 可用工具

### 查看工具列表

```bash
node feishu-mcp-client.js list-tools --tools "create-doc,fetch-doc,search-doc"
```

这会显示每个工具的详细说明和参数定义。

### 调用工具

```bash
node feishu-mcp-client.js call-tool \
  --tool-name "search-doc" \
  --args '{"query":"项目计划"}'
```

## 注意事项

1. 首次使用需要执行 `auth` 命令进行授权
2. 工具调用需要在 `--tools` 参数中声明允许的工具列表
3. 工具参数必须是有效的 JSON 格式
4. Token 过期会自动刷新，refresh_token 过期需要重新授权

## 参考资料

- [飞书 MCP 官方文档](https://open.feishu.cn/document/mcp_open_tools/developers-call-remote-mcp-server)
