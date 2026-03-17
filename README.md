# 飞书 MCP 远程调用

通过 HTTP 远程调用飞书官方部署的 MCP 服务，无需本地部署即可使用飞书的云文档、知识库等能力。

## 前置准备

1. 访问 [飞书开放平台](https://open.feishu.cn/) 创建自建应用
2. 获取 **App ID** 和 **App Secret**
3. 配置重定向 URL：`http://localhost:3000/callback`
4. 发布应用

## 使用说明

详细使用方法请查看 [Skill.md](./Skill.md)

## 依赖要求

- Node.js >= 18.0.0
- 无需额外 npm 包（仅使用 Node.js 内置模块）

## 参考资料

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 MCP 官方文档](https://open.feishu.cn/document/server-docs/mcp/overview)

## 许可证

MIT License
