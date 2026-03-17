#!/usr/bin/env node

/**
 * 飞书 MCP 远程调用客户端
 * 支持通过 HTTP 调用飞书官方 MCP 服务
 * 支持完整的 OAuth 2.0 授权流程
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// MCP 服务端点
const MCP_ENDPOINT = 'https://mcp.feishu.cn/mcp';
const MCP_ENDPOINT_LARK = 'https://mcp.larksuite.com/mcp';

// OAuth 端点
const OAUTH_AUTHORIZE_URL = 'https://accounts.feishu.cn/open-apis/authen/v1/authorize';
const OAUTH_TOKEN_URL = 'https://open.feishu.cn/open-apis/authen/v2/oauth/token';

// Token 存储路径
const TOKEN_CACHE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.feishu-mcp');
const TOKEN_CACHE_FILE = path.join(TOKEN_CACHE_DIR, 'tokens.json');

// 默认权限列表
const DEFAULT_SCOPES = [
  'docx:document:create',
  'docx:document:readonly',
  'docx:document:write_only',
  'search:docs:read',
  'wiki:wiki:readonly',
  'contact:user:search',
  'contact:contact.base:readonly',
  'docs:document.comment:read',
  'docs:document.comment:create',
  'offline_access',
  'wiki:node:read',                                                                               
  'wiki:node:create',                                                                                    
  'drive:drive', 
];

/**
 * 确保 token 缓存目录存在
 */
function ensureTokenCacheDir() {
  if (!fs.existsSync(TOKEN_CACHE_DIR)) {
    fs.mkdirSync(TOKEN_CACHE_DIR, { recursive: true });
  }
}

/**
 * 保存 token 到本地
 */
function saveTokens(appId, tokens) {
  ensureTokenCacheDir();

  let cache = {};
  if (fs.existsSync(TOKEN_CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
    } catch (e) {
      // 忽略解析错误
    }
  }

  cache[appId] = {
    ...tokens,
    savedAt: Date.now()
  };

  fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * 从本地读取 token
 */
function loadTokens(appId) {
  if (!fs.existsSync(TOKEN_CACHE_FILE)) {
    return null;
  }

  try {
    const cache = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
    return cache[appId] || null;
  } catch (e) {
    return null;
  }
}

/**
 * 检查 token 是否过期
 */
function isTokenExpired(tokens) {
  if (!tokens || !tokens.savedAt || !tokens.expires_in) {
    return true;
  }

  const expiresAt = tokens.savedAt + (tokens.expires_in * 1000);
  const now = Date.now();

  // 提前 5 分钟刷新
  return now >= (expiresAt - 5 * 60 * 1000);
}

/**
 * 发送 HTTPS 请求
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * 启动本地 HTTP 服务器接收 OAuth 回调
 */
function startCallbackServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <head><title>授权失败</title></head>
              <body>
                <h1>授权失败</h1>
                <p>错误：${error}</p>
                <p>你可以关闭此页面</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`授权失败: ${error}`));
        } else if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <head><title>授权成功</title></head>
              <body>
                <h1>授权成功！</h1>
                <p>你可以关闭此页面，返回终端继续操作</p>
              </body>
            </html>
          `);
          server.close();
          resolve(code);
        }
      }
    });

    server.listen(port, () => {
      console.log(`✓ 本地回调服务器已启动，监听端口 ${port}`);
    });

    server.on('error', reject);
  });
}

/**
 * 获取授权码
 */
async function getAuthorizationCode(appId, scopes, redirectUri, domain = 'feishu') {
  const state = crypto.randomBytes(16).toString('hex');
  const scopeStr = scopes.join(' ');

  const authUrl = `${OAUTH_AUTHORIZE_URL}?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopeStr)}&state=${state}`;

  console.log('\n请在浏览器中打开以下链接进行授权：');
  console.log('\n' + authUrl + '\n');
  console.log('等待授权回调...\n');

  const code = await startCallbackServer(3000);
  return code;
}

/**
 * 用授权码换取 token
 */
async function exchangeCodeForToken(appId, appSecret, code, redirectUri) {
  const body = JSON.stringify({
    grant_type: 'authorization_code',
    client_id: appId,
    client_secret: appSecret,
    code: code,
    redirect_uri: redirectUri
  });

  const response = await httpsRequest(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });

  if (response.data.code === 0) {
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      refresh_token_expires_in: response.data.refresh_token_expires_in
    };
  } else {
    throw new Error(`获取 token 失败: ${response.data.error_description || response.data.msg}`);
  }
}

/**
 * 刷新 token
 */
async function refreshAccessToken(appId, appSecret, refreshToken) {
  const body = JSON.stringify({
    grant_type: 'refresh_token',
    client_id: appId,
    client_secret: appSecret,
    refresh_token: refreshToken
  });

  const response = await httpsRequest(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });

  if (response.data.code === 0) {
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      refresh_token_expires_in: response.data.refresh_token_expires_in
    };
  } else {
    throw new Error(`刷新 token 失败: ${response.data.error_description || response.data.msg}`);
  }
}

/**
 * 获取有效的 access token
 */
async function getValidAccessToken(appId, appSecret, scopes = DEFAULT_SCOPES, forceRefresh = false) {
  let tokens = loadTokens(appId);

  // 如果没有 token 或强制刷新，进行 OAuth 授权
  if (!tokens || forceRefresh) {
    console.log('开始 OAuth 授权流程...');
    const redirectUri = 'http://localhost:3000/callback';
    const code = await getAuthorizationCode(appId, scopes, redirectUri);
    tokens = await exchangeCodeForToken(appId, appSecret, code, redirectUri);
    saveTokens(appId, tokens);
    console.log('✓ 授权成功，token 已保存');
    return tokens.access_token;
  }

  // 检查 token 是否过期
  if (isTokenExpired(tokens)) {
    if (tokens.refresh_token) {
      console.log('Token 已过期，正在刷新...');
      try {
        tokens = await refreshAccessToken(appId, appSecret, tokens.refresh_token);
        saveTokens(appId, tokens);
        console.log('✓ Token 刷新成功');
        return tokens.access_token;
      } catch (error) {
        console.log('✗ Token 刷新失败，重新授权...');
        return getValidAccessToken(appId, appSecret, scopes, true);
      }
    } else {
      console.log('Token 已过期且无 refresh_token，重新授权...');
      return getValidAccessToken(appId, appSecret, scopes, true);
    }
  }

  return tokens.access_token;
}

/**
 * 发送 MCP 请求
 */
async function sendMCPRequest(options) {
  const {
    token,
    method,
    params = {},
    allowedTools = [],
    domain = 'feishu'
  } = options;

  const endpoint = domain === 'lark' ? MCP_ENDPOINT_LARK : MCP_ENDPOINT;
  const url = new URL(endpoint);

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
    'X-Lark-MCP-UAT': token
  };

  // 添加允许的工具列表
  if (allowedTools.length > 0) {
    headers['X-Lark-MCP-Allowed-Tools'] = allowedTools.join(',');
  }

  // 构建请求体
  const requestBody = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
  };

  if (Object.keys(params).length > 0) {
    requestBody.params = params;
  }

  const postData = JSON.stringify(requestBody);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject({
                statusCode: res.statusCode,
                error: response.error || response,
              });
            }
          } catch (e) {
            reject({
              statusCode: res.statusCode,
              error: { message: '响应解析失败', raw: data },
            });
          }
        });
      }
    );

    req.on('error', (e) => {
      reject({ error: { message: '请求失败', details: e.message } });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 授权命令
 */
async function authorize(appId, appSecret, scopes, domain) {
  console.log('='.repeat(60));
  console.log('飞书 MCP OAuth 授权');
  console.log('='.repeat(60));
  console.log('');

  try {
    const token = await getValidAccessToken(appId, appSecret, scopes, true);
    console.log('\n✓ 授权完成！');
    console.log(`\nAccess Token: ${token.substring(0, 20)}...`);
    console.log('\nToken 已保存到本地，后续调用将自动使用');
  } catch (error) {
    console.error('\n✗ 授权失败');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * 初始化 MCP 连接
 */
async function initialize(appId, appSecret, scopes, domain) {
  console.log('正在初始化 MCP 连接...');

  try {
    const token = await getValidAccessToken(appId, appSecret, scopes);

    const response = await sendMCPRequest({
      token,
      method: 'initialize',
      domain,
    });

    console.log('✓ 连接成功');
    console.log(JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('✗ 连接失败');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

/**
 * 列出可用工具
 */
async function listTools(appId, appSecret, scopes, allowedTools, domain) {
  console.log('正在获取工具列表...');

  try {
    const token = await getValidAccessToken(appId, appSecret, scopes);

    const response = await sendMCPRequest({
      token,
      method: 'tools/list',
      allowedTools,
      domain,
    });

    console.log('✓ 获取成功');

    if (response.result && response.result.tools) {
      console.log(`\n共 ${response.result.tools.length} 个可用工具：\n`);
      response.result.tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        console.log(`   描述：${tool.description || tool.annotations?.title || '无'}`);
        console.log(`   参数：${JSON.stringify(tool.inputSchema?.properties || {})}`);
        console.log('');
      });
    }

    return response;
  } catch (error) {
    console.error('✗ 获取失败');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

/**
 * 调用工具
 */
async function callTool(appId, appSecret, scopes, toolName, args, allowedTools, domain) {
  console.log(`正在调用工具：${toolName}...`);

  try {
    const token = await getValidAccessToken(appId, appSecret, scopes);

    const response = await sendMCPRequest({
      token,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
      allowedTools: allowedTools.length > 0 ? allowedTools : [toolName],
      domain,
    });

    console.log('✓ 调用成功');

    // 检查是否有错误
    if (response.result?.isError) {
      console.log('\n⚠ 工具执行出错：');
      console.log(JSON.stringify(response.result.content, null, 2));
    } else {
      console.log('\n结果：');
      console.log(JSON.stringify(response, null, 2));
    }

    return response;
  } catch (error) {
    console.error('✗ 调用失败');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    action: args[0],
    appId: null,
    appSecret: null,
    toolName: null,
    args: {},
    tools: [],
    scopes: DEFAULT_SCOPES,
    domain: 'feishu',
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--app-id' && args[i + 1]) {
      parsed.appId = args[i + 1];
      i++;
    } else if (arg === '--app-secret' && args[i + 1]) {
      parsed.appSecret = args[i + 1];
      i++;
    } else if (arg === '--tool-name' && args[i + 1]) {
      parsed.toolName = args[i + 1];
      i++;
    } else if (arg === '--args' && args[i + 1]) {
      try {
        parsed.args = JSON.parse(args[i + 1]);
      } catch (e) {
        console.error('错误：--args 参数必须是有效的 JSON 格式');
        process.exit(1);
      }
      i++;
    } else if (arg === '--tools' && args[i + 1]) {
      parsed.tools = args[i + 1].split(',').map(t => t.trim());
      i++;
    } else if (arg === '--scopes' && args[i + 1]) {
      parsed.scopes = args[i + 1].split(',').map(s => s.trim());
      i++;
    } else if (arg === '--domain' && args[i + 1]) {
      parsed.domain = args[i + 1];
      i++;
    }
  }

  return parsed;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
飞书 MCP 远程调用客户端（支持 OAuth 授权）

用法：
  node feishu-mcp-client.js <action> [options]

操作：
  auth              进行 OAuth 授权（首次使用或重新授权）
  init              初始化 MCP 连接
  list-tools        列出可用工具
  call-tool         调用指定工具

选项：
  --app-id <id>             应用 App ID（必需）
  --app-secret <secret>     应用 App Secret（必需）
  --tool-name <name>        工具名称（用于 call-tool）
  --args <json>             工具参数（JSON 格式，用于 call-tool）
  --tools <list>            允许调用的工具列表（逗号分隔）
  --scopes <list>           OAuth 权限范围（逗号分隔，默认包含常用权限）
  --domain <domain>         域名（feishu 或 lark，默认 feishu）

示例：

  # 1. 首次授权（会打开浏览器）
  node feishu-mcp-client.js auth \\
    --app-id "cli_xxxxx" \\
    --app-secret "xxxxx"

  # 2. 列出可用工具
  node feishu-mcp-client.js list-tools \\
    --app-id "cli_xxxxx" \\
    --app-secret "xxxxx" \\
    --tools "create-doc,fetch-doc,search-doc"

  # 3. 调用工具
  node feishu-mcp-client.js call-tool \\
    --app-id "cli_xxxxx" \\
    --app-secret "xxxxx" \\
    --tool-name "search-doc" \\
    --args '{"query":"项目计划"}'

  # 4. 自定义权限范围
  node feishu-mcp-client.js auth \\
    --app-id "cli_xxxxx" \\
    --app-secret "xxxxx" \\
    --scopes "docx:document:readonly,contact:user:search,offline_access"

注意事项：
  - 首次使用需要先执行 auth 命令进行授权
  - Token 会自动保存到 ~/.feishu-mcp/tokens.json
  - Token 过期后会自动刷新
  - 重定向 URL 必须配置为 http://localhost:3000/callback
`);
}

/**
 * 主函数
 */
async function main() {
  const parsed = parseArgs();

  if (!parsed.action || parsed.action === '--help' || parsed.action === '-h') {
    showHelp();
    return;
  }

  // 检查必需参数
  if (!parsed.appId || !parsed.appSecret) {
    console.error('错误：必须提供 --app-id 和 --app-secret 参数');
    console.error('使用 --help 查看帮助信息');
    process.exit(1);
  }

  try {
    switch (parsed.action) {
      case 'auth':
        await authorize(parsed.appId, parsed.appSecret, parsed.scopes, parsed.domain);
        break;

      case 'init':
        await initialize(parsed.appId, parsed.appSecret, parsed.scopes, parsed.domain);
        break;

      case 'list-tools':
        await listTools(parsed.appId, parsed.appSecret, parsed.scopes, parsed.tools, parsed.domain);
        break;

      case 'call-tool':
        if (!parsed.toolName) {
          console.error('错误：call-tool 操作需要 --tool-name 参数');
          process.exit(1);
        }
        await callTool(
          parsed.appId,
          parsed.appSecret,
          parsed.scopes,
          parsed.toolName,
          parsed.args,
          parsed.tools,
          parsed.domain
        );
        break;

      default:
        console.error(`错误：未知操作 "${parsed.action}"`);
        console.error('使用 --help 查看帮助信息');
        process.exit(1);
    }
  } catch (error) {
    console.error('执行失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getValidAccessToken,
  sendMCPRequest,
  authorize,
  initialize,
  listTools,
  callTool
};
