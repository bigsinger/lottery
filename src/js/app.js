/**
 * 主程序入口
 * 抽奖应用核心逻辑
 * 支持多设备配置同步
 */

class LotteryApp {
  /**
   * 构造函数
   */
  constructor() {
    this.user = Utils.getUrlParam('user') || '';
    this.mode = Utils.getUrlParam('mode') || 'default';
    this.configManager = new ConfigManager(this.user, this.mode);
    this.storage = new StorageManager(this.user, this.mode);
    this.turntable = null;
    this.config = null;
    this.resizeTimeout = null;
    this.editingPrizeId = null;
    
    // DOM 元素引用
    this.elements = {
      title: null,
      canvas: null,
      drawBtn: null,
      modeIndicator: null,
      userIndicator: null,
      settingBtn: null,
      helpBtn: null,
      settingModal: null,
      helpModal: null,
      resultModal: null,
      importModal: null
    };
  }

  /**
   * 初始化应用
   */
  async init() {
    // 加载配置（异步）
    this.config = await this.configManager.getConfig();
    
    // 获取 DOM 元素
    this.getElements();
    
    // 初始化转盘
    this.initTurntable();
    
    // 绑定事件
    this.bindEvents();
    
    // 更新界面
    this.updateUI();
    
    // 输出初始化信息
    const storageType = this.configManager.getStorageType();
    console.log(`抽奖应用初始化完成，用户: ${this.user || '本地'}, 模式: ${this.mode}, 存储: ${storageType}`);
  }

  /**
   * 获取 DOM 元素
   */
  getElements() {
    this.elements.title = document.getElementById('title');
    this.elements.canvas = document.getElementById('turntableCanvas');
    this.elements.drawBtn = document.getElementById('drawBtn');
    this.elements.modeIndicator = document.getElementById('modeIndicator');
    this.elements.userIndicator = document.getElementById('userIndicator');
    this.elements.settingBtn = document.getElementById('settingBtn');
    this.elements.helpBtn = document.getElementById('helpBtn');
    this.elements.settingModal = document.getElementById('settingModal');
    this.elements.helpModal = document.getElementById('helpModal');
    this.elements.resultModal = document.getElementById('resultModal');
    this.elements.importModal = document.getElementById('importModal');
  }

  /**
   * 初始化转盘
   */
  initTurntable() {
    this.turntable = new Turntable(this.elements.canvas);
    this.turntable.draw(this.config.prizes);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 抽奖按钮
    this.elements.drawBtn.addEventListener('click', () => this.draw());
    
    // 设置按钮
    this.elements.settingBtn.addEventListener('click', () => this.openModal(this.elements.settingModal));
    
    // 帮助按钮
    this.elements.helpBtn.addEventListener('click', () => this.openModal(this.elements.helpModal));
    
    // 弹窗关闭
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
          this.closeAllModals();
        }
      });
    });
    
    // 阻止弹窗内部点击关闭
    document.querySelectorAll('.modal-container').forEach(el => {
      el.addEventListener('click', (e) => e.stopPropagation());
    });
    
    // 设置面板事件
    this.bindSettingEvents();
    
    // 窗口大小变化
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.turntable.resizeCanvas();
        this.turntable.draw(this.config.prizes);
      }, 100);
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  /**
   * 绑定设置面板事件
   */
  bindSettingEvents() {
    // 标题输入
    document.getElementById('configTitle').addEventListener('input', (e) => {
      this.config.title = e.target.value;
    });
    
    // 添加奖品
    document.getElementById('addPrizeBtn').addEventListener('click', () => {
      this.config = this.configManager.addPrize(this.config, {
        text: '新奖品',
        icon: '🎁',
        color: Utils.getDefaultColor(this.config.prizes.length)
      });
      this.updatePrizeList();
      this.turntable.updatePrizes(this.config.prizes);
      this.turntable.draw();
    });
    
    // 清空奖品
    document.getElementById('clearPrizeBtn').addEventListener('click', () => {
      if (confirm('确定要清空所有奖品吗？')) {
        this.config = this.configManager.clearPrizes(this.config);
        this.updatePrizeList();
        this.turntable.updatePrizes(this.config.prizes);
        this.turntable.draw();
      }
    });
    
    // 导入奖品
    document.getElementById('importPrizeBtn').addEventListener('click', () => {
      this.openModal(this.elements.importModal);
    });
    
    // 导入确认
    document.getElementById('importConfirmBtn').addEventListener('click', () => {
      const text = document.getElementById('importText').value.trim();
      if (text) {
        const names = text.split('\n').map(name => name.trim()).filter(name => name && name.length <= 10);
        if (names.length > 0) {
          this.config = this.configManager.importPrizes(this.config, names);
          this.updatePrizeList();
          this.turntable.updatePrizes(this.config.prizes);
          this.turntable.draw();
          this.closeImportModal();
        }
      }
    });
    
    // 奖品编辑器事件
    this.bindPrizeEditorEvents();
    
    // 保存配置（不关闭对话框）
    document.getElementById('saveConfigBtn').addEventListener('click', async () => {
      // 如果有正在编辑的奖品，先保存编辑区域的修改
      if (this.editingPrizeId) {
        const name = document.getElementById('prizeName').value.trim();
        const weight = parseInt(document.getElementById('prizeWeight').value) || 10;
        const maxWins = parseInt(document.getElementById('prizeMaxWins').value) || 1;
        
        if (!name) {
          alert('请输入抽奖名称');
          return;
        }
        
        this.config = this.configManager.updatePrize(this.config, this.editingPrizeId, {
          text: name,
          icon: this.selectedIcon || '🎁',
          color: this.selectedColor || '#e74c3c',
          weight: weight,
          maxWins: maxWins
        });
        this.updatePrizeList();
        this.turntable.updatePrizes(this.config.prizes);
        this.turntable.draw();
        this.hidePrizeEditor();
      }
      
      // 保存标题
      this.config.title = document.getElementById('configTitle').value.trim() || '幸运抽奖';
      this.elements.title.textContent = this.config.title;
      
      await this.saveConfig();
      alert('配置已保存！');
    });
    
    // 重置中奖次数（不重置配置列表）
    document.getElementById('resetConfigBtn').addEventListener('click', async () => {
      if (confirm('确定要重置所有中奖次数吗？\n\n这将把所有奖品的中奖次数清零，但不会改变奖品配置。')) {
        this.config = this.configManager.resetWinCounts(this.config);
        await this.saveConfig();
        this.updatePrizeList();
        alert('中奖次数已重置！');
      }
    });
  }

  /**
   * 绑定奖品编辑器事件
   */
  bindPrizeEditorEvents() {
    // 图标选择
    document.querySelectorAll('.icon-option').forEach(el => {
      el.addEventListener('click', (e) => {
        const icon = e.target.dataset.icon;
        document.getElementById('iconPreview').textContent = icon;
        this.selectedIcon = icon;
      });
    });
    
    // 颜色选择
    document.querySelectorAll('.color-option').forEach(el => {
      el.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        document.getElementById('colorPreview').style.background = color;
        this.selectedColor = color;
      });
    });
    
    // 注意：编辑区域的保存和取消按钮已移除
    // 用户编辑后需点击设置对话框底部的"保存"按钮来保存
  }

  /**
   * 更新界面
   */
  updateUI() {
    // 更新标题
    this.elements.title.textContent = this.config.title;
    
    // 更新模式指示器
    this.elements.modeIndicator.textContent = `模式: ${this.mode}`;
    
    // 更新用户指示器（如果存在）
    if (this.elements.userIndicator) {
      if (this.user) {
        this.elements.userIndicator.textContent = `用户: ${this.user}`;
        this.elements.userIndicator.style.display = 'inline';
      } else {
        this.elements.userIndicator.style.display = 'none';
      }
    }
    
    // 更新设置面板
    document.getElementById('configTitle').value = this.config.title;
    this.updatePrizeList();
    
    // 更新转盘
    this.turntable.updatePrizes(this.config.prizes);
    this.turntable.draw();
  }

  /**
   * 更新奖品列表
   */
  updatePrizeList() {
    const prizeList = document.getElementById('prizeList');
    prizeList.innerHTML = '';
    
    this.config.prizes.forEach(prize => {
      const item = document.createElement('div');
      item.className = 'prize-item';
      item.innerHTML = `
        <div class="prize-info">
          <span class="prize-icon" style="background: ${prize.color};">${prize.icon || ''}</span>
          <span class="prize-name">${prize.text}</span>
          ${prize.winCount > 0 ? `<span class="win-badge">${prize.winCount}次</span>` : ''}
        </div>
        <div class="prize-actions">
          <button class="edit-btn" data-id="${prize.id}">编辑</button>
          <button class="delete-btn" data-id="${prize.id}">删除</button>
        </div>
      `;
      
      // 编辑按钮
      item.querySelector('.edit-btn').addEventListener('click', () => {
        this.editPrize(prize.id);
      });
      
      // 删除按钮
      item.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm(`确定要删除「${prize.text}」吗？`)) {
          this.config = this.configManager.deletePrize(this.config, prize.id);
          this.updatePrizeList();
          this.turntable.updatePrizes(this.config.prizes);
          this.turntable.draw();
          await this.saveConfig();
        }
      });
      
      prizeList.appendChild(item);
    });
  }

  /**
   * 编辑奖品
   * @param {string} prizeId 奖品 ID
   */
  editPrize(prizeId) {
    const prize = this.config.prizes.find(p => p.id === prizeId);
    if (!prize) return;
    
    this.editingPrizeId = prizeId;
    this.selectedIcon = prize.icon;
    this.selectedColor = prize.color;
    
    document.getElementById('prizeName').value = prize.text;
    document.getElementById('prizeWeight').value = prize.weight || 10;
    document.getElementById('prizeMaxWins').value = prize.maxWins || 1;
    document.getElementById('iconPreview').textContent = prize.icon || '🎁';
    document.getElementById('colorPreview').style.background = prize.color || '#e74c3c';
    
    this.showPrizeEditor();
  }

  /**
   * 显示奖品编辑器
   */
  showPrizeEditor() {
    const editor = document.getElementById('prizeEditor');
    editor.style.display = 'block';
    // 自动滚动到编辑区域
    setTimeout(() => {
      editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /**
   * 隐藏奖品编辑器
   */
  hidePrizeEditor() {
    document.getElementById('prizeEditor').style.display = 'none';
    this.editingPrizeId = null;
    this.selectedIcon = null;
    this.selectedColor = null;
  }

  /**
   * 抽奖
   */
  async draw() {
    // 检查是否有可抽奖的奖品
    const availablePrizes = this.configManager.getAvailablePrizes(this.config);
    if (availablePrizes.length === 0) {
      alert('全部抽完，请重置抽奖结果重新开始。');
      return;
    }
    
    // 禁用按钮
    this.elements.drawBtn.disabled = true;
    this.elements.drawBtn.textContent = '抽奖中...';
    
    // 根据权重计算中奖结果
    const result = this.calculateResult(availablePrizes);
    
    // 找到中奖奖品在配置列表中的索引（用于转盘旋转定位）
    const targetIndex = this.config.prizes.findIndex(p => p.id === result.id);
    
    // 旋转转盘（传入索引）
    await this.turntable.spin(targetIndex);
    
    // 更新中奖次数
    const prizeIndex = this.config.prizes.findIndex(p => p.id === result.id);
    if (prizeIndex !== -1) {
      this.config.prizes[prizeIndex].winCount++;
    }
    
    // 显示结果
    this.showResult(result);
    
    // 保存配置
    await this.saveConfig();
    
    // 保存历史
    await this.storage.saveHistory({
      prize: result.text,
      icon: result.icon,
      mode: this.mode,
      user: this.user
    });
    
    // 恢复按钮
    this.elements.drawBtn.disabled = false;
    this.elements.drawBtn.textContent = '开始抽奖';
    
    // 更新奖品列表
    this.updatePrizeList();
  }

  /**
   * 根据权重计算中奖结果
   * @param {Array} prizes 可抽奖的奖品列表
   * @returns {Object} 中奖奖品
   */
  calculateResult(prizes) {
    // 计算总权重
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    
    // 随机选择
    let random = Math.random() * totalWeight;
    for (const prize of prizes) {
      random -= prize.weight;
      if (random <= 0) {
        return prize;
      }
    }
    
    // 如果没选中（理论上不会发生），返回最后一个
    return prizes[prizes.length - 1];
  }

  /**
   * 显示抽奖结果
   * @param {Object} prize 中奖奖品
   */
  showResult(prize) {
    const resultModal = this.elements.resultModal;
    resultModal.querySelector('.result-prize').textContent = prize.text;
    resultModal.querySelector('.result-prize').style.color = prize.color;
    resultModal.querySelector('.result-icon').textContent = prize.icon || '🎉';
    
    this.openModal(resultModal);
    
    // 3秒后自动关闭
    setTimeout(() => {
      this.closeModal(resultModal);
    }, 3000);
  }

  /**
   * 保存配置
   */
  async saveConfig() {
    const success = await this.configManager.saveConfig(this.config);
    if (!success) {
      console.error('配置保存失败');
      // 如果是服务端存储，提示用户
      if (this.configManager.isServerStorage()) {
        alert('配置同步失败，请检查网络连接');
      }
    }
  }

  /**
   * 打开弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  openModal(modal) {
    modal.classList.add('active');
  }

  /**
   * 关闭弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  closeModal(modal) {
    modal.classList.remove('active');
  }

  /**
   * 关闭所有弹窗
   */
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      this.closeModal(modal);
    });
    this.hidePrizeEditor();
  }

  /**
   * 关闭导入弹窗
   */
  closeImportModal() {
    this.closeModal(this.elements.importModal);
    document.getElementById('importText').value = '';
  }
}

// 初始化应用
const app = new LotteryApp();
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});