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
      resultModal: null
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
      // 使用防抖处理
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.turntable.resizeCanvas();
        this.turntable.draw(this.config.prizes);
      }, 200);
    });
    
    // 监听页面加载完成（确保图片等资源加载后重新计算尺寸）
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.turntable.resizeCanvas();
        this.turntable.draw(this.config.prizes);
      }, 100);
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 抽奖按钮
    if (this.elements.drawBtn) {
      this.elements.drawBtn.addEventListener('click', () => this.draw());
    }
    
    // 设置按钮
    if (this.elements.settingBtn) {
      this.elements.settingBtn.addEventListener('click', () => this.openSettingModal());
    }
    
    // 帮助按钮
    if (this.elements.helpBtn) {
      this.elements.helpBtn.addEventListener('click', () => this.openHelpModal());
    }
    
    // 关闭弹窗按钮
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        this.closeModal(modal);
      });
    });
    
    // 点击遮罩关闭弹窗
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
    
    // 保存配置按钮
    const saveBtn = document.getElementById('saveConfigBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveConfig());
    }
    
    // 重置配置按钮
    const resetBtn = document.getElementById('resetConfigBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetConfig());
    }
    
    // 添加奖品按钮
    const addPrizeBtn = document.getElementById('addPrizeBtn');
    if (addPrizeBtn) {
      addPrizeBtn.addEventListener('click', () => this.openPrizeEditor());
    }
    
    // 奖品编辑保存
    const prizeSaveBtn = document.getElementById('prizeSaveBtn');
    if (prizeSaveBtn) {
      prizeSaveBtn.addEventListener('click', () => this.savePrizeEdit());
    }
    
    // 奖品编辑取消
    const prizeCancelBtn = document.getElementById('prizeCancelBtn');
    if (prizeCancelBtn) {
      prizeCancelBtn.addEventListener('click', () => this.closePrizeEditor());
    }
    
    // 图标选择
    document.querySelectorAll('.icon-option').forEach(icon => {
      icon.addEventListener('click', (e) => this.selectIcon(e));
    });
    
    // 颜色选择
    document.querySelectorAll('.color-option').forEach(color => {
      color.addEventListener('click', (e) => this.selectColor(e));
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
  }

  /**
   * 执行抽奖
   */
  draw() {
    if (this.turntable.isSpinning) {
      return;
    }
    
    // 应用黑白名单过滤
    const filteredPrizes = this.configManager.applyFilters(this.config);
    
    if (filteredPrizes.length === 0) {
      alert('没有可抽奖的奖品，请检查黑白名单设置');
      return;
    }
    
    // 禁用按钮
    this.elements.drawBtn.disabled = true;
    
    // 计算中奖结果
    const targetIndex = Utils.weightedRandom(filteredPrizes);
    
    // 执行转盘动画
    this.turntable.spin(targetIndex, (prize) => {
      // 显示结果
      this.showResult(prize);
      
      // 保存历史
      this.storage.saveHistory({
        prize: prize.text,
        prizeId: prize.id
      });
      
      // 恢复按钮
      this.elements.drawBtn.disabled = false;
    });
  }

  /**
   * 显示中奖结果
   * @param {Object} prize 中奖奖品
   */
  showResult(prize) {
    const resultModal = this.elements.resultModal;
    if (!resultModal) return;
    
    // 更新结果内容
    const resultIcon = resultModal.querySelector('.result-icon');
    const resultPrize = resultModal.querySelector('.result-prize');
    
    if (resultIcon) {
      resultIcon.textContent = prize.icon || '🎉';
    }
    
    if (resultPrize) {
      resultPrize.textContent = prize.text;
    }
    
    // 显示弹窗
    this.openModal(resultModal);
    
    // 3秒后自动关闭
    setTimeout(() => {
      this.closeModal(resultModal);
    }, 3000);
  }

  /**
   * 打开设置弹窗
   */
  openSettingModal() {
    const modal = this.elements.settingModal;
    if (!modal) return;
    
    // 加载当前配置到表单
    this.loadConfigToForm();
    
    // 显示弹窗
    this.openModal(modal);
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
    
    // 黑白名单列表
    this.renderFilterList();
  }

  /**
   * 渲染奖品列表
   */
  renderPrizeList() {
    const prizeListEl = document.getElementById('prizeList');
    if (!prizeListEl) return;
    
    prizeListEl.innerHTML = '';
    
    this.config.prizes.forEach((prize, index) => {
      const prizeItem = document.createElement('div');
      prizeItem.className = 'prize-item';
      prizeItem.dataset.id = prize.id;
      
      // 检查黑白名单状态
      const isBlacklisted = this.config.blacklist && this.config.blacklist.includes(prize.id);
      const isWhitelisted = this.config.whitelist && this.config.whitelist.includes(prize.id);
      const statusBadge = isWhitelisted ? '<span style="color: #2ecc71; font-size: 12px;">[白名单]</span>' : 
                          isBlacklisted ? '<span style="color: #e74c3c; font-size: 12px;">[黑名单]</span>' : '';
      
      prizeItem.innerHTML = `
        <div class="prize-color" style="background: ${prize.color || Utils.getDefaultColor(index)}">
          ${prize.icon || ''}
        </div>
        <div class="prize-info">
          <div class="prize-name">${prize.text} ${statusBadge}</div>
          <div class="prize-weight">权重: ${prize.weight || 1}</div>
        </div>
        <div class="prize-actions">
          <button class="prize-btn prize-btn-edit" onclick="app.editPrize('${prize.id}')">编辑</button>
          <button class="prize-btn prize-btn-delete" onclick="app.deletePrize('${prize.id}')">删除</button>
        </div>
      `;
      
      prizeListEl.appendChild(prizeItem);
    });
  }

  /**
   * 渲染黑白名单列表
   */
  renderFilterList() {
    const filterListEl = document.getElementById('filterListContainer');
    if (!filterListEl) return;
    
    filterListEl.innerHTML = '';
    
    this.config.prizes.forEach((prize, index) => {
      const filterItem = document.createElement('div');
      filterItem.className = 'filter-item';
      filterItem.style.cssText = 'display: flex; align-items: center; padding: 8px; gap: 15px; border-bottom: 1px solid #eee;';
      
      const isBlacklisted = this.config.blacklist && this.config.blacklist.includes(prize.id);
      const isWhitelisted = this.config.whitelist && this.config.whitelist.includes(prize.id);
      
      filterItem.innerHTML = `
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${prize.color || Utils.getDefaultColor(index)}; display: flex; align-items: center; justify-content: center; font-size: 14px;">
          ${prize.icon || ''}
        </div>
        <div style="flex: 1; font-size: 14px;">${prize.text}</div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 3px; font-size: 12px; color: #e74c3c;">
            <input type="checkbox" class="blacklist-checkbox" data-prize-id="${prize.id}" ${isBlacklisted ? 'checked' : ''}>
            黑名单
          </label>
          <label style="display: flex; align-items: center; gap: 3px; font-size: 12px; color: #2ecc71;">
            <input type="checkbox" class="whitelist-checkbox" data-prize-id="${prize.id}" ${isWhitelisted ? 'checked' : ''}>
            白名单
          </label>
        </div>
      `;
      
      filterListEl.appendChild(filterItem);
    });
    
    // 绑定黑白名单勾选事件
    filterListEl.querySelectorAll('.blacklist-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleBlacklistChange(e));
    });
    
    filterListEl.querySelectorAll('.whitelist-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleWhitelistChange(e));
    });
  }

  /**
   * 处理黑名单勾选变化
   */
  handleBlacklistChange(e) {
    const prizeId = e.target.dataset.prizeId;
    const isChecked = e.target.checked;
    
    if (!this.config.blacklist) {
      this.config.blacklist = [];
    }
    
    if (isChecked) {
      // 添加到黑名单，同时从白名单移除
      if (!this.config.blacklist.includes(prizeId)) {
        this.config.blacklist.push(prizeId);
      }
      this.config.whitelist = this.config.whitelist.filter(id => id !== prizeId);
      
      // 取消对应的白名单勾选
      const whitelistCheckbox = document.querySelector(`.whitelist-checkbox[data-prize-id="${prizeId}"]`);
      if (whitelistCheckbox) {
        whitelistCheckbox.checked = false;
      }
    } else {
      // 从黑名单移除
      this.config.blacklist = this.config.blacklist.filter(id => id !== prizeId);
    }
    
    // 更新奖品列表显示
    this.renderPrizeList();
  }

  /**
   * 处理白名单勾选变化
   */
  handleWhitelistChange(e) {
    const prizeId = e.target.dataset.prizeId;
    const isChecked = e.target.checked;
    
    if (!this.config.whitelist) {
      this.config.whitelist = [];
    }
    
    if (isChecked) {
      // 添加到白名单，同时从黑名单移除
      if (!this.config.whitelist.includes(prizeId)) {
        this.config.whitelist.push(prizeId);
      }
      this.config.blacklist = this.config.blacklist.filter(id => id !== prizeId);
      
      // 取消对应的黑名单勾选
      const blacklistCheckbox = document.querySelector(`.blacklist-checkbox[data-prize-id="${prizeId}"]`);
      if (blacklistCheckbox) {
        blacklistCheckbox.checked = false;
      }
    } else {
      // 从白名单移除
      this.config.whitelist = this.config.whitelist.filter(id => id !== prizeId);
    }
    
    // 更新奖品列表显示
    this.renderPrizeList();
  }

  /**
   * 编辑奖品
   * @param {string} prizeId 奖品 ID
   */
  editPrize(prizeId) {
    const prize = this.config.prizes.find(p => p.id === prizeId);
    if (!prize) return;
    
    // 打开编辑弹窗
    this.openPrizeEditor(prize);
  }

  /**
   * 删除奖品
   * @param {string} prizeId 奖品 ID
   */
  deletePrize(prizeId) {
    if (this.config.prizes.length <= 1) {
      alert('至少需要保留一个奖品');
      return;
    }
    
    // 确认删除
    if (confirm('确定要删除这个奖品吗？')) {
      this.config = this.configManager.deletePrize(this.config, prizeId);
      this.renderPrizeList();
    }
  }

  /**
   * 打开奖品编辑弹窗
   * @param {Object} prize 现有奖品（编辑模式）或 null（添加模式）
   */
  openPrizeEditor(prize = null) {
    const editor = document.getElementById('prizeEditor');
    if (!editor) return;
    
    // 设置编辑模式
    this.editingPrizeId = prize ? prize.id : null;
    
    // 加载奖品数据
    const nameInput = document.getElementById('prizeName');
    const weightInput = document.getElementById('prizeWeight');
    const iconPreview = document.getElementById('iconPreview');
    const colorPreview = document.getElementById('colorPreview');
    
    if (nameInput) {
      nameInput.value = prize ? prize.text : '';
    }
    
    if (weightInput) {
      weightInput.value = prize ? (prize.weight || 1) : 1;
    }
    
    if (iconPreview) {
      iconPreview.textContent = prize ? (prize.icon || '') : '';
      iconPreview.dataset.icon = prize ? (prize.icon || '') : '';
    }
    
    if (colorPreview) {
      colorPreview.style.background = prize ? (prize.color || Utils.getDefaultColor(0)) : Utils.getDefaultColor(0);
      colorPreview.dataset.color = prize ? (prize.color || Utils.getDefaultColor(0)) : Utils.getDefaultColor(0);
    }
    
    // 显示编辑器
    editor.style.display = 'block';
  }

  /**
   * 关闭奖品编辑弹窗
   */
  closePrizeEditor() {
    const editor = document.getElementById('prizeEditor');
    if (editor) {
      editor.style.display = 'none';
    }
    this.editingPrizeId = null;
  }

  /**
   * 保存奖品编辑
   */
  savePrizeEdit() {
    const nameInput = document.getElementById('prizeName');
    const weightInput = document.getElementById('prizeWeight');
    const iconPreview = document.getElementById('iconPreview');
    const colorPreview = document.getElementById('colorPreview');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const weight = weightInput ? parseInt(weightInput.value) || 1 : 1;
    const icon = iconPreview ? iconPreview.dataset.icon : '';
    const color = colorPreview ? colorPreview.dataset.color : Utils.getDefaultColor(0);
    
    if (!name) {
      alert('请输入奖品名称');
      return;
    }
    
    const prizeData = {
      text: name,
      weight: weight,
      icon: icon,
      color: color
    };
    
    if (this.editingPrizeId) {
      // 编辑模式
      this.config = this.configManager.updatePrize(this.config, this.editingPrizeId, prizeData);
    } else {
      // 添加模式
      this.config = this.configManager.addPrize(this.config, prizeData);
    }
    
    // 更新列表
    this.renderPrizeList();
    
    // 关闭编辑器
    this.closePrizeEditor();
  }

  /**
   * 选择图标
   * @param {Event} e 点击事件
   */
  selectIcon(e) {
    const icon = e.target.dataset.icon;
    const preview = document.getElementById('iconPreview');
    
    if (preview) {
      preview.textContent = icon;
      preview.dataset.icon = icon;
    }
    
    // 更新选中状态
    document.querySelectorAll('.icon-option').forEach(el => {
      el.classList.remove('selected');
    });
    e.target.classList.add('selected');
  }

  /**
   * 选择颜色
   * @param {Event} e 点击事件
   */
  selectColor(e) {
    const color = e.target.dataset.color;
    const preview = document.getElementById('colorPreview');
    
    if (preview) {
      preview.style.background = color;
      preview.dataset.color = color;
    }
    
    // 更新选中状态
    document.querySelectorAll('.color-option').forEach(el => {
      el.classList.remove('selected');
    });
    e.target.classList.add('selected');
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
    
    // 确保黑白名单已初始化
    if (!this.config.blacklist) {
      this.config.blacklist = [];
    }
    if (!this.config.whitelist) {
      this.config.whitelist = [];
    }
    
    // 保存配置
    if (this.configManager.saveConfig(this.config)) {
      // 更新界面
      this.updateUI();
      
      // 更新转盘
      this.turntable.updatePrizes(this.config.prizes);
      
      // 关闭弹窗
      this.closeModal(this.elements.settingModal);
      
      alert('配置已保存');
    } else {
      alert('配置保存失败，请检查浏览器是否支持 localStorage');
    }
  }

  /**
   * 重置配置
   */
  resetConfig() {
    if (confirm('确定要重置为默认配置吗？所有自定义设置将丢失。')) {
      this.config = this.configManager.resetConfig();
      
      // 更新界面
      this.updateUI();
      this.loadConfigToForm();
      
      // 更新转盘
      this.turntable.updatePrizes(this.config.prizes);
      
      // 关闭弹窗
      this.closeModal(this.elements.settingModal);
      
      alert('配置已重置');
    }
  }

  /**
   * 打开帮助弹窗
   */
  openHelpModal() {
    const modal = this.elements.helpModal;
    if (modal) {
      this.openModal(modal);
    }
  }

  /**
   * 打开弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  openModal(modal) {
    if (modal) {
      modal.classList.add('active');
    }
  }

  /**
   * 关闭弹窗
   * @param {HTMLElement} modal 弹窗元素
   */
  closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

// 创建全局实例
let app;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  app = new LotteryApp();
  app.init();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LotteryApp;
} else {
  window.LotteryApp = LotteryApp;
}