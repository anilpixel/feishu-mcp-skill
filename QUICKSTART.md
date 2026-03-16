# 快速开始指南

## 第一步：创建飞书应用并获取凭证

### 1. 创建应用
1. 访问 https://open.feishu.cn/app
2. 点击"创建自建应用"
3. 填写应用名称和描述
4. 记录 **App ID** 和 **App Secret**

### 2. 配置重定向 URL
1. 进入应用管理后台
2. 导航到 **开发配置** → **安全设置** → **重定向 URL**
3. 添加：`http://localhost:3000/callback`
4. 保存配置

### 3. 申请权限

在 **开发配置** → **权限管理** → **API 权限** 中申请以下权限：

**必选权限**：
- ✅ `offline_access` - 刷新令牌（必需）
- ✅ `docx:document:readonly` - 查看新版文档
- ✅ `contact:contact.base:readonly` - 获取通讯录基本信息

**推荐权限**（按需选择）：
- ✅ `docx:document:create` - 创建新版文档
- ✅ `docx:document:write_only` - 编辑新版文档
- ✅ `search:docs:read` - 搜索云文档
- ✅ `wiki:wiki:readonly` - 查看知识库
- ✅ `contact:user:search` - 搜索用户
- ✅ `docs:document.comment:read` - 获取云文档评论
- ✅ `docs:document.comment:create` - 添加云文档评论

### 4. 发布应用
申请权限后，需要发布应用使配置生效：
1. 在应用管理后台点击 **版本管理与发布**
2. 创建版本并发布

## 第二步：OAuth 授权

运行授权命令：

```bash
cd feishu-mcp-remote
node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
```

**授权流程**：
1. 脚本启动本地回调服务器（端口 3000）
2. 终端显示授权链接
3. 复制链接到浏览器打开
4. 在飞书授权页面点击"同意授权"
5. 浏览器跳转到成功页面
6. 终端显示"授权成功"

**Token 存储**：
- Token 自动保存到 `~/.feishu-mcp/tokens.json`
- 包含 `access_token` 和 `refresh_token`
- 脚本会自动管理 token 的刷新

## 第三步：测试连接

运行快速测试：

```bash
node test.js
```

按提示输入：
- App ID
- App Secret

测试脚本会自动：
1. 检查本地 token
2. 如果 token 不存在或过期，引导你授权
3. 测试初始化连接
4. 列出可用工具
5. 测试搜索用户和文档

## 第四步：开始使用

### 在 Claude Code 中使用

授权完成后，直接对话即可：

```
我的飞书 App ID 是 cli_xxxxx，App Secret 是 xxxxx

帮我搜索飞书中包含"项目计划"的文档
```

Claude 会自动：
1. 加载本地 token
2. 检查并刷新 token（如需要）
3. 调用飞书 MCP 工具
4. 返回结果

### 命令行使用

```bash
# 搜索文档
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "search-doc" \
  --args '{"query":"项目计划"}'

# 创建文档
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "create-doc" \
  --args '{"title":"新文档","content":"内容"}'

# 查看文档
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "fetch-doc" \
  --args '{"docID":"doccnXXXXXX"}'
```

## 常见问题

### Q1: 授权时提示 "20027" 错误
**A:** 应用未申请相应权限。
- 检查是否申请了 `offline_access` 权限
- 确认权限申请后已发布应用
- 重新授权

### Q2: 提示 "redirect_uri 不匹配"
**A:** 重定向 URL 配置错误。
- 确保在应用后台配置了 `http://localhost:3000/callback`
- 注意 URL 必须完全匹配，包括协议和端口

### Q3: Token 自动刷新失败
**A:** Refresh token 可能已过期。
- Refresh token 有效期为 7 天（默认）
- 超过有效期需要重新授权
- 运行 `node feishu-mcp-client.js auth` 重新授权

### Q4: 无法搜索到文档
**A:** 权限或范围问题。
- 确保申请了 `search:docs:read` 权限
- 确认用户有文档访问权限
- 检查文档是否在用户可见范围内

### Q5: 端口 3000 被占用
**A:** 修改回调端口。
- 在应用后台修改重定向 URL 为其他端口
- 修改脚本中的端口号（目前硬编码为 3000）

### Q6: 如何查看当前 token 状态？
**A:** 查看 token 缓存文件。
```bash
cat ~/.feishu-mcp/tokens.json
```

### Q7: 如何重新授权？
**A:** 删除本地 token 并重新授权。
```bash
rm ~/.feishu-mcp/tokens.json
node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
```

## Token 管理

### Token 自动刷新机制

脚本会自动管理 token：
1. **检查过期**：每次调用前检查 token 是否过期
2. **提前刷新**：在过期前 5 分钟自动刷新
3. **保存新 token**：刷新后自动保存到本地
4. **失败重试**：刷新失败时提示重新授权

### Token 存储格式

```json
{
  "cli_xxxxx": {
    "access_token": "u-gxxxxx...",
    "refresh_token": "r-gxxxxx...",
    "expires_in": 7200,
    "refresh_token_expires_in": 604800,
    "savedAt": 1234567890000
  }
}
```

### 安全建议

1. **保护 token 文件**：
   ```bash
   chmod 600 ~/.feishu-mcp/tokens.json
   ```

2. **不要提交到版本控制**：
   - 已在 `.gitignore` 中排除
   - 确保不会意外提交

3. **定期更新**：
   - 建议每周至少使用一次，保持 refresh_token 有效
   - 长期不用需要重新授权

## 进阶使用

### 自定义权限范围

修改脚本中的 `DEFAULT_SCOPES` 数组：

```javascript
const DEFAULT_SCOPES = [
  'docx:document:readonly',  // 只读文档
  'search:docs:read',        // 搜索文档
  'offline_access'           // 必需
];
```

### 批量操作

创建脚本批量处理：

```javascript
const { execSync } = require('child_process');

const appId = 'cli_xxxxx';
const queries = ['项目A', '项目B', '项目C'];

queries.forEach(query => {
  const result = execSync(
    `node feishu-mcp-client.js call-tool --app-id "${appId}" --tool-name "search-doc" --args '{"query":"${query}"}'`,
    { encoding: 'utf-8' }
  );
  console.log(result);
});
```

### 集成到 CI/CD

在自动化环境中使用：

```bash
#!/bin/bash

APP_ID="cli_xxxxx"
APP_SECRET="xxxxx"

# 首次授权（需要人工介入）
# node feishu-mcp-client.js auth --app-id "$APP_ID" --app-secret "$APP_SECRET"

# 后续自动调用
node feishu-mcp-client.js call-tool \
  --app-id "$APP_ID" \
  --tool-name "create-doc" \
  --args '{"title":"自动生成报告","content":"..."}'
```

## 下一步

- 查看 [EXAMPLES.md](./EXAMPLES.md) 了解更多使用示例
- 阅读 [TOOLS.md](./TOOLS.md) 了解所有可用工具
- 查看 [README.md](./README.md) 了解完整功能

## 获取帮助

遇到问题？
1. 查看本文档的常见问题部分
2. 检查飞书开放平台的应用配置
3. 确认权限申请和发布状态
4. 查看 token 缓存文件内容
5. 访问飞书开放平台文档
