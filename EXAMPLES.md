# 飞书 MCP 远程调用示例

## 示例 0：首次授权

```bash
# OAuth 授权流程
node feishu-mcp-client.js auth \
  --app-id "cli_xxxxx" \
  --app-secret "xxxxx"

# 授权成功后，token 会自动保存到 ~/.feishu-mcp/tokens.json
```

## 示例 1：初始化连接并列出工具

```bash
# 初始化（会自动加载本地 token）
node feishu-mcp-client.js init --app-id "cli_xxxxx"

# 列出可用的云文档工具
node feishu-mcp-client.js list-tools \
  --app-id "cli_xxxxx" \
  --tools "create-doc,fetch-doc,update-doc,search-doc"
```

## 示例 2：搜索文档

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "search-doc" \
  --args '{"query":"项目计划","limit":10}'
```

## 示例 3：创建文档

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "create-doc" \
  --args '{
    "title": "AI 生成的文档",
    "content": "这是通过 MCP 创建的文档内容"
  }'
```

## 示例 4：查看文档内容

```bash
# 替换 docID 为实际的文档 ID
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "fetch-doc" \
  --args '{"docID":"doccnXXXXXXXXXXXXXX"}'
```

## 示例 5：更新文档

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "update-doc" \
  --args '{
    "docID": "doccnXXXXXXXXXXXXXX",
    "content": "追加的新内容",
    "position": "end"
  }'
```

## 示例 6：搜索用户

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "search-user" \
  --args '{"query":"张三"}'
```

## 示例 7：获取文档评论

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "get-comments" \
  --args '{"docID":"doccnXXXXXXXXXXXXXX"}'
```

## 示例 8：添加文档评论

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "add-comments" \
  --args '{
    "docID": "doccnXXXXXXXXXXXXXX",
    "content": "这是一条评论"
  }'
```

## 示例 9：列出知识空间下的文档

```bash
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --tool-name "list-docs" \
  --args '{
    "spaceID": "wikicnXXXXXXXXXXXXXX",
    "pageSize": 20
  }'
```

## 示例 10：国际版 Lark

```bash
# 使用 Lark 域名
node feishu-mcp-client.js call-tool \
  --app-id "cli_xxxxx" \
  --domain "lark" \
  --tool-name "search-doc" \
  --args '{"query":"project plan"}'
```

## 示例 11：重新授权

```bash
# 删除本地 token
rm ~/.feishu-mcp/tokens.json

# 重新授权
node feishu-mcp-client.js auth \
  --app-id "cli_xxxxx" \
  --app-secret "xxxxx"
```

## Token 管理示例

### 查看当前 Token 状态

```bash
# 查看 token 缓存文件
cat ~/.feishu-mcp/tokens.json

# 输出示例：
# {
#   "cli_xxxxx": {
#     "access_token": "u-gxxxxx...",
#     "refresh_token": "r-gxxxxx...",
#     "expires_in": 7200,
#     "refresh_token_expires_in": 604800,
#     "savedAt": 1234567890000
#   }
# }
```

### 手动触发 Token 刷新

Token 会自动刷新，但如果需要手动触发：

```bash
# 任意调用都会检查并刷新 token
node feishu-mcp-client.js init --app-id "cli_xxxxx"
```

## 在 Claude Code 中使用

### 首次配置

```
我的飞书应用信息：
App ID: cli_xxxxx
App Secret: xxxxx

请帮我完成授权
```

### 日常使用

```
帮我搜索飞书中包含"项目计划"的文档
```

```
创建一个飞书文档，标题是"会议纪要"，内容包括：
1. 会议时间
2. 参会人员
3. 讨论议题
```

```
查看文档 doccnXXXXXX 的内容并总结
```

## 批量操作示例

### 批量搜索文档

```javascript
const { execSync } = require('child_process');

const appId = 'cli_xxxxx';
const queries = ['项目A', '项目B', '项目C'];

queries.forEach(query => {
  console.log(`\n搜索: ${query}`);
  const result = execSync(
    `node feishu-mcp-client.js call-tool --app-id "${appId}" --tool-name "search-doc" --args '{"query":"${query}"}'`,
    { encoding: 'utf-8' }
  );
  console.log(result);
});
```

### 批量创建文档

```javascript
const { execSync } = require('child_process');

const appId = 'cli_xxxxx';
const docs = [
  { title: '文档1', content: '内容1' },
  { title: '文档2', content: '内容2' },
  { title: '文档3', content: '内容3' }
];

docs.forEach(doc => {
  console.log(`\n创建文档: ${doc.title}`);
  const args = JSON.stringify(doc);
  const result = execSync(
    `node feishu-mcp-client.js call-tool --app-id "${appId}" --tool-name "create-doc" --args '${args}'`,
    { encoding: 'utf-8' }
  );
  console.log(result);
});
```

## 错误处理示例

### 处理授权过期

```javascript
const { execSync } = require('child_process');

function callTool(appId, toolName, args) {
  try {
    const result = execSync(
      `node feishu-mcp-client.js call-tool --app-id "${appId}" --tool-name "${toolName}" --args '${JSON.stringify(args)}'`,
      { encoding: 'utf-8' }
    );
    return JSON.parse(result);
  } catch (error) {
    if (error.message.includes('refresh_token 已过期')) {
      console.log('Token 已过期，请重新授权');
      // 引导用户重新授权
      execSync(
        `node feishu-mcp-client.js auth --app-id "${appId}" --app-secret "${process.env.APP_SECRET}"`,
        { stdio: 'inherit' }
      );
      // 重试
      return callTool(appId, toolName, args);
    }
    throw error;
  }
}

// 使用
const result = callTool('cli_xxxxx', 'search-doc', { query: '项目' });
console.log(result);
```

## 常见错误处理

### 错误：Token 不存在

```bash
# 错误信息：Token 不存在，请先运行授权命令
# 解决方法：
node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
```

### 错误：Token 已过期

```bash
# 错误信息：refresh_token 已过期，请重新授权
# 解决方法：
rm ~/.feishu-mcp/tokens.json
node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
```

### 错误：权限不足

```bash
# 错误信息：99991679 - Unauthorized
# 解决方法：
# 1. 检查应用是否申请了相应权限
# 2. 确认权限申请后已发布应用
# 3. 重新授权以获取新权限
node feishu-mcp-client.js auth --app-id "cli_xxxxx" --app-secret "xxxxx"
```

### 错误：工具不存在

```bash
# 错误信息：-32601 - Method not found
# 解决方法：检查工具名称和 --tools 参数
node feishu-mcp-client.js list-tools --app-id "cli_xxxxx" --tools "search-doc,fetch-doc"
```

## 集成到自动化脚本

### Shell 脚本示例

```bash
#!/bin/bash

APP_ID="cli_xxxxx"
TOOL_NAME="create-doc"

# 创建每日报告
DATE=$(date +%Y-%m-%d)
TITLE="每日报告 - $DATE"
CONTENT="今日工作总结..."

node feishu-mcp-client.js call-tool \
  --app-id "$APP_ID" \
  --tool-name "$TOOL_NAME" \
  --args "{\"title\":\"$TITLE\",\"content\":\"$CONTENT\"}"
```

### Cron 定时任务

```bash
# 每天早上 9 点创建日报
0 9 * * * cd /path/to/feishu-mcp-remote && node feishu-mcp-client.js call-tool --app-id "cli_xxxxx" --tool-name "create-doc" --args '{"title":"日报","content":"..."}'
```

## 权限配置参考

根据使用的工具，需要申请对应权限：

| 工具 | 所需权限 |
|------|---------|
| create-doc | docx:document:create, docx:document:write_only |
| fetch-doc | docx:document:readonly |
| update-doc | docx:document:write_only |
| search-doc | search:docs:read, wiki:wiki:readonly |
| search-user | contact:user:search |
| get-user | contact:contact.base:readonly |
| get-comments | docs:document.comment:read |
| add-comments | docs:document.comment:create |

**注意**：所有场景都需要申请 `offline_access` 权限以支持 token 刷新。
