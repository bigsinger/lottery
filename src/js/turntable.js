/**
 * 转盘引擎模块
 * 基于 Canvas 绘制转盘，实现抽奖动画
 */

class Turntable {
  /**
   * 构造函数
   * @param {HTMLElement} canvas Canvas 元素
   * @param {Object} options 配置选项
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      radius: options.radius || 150,
      centerX: options.centerX || 150,
      centerY: options.centerY || 150,
      textRadius: options.textRadius || 100,
      colors: options.colors || Utils.PRESET_COLORS
    };
    
    this.prizes = [];
    this.isSpinning = false;
    this.currentRotation = 0;
    
    // 设置 Canvas 尺寸
    this.resizeCanvas();
  }

  /**
   * 调整 Canvas 尺寸
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    
    // 设置实际绘制尺寸（高分辨率）
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    
    // 更新中心和半径
    this.options.centerX = (size * dpr) / 2;
    this.options.centerY = (size * dpr) / 2;
    this.options.radius = (size * dpr) / 2 - 10;
    this.options.textRadius = this.options.radius * 0.65;
    
    // 缩放上下文
    this.ctx.scale(dpr, dpr);
  }

  /**
   * 绘制转盘
   * @param {Array} prizes 奖品列表
   */
  draw(prizes) {
    this.prizes = prizes;
    const num = prizes.length;
    
    if (num === 0) {
      console.warn('奖品列表为空');
      return;
    }
    
    const ctx = this.ctx;
    const { centerX, centerY, radius, textRadius } = this.options;
    
    // 清除画布
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 计算每个扇形的角度
    const anglePerPrize = (2 * Math.PI) / num;
    
    // 绘制每个扇形
    for (let i = 0; i < num; i++) {
      const prize = prizes[i];
      const startAngle = i * anglePerPrize - Math.PI / 2;
      const endAngle = startAngle + anglePerPrize;
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // 填充颜色
      ctx.fillStyle = prize.color || Utils.getDefaultColor(i);
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制文字或图标
      ctx.save();
      
      // 计算文字位置
      const textAngle = startAngle + anglePerPrize / 2;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;
      
      // 设置文字样式
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 旋转文字使其垂直于扇形
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      
      // 绘制图标或文字
      if (prize.icon) {
        ctx.font = '24px Arial';
        ctx.fillText(prize.icon, 0, 0);
      } else {
        // 文字过长时截断
        const text = prize.text.length > 6 ? prize.text.substring(0, 6) + '...' : prize.text;
        ctx.fillText(text, 0, 0);
      }
      
      ctx.restore();
    }
    
    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // 绘制中心装饰
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    ctx.fill();
  }

  /**
   * 开始旋转
   * @param {number} targetIndex 目标奖品索引
   * @param {Function} callback 完成回调
   */
  spin(targetIndex, callback) {
    if (this.isSpinning) {
      console.warn('转盘正在旋转中');
      return;
    }
    
    this.isSpinning = true;
    
    const num = this.prizes.length;
    const anglePerPrize = 360 / num;
    
    // 计算目标角度
    // 从顶部（指针位置）开始，奖品索引对应的角度
    const targetAngle = targetIndex * anglePerPrize + anglePerPrize / 2;
    
    // 计算总旋转角度：多转几圈 + 精确停在目标位置
    const extraRotations = 5; // 多转5圈
    const totalRotation = 360 * extraRotations + (360 - targetAngle);
    
    // 累加当前角度（确保每次都从当前位置开始）
    this.currentRotation += totalRotation;
    
    // 应用 CSS Transform 动画
    this.canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    this.canvas.style.transform = `rotate(${this.currentRotation}deg)`;
    
    // 监听动画结束
    const onEnd = () => {
      this.isSpinning = false;
      this.canvas.removeEventListener('transitionend', onEnd);
      
      // 重置 transition，保持当前角度
      this.canvas.style.transition = 'none';
      
      // 调用回调
      if (callback) {
        callback(this.prizes[targetIndex]);
      }
    };
    
    this.canvas.addEventListener('transitionend', onEnd);
  }

  /**
   * 重置转盘
   */
  reset() {
    this.currentRotation = 0;
    this.canvas.style.transition = 'none';
    this.canvas.style.transform = 'rotate(0deg)';
    this.isSpinning = false;
  }

  /**
   * 更新奖品列表并重绘
   * @param {Array} prizes 新奖品列表
   */
  updatePrizes(prizes) {
    this.reset();
    this.draw(prizes);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Turntable;
} else {
  window.Turntable = Turntable;
}