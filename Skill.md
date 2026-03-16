---
name: feishu-mcp-remote
description: 通过远程 HTTP 调用飞书 MCP 服务，支持云文档创建、查看、更新、搜索等操作。适用于需要集成飞书文档能力的场景。
dependencies: node>=18.0.0
---

# 飞书 MCP 远程调用

通过 HTTP 请求调用飞书官方部署的 MCP 服务，无需本地部署即可使用飞书的云文档、多维表格等能力。

## 使用场景

- 创建、查看、更新飞书云文档
- 搜索企业内的文档和用户
- 获取文档评论并添加评论
- 列出知识空间下的文档
- 获取文件内容（图片、附件等）

## 前置要求

1. **飞书应用凭证**：
   - App ID - 应用标识
   - App Secret - 应用密钥
   - 获取方式：飞书开放平台 → 应用详情 → 凭证与基础信息

2. **API 权限**：在飞书开放平台申请以下权限：
   - `docx:document:create` - 创建新版文档
   - `docx:document:readonly` - 查看新版文档
   - `docx:document:write_only` - 编辑新版文档
   - `search:docs:read` - 搜索云文档
   - `contact:user:search` - 搜索用户
   - `offline_access` - 刷新令牌（必需）
   - 更多权限参考飞书开放平台文档

3. **重定向 URL 配置**：
   - 在飞书开放平台 → 安全设置 → 重定向 URL
   - 添加：`http://localhost:3000/callback`

## 使用方法

### 首次使用：OAuth 授权

第一次使用时需要完成 OAuth 授权流程：

```bash
node feishu-mcp-client.js auth --app-id <你的AppID> --app-secret <你的AppSecret>
```

脚本会：
1. 启动本地回调服务器（端口 3000）
2. 生成授权链接并在终端显示
3. 你在浏览器中打开链接并授权
4. 自动获取并保存 token 到本地

Token 会自动保存到 `~/.feishu-mcp/tokens.json`，后续使用会自动刷新。

### 日常使用

授权完成后，直接调用工具即可：

```bash
# 列出可用工具
node feishu-mcp-client.js list-tools --app-id <AppID> --tools "create-doc,fetch-doc"

# 调用工具
node feishu-mcp-client.js call-tool --app-id <AppID> --tool-name "search-doc" --args '{"query":"项目"}'
```

脚本会自动：
- 从本地加载 token
- 检查 token 是否过期
- 如果过期，自动使用 refresh_token 刷新
- 如果 refresh_token 也过期，提示重新授权

## 支持的工具列表

### 通用工具
- `search-user` - 搜索企业用户
- `get-user` - 获取用户信息
- `fetch-file` - 获取文件内容

### 云文档工具
- `search-doc` - 搜索云文档
- `create-doc` - 创建云文档
- `fetch-doc` - 查看云文档
- `update-doc` - 更新云文档
- `list-docs` - 列出文档列表
- `get-comments` - 获取文档评论
- `add-comments` - 添加文档评论

## 示例

### 示例 1：首次授权
```bash
node feishu-mcp-client.js auth \
  --app-id "cli_xxxxx" \
  --app-secret "xxxxx"
```

### 示例 2：搜索文档
```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "search-doc" \
  --args '{"query":"项目计划"}'
```

### 示例 3：创建文档
```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "create-doc" \
  --args '{"title":"新文档","content":"文档内容"}'
```

### 示例 4：查看文档
```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "fetch-doc" \
  --args '{"docID":"doccnxxxxxx"}'
```

## 错误处理

脚本会自动处理以下错误：
- 认证失败（401）
- 参数错误（400）
- 工具不存在（404）
- 频率限制（429）
- 服务器错误（500）

错误信息会以 JSON 格式输出，包含错误码和详细说明。

## 注意事项

1. Token 需要有效且具备相应权限
2. 工具调用需要在 `--tools` 参数中声明
3. 参数格式必须为有效的 JSON
4. 国际版 Lark 需要使用 `--domain https://mcp.larksuite.com`
5. 请求频率受限，建议合理控制调用频率

## 参考资料

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 MCP 官方文档](https://open.feishu.cn/document/server-docs/mcp/overview)
