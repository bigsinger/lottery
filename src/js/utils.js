/**
 * 工具函数
 */

const Utils = {
  /**
   * 获取 URL 参数
   * @param {string} name 参数名
   * @returns {string|null} 参数值
   */
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /**
   * 生成唯一 ID
   * @returns {string} UUID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * 获取默认颜色
   * @param {number} index 索引
   * @returns {string} 颜色值
   */
  getDefaultColor(index) {
    const colors = [
      '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
      '#3498db', '#9b59b6', '#1abc9c', '#34495e',
      '#ff6b6b', '#ffa502', '#5dade2', '#27ae60'
    ];
    return colors[index % colors.length];
  },

  /**
   * 权重随机算法
   * @param {Array} prizes 奖品列表
   * @returns {number} 中奖索引
   */
  weightedRandom(prizes) {
    // 计算总权重
    const totalWeight = prizes.reduce((sum, p) => sum + (p.weight || 1), 0);
    
    // 生成随机数
    let random = Math.random() * totalWeight;
    
    // 找到中奖奖品
    for (let i = 0; i < prizes.length; i++) {
      random -= prizes[i].weight || 1;
      if (random <= 0) {
        return i;
      }
    }
    
    return 0;
  },

  /**
   * Fisher-Yates 洗牌算法
   * @param {Array} array 数组
   * @returns {Array} 洗牌后的数组
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 预制图标列表
   */
  PRESET_ICONS: [
    { emoji: '🎁', name: '礼物' },
    { emoji: '🏆', name: '奖杯' },
    { emoji: '💰', name: '红包' },
    { emoji: '🎫', name: '门票' },
    { emoji: '🎮', name: '游戏' },
    { emoji: '📱', name: '手机' },
    { emoji: '🍰', name: '蛋糕' },
    { emoji: '✨', name: '星星' },
    { emoji: '🎈', name: '气球' },
    { emoji: '🌹', name: '玫瑰' },
    { emoji: '💎', name: '钻石' },
    { emoji: '🎯', name: '目标' }
  ],

  /**
   * 预制颜色列表
   */
  PRESET_COLORS: [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
    '#3498db', '#9b59b6', '#1abc9c', '#34495e',
    '#ff6b6b', '#ffa502', '#5dade2', '#27ae60'
  ]
};

// 导出（兼容模块化和全局）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
} else {
  window.Utils = Utils;
}