/**
 * 抽奖配置 API（Node.js 版本）
 * 用于 Vercel / Netlify 等平台
 * 
 * 使用方式：
 * 1. 将此文件放置在 src/api/ 目录下
 * 2. 在 Vercel 中配置为 Serverless Function
 * 3. 确保 src/user/ 目录存在且可写
 */

const fs = require('fs');
const path = require('path');

// 配置文件目录
const USER_DIR = path.join(__dirname, '..', 'user');

/**
 * 处理 API 请求
 */
module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只接受 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // 获取请求数据
  const data = req.body;

  if (!data) {
    res.status(400).json({ success: false, error: 'Invalid JSON' });
    return;
  }

  // 获取参数
  const action = data.action || '';
  const user = data.user || '';
  const mode = data.mode || 'default';

  // 验证 user 参数
  if (!user) {
    res.status(400).json({ success: false, error: 'User parameter required' });
    return;
  }

  // 验证 user 参数格式
  if (!/^[a-zA-Z0-9_-]+$/.test(user)) {
    res.status(400).json({ success: false, error: 'Invalid user format' });
    return;
  }

  // 配置文件路径
  const configFile = path.join(USER_DIR, `${user}.json`);

  // 确保 user 目录存在
  try {
    if (!fs.existsSync(USER_DIR)) {
      fs.mkdirSync(USER_DIR, { recursive: true });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot create user directory' });
    return;
  }

  // 处理不同的操作
  switch (action) {
    case 'saveConfig':
      await handleSaveConfig(res, configFile, mode, data);
      break;

    case 'loadConfig':
      await handleLoadConfig(res, configFile, mode);
      break;

    case 'clearConfig':
      await handleClearConfig(res, configFile, mode);
      break;

    case 'saveHistory':
      await handleSaveHistory(res, configFile, mode, data);
      break;

    case 'loadHistory':
      await handleLoadHistory(res, configFile, mode);
      break;

    case 'clearHistory':
      await handleClearHistory(res, configFile, mode);
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid action' });
  }
};

/**
 * 保存配置
 */
async function handleSaveConfig(res, configFile, mode, data) {
  const config = data.config;

  if (!config) {
    res.status(400).json({ success: false, error: 'Config data required' });
    return;
  }

  try {
    const allData = loadAllData(configFile);
    allData.configs[mode] = config;
    allData.updatedAt = new Date().toISOString();

    saveAllData(configFile, allData);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot save config' });
  }
}

/**
 * 加载配置
 */
async function handleLoadConfig(res, configFile, mode) {
  try {
    const allData = loadAllData(configFile);
    const config = allData.configs[mode] || null;
    res.json({ success: true, config });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot load config' });
  }
}

/**
 * 清除配置
 */
async function handleClearConfig(res, configFile, mode) {
  try {
    const allData = loadAllData(configFile);
    
    if (allData.configs[mode]) {
      delete allData.configs[mode];
      allData.updatedAt = new Date().toISOString();
      saveAllData(configFile, allData);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot clear config' });
  }
}

/**
 * 保存历史
 */
async function handleSaveHistory(res, configFile, mode, data) {
  const historyResult = data.historyResult;

  if (!historyResult) {
    res.status(400).json({ success: false, error: 'History data required' });
    return;
  }

  try {
    const allData = loadAllData(configFile);

    if (!allData.histories[mode]) {
      allData.histories[mode] = [];
    }

    allData.histories[mode].push({
      prize: historyResult.prize,
      icon: historyResult.icon,
      timestamp: new Date().toISOString()
    });

    // 只保留最近 100 条记录
    if (allData.histories[mode].length > 100) {
      allData.histories[mode] = allData.histories[mode].slice(-100);
    }

    allData.updatedAt = new Date().toISOString();
    saveAllData(configFile, allData);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot save history' });
  }
}

/**
 * 加载历史
 */
async function handleLoadHistory(res, configFile, mode) {
  try {
    const allData = loadAllData(configFile);
    const history = allData.histories[mode] || [];
    res.json({ success: true, history });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot load history' });
  }
}

/**
 * 清除历史
 */
async function handleClearHistory(res, configFile, mode) {
  try {
    const allData = loadAllData(configFile);

    if (allData.histories[mode]) {
      delete allData.histories[mode];
      allData.updatedAt = new Date().toISOString();
      saveAllData(configFile, allData);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Cannot clear history' });
  }
}

/**
 * 加载所有数据
 */
function loadAllData(configFile) {
  try {
    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf8');
      const data = JSON.parse(content);
      if (data) {
        return data;
      }
    }
  } catch (e) {
    console.error('Load data error:', e);
  }

  // 返回默认结构
  return {
    configs: {},
    histories: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * 保存所有数据
 */
function saveAllData(configFile, data) {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(configFile, content, 'utf8');
}