/**
 * 存储管理模块
 * 支持本地存储和服务端存储
 * - 无 user 参数：使用 localStorage（本地存储）
 * - 有 user 参数：使用服务端 API（多设备同步）
 * 
 * 数据结构说明：
 * - user 参数：指定 JSON 配置文件名（如 user/张三.json）
 * - mode 参数：指定在该 JSON 中使用哪个 mode 配置
 * - 一个 user 的 JSON 文件可以包含多个 mode 配置
 */

/**
 * 本地存储管理器
 * 使用 localStorage 实现存储
 */
class LocalStorageManager {
  /**
   * 构造函数
   * @param {string} mode 模式名称
   */
  constructor(mode) {
    this.mode = mode || 'default';
    this.configKey = `lottery_config_${this.mode}`;
    this.historyKey = `lottery_history_${this.mode}`;
    
    // 检查 localStorage 是否可用
    this.isAvailable = this.checkAvailability();
    
    console.log(`使用本地存储，模式: ${this.mode}`);
  }

  /**
   * 检查 localStorage 是否可用
   * @returns {boolean} 是否可用
   */
  checkAvailability() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage 不可用:', e);
      return false;
    }
  }

  /**
   * 获取存储类型
   * @returns {string} 存储类型
   */
  getStorageType() {
    return 'local';
  }

  /**
   * 是否为服务端存储
   * @returns {boolean} 始终返回 false
   */
  isServerStorage() {
    return false;
  }

  /**
   * 保存配置
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 是否成功
   */
  async saveConfig(config) {
    if (!this.isAvailable) {
      console.warn('存储不可用，配置无法保存');
      return false;
    }

    try {
      config.updatedAt = new Date().toISOString();
      config.mode = this.mode;
      localStorage.setItem(this.configKey, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('保存配置失败:', e);
      return false;
    }
  }

  /**
   * 加载配置
   * @returns {Promise<Object|null>} 配置对象
   */
  async loadConfig() {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const data = localStorage.getItem(this.configKey);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      console.error('加载配置失败:', e);
      return null;
    }
  }

  /**
   * 清除配置
   * @returns {Promise<boolean>} 是否成功
   */
  async clearConfig() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.configKey);
      return true;
    } catch (e) {
      console.error('清除配置失败:', e);
      return false;
    }
  }

  /**
   * 保存抽奖历史
   * @param {Object} result 抽奖结果
   * @returns {Promise<boolean>} 是否成功
   */
  async saveHistory(result) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const history = await this.loadHistory();
      history.push({
        ...result,
        timestamp: new Date().toISOString()
      });
      // 只保留最近 100 条记录
      if (history.length > 100) {
        history.shift();
      }
      localStorage.setItem(this.historyKey, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('保存历史失败:', e);
      return false;
    }
  }

  /**
   * 加载抽奖历史
   * @returns {Promise<Array>} 历史记录数组
   */
  async loadHistory() {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const data = localStorage.getItem(this.historyKey);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.error('加载历史失败:', e);
      return [];
    }
  }

  /**
   * 清除历史
   * @returns {Promise<boolean>} 是否成功
   */
  async clearHistory() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.historyKey);
      return true;
    } catch (e) {
      console.error('清除历史失败:', e);
      return false;
    }
  }

  /**
   * 清除所有数据（配置 + 历史）
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAll() {
    return await this.clearConfig() && await this.clearHistory();
  }
}

/**
 * 服务端存储管理器
 * 使用 PHP API 实现多设备同步
 * 
 * 数据结构：一个 user 的 JSON 文件包含多个 mode 配置
 * {
 *   "user": "张三",
 *   "modes": {
 *     "default": { "title": "...", "prizes": [...], "updatedAt": "..." },
 *     "team1": { "title": "...", "prizes": [...], "updatedAt": "..." }
 *   },
 *   "updatedAt": "..."
 * }
 */
class ServerStorageManager {
  /**
   * 构造函数
   * @param {string} user 用户标识（JSON 文件名）
   * @param {string} mode 模式名称（在该 JSON 中使用的配置）
   */
  constructor(user, mode) {
    this.user = user;
    this.mode = mode || 'default';
    
    // API 路径（相对于 index.html）
    this.apiBase = 'api';
    
    console.log(`使用服务端存储，用户: ${this.user}, 模式: ${this.mode}`);
  }

  /**
   * 获取存储类型
   * @returns {string} 存储类型
   */
  getStorageType() {
    return 'server';
  }

  /**
   * 是否为服务端存储
   * @returns {boolean} 始终返回 true
   */
  isServerStorage() {
    return true;
  }

  /**
   * 保存配置到服务器
   * 逻辑：读取整个 JSON，更新/添加指定 mode 的配置，保存整个 JSON
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 是否成功
   */
  async saveConfig(config) {
    try {
      const response = await fetch(`${this.apiBase}/save.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: this.user,
          mode: this.mode,
          title: config.title,
          prizes: config.prizes
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('保存配置失败:', result.error || '未知错误');
        return false;
      }

      console.log('配置已保存到服务器:', result.message);
      return true;
    } catch (e) {
      console.error('保存配置失败:', e);
      return false;
    }
  }

  /**
   * 从服务器加载配置
   * 逻辑：读取整个 JSON，返回指定 mode 的配置
   * 如果 mode 不存在，返回 null（保存时会自动创建）
   * @returns {Promise<Object|null>} 配置对象
   */
  async loadConfig() {
    try {
      const response = await fetch(`${this.apiBase}/load.php?user=${encodeURIComponent(this.user)}&mode=${encodeURIComponent(this.mode)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('加载配置失败:', result.error || '未知错误');
        return null;
      }

      if (!result.exists) {
        console.log('用户配置不存在，将使用默认配置');
        return null;
      }

      if (!result.modeExists) {
        console.log(`模式 ${this.mode} 不存在，将使用默认配置，保存时自动创建`);
        return null;
      }

      console.log(`配置已从服务器加载，模式: ${this.mode}`);
      return result.config;
    } catch (e) {
      console.error('加载配置失败:', e);
      return null;
    }
  }

  /**
   * 清除配置（暂不支持，保留接口）
   * @returns {Promise<boolean>} 是否成功
   */
  async clearConfig() {
    console.warn('服务端存储暂不支持清除配置');
    return false;
  }

  /**
   * 保存抽奖历史（使用本地存储）
   * @param {Object} result 抽奖结果
   * @returns {Promise<boolean>} 是否成功
   */
  async saveHistory(result) {
    // 历史记录保存在本地，不同步到服务器
    const historyKey = `lottery_history_${this.user}_${this.mode}`;
    try {
      const historyStr = localStorage.getItem(historyKey);
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push({
        ...result,
        timestamp: new Date().toISOString()
      });
      if (history.length > 100) {
        history.shift();
      }
      localStorage.setItem(historyKey, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('保存历史失败:', e);
      return false;
    }
  }

  /**
   * 加载抽奖历史（使用本地存储）
   * @returns {Promise<Array>} 历史记录数组
   */
  async loadHistory() {
    const historyKey = `lottery_history_${this.user}_${this.mode}`;
    try {
      const historyStr = localStorage.getItem(historyKey);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (e) {
      console.error('加载历史失败:', e);
      return [];
    }
  }

  /**
   * 清除历史（使用本地存储）
   * @returns {Promise<boolean>} 是否成功
   */
  async clearHistory() {
    const historyKey = `lottery_history_${this.user}_${this.mode}`;
    try {
      localStorage.removeItem(historyKey);
      return true;
    } catch (e) {
      console.error('清除历史失败:', e);
      return false;
    }
  }

  /**
   * 清除所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAll() {
    return await this.clearConfig() && await this.clearHistory();
  }
}

/**
 * 统一存储管理器
 * 根据 user 参数自动选择存储方式
 */
class StorageManager {
  /**
   * 构造函数
   * @param {string} user 用户标识（可选，指定 JSON 文件名）
   * @param {string} mode 模式名称（在该 JSON 中使用的配置）
   */
  constructor(user, mode) {
    // 根据是否有 user 参数选择存储方式
    if (user && user.trim()) {
      this.storage = new ServerStorageManager(user.trim(), mode);
    } else {
      this.storage = new LocalStorageManager(mode);
    }
  }

  /**
   * 获取存储类型
   * @returns {string} 存储类型（'local' 或 'server'）
   */
  getStorageType() {
    return this.storage.getStorageType();
  }

  /**
   * 是否为服务端存储
   * @returns {boolean}
   */
  isServerStorage() {
    return this.storage.isServerStorage();
  }

  /**
   * 保存配置
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 是否成功
   */
  async saveConfig(config) {
    return await this.storage.saveConfig(config);
  }

  /**
   * 加载配置
   * @returns {Promise<Object|null>} 配置对象
   */
  async loadConfig() {
    return await this.storage.loadConfig();
  }

  /**
   * 清除配置
   * @returns {Promise<boolean>} 是否成功
   */
  async clearConfig() {
    return await this.storage.clearConfig();
  }

  /**
   * 保存抽奖历史
   * @param {Object} result 抽奖结果
   * @returns {Promise<boolean>} 是否成功
   */
  async saveHistory(result) {
    return await this.storage.saveHistory(result);
  }

  /**
   * 加载抽奖历史
   * @returns {Promise<Array>} 历史记录数组
   */
  async loadHistory() {
    return await this.storage.loadHistory();
  }

  /**
   * 清除历史
   * @returns {Promise<boolean>} 是否成功
   */
  async clearHistory() {
    return await this.storage.clearHistory();
  }

  /**
   * 清除所有数据
   * @returns {Promise<boolean>} 是否成功
   */
  async clearAll() {
    return await this.storage.clearAll();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, LocalStorageManager, ServerStorageManager };
} else {
  window.StorageManager = StorageManager;
  window.LocalStorageManager = LocalStorageManager;
  window.ServerStorageManager = ServerStorageManager;
}