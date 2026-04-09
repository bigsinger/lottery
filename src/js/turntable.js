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
    
    // 获取容器实际尺寸
    let size = Math.min(container.offsetWidth, container.offsetHeight);
    
    // 如果容器尺寸为0（可能是隐藏状态），使用备用尺寸
    if (size === 0 || size < 50) {
      size = Math.min(window.innerWidth - 40, 320);
      // 手机端使用更保守的尺寸
      if (window.innerWidth < 500) {
        size = Math.min(window.innerWidth - 60, 280);
      }
    }
    
    // 确保 size 为正数
    size = Math.max(size, 150);
    
    // 设置实际绘制尺寸（高分辨率）
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    
    // 重置缩放（避免重复缩放）
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // 更新中心和半径（使用 CSS 像素尺寸）
    this.options.centerX = size / 2;
    this.options.centerY = size / 2;
    this.options.radius = size / 2 - 10;
    this.options.textRadius = this.options.radius * 0.65;
    
    // 缩放上下文以支持高分辨率
    this.ctx.scale(dpr, dpr);
    
    console.log(`Canvas 尺寸: ${size}px, DPR: ${dpr}, 实际: ${size * dpr}px`);
  }

  /**
   * 绘制转盘
   * @param {Array} prizes 奖品列表
   */
  draw(prizes) {
    // 参数检查
    if (!prizes || !Array.isArray(prizes)) {
      prizes = this.prizes || [];
    }
    this.prizes = prizes;
    const num = prizes.length;
    
    if (num === 0) {
      console.warn('奖品列表为空');
      return;
    }
    
    const ctx = this.ctx;
    const { centerX, centerY, radius } = this.options;
    
    // 使用 CSS 像素尺寸计算（因为已经 scale 过了）
    const dpr = window.devicePixelRatio || 1;
    const actualSize = this.canvas.width / dpr;
    
    // 根据奖品数量和屏幕尺寸动态计算字体大小
    const baseFontSize = actualSize < 250 ? 9 : (actualSize < 300 ? 10 : (actualSize < 400 ? 12 : 14));
    const iconSize = baseFontSize + 6;
    
    // 清除画布（使用实际像素尺寸）
    ctx.clearRect(0, 0, actualSize, actualSize);
    
    // 计算每个扇形的角度
    const anglePerPrize = (2 * Math.PI) / num;
    
    // 绘制每个扇形
    for (let i = 0; i < num; i++) {
      const prize = prizes[i];
      const startAngle = i * anglePerPrize - Math.PI / 2;
      const endAngle = startAngle + anglePerPrize;
      
      // 绘制扇形（顺时针方向，arc默认是顺时针）
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
      
      // 绘制图标和文字
      ctx.save();
      
      // 计算文字位置（根据奖品数量调整距离）
      const textAngle = startAngle + anglePerPrize / 2;
      const textRadiusRatio = num > 6 ? 0.55 : 0.65;
      const textRadius = radius * textRadiusRatio;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;
      
      // 旋转文字使其垂直于扇形
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      
      // 绘制文字（文字过长时截断）- 文字在上
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 增大文字可显示区域
      const maxLen = actualSize < 250 ? 4 : (actualSize < 300 ? 5 : (actualSize < 400 ? 7 : 10));
      const text = prize.text.length > maxLen ? prize.text.substring(0, maxLen) + '..' : prize.text;
      const textOffset = prize.icon ? -iconSize / 2 - 2 : 0;
      ctx.fillText(text, 0, textOffset);
      
      // 绘制图标（如果有）- 图标在下
      if (prize.icon) {
        ctx.fillStyle = '#fff';
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(prize.icon, 0, baseFontSize / 2 + 4);
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
    ctx.fillStyle = '#667eea';
    ctx.fill();
    
    console.log(`转盘绘制完成: ${num}个奖品, 尺寸: ${actualSize}px`);
  }

  /**
   * 开始旋转
   * @param {number} targetIndex 目标奖品索引
   * @returns {Promise} 完成后返回中奖奖品
   */
  spin(targetIndex) {
    return new Promise((resolve, reject) => {
      if (this.isSpinning) {
        console.warn('转盘正在旋转中');
        reject(new Error('转盘正在旋转中'));
        return;
      }
      
      if (!this.prizes || this.prizes.length === 0) {
        reject(new Error('奖品列表为空'));
        return;
      }
      
      if (targetIndex < 0 || targetIndex >= this.prizes.length) {
        reject(new Error('无效的奖品索引'));
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
      
      console.log(`开始旋转: 目标索引=${targetIndex}, 目标角度=${targetAngle}°, 总旋转=${this.currentRotation}°`);
      
      // 应用 CSS Transform 动画
      this.canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      this.canvas.style.transform = `rotate(${this.currentRotation}deg)`;
      
      // 监听动画结束
      const onEnd = () => {
        this.isSpinning = false;
        this.canvas.removeEventListener('transitionend', onEnd);
        
        // 重置 transition，保持当前角度
        this.canvas.style.transition = 'none';
        
        console.log(`旋转完成: 中奖=${this.prizes[targetIndex].text}`);
        
        // 返回中奖奖品
        resolve(this.prizes[targetIndex]);
      };
      
      this.canvas.addEventListener('transitionend', onEnd);
    });
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
    this.resizeCanvas();
    this.draw(prizes);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Turntable;
} else {
  window.Turntable = Turntable;
}