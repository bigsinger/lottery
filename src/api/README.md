# API 目录

## 目录说明

此目录包含抽奖配置的 API 文件，用于实现多设备配置同步。

## API 文件

### Node.js API (`api.js`)

**适用环境**：Vercel、Netlify 等平台

**使用方法**：
1. 将 `api.js` 作为 Serverless Function
2. 确保 `../user/` 目录存在且可写
3. 通过 POST 请求调用 API

**请求格式**：
```json
{
  "action": "saveConfig|loadConfig|clearConfig|saveHistory|loadHistory|clearHistory",
  "user": "用户标识",
  "mode": "模式名称",
  "config": { /* 配置数据 */ },
  "historyResult": { /* 抽奖结果 */ }
}
```

**响应格式**：
```json
{
  "success": true,
  "config": { /* 配置数据 */ },
  "history": [ /* 抽奖历史 */ ]
}
```

## 支持的操作

| 操作 | 说明 | 请求参数 | 返回数据 |
|------|------|----------|----------|
| saveConfig | 保存配置 | user, mode, config | { success: true } |
| loadConfig | 加载配置 | user, mode | { success: true, config: {...} } |
| clearConfig | 清除配置 | user, mode | { success: true } |
| saveHistory | 保存历史 | user, mode, historyResult | { success: true } |
| loadHistory | 加载历史 | user, mode | { success: true, history: [...] } |
| clearHistory | 清除历史 | user, mode | { success: true } |

## 安全措施

- user 参数格式验证（只允许字母、数字、下划线、中划线）
- 配置数据完整性验证
- CORS 配置（允许跨域访问）
- 错误处理和日志记录

## 注意事项

- API 需要与前端配合使用
- 前端通过 URL 参数 `?user=xxx` 触发服务端存储
- 网络错误时前端会提示并使用本地缓存

## 纯前端模式

如果不使用服务端存储，可以直接打开 `index.html` 文件，使用 localStorage 进行本地存储。