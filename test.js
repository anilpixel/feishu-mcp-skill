#!/usr/bin/env node

/**
 * 飞书 MCP 快速测试脚本
 * 用于验证配置是否正确
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('='.repeat(60));
  console.log('飞书 MCP 远程调用 - 快速测试');
  console.log('='.repeat(60));
  console.log('');

  // 获取 App ID
  const appId = await question('请输入你的 App ID: ');
  if (!appId.trim()) {
    console.error('错误：App ID 不能为空');
    rl.close();
    return;
  }

  // 获取 App Secret
  const appSecret = await question('请输入你的 App Secret: ');
  if (!appSecret.trim()) {
    console.error('错误：App Secret 不能为空');
    rl.close();
    return;
  }

  // 获取域名
  const domain = await question('域名 (feishu/lark，默认 feishu): ');
  const finalDomain = domain.trim().toLowerCase() || 'feishu';

  console.log('');
  console.log('='.repeat(60));
  console.log('开始测试...');
  console.log('='.repeat(60));
  console.log('');

  // 检查 token 是否存在
  const tokenCacheDir = path.join(process.env.HOME || process.env.USERPROFILE, '.feishu-mcp');
  const tokenCacheFile = path.join(tokenCacheDir, 'tokens.json');

  let needAuth = true;
  if (fs.existsSync(tokenCacheFile)) {
    try {
      const cache = JSON.parse(fs.readFileSync(tokenCacheFile, 'utf-8'));
      if (cache[appId.trim()]) {
        console.log('✓ 发现本地 token 缓存\n');
        needAuth = false;
      }
    } catch (e) {
      // 忽略
    }
  }

  // 如果需要授权
  if (needAuth) {
    console.log('测试 0: OAuth 授权');
    console.log('-'.repeat(60));
    console.log('首次使用需要完成 OAuth 授权流程');
    console.log('');

    const doAuth = await question('是否现在进行授权？(y/n): ');
    if (doAuth.toLowerCase() === 'y') {
      try {
        execSync(
          `node feishu-mcp-client.js auth --app-id "${appId.trim()}" --app-secret "${appSecret.trim()}" --domain "${finalDomain}"`,
          { stdio: 'inherit' }
        );
        console.log('✓ 授权成功\n');
      } catch (error) {
        console.error('✗ 授权失败\n');
        rl.close();
        return;
      }
    } else {
      console.log('跳过授权，后续测试可能失败\n');
    }
  }

  // 测试 1: 初始化连接
  console.log('测试 1: 初始化 MCP 连接');
  console.log('-'.repeat(60));
  try {
    execSync(
      `node feishu-mcp-client.js init --app-id "${appId.trim()}" --domain "${finalDomain}"`,
      { stdio: 'inherit' }
    );
    console.log('✓ 初始化成功\n');
  } catch (error) {
    console.error('✗ 初始化失败\n');
    rl.close();
    return;
  }

  // 测试 2: 列出工具
  console.log('测试 2: 列出可用工具');
  console.log('-'.repeat(60));
  try {
    execSync(
      `node feishu-mcp-client.js list-tools --app-id "${appId.trim()}" --tools "search-doc,fetch-doc,create-doc" --domain "${finalDomain}"`,
      { stdio: 'inherit' }
    );
    console.log('✓ 工具列表获取成功\n');
  } catch (error) {
    console.error('✗ 工具列表获取失败\n');
  }

  // 测试 3: 搜索用户
  console.log('测试 3: 搜索用户');
  console.log('-'.repeat(60));
  const userName = await question('输入要搜索的用户名（留空跳过）: ');
  if (userName.trim()) {
    try {
      execSync(
        `node feishu-mcp-client.js call-tool --app-id "${appId.trim()}" --tool-name "search-user" --args '{"query":"${userName.trim()}"}' --domain "${finalDomain}"`,
        { stdio: 'inherit' }
      );
      console.log('✓ 用户搜索成功\n');
    } catch (error) {
      console.error('✗ 用户搜索失败\n');
    }
  } else {
    console.log('跳过用户搜索测试\n');
  }

  // 测试 4: 搜索文档
  console.log('测试 4: 搜索文档');
  console.log('-'.repeat(60));
  const docQuery = await question('输入要搜索的文档关键词（留空跳过）: ');
  if (docQuery.trim()) {
    try {
      execSync(
        `node feishu-mcp-client.js call-tool --app-id "${appId.trim()}" --tool-name "search-doc" --args '{"query":"${docQuery.trim()}"}' --domain "${finalDomain}"`,
        { stdio: 'inherit' }
      );
      console.log('✓ 文档搜索成功\n');
    } catch (error) {
      console.error('✗ 文档搜索失败\n');
    }
  } else {
    console.log('跳过文档搜索测试\n');
  }

  // 测试 5: Token 自动刷新
  console.log('测试 5: Token 状态检查');
  console.log('-'.repeat(60));
  if (fs.existsSync(tokenCacheFile)) {
    try {
      const cache = JSON.parse(fs.readFileSync(tokenCacheFile, 'utf-8'));
      const tokens = cache[appId.trim()];
      if (tokens) {
        const expiresAt = tokens.savedAt + (tokens.expires_in * 1000);
        const now = Date.now();
        const remainingSeconds = Math.floor((expiresAt - now) / 1000);

        console.log(`Access Token 剩余有效期: ${remainingSeconds} 秒`);

        if (tokens.refresh_token_expires_in) {
          const refreshExpiresAt = tokens.savedAt + (tokens.refresh_token_expires_in * 1000);
          const refreshRemainingSeconds = Math.floor((refreshExpiresAt - now) / 1000);
          console.log(`Refresh Token 剩余有效期: ${refreshRemainingSeconds} 秒`);
        }

        if (remainingSeconds < 300) {
          console.log('\n⚠ Access Token 即将过期，下次调用时会自动刷新');
        }

        console.log('✓ Token 状态正常\n');
      }
    } catch (e) {
      console.error('✗ 无法读取 token 信息\n');
    }
  }

  console.log('='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));
  console.log('');
  console.log('如果所有测试都通过，说明配置正确。');
  console.log('你现在可以在 Claude Code 中使用此 skill 了。');
  console.log('');
  console.log('Token 缓存位置: ' + tokenCacheFile);
  console.log('更多示例请查看 EXAMPLES.md');
  console.log('');

  rl.close();
}

main().catch(error => {
  console.error('测试过程中发生错误:', error);
  rl.close();
  process.exit(1);
});
