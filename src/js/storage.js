/**
 * 存储管理模块
 * 使用 localStorage 实现永久存储
 */

class StorageManager {
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
   * 保存配置
   * @param {Object} config 配置对象
   * @returns {boolean} 是否成功
   */
  saveConfig(config) {
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
   * @returns {Object|null} 配置对象
   */
  loadConfig() {
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
   * @returns {boolean} 是否成功
   */
  clearConfig() {
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
   * @returns {boolean} 是否成功
   */
  saveHistory(result) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const history = this.loadHistory();
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
   * @returns {Array} 历史记录数组
   */
  loadHistory() {
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
   * @returns {boolean} 是否成功
   */
  clearHistory() {
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
   * @returns {boolean} 是否成功
   */
  clearAll() {
    return this.clearConfig() && this.clearHistory();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else {
  window.StorageManager = StorageManager;
}