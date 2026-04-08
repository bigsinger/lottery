# 🎯 幸运抽奖 - 可配置转盘抽奖程序

一个基于 HTML/CSS/JS 的转盘抽奖网页程序，支持个性化配置、本地存储、多模式切换。

## ✨ 特性

- 🎨 **可视化转盘** - Canvas 绘制，流畅旋转动画
- ⚙️ **可配置** - 自定义奖品、权重、颜色、图标
- 💾 **本地存储** - 配置永久保存在浏览器
- 🔄 **多模式** - URL 参数切换不同抽奖场景
- 📱 **响应式** - 支持桌面端和移动端
- 🚀 **零依赖** - 纯静态文件，无需后端

## 📦 快速开始

### 本地预览

1. 下载 `src` 目录
2. 双击打开 `index.html`
3. 即可开始使用

### 部署到虚拟主机

1. 将 `src` 目录下所有文件上传到服务器
2. 访问对应 URL 即可使用

### 多模式使用

通过 URL 参数切换不同抽奖模式：

```
https://your-domain.com/lottery/index.html?mode=team1
https://your-domain.com/lottery/index.html?mode=team2
https://your-domain.com/lottery/index.html?mode=kids_reward
```

每个模式拥有独立的配置存储。

## 🎮 功能说明

### 基本操作

- 点击「开始抽奖」按钮进行抽奖
- 转盘旋转后显示中奖结果
- 结果自动保存历史记录

### 配置设置

点击右上角「⚙」按钮打开设置面板：

- **标题修改** - 自定义抽奖标题
- **奖品管理** - 添加/编辑/删除奖品
- **权重设置** - 控制中奖概率
- **图标选择** - 12种预制图标
- **颜色选择** - 8种预制颜色

### 奖品属性

| 属性 | 说明 |
|------|------|
| 名称 | 奖品显示名称 |
| 图标 | 预制图标（可选） |
| 颜色 | 扇形背景颜色 |
| 权重 | 中奖概率倍数 |

## 📁 目录结构

```
lottery/
├── doc/                    # 文档目录
│   ├── 需求文档.md
│   ├── 设计文档.md
│   └── 使用说明.md
├── src/                    # 源码目录（部署此目录）
│   ├── index.html          # 主页面
│   ├── css/
│   │   ├── style.css       # 主样式
│   │   ├── turntable.css   # 转盘样式
│   │   └── modal.css       # 弹窗样式
│   └── js/
│       ├── utils.js        # 工具函数
│       ├── storage.js      # 存储管理
│       ├── config.js       # 配置管理
│       ├── turntable.js    # 转盘引擎
│       └── app.js          # 主程序
└── README.md               # 项目说明
```

## 🔧 技术栈

- **HTML5** - Canvas 绘制转盘
- **CSS3** - 动画和响应式布局
- **JavaScript** - 原生 ES6+
- **localStorage** - 永久本地存储

## 🌐 兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- 移动端浏览器

## 📝 数据结构

### 配置数据

```json
{
  "mode": "default",
  "title": "幸运抽奖",
  "prizes": [
    {
      "id": "abc123",
      "text": "一等奖",
      "icon": "🏆",
      "color": "#e74c3c",
      "weight": 1
    }
  ],
  "blacklist": [],
  "whitelist": [],
  "updatedAt": "2026-04-08T00:00:00.000Z"
}
```

### 本地存储 Key

- `lottery_config_{mode}` - 配置数据
- `lottery_history_{mode}` - 抽奖历史

## 📖 参考资料

- [GB-canvas-turntable](https://github.com/bigsinger/GB-canvas-turntable) - 原始参考项目

## 📜 License

MIT License

---

**版本**: v1.0.0
**更新日期**: 2026-04-08
**作者**: 柳飘飘