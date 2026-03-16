# 飞书 MCP 工具配置

## 工具分类

### 通用工具

#### search-user
- **功能**：搜索企业用户
- **支持令牌**：UAT
- **所需权限**：`contact:user:search`
- **参数**：
  ```json
  {
    "query": "用户名或邮箱"
  }
  ```

#### get-user
- **功能**：获取用户信息
- **支持令牌**：UAT/TAT
- **所需权限**：`contact:contact.base:readonly`, `contact:user.base:readonly`
- **参数**：
  ```json
  {
    "userID": "用户 ID（可选，不传则获取当前用户）"
  }
  ```

#### fetch-file
- **功能**：获取文件内容（图片、附件）
- **支持令牌**：UAT/TAT
- **所需权限**：`docs:document.media:download`, `board:whiteboard:node:read`
- **限制**：文件大小 ≤ 5MB
- **参数**：
  ```json
  {
    "fileToken": "文件 token"
  }
  ```

### 云文档工具

#### search-doc
- **功能**：搜索云文档
- **支持令牌**：UAT
- **所需权限**：`search:docs:read`, `wiki:wiki:readonly`
- **限制**：仅支持 doc、docx 类型
- **参数**：
  ```json
  {
    "query": "搜索关键词",
    "limit": 10,
    "offset": 0
  }
  ```

#### create-doc
- **功能**：创建云文档
- **支持令牌**：UAT/TAT
- **所需权限**：
  - `docx:document:create`
  - `docx:document:write_only`
  - `docx:document:readonly`
  - `wiki:node:read`
  - `wiki:node:create`
  - `docs:document.media:upload`
  - `board:whiteboard:node:create`
- **参数**：
  ```json
  {
    "title": "文档标题",
    "content": "文档内容（Markdown 格式）",
    "folderToken": "文件夹 token（可选）"
  }
  ```

#### fetch-doc
- **功能**：查看云文档内容
- **支持令牌**：UAT/TAT
- **所需权限**：`docx:document:readonly`, `task:task:read`, `im:chat:read`
- **参数**：
  ```json
  {
    "docID": "文档 ID",
    "startPage": 0,
    "pageSize": 100
  }
  ```

#### update-doc
- **功能**：更新云文档
- **支持令牌**：UAT/TAT
- **所需权限**：
  - `docx:document:create`
  - `docx:document:write_only`
  - `docx:document:readonly`
  - `wiki:node:read`
  - `wiki:node:create`
  - `docs:document.media:upload`
  - `board:whiteboard:node:create`
- **参数**：
  ```json
  {
    "docID": "文档 ID",
    "content": "新增或替换的内容",
    "position": "end|start|replace",
    "blockID": "块 ID（用于精确定位）"
  }
  ```

#### list-docs
- **功能**：列出知识空间下的文档
- **支持令牌**：UAT/TAT
- **所需权限**：`wiki:wiki:readonly`
- **参数**：
  ```json
  {
    "spaceID": "知识空间 ID",
    "parentNodeToken": "父节点 token（可选）",
    "pageSize": 20,
    "pageToken": "分页 token（可选）"
  }
  ```

#### get-comments
- **功能**：获取文档评论
- **支持令牌**：UAT/TAT
- **所需权限**：`docs:document.comment:read`, `contact:contact.base:readonly`
- **参数**：
  ```json
  {
    "docID": "文档 ID",
    "pageSize": 20,
    "pageToken": "分页 token（可选）"
  }
  ```

#### add-comments
- **功能**：添加文档评论
- **支持令牌**：UAT/TAT
- **所需权限**：`docs:document.comment:create`
- **限制**：仅支持全文评论，不支持划词评论
- **参数**：
  ```json
  {
    "docID": "文档 ID",
    "content": "评论内容",
    "replyID": "回复的评论 ID（可选）"
  }
  ```

## 权限矩阵

| 工具 | UAT | TAT | 主要权限 |
|------|-----|-----|---------|
| search-user | ✅ | ❌ | contact:user:search |
| get-user | ✅ | ✅ | contact:contact.base:readonly |
| fetch-file | ✅ | ✅ | docs:document.media:download |
| search-doc | ✅ | ❌ | search:docs:read |
| create-doc | ✅ | ✅ | docx:document:create |
| fetch-doc | ✅ | ✅ | docx:document:readonly |
| update-doc | ✅ | ✅ | docx:document:write_only |
| list-docs | ✅ | ✅ | wiki:wiki:readonly |
| get-comments | ✅ | ✅ | docs:document.comment:read |
| add-comments | ✅ | ✅ | docs:document.comment:create |

## 使用建议

### UAT vs TAT 选择

**使用 UAT 的场景**：
- 需要搜索用户或文档
- 操作用户个人文档
- 需要用户身份进行评论
- 交互式操作

**使用 TAT 的场景**：
- 服务端自动化任务
- 批量处理文档
- 应用级别的文档管理
- 无需用户上下文的操作

### 权限申请建议

**最小权限集**（基础功能）：
```
docx:document:readonly
contact:contact.base:readonly
```

**推荐权限集**（常用功能）：
```
docx:document:create
docx:document:readonly
docx:document:write_only
search:docs:read
wiki:wiki:readonly
contact:user:search
```

**完整权限集**（所有功能）：
```
docx:document:create
docx:document:readonly
docx:document:write_only
search:docs:read
wiki:wiki:readonly
wiki:node:read
wiki:node:create
docs:document.media:upload
docs:document.media:download
docs:document.comment:read
docs:document.comment:create
contact:user:search
contact:contact.base:readonly
contact:user.base:readonly
board:whiteboard:node:read
board:whiteboard:node:create
task:task:read
im:chat:read
```

## 常见组合

### 文档搜索 + 查看
```bash
# 1. 搜索文档
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "search-doc" \
  --args '{"query":"项目计划"}'

# 2. 查看文档（使用搜索结果中的 docID）
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "fetch-doc" \
  --args '{"docID":"doccnXXXXXX"}'
```

### 创建文档 + 添加评论
```bash
# 1. 创建文档
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "create-doc" \
  --args '{"title":"新文档","content":"内容"}'

# 2. 添加评论（使用创建结果中的 docID）
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "add-comments" \
  --args '{"docID":"doccnXXXXXX","content":"已创建"}'
```

### 搜索用户 + 创建文档并@用户
```bash
# 1. 搜索用户
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "search-user" \
  --args '{"query":"张三"}'

# 2. 创建文档并@用户
node feishu-mcp-client.js call-tool \
  --token "u-gxxxxx" \
  --tool-name "create-doc" \
  --args '{"title":"任务分配","content":"@张三 请查看"}'
```
