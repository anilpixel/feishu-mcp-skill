# 发布到 skills.sh 指南

## 准备工作

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 上创建新仓库，例如：
# https://github.com/你的用户名/feishu-mcp-skill
```

### 2. 初始化 Git 仓库

```bash
cd feishu-mcp-remote
git init
git add .
git commit -m "Initial commit: Feishu MCP Remote Skill"
git branch -M main
git remote add origin https://github.com/你的用户名/feishu-mcp-skill.git
git push -u origin main
```

### 3. 添加 GitHub Topics

在 GitHub 仓库页面添加以下 topics：
- `claude-skill`
- `claude-code`
- `feishu`
- `lark`
- `mcp`
- `agent-skill`

## 发布到 skills.sh

### 自动索引

一旦你的仓库：
1. ✅ 是公开的
2. ✅ 包含 `Skill.md` 文件
3. ✅ 添加了 `claude-skill` topic

skills.sh 会自动索引你的 skill。

### 用户安装

用户可以通过以下命令安装：

```bash
npx skills add 你的用户名/feishu-mcp-skill
```

或者在 Claude Code 中：

```
/skills add 你的用户名/feishu-mcp-skill
```

## 推广

### 1. 在 skills.sh 上展示

你的 skill 会出现在：
- https://skills.sh/你的用户名/feishu-mcp-skill

### 2. 社区分享

- 在 [Anthropic Discord](https://discord.gg/anthropic) 分享
- 在 Twitter/X 上使用 #ClaudeCode 标签
- 在相关论坛和社区发布

### 3. 文档优化

确保以下文件完善：
- ✅ README.md - 清晰的使用说明
- ✅ Skill.md - 详细的 skill 定义
- ✅ QUICKSTART.md - 快速开始指南
- ✅ EXAMPLES.md - 丰富的示例
- ✅ CHANGELOG.md - 版本更新记录

## 维护

### 版本管理

使用 Git tags 管理版本：

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 更新 skill

```bash
git add .
git commit -m "Update: 描述更新内容"
git push
```

用户可以通过以下命令更新：

```bash
npx skills update 你的用户名/feishu-mcp-skill
```

## 最佳实践

### 1. 清晰的命名

- 仓库名：`feishu-mcp-skill` 或 `feishu-mcp-remote`
- Skill 名：在 Skill.md 中使用清晰的名称

### 2. 完善的文档

- 提供详细的安装步骤
- 包含常见问题解答
- 提供丰富的使用示例

### 3. 持续维护

- 及时响应 Issues
- 定期更新依赖
- 修复 bug 和改进功能

### 4. 社区互动

- 鼓励用户反馈
- 接受 Pull Requests
- 分享使用案例

## 参考资源

- [skills.sh](https://skills.sh) - Skills 市场
- [Anthropic Skills Repository](https://github.com/anthropics/skills) - 官方 skills 仓库
- [Open Directory for AI Agent Skills](https://vibecoding.app/blog/skills-sh-review) - Skills.sh 评测
- [Publishing Claude Code Skills](https://magazine.ediary.site/blog/publishing-claude-code-skills-a) - 发布指南
