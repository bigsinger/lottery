/**
 * 主程序入口
 * 抽奖应用核心逻辑
 */

class LotteryApp {
  /**
   * 构造函数
   */
  constructor() {
    this.mode = Utils.getUrlParam('mode') || 'default';
    this.configManager = new ConfigManager(this.mode);
    this.storage = new StorageManager(this.mode);
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
  init() {
    // 加载配置
    this.config = this.configManager.getConfig();
    
    // 获取 DOM 元素
    this.getElements();
    
    // 初始化转盘
    this.initTurntable();
    
    // 绑定事件
    this.bindEvents();
    
    // 更新界面
    this.updateUI();
    
    console.log(`抽奖应用初始化完成，模式: ${this.mode}`);
  }

  /**
   * 获取 DOM 元素
   */
  getElements() {
    this.elements.title = document.getElementById('title');
    this.elements.canvas = document.getElementById('turntableCanvas');
    this.elements.drawBtn = document.getElementById('drawBtn');
    this.elements.modeIndicator = document.getElementById('modeIndicator');
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
    if (!this.elements.canvas) {
      console.error('Canvas 元素不存在');
      return;
    }
    
    this.turntable = new Turntable(this.elements.canvas);
    
    // 延迟绘制，确保容器尺寸已计算
    setTimeout(() => {
      this.turntable.resizeCanvas();
      this.turntable.draw(this.config.prizes);
    }, 100);
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.turntable.resizeCanvas();
        this.turntable.draw(this.config.prizes);
      }, 200);
    });
    
    // 监听页面加载完成
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.turntable.resizeCanvas();
        this.turntable.draw(this.config.prizes);
      }, 100);
    });

    // 监听 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (this.turntable) {
          this.turntable.resizeCanvas();
          this.turntable.draw(this.config.prizes);
        }
      }, 50);
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 抽奖按钮
    if (this.elements.drawBtn) {
      this.elements.drawBtn.addEventListener('click', () => this.startDraw());
    }
    
    // 设置按钮
    if (this.elements.settingBtn) {
      this.elements.settingBtn.addEventListener('click', () => this.openSettingModal());
    }
    
    // 帮助按钮
    if (this.elements.helpBtn) {
      this.elements.helpBtn.addEventListener('click', () => this.openModal(this.elements.helpModal));
    }
    
    // 弹窗关闭按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        this.closeModal(modal);
      });
    });
    
    // 点击弹窗外部关闭
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
    
    // 添加奖品按钮
    const addPrizeBtn = document.getElementById('addPrizeBtn');
    if (addPrizeBtn) {
      addPrizeBtn.addEventListener('click', () => this.addPrize());
    }
    
    // 清空奖品按钮
    const clearPrizeBtn = document.getElementById('clearPrizeBtn');
    if (clearPrizeBtn) {
      clearPrizeBtn.addEventListener('click', () => this.clearPrizes());
    }
    
    // 导入奖品按钮
    const importPrizeBtn = document.getElementById('importPrizeBtn');
    if (importPrizeBtn) {
      importPrizeBtn.addEventListener('click', () => this.openImportModal());
    }
    
    // 导入确认按钮
    const importConfirmBtn = document.getElementById('importConfirmBtn');
    if (importConfirmBtn) {
      importConfirmBtn.addEventListener('click', () => this.confirmImport());
    }
    
    // 奖品保存按钮
    const prizeSaveBtn = document.getElementById('prizeSaveBtn');
    if (prizeSaveBtn) {
      prizeSaveBtn.addEventListener('click', () => this.savePrizeEdit());
    }
    
    // 奖品取消按钮
    const prizeCancelBtn = document.getElementById('prizeCancelBtn');
    if (prizeCancelBtn) {
      prizeCancelBtn.addEventListener('click', () => this.cancelPrizeEdit());
    }
    
    // 配置保存按钮
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', () => this.saveConfig());
    }
    
    // 配置重置按钮
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    if (resetConfigBtn) {
      resetConfigBtn.addEventListener('click', () => this.resetWinCounts());
    }
    
    // 图标选择
    document.querySelectorAll('.icon-option').forEach(icon => {
      icon.addEventListener('click', (e) => this.selectIcon(e.target.dataset.icon));
    });
    
    // 颜色选择
    document.querySelectorAll('.color-option').forEach(color => {
      color.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
    });
  }

  /**
   * 更新界面
   */
  updateUI() {
    // 更新标题
    if (this.elements.title) {
      this.elements.title.textContent = this.config.title;
    }
    
    // 更新模式指示器
    if (this.elements.modeIndicator) {
      this.elements.modeIndicator.textContent = `模式: ${this.mode}`;
    }
    
    // 更新转盘
    if (this.turntable && this.config.prizes) {
      this.turntable.draw(this.config.prizes);
    }
  }

  /**
   * 打开设置弹窗
   */
  openSettingModal() {
    this.loadConfigToForm();
    this.openModal(this.elements.settingModal);
  }

  /**
   * 加载配置到表单
   */
  loadConfigToForm() {
    // 标题
    const titleInput = document.getElementById('configTitle');
    if (titleInput) {
      titleInput.value = this.config.title;
    }
    
    // 奖品列表
    this.renderPrizeList();
  }

  /**
   * 渲染奖品列表
   */
  renderPrizeList() {
    const prizeListEl = document.getElementById('prizeList');
    if (!prizeListEl) return;
    
    prizeListEl.innerHTML = '';
    
    if (this.config.prizes.length === 0) {
      prizeListEl.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">暂无奖品，请添加或导入</div>';
      return;
    }
    
    this.config.prizes.forEach((prize, index) => {
      const prizeItem = document.createElement('div');
      prizeItem.className = 'prize-item';
      prizeItem.dataset.id = prize.id;
      
      // 中奖次数显示（大于0时才显示）
      const winCountBadge = prize.winCount > 0 
        ? `<div style="background: #2ecc71; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 10px;">已抽${prize.winCount}次</div>` 
        : '';
      
      prizeItem.innerHTML = `
        <div class="prize-color" style="background: ${prize.color || Utils.getDefaultColor(index)}">
          ${prize.icon || ''}
        </div>
        <div class="prize-info">
          <div class="prize-name">${prize.text}</div>
          <div class="prize-weight">权重: ${prize.weight}% | 最大: ${prize.maxWins}次</div>
        </div>
        <div style="display: flex; align-items: center;">
          ${winCountBadge}
          <div class="prize-actions">
            <button class="prize-btn prize-btn-edit" onclick="app.editPrize('${prize.id}')">编辑</button>
            <button class="prize-btn prize-btn-delete" onclick="app.deletePrize('${prize.id}')">删除</button>
          </div>
        </div>
      `;
      
      prizeListEl.appendChild(prizeItem);
    });
  }

  /**
   * 添加奖品
   */
  addPrize() {
    this.editingPrizeId = null;
    
    // 显示编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'block';
    }
    
    // 清空表单
    document.getElementById('prizeName').value = '';
    document.getElementById('prizeWeight').value = '10';
    document.getElementById('prizeMaxWins').value = '1';
    
    // 设置默认图标和颜色
    this.selectIcon('🎁');
    this.selectColor(Utils.getDefaultColor(this.config.prizes.length));
  }

  /**
   * 编辑奖品
   * @param {string} prizeId 奖品 ID
   */
  editPrize(prizeId) {
    const prize = this.config.prizes.find(p => p.id === prizeId);
    if (!prize) return;
    
    this.editingPrizeId = prizeId;
    
    // 显示编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'block';
    }
    
    // 填充表单
    document.getElementById('prizeName').value = prize.text;
    document.getElementById('prizeWeight').value = prize.weight || 10;
    document.getElementById('prizeMaxWins').value = prize.maxWins || 1;
    
    // 设置图标和颜色
    this.selectIcon(prize.icon || '🎁');
    this.selectColor(prize.color || Utils.getDefaultColor(0));
  }

  /**
   * 删除奖品
   * @param {string} prizeId 奖品 ID
   */
  deletePrize(prizeId) {
    if (!confirm('确定要删除这个奖品吗？')) return;
    
    this.configManager.deletePrize(this.config, prizeId);
    this.renderPrizeList();
    
    // 隐藏编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
  }

  /**
   * 清空所有奖品
   */
  clearPrizes() {
    if (!confirm('确定要清空所有奖品吗？此操作不可撤销。')) return;
    
    this.configManager.clearPrizes(this.config);
    this.renderPrizeList();
    
    // 隐藏编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
  }

  /**
   * 打开导入弹窗
   */
  openImportModal() {
    const importText = document.getElementById('importText');
    if (importText) {
      importText.value = '';
    }
    this.openModal(this.elements.importModal);
  }

  /**
   * 关闭导入弹窗
   */
  closeImportModal() {
    this.closeModal(this.elements.importModal);
  }

  /**
   * 确认导入
   */
  confirmImport() {
    const importText = document.getElementById('importText');
    if (!importText) return;
    
    const text = importText.value.trim();
    if (!text) {
      alert('请输入抽奖名称列表');
      return;
    }
    
    // 解析输入（每行一个名称）
    const names = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length <= 10);
    
    if (names.length === 0) {
      alert('没有有效的抽奖名称，每行不超过10个字');
      return;
    }
    
    // 导入奖品
    this.configManager.importPrizes(this.config, names);
    this.renderPrizeList();
    
    // 关闭导入弹窗
    this.closeImportModal();
    
    // 隐藏编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
  }

  /**
   * 保存奖品编辑
   */
  savePrizeEdit() {
    const name = document.getElementById('prizeName').value.trim();
    const weight = parseInt(document.getElementById('prizeWeight').value) || 10;
    const maxWins = parseInt(document.getElementById('prizeMaxWins').value) || 1;
    
    // 验证
    if (!name) {
      alert('请输入抽奖名称');
      return;
    }
    
    if (weight < 0 || weight > 100) {
      alert('权重必须在 0-100 之间');
      return;
    }
    
    if (maxWins < 1) {
      alert('最大中奖次数必须大于 0');
      return;
    }
    
    // 获取选中的图标和颜色
    const iconPreview = document.getElementById('iconPreview');
    const colorPreview = document.getElementById('colorPreview');
    const icon = iconPreview ? iconPreview.textContent : '🎁';
    const color = colorPreview ? colorPreview.style.background : Utils.getDefaultColor(0);
    
    if (this.editingPrizeId) {
      // 更新现有奖品
      this.configManager.updatePrize(this.config, this.editingPrizeId, {
        text: name,
        icon: icon,
        color: color,
        weight: weight,
        maxWins: maxWins
      });
    } else {
      // 添加新奖品
      this.configManager.addPrize(this.config, {
        text: name,
        icon: icon,
        color: color,
        weight: weight,
        maxWins: maxWins,
        winCount: 0
      });
    }
    
    // 更新列表
    this.renderPrizeList();
    
    // 隐藏编辑器
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
  }

  /**
   * 取消奖品编辑
   */
  cancelPrizeEdit() {
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
    this.editingPrizeId = null;
  }

  /**
   * 选择图标
   * @param {string} icon 图标
   */
  selectIcon(icon) {
    const iconPreview = document.getElementById('iconPreview');
    if (iconPreview) {
      iconPreview.textContent = icon;
    }
    
    // 高亮选中的图标
    document.querySelectorAll('.icon-option').forEach(el => {
      el.style.background = el.dataset.icon === icon ? '#e0e0e0' : 'transparent';
    });
  }

  /**
   * 选择颜色
   * @param {string} color 颜色
   */
  selectColor(color) {
    const colorPreview = document.getElementById('colorPreview');
    if (colorPreview) {
      colorPreview.style.background = color;
    }
    
    // 高亮选中的颜色
    document.querySelectorAll('.color-option').forEach(el => {
      el.style.border = el.dataset.color === color ? '3px solid #333' : '2px solid transparent';
    });
  }

  /**
   * 开始抽奖
   */
  startDraw() {
    // 获取可抽奖的奖品列表
    const availablePrizes = this.configManager.getAvailablePrizes(this.config);
    
    if (availablePrizes.length === 0) {
      alert('没有可抽奖的奖品了！请重置中奖次数或添加更多奖品。');
      return;
    }
    
    // 根据权重选择奖品
    const targetPrize = this.selectPrizeByWeight(availablePrizes);
    const targetIndex = this.config.prizes.findIndex(p => p.id === targetPrize.id);
    
    // 开始旋转
    this.turntable.spin(targetIndex, (prize) => {
      // 更新中奖次数
      const prizeData = this.config.prizes.find(p => p.id === prize.id);
      if (prizeData) {
        prizeData.winCount = (prizeData.winCount || 0) + 1;
      }
      
      // 显示结果
      this.showResult(prize);
      
      // 保存配置
      this.configManager.saveConfig(this.config);
      
      // 更新转盘显示
      this.turntable.draw(this.config.prizes);
    });
  }

  /**
   * 根据权重选择奖品
   * @param {Array} prizes 奖品列表
   * @returns {Object} 选中的奖品
   */
  selectPrizeByWeight(prizes) {
    // 计算总权重
    const totalWeight = prizes.reduce((sum, p) => sum + (p.weight || 10), 0);
    
    // 如果有权重为100的奖品，直接返回
    const guaranteedPrize = prizes.find(p => p.weight === 100);
    if (guaranteedPrize) {
      return guaranteedPrize;
    }
    
    // 随机选择
    let random = Math.random() * totalWeight;
    for (const prize of prizes) {
      random -= (prize.weight || 10);
      if (random <= 0) {
        return prize;
      }
    }
    
    // 默认返回最后一个
    return prizes[prizes.length - 1];
  }

  /**
   * 显示抽奖结果
   * @param {Object} prize 奖品
   */
  showResult(prize) {
    const resultModal = this.elements.resultModal;
    if (!resultModal) return;
    
    const prizeEl = resultModal.querySelector('.result-prize');
    const iconEl = resultModal.querySelector('.result-icon');
    
    if (prizeEl) {
      prizeEl.textContent = prize.text;
    }
    
    if (iconEl) {
      iconEl.textContent = prize.icon || '🎉';
    }
    
    this.openModal(resultModal);
    
    // 3秒后自动关闭
    setTimeout(() => {
      this.closeModal(resultModal);
    }, 3000);
  }

  /**
   * 保存配置
   */
  saveConfig() {
    // 获取标题
    const titleInput = document.getElementById('configTitle');
    if (titleInput) {
      this.config.title = titleInput.value.trim() || '幸运抽奖';
    }
    
    // 保存配置
    if (this.configManager.saveConfig(this.config)) {
      // 更新界面
      this.updateUI();
      
      // 更新转盘
      this.turntable.updatePrizes(this.config.prizes);
      
      // 不关闭弹窗，只显示提示
      alert('配置已保存');
    } else {
      alert('配置保存失败，请检查浏览器是否支持 localStorage');
    }
  }

  /**
   * 重置中奖次数
   */
  resetWinCounts() {
    if (!confirm('确定要重置所有中奖次数吗？这将开始新一轮抽奖。')) return;
    
    this.configManager.resetWinCounts(this.config);
    this.renderPrizeList();
    
    // 更新转盘
    this.turntable.updatePrizes(this.config.prizes);
    
    // 不关闭弹窗
    alert('中奖次数已重置');
  }

  /**
   * 打开弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      
      // 重新绘制转盘（如果是设置弹窗）
      if (modal.id === 'settingModal') {
        setTimeout(() => {
          if (this.turntable) {
            this.turntable.resizeCanvas();
            this.turntable.draw(this.config.prizes);
          }
        }, 100);
      }
    }
  }

  /**
   * 关闭弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      
      // 隐藏奖品编辑器
      const editor = document.getElementById('prizeEditor');
      if (editor) {
        editor.style.display = 'none';
      }
    }
  }
}

// 创建全局实例
const app = new LotteryApp();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});