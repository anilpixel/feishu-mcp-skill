# 飞书 MCP 远程调用 Skill

> 🚀 通过 Claude Code 直接操作飞书云文档、搜索用户、管理知识库

这是一个 Claude Code skill，用于通过 HTTP 远程调用飞书官方部署的 MCP 服务，无需本地部署即可使用飞书的云文档、用户搜索等能力。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Feishu](https://img.shields.io/badge/Feishu-MCP-green)](https://open.feishu.cn/)

## 快速安装

```bash
npx skills add 你的用户名/feishu-mcp-skill
```

或在 Claude Code 中：

```
/skills add 你的用户名/feishu-mcp-skill
```

## 功能特性

- ✅ 无需本地部署 MCP 服务
- ✅ 支持所有飞书 MCP 云文档工具
- ✅ 完整的 OAuth 2.0 授权流程
- ✅ 自动 Token 管理和刷新
- ✅ 本地 Token 缓存
- ✅ 完整的错误处理和友好的输出
- ✅ 支持国内版飞书和国际版 Lark
- ✅ 内置 Node.js 脚本，开箱即用

## 安装方法

### 方法 1：通过 Claude Code 安装

1. 将 `feishu-mcp-remote` 文件夹压缩为 ZIP 文件
2. 在 Claude Code 中导入该 skill
3. Claude 会自动识别并加载

### 方法 2：手动安装

1. 将 `feishu-mcp-remote` 文件夹复制到 Claude skills 目录
2. 重启 Claude Code

## 前置准备

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建自建应用
3. 获取 **App ID** 和 **App Secret**

### 2. 配置重定向 URL

在应用管理后台：
1. 进入 **开发配置** → **安全设置** → **重定向 URL**
2. 添加：`http://localhost:3000/callback`

### 3. 申请权限

在 **权限管理** 中申请以下权限：

**必选权限**：
- `offline_access` - 刷新令牌（必需）
- `docx:document:readonly` - 查看文档
- `contact:contact.base:readonly` - 获取用户信息

**推荐权限**（按需选择）：
- `docx:document:create` - 创建文档
- `docx:document:write_only` - 编辑文档
- `search:docs:read` - 搜索文档
- `wiki:wiki:readonly` - 查看知识库
- `contact:user:search` - 搜索用户
- `docs:document.comment:read` - 查看评论
- `docs:document.comment:create` - 添加评论

### 4. 发布应用

申请权限后，需要发布应用使配置生效。

## 使用方法

### 首次使用：OAuth 授权

```bash
cd feishu-mcp-remote

# 运行授权命令
node feishu-mcp-client.js auth \
  --app-id "cli_xxxxx" \
  --app-secret "xxxxx"
```

脚本会：
1. 启动本地回调服务器
2. 显示授权链接
3. 你在浏览器中授权
4. 自动获取并保存 token

### 在 Claude Code 中使用

授权完成后，直接对话：

```
我的飞书 App ID 是 cli_xxxxx，App Secret 是 xxxxx

帮我搜索飞书中包含"项目计划"的文档
```

```
创建一个飞书文档，标题是"会议纪要"
```

Claude 会自动管理 token 的加载和刷新。

### 命令行使用

```bash
# 列出可用工具
node feishu-mcp-client.js list-tools \
  --app-id "cli_xxxxx" \
  --tools "create-doc,fetch-doc,search-doc"

# 调用工具
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "search-doc" \
  --args '{"query":"项目计划"}'
```

Token 会自动从本地加载，过期时自动刷新。

## 支持的工具

### 通用工具
- `search-user` - 搜索企业用户
- `get-user` - 获取用户信息
- `fetch-file` - 获取文件内容（图片、附件）

### 云文档工具
- `search-doc` - 搜索云文档
- `create-doc` - 创建云文档
- `fetch-doc` - 查看云文档内容
- `update-doc` - 更新云文档
- `list-docs` - 列出知识空间下的文档
- `get-comments` - 获取文档评论
- `add-comments` - 添加文档评论

详细使用示例请查看 [EXAMPLES.md](./EXAMPLES.md)

## 配置选项

### 令牌类型
- `--token-type UAT` - 用户访问令牌（默认）
- `--token-type TAT` - 租户访问令牌

### 域名选择
- `--domain feishu` - 国内版飞书（默认）
- `--domain lark` - 国际版 Lark

### 工具白名单
使用 `--tools` 参数指定允许调用的工具列表：
```bash
--tools "create-doc,fetch-doc,update-doc"
```

## 错误处理

脚本会自动处理常见错误并提供友好的错误信息：

| 错误码 | 说明 | 解决方法 |
|--------|------|----------|
| -32011 | 缺少认证令牌 | 提供 --token 参数 |
| -32003 | 令牌无效或过期 | 重新获取有效令牌 |
| -32601 | 工具不存在 | 检查工具名称和 --tools 参数 |
| -32030 | 请求频率超限 | 降低调用频率 |
| -32603 | 服务器内部错误 | 重试或联系技术支持 |

## 注意事项

1. **权限要求**：确保应用已申请所需的 API 权限
2. **令牌有效期**：UAT 和 TAT 都有有效期，需定期刷新
3. **频率限制**：注意控制调用频率，避免触发限流
4. **文档权限**：使用 TAT 时，需确保应用已获得目标文档的授权
5. **参数格式**：工具参数必须是有效的 JSON 格式

## 技术架构

```
Claude Code
    ↓
Skill (feishu-mcp-remote)
    ↓
Node.js 脚本 (feishu-mcp-client.js)
    ↓
HTTPS 请求
    ↓
飞书 MCP 服务 (mcp.feishu.cn)
    ↓
飞书开放平台 API
```

## 依赖要求

- Node.js >= 18.0.0
- 无需额外 npm 包（仅使用 Node.js 内置模块）

## 参考资料

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 MCP 官方文档](https://open.feishu.cn/document/server-docs/mcp/overview)
- [Claude Code Skills 文档](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
