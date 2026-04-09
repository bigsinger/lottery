# 历史事件日志

> 记录重要事件和决策，追加式记录

---

## 2026-04-08

[2026-04-08 18:25] - Skill update: share-me v1.0.0 → v2.0.0
- 添加可执行脚本 `scripts/generate_guide.py`
- 修复路径引用（evolve目录已重组为"最佳进化实践"）
- 自动化流程：自动读取核心信息，无需手动指定路径
- 灵活性增强：支持命令行参数指定维度和输出路径
- 内容更新：从最新的MEMORY.md和技能索引获取信息
- 测试通过：成功生成学习指南，技能数量正确显示（26自建+30内置=56总）
- 技能数量：26 → 27（25自建 + 1三方 + 1内置）
- 健康度：91/100 ⭐⭐⭐⭐⭐

[2026-04-08 15:52] - Deleted 3 skills: schedule-manager, memory-validator, report-generator
- schedule-manager: 零使用频次，功能与cron技能完全重叠，实际定时任务由cron管理
- memory-validator: 零使用频次，MEMORY.md由Dream自动管理，不需要手动验证
- report-generator: 零使用频次，功能与weekly-report/diary技能重叠
- 技能数量：28 → 25（24自建 + 1三方 + 1内置）
- 更新文件：SKILL_INDEX.md、MEMORY.md

[2026-04-08 15:34] - Skill update: yidun-gongdan v4.0.0 → v5.0.0
- 核心改进：流水线式执行，每个产品完成后立即发送邮件
- 用户需求：每完成一个产品的工单分析后就生成MD文件，转换成HTML，发送邮件，这样每收到一个邮件就可以先让同事看着了
- 用户需求：每个产品的分析报告邮件是分开发送的，不能混合在一起
- 执行流程改进：产品A流水线完成后立即发送邮件 → 产品B流水线 → 产品C流水线
- 优势：同事可以先看到已完成的产品报告，提前开始工作；减少等待时间；每个产品的分析报告邮件分开发送
- 更新文件：SKILL.md、SKILL_INDEX.md、MEMORY.md

[2026-04-08 12:01] - User preference: tests new skills with real Zhihu article URLs
- Solution: zhihu-article-parser skill successfully fetches Zhihu articles without login, outputs Markdown format with automatic image downloading

[2026-04-08 12:05] - Skill update: zhihu-article-parser v1.0.0 → v1.1.0
- 添加大模型分析输出格式规范（与 zhihu-article-analyzer 保持一致）
- 添加核心观点和关键洞察的凝练规则
- 添加示例输出格式
- 更新 SKILL_INDEX.md 版本号和描述
- 核心改进：输出格式完全统一，两个技能的大模型分析输出格式保持一致
- 测试结果：知乎问题分析结果已按照统一格式输出

[2026-04-08 12:06] - 状态保存：技能更新完成，两个知乎技能输出格式统一

[2026-04-08 12:23] - Skill update: travel-blog v6.0.0 → v6.1.0
- 新增信息确认步骤：接收原始文字后先提取结构化信息让用户确认
- 必须提取的信息：日期、地点、人物、天气、时长、交通、主要事件、感悟
- 可选提取的信息：费用、餐饮、景点、坑点、装备
- 用户确认机制：信息正确→生成游记；需要修改→修正信息；需要补充→添加信息
- 核心改进：避免遗漏和错误，优化用户体验
- 更新文件：SKILL.md、SKILL_INDEX.md

[2026-04-08 12:42] - Skill update: claw-y-news v4.2.0 → v4.3.0
- opencli整合增强：整合opencli youtube search作为搜索备选方案
- 降级策略优化：增加搜索和字幕提取的降级策略说明
- 工具选择优先级：明确工具选择的优先级顺序（yt-dlp > opencli > youtube-watcher）
- opencli能力评估：评估opencli的YouTube命令可用性（只有search可用）
  - ✅ opencli youtube search：可用，返回JSON格式
  - ❌ opencli youtube video：不可用，报错"Failed to fetch"
  - ❌ opencli youtube transcript：不可用，报错"No captions available"
  - ❌ opencli youtube channel：不可用，报错"HTTP 400"
- 更新文件：SKILL.md、SKILL_INDEX.md
- 健康度：95/100（保持）

[2026-04-08 13:31] - User requested minimum time range of 12 hours for video search
- Time filtering was too strict: filtering by exact datetime excluded same-day videos; fixed by comparing dates only (ignoring time portion)
- yt-dlp search falls back to opencli when it fails or times out
- Script version updated to claw-y-news v4.3.1

[2026-04-08 13:35] - 学习进化：知识体系建设
- 学习来源：`F:/agent/liupiaopiao/reports/技能学习/每日快速学习_2026-04-07.md`
- 学习主题：知识体系建设（主题深度学习、知识图谱构建、原理理解、类比推理）
- 学习时长：15分钟

[2026-04-08 15:13] - Skill update: web-search v3.0.0 → v3.1.0
- 新增内容提取功能：opencli（优先）、requests（降级）两种提取方法
- 新增AI答案摘要功能：生成结构化提示词（核心摘要、关键观点、推荐链接、进一步建议）
- 新增批量内容提取支持：--max-extract参数控制提取数量
- 新增提取统计功能：记录成功/失败次数，分析提取效果
- 新增命令行参数：--extract、--summary、--max-extract、--extract-method
- 新增文件：content_extractor.py（内容提取模块）
- 更新文件：web_search.py、SKILL.md、SKILL_INDEX.md
- 测试结果：✅ 内容提取成功（opencli提取python.org）、✅ AI摘要提示词生成成功
- 健康度：90/100

[2026-04-08 14:20] - 技能测试：agent-sec-news v2.1.0
- 测试内容：获取最近2天的Agent安全资讯
- 测试结果：✅ 成功
  - 搜索到9个安全资讯来源
  - 生成Markdown报告（5285字符）
  - 转换为HTML报告（安全主题样式）
  - 发送邮件到 pushebp@163.com
- 发现的安全资讯：
  - Claude Code CLI 三连CVE漏洞（Shell注入）
  - Chrome Gemini CVE-2026-0628（恶意扩展劫持）
  - FreeBSD CVE-2026-4747（AI Agent自主攻破内核）
  - VENOM-1首个AI Agent供应链攻击
  - OpenClaw ClawHub 386个恶意技能
  - Axios npm供应链攻击
  - OWASP Agentic AI Top 10 2026发布
  - Prompt Injection研究进展
- 报告保存：`F:/Agent/my-skills/agent-sec-news/reports/agent-sec-news_2026-04-08.md`
- 能力评估：4个方面都需要改进
- 实践计划：
  - 短期：知识图谱构建训练、主题深度学习实践、原理理解追问
  - 中期：建立知识关联机制、类比推理训练、知识体系框架完善
  - 长期：全面提升知识体系建设能力、建立完整的知识图谱、形成系统化的认知框架
- 更新文件：MEMORY.md（添加"知识体系建设"部分）
- 状态：✅ 学习进化完成

[2026-04-08 13:45] - 技能完善：solve-math（v2.1.0 → v3.0.0）
- 完善内容：
  - 新增画图方法详解（线段图、比较图、倍数图、分割图、流程图、时间轴）
  - 新增举一反三功能（每个示例添加1~3个巩固练习题目）
  - 优化讲解思路（使用更简单明晰的语言）
  - 强调画图重要性（在输出格式中新增"画图理解"部分）
  - 新增画图示例（为每个示例添加详细的画图说明）
  - 新增巩固练习答案（每个巩固练习题目都附带答案）
- 更新文件：SKILL.md、SKILL_INDEX.md
- 技能特色：画图辅助理解、举一反三巩固练习、小学生轻松掌握
- 状态：✅ 技能完善完成

[2026-04-08 13:40] - 技能删除：dream（用户手动删除）
- 更新文件：SKILL_INDEX.md、MEMORY.md
- 技能总数：32个 → 31个（29个自建技能 + 1个三方技能 + 1个内置技能）
- 状态：✅ 索引已更新

[2026-04-08 13:54] - 技能删除：security-bounty-manager（v1.0.0）
- 删除原因：
  - 零使用频次：创建13天以来从未被使用
  - 功能与用户角色不匹配：用户是内容创作者，不是安全研究人员
  - 无实际功能：漏洞报告无存储、奖励发放无支付能力
  - 无外部集成：没有连接任何漏洞赏金平台
  - 低优先级：用户已标记为低优先级
- 更新文件：SKILL_INDEX.md、MEMORY.md
- 技能总数：31个 → 30个（28个自建技能 + 1个三方技能 + 1个内置技能）
- 状态：✅ 技能删除完成

[2026-04-08 13:50] - 技能删除：resource-monitoring（v1.0.0）
- 删除原因：
  - 无实际功能：只输出模拟数据，没有真实监控能力
  - 零使用频次：创建11天以来从未被使用
  - 低优先级：用户已标记为低优先级
  - 占用空间：占用技能索引，增加维护负担
- 更新文件：SKILL_INDEX.md、MEMORY.md
- 技能总数：32个 → 31个（29个自建技能 + 1个三方技能 + 1个内置技能）
- 状态：✅ 技能删除完成

[2026-04-08 14:02] - 技能完善：agent-sec-news（v1.0.0 → v2.0.0）
- 完善内容：
  - 增加20+专业安全渠道，分类管理（专业安全研究博客、漏洞数据库、OWASP与安全标准、安全新闻与媒体、学术研究与论文、安全厂商博客、技术博客与社区、综合搜索渠道）
  - 增加漏洞数据库（AI Security Hub、CVE Details、NVD、CSA Agentic Catalog）
  - 增加OWASP Agentic AI Top 10跟踪（ASI-01到ASI-10）
  - 增加Prompt Injection攻击技术研究（间接Prompt Injection、多轮对话攻击、工具调用劫持）
  - 增加Agent安全风险5大核心关注领域（AI Agent漏洞与CVE、Prompt Injection攻击、OWASP Agentic AI Top 10、Agent供应链安全、Agent运行时安全）
  - 增加专业安全研究博客（Adversa AI、Palo Alto Networks Unit42、Microsoft Security Blog、Cisco AI Blog、Google DeepMind Research）
  - 增加学术研究渠道（arXiv、CVE-Bench、Emergent Mind）
  - 增加安全厂商博客（Protect AI、AppOmni、Tetrate、VulnerX）
  - 增加专门搜索关键词（漏洞相关、攻击技术相关、OWASP相关、威胁情报相关）
  - 优化报告结构（增加高危漏洞模块、OWASP动态模块、Prompt Injection研究模块）
  - 优化AI处理流程（增加高危漏洞优先搜索、OWASP动态搜索、攻击技术研究步骤）
- 更新文件：SKILL.md、SKILL_INDEX.md
- 技能特色：专业安全渠道、Agent安全风险与漏洞、OWASP Agentic AI Top 10、Prompt Injection攻击研究
- 状态：✅ 技能完善完成

[2026-04-08 14:12] - 技能完善：agent-sec-news（v2.0.0 → v2.1.0）
- 完善内容：
  - 增加Markdown转HTML功能（scripts/md_to_html.py）
  - 增加发送HTML邮件功能（使用imap-smtp-email技能）
  - 邮件地址从配置文件读取（F:/agent/liupiaopiao/config/mail_contacts_config.json）
  - HTML主题采用安全风格（红色/橙色渐变）
  - 支持响应式设计（桌面/平板/手机）
- 更新文件：SKILL.md、SKILL_INDEX.md、scripts/md_to_html.py
- 配置文件修复：mail_contacts_config.json修复为标准JSON格式（原文件使用单引号）
- 邮件收件人：从配置文件的mail_contacts.self.email字段读取（pushebp@163.com）
- 状态：✅ 技能完善完成

[2026-04-08 11:00] 执行每日英语学习任务（daily-english v6.1）。步骤1：修复progress.json格式问题（单引号改为双引号）；步骤2：运行generate_daily_english_v6.py脚本获取故事（短句：Rome wasn't built in a day.；故事：The Fox and The Stork，索引14，已学习15个，剩余131个）；步骤3：大模型翻译故事和寓意；步骤4：保存内容到F:/agent/liupiaopiao/reports/daily-english/每日英语学习_2026-04-08.md；步骤5：发送消息到飞书。任务完成，成功发送英语短句和寓言故事（狐狸和鹳），包含中英对照、词汇学习、语法重点、实用表达和学习建议。