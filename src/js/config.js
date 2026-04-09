/**
 * 配置管理模块
 * 支持本地存储和服务端存储
 */

class ConfigManager {
  /**
   * 构造函数
   * @param {string} user 用户标识（可选）
   * @param {string} mode 模式名称
   */
  constructor(user, mode) {
    this.user = user;
    this.mode = mode || 'default';
    this.storage = new StorageManager(user, mode);
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置对象
   */
  getDefaultConfig() {
    return {
      user: this.user,
      mode: this.mode,
      title: '幸运抽奖',
      prizes: [
        { id: Utils.generateId(), text: '一等奖', icon: '🏆', color: '#e74c3c', weight: 10, maxWins: 1, winCount: 0 },
        { id: Utils.generateId(), text: '二等奖', icon: '🎁', color: '#e67e22', weight: 20, maxWins: 1, winCount: 0 },
        { id: Utils.generateId(), text: '三等奖', icon: '🎈', color: '#f1c40f', weight: 30, maxWins: 1, winCount: 0 },
        { id: Utils.generateId(), text: '谢谢参与', icon: '✨', color: '#95a5a6', weight: 40, maxWins: 100, winCount: 0 }
      ],
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 获取配置
   * @returns {Promise<Object>} 配置对象
   */
  async getConfig() {
    const savedConfig = await this.storage.loadConfig();
    
    if (savedConfig) {
      // 验证配置完整性
      if (this.validateConfig(savedConfig)) {
        return savedConfig;
      } else {
        console.warn('配置数据不完整，使用默认配置');
        return this.getDefaultConfig();
      }
    }
    
    return this.getDefaultConfig();
  }

  /**
   * 验证配置
   * @param {Object} config 配置对象
   * @returns {boolean} 是否有效
   */
  validateConfig(config) {
    // 检查必要字段
    if (!config.title || typeof config.title !== 'string') {
      return false;
    }
    
    if (!config.prizes || !Array.isArray(config.prizes) || config.prizes.length === 0) {
      return false;
    }
    
    // 检查奖品格式
    for (const prize of config.prizes) {
      if (!prize.text || typeof prize.text !== 'string') {
        return false;
      }
      if (prize.weight && typeof prize.weight !== 'number') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 保存配置
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 是否成功
   */
  async saveConfig(config) {
    // 验证配置
    if (!this.validateConfig(config)) {
      console.error('配置验证失败');
      return false;
    }
    
    return await this.storage.saveConfig(config);
  }

  /**
   * 重置配置
   * @returns {Promise<Object>} 默认配置
   */
  async resetConfig() {
    const defaultConfig = this.getDefaultConfig();
    await this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * 清除配置
   * @returns {Promise<boolean>} 是否成功
   */
  async clearConfig() {
    return await this.storage.clearConfig();
  }

  /**
   * 添加奖品
   * @param {Object} config 当前配置
   * @param {Object} prize 新奖品
   * @returns {Object} 更新后的配置
   */
  addPrize(config, prize) {
    prize.id = Utils.generateId();
    if (!prize.color) {
      prize.color = Utils.getDefaultColor(config.prizes.length);
    }
    if (!prize.weight) {
      prize.weight = 10;
    }
    if (!prize.maxWins) {
      prize.maxWins = 1;
    }
    if (!prize.winCount) {
      prize.winCount = 0;
    }
    config.prizes.push(prize);
    return config;
  }

  /**
   * 更新奖品
   * @param {Object} config 当前配置
   * @param {string} prizeId 奖品 ID
   * @param {Object} updates 更新内容
   * @returns {Object} 更新后的配置
   */
  updatePrize(config, prizeId, updates) {
    const index = config.prizes.findIndex(p => p.id === prizeId);
    if (index !== -1) {
      config.prizes[index] = { ...config.prizes[index], ...updates };
    }
    return config;
  }

  /**
   * 删除奖品
   * @param {Object} config 当前配置
   * @param {string} prizeId 奖品 ID
   * @returns {Object} 更新后的配置
   */
  deletePrize(config, prizeId) {
    config.prizes = config.prizes.filter(p => p.id !== prizeId);
    return config;
  }

  /**
   * 清空所有奖品
   * @param {Object} config 当前配置
   * @returns {Object} 更新后的配置
   */
  clearPrizes(config) {
    config.prizes = [];
    return config;
  }

  /**
   * 批量导入奖品
   * @param {Object} config 当前配置
   * @param {Array} names 名称列表
   * @returns {Object} 更新后的配置
   */
  importPrizes(config, names) {
    const icons = ['🎁', '🏆', '💰', '🎫', '🎮', '📱', '🍰', '✨', '🎈', '🌹', '💎', '🎯'];
    config.prizes = names.map((name, index) => ({
      id: Utils.generateId(),
      text: name,
      icon: icons[index % icons.length],
      color: Utils.getDefaultColor(index),
      weight: 10,
      maxWins: 1,
      winCount: 0
    }));
    return config;
  }

  /**
   * 重置所有中奖次数
   * @param {Object} config 当前配置
   * @returns {Object} 更新后的配置
   */
  resetWinCounts(config) {
    config.prizes.forEach(prize => {
      prize.winCount = 0;
    });
    return config;
  }

  /**
   * 获取可抽奖的奖品列表（排除已达到最大中奖次数的）
   * @param {Object} config 当前配置
   * @returns {Array} 可抽奖的奖品列表
   */
  getAvailablePrizes(config) {
    return config.prizes.filter(prize => {
      // 权重为0的不参与抽奖
      if (prize.weight === 0) return false;
      // 已达到最大中奖次数的不参与抽奖
      if (prize.winCount >= prize.maxWins) return false;
      return true;
    });
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
   * @returns {boolean} 是否为服务端存储
   */
  isServerStorage() {
    return this.storage.isServerStorage();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigManager;
} else {
  window.ConfigManager = ConfigManager;
}