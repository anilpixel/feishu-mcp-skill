# 文件清单

## 核心文件

### Skill.md
Claude Code skill 定义文件，包含：
- YAML frontmatter（name, description, dependencies）
- 功能说明
- 使用方法
- 支持的工具列表
- 示例和注意事项

### feishu-mcp-client.js
Node.js 客户端脚本，实现：
- MCP 协议的 HTTP 调用
- initialize、tools/list、tools/call 三个核心方法
- 完整的错误处理
- 命令行参数解析
- 友好的输出格式

### package.json
npm 包配置文件，定义：
- 包名称和版本
- 依赖要求（Node.js >= 18.0.0）
- 可执行命令
- 元数据

## 文档文件

### README.md
完整的使用说明，包含：
- 功能特性
- 安装方法
- 前置准备
- 使用方法
- 支持的工具
- 配置选项
- 错误处理
- 技术架构
- 参考资料

### QUICKSTART.md
快速开始指南，包含：
- 获取飞书应用凭证的详细步骤
- 权限申请清单
- 获取访问令牌的方法
- 测试连接步骤
- 常见问题解答
- 进阶使用技巧

### EXAMPLES.md
使用示例集合，包含：
- 11 个实际使用示例
- 获取 Token 的方法
- 常见错误处理
- 权限配置表

### TOOLS.md
工具配置说明，包含：
- 所有工具的详细说明
- 参数格式
- 权限要求
- 使用限制
- 权限矩阵
- 常见组合示例

### CHANGELOG.md
版本更新日志，包含：
- 当前版本功能
- 未来计划
- 反馈渠道

## 辅助文件

### test.js
快速测试脚本，提供：
- 交互式测试流程
- 自动化测试步骤
- 配置验证

### .gitignore
Git 忽略文件配置

## 文件结构

```
feishu-mcp-remote/
├── Skill.md                    # Claude Code skill 定义
├── feishu-mcp-client.js        # 核心客户端脚本
├── package.json                # npm 包配置
├── test.js                     # 快速测试脚本
├── .gitignore                  # Git 忽略配置
├── README.md                   # 完整使用说明
├── QUICKSTART.md               # 快速开始指南
├── EXAMPLES.md                 # 使用示例
├── TOOLS.md                    # 工具配置说明
├── CHANGELOG.md                # 更新日志
└── FILES.md                    # 本文件
```

## 文件大小

- Skill.md: ~3 KB
- feishu-mcp-client.js: ~8 KB
- package.json: ~0.5 KB
- test.js: ~3 KB
- README.md: ~6 KB
- QUICKSTART.md: ~5 KB
- EXAMPLES.md: ~4 KB
- TOOLS.md: ~6 KB
- CHANGELOG.md: ~1 KB
- FILES.md: ~2 KB

**总计**: ~38.5 KB

## 依赖关系

```
Skill.md (入口)
    ↓
feishu-mcp-client.js (核心)
    ↓
Node.js 内置模块
    - https
    - url
    - child_process
    - readline
```

无需安装任何 npm 包，仅依赖 Node.js >= 18.0.0。

## 使用流程

1. **阅读文档**
   - README.md - 了解整体功能
   - QUICKSTART.md - 快速上手

2. **配置凭证**
   - 按照 QUICKSTART.md 获取 Token
   - 申请必要的 API 权限

3. **测试连接**
   - 运行 test.js 验证配置
   - 确保所有测试通过

4. **开始使用**
   - 在 Claude Code 中自动调用
   - 或通过命令行直接使用
   - 参考 EXAMPLES.md 和 TOOLS.md

## 维护说明

### 更新 skill
1. 修改相应文件
2. 更新 CHANGELOG.md
3. 测试功能
4. 重新打包（如需分发）

### 添加新工具
1. 在 feishu-mcp-client.js 中添加支持（如需特殊处理）
2. 在 TOOLS.md 中添加文档
3. 在 EXAMPLES.md 中添加示例
4. 更新 Skill.md 的工具列表

### 报告问题
- 检查 QUICKSTART.md 的常见问题
- 查看 TOOLS.md 的权限要求
- 参考 EXAMPLES.md 的错误处理
- 向飞书开放平台反馈

## 许可证

MIT License - 可自由使用、修改和分发
