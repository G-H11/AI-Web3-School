# 每日交互记录 · Prompts

> 简化记录每次对话中用户提出的要求。
> 格式：`日期 时间 | 要求摘要`

## 2026-06-09

| 时间 | 要求摘要 |
|------|---------|
| 08:00 | Cron MORNING 模式自动触发 — 早晨规划（WCB 新版 Week 1-4 课程结构；Hackathon 距 6/13 截止仅剩 4 天；Phase 1 编码延迟 3 天） |

## 2026-06-08

| 时间 | 要求摘要 |
|------|---------|
| 21:00 | Cron EVENING 模式自动触发 — 晚间回顾（无早间规划；发现 Zoom 分享會 ZKP 转录；Phase 1 编码仍未启动，距提交截止 5 天） |

## 2026-06-07

| 时间 | 要求摘要 |
|------|---------|
| 08:00 | Cron MORNING 模式自动触发 — Hackathon Build Day 5 规划（Vinothèque Phase 1 核心 MVP 编码启动） |
| 21:00 | Cron EVENING 模式自动触发 — 晚间回顾（无当日用户交互，Phase 1 编码尚未启动，距提交截止 6 天） |

## 2026-06-06

| 时间 | 要求摘要 |
|------|---------|
| 08:00 | Cron MORNING 模式自动触发 — 每日学习规划（SafeAgent Wallet 编码 + Hackathon 双线策略） |
| 21:00 | Cron EVENING 模式自动触发 — 晚间回顾 + 打卡草稿（检测到策略调整：双线→单项目 Vinothèque） |

## 2026-06-05

| 时间 | 要求摘要 |
|------|---------|
| 08:00 | Cron MORNING 模式自动触发 — 每日学习规划 |
| 21:00 | Cron EVENING 模式自动触发 — 晚间回顾 + 打卡草稿 + 整理两场 Zoom 会议笔记 |

## 2026-06-04

| 时间 | 要求摘要 |
|------|---------|
| 08:00 | Cron MORNING 模式自动触发 — 每日学习规划 |
| 21:00 | Cron EVENING 模式自动触发 — 晚间回顾 + 打卡草稿 + Flux 会议笔记整理 |
| 21:20 | 开发 Hackathon NFT Collection DApp：以太坊 NFT 馆藏，ERC-721/721A/1155 三种标准，Scaffold-ETH 2 + Foundry + Next.js + Viem/Wagmi + Tailwind + shadcn/ui，含铸造/展示/详情/浏览/购买/后台管理，IPFS+Pinata 存储 |



## 2026-05-26

| # | 要求 |
|---|------|
| 1 | 执行昨天配置的每日打卡系统 |
| 2 | 纠正时间错误（实际 06:35 非 14:34） |
| 3 | 现在是 Week 2 不是 Week 1，重新匹配日期和任务，修改 daily note |
| 4 | 检查 `E:\文档\Zoom\` 下会议转录，整理为会议笔记存到 `notes/`，命名：日期+会议名 |
| 5 | 确认会议笔记格式为 `.md` |
| 6 | Week 2 Module A：画 AI×Web3 问题地图（≥6方向，含 AI 作用+Web3 机制），选 2 方向说明交叉性，选 1 方向为 Week 2 主线 |
| 7 | 建立 `prompts/` + `logs/` 目录，每次对话简化记录问题和回答，各一个 `.md` 文件累积 |

## 2026-05-27

| # | 要求 |
|---|------|
| 1 | 比较 EOA、智能账户、多签账户的权限差异（≥4 维度），说明安全边界和适用场景 |
| 2 | 以 .md 格式存到 notes/，同时更新 prompts/logs，以后不用每次提醒 |
| 3 | Week 2 Module B：设计 agent 完成任务并收款的完整商业流程（报价→验收→付款→仲裁），比较 x402 vs ERC-8183 |
| 4 | 画最小 AI×Web3 工作流（AI 生成合约→人工复核→钱包签名→测试网部署→区块浏览器验证），标注 AI/人/链边界和风险 |
| 5 | 设计受限 Web3 助手（DeFi 仓位健康检查）：输入输出示例、AI 可做与不可做的事、人工确认点、≥3 风险、验证方法 |
| 6 | 将 Zoom 转录 `2026-05-27 Neo-Cypherpunk & the Cultural Layers of Privacy` 整理为中文会议笔记 |
| 7 | 拆解 2 个 AI×Web3 项目：Virtuals Protocol 和 ORA/opAgent，分别分析 AI 部分、Web3 部分、可验证材料、个人判断 |

## 2026-05-28

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：执行每日早晨学习规划 |
| 2 | Week 2 Module C：选择熟悉 agent 写 Profile 草图（identity/capability/IO/协作/收费/验证/失败），加分题比较 MCP/A2A/ERC-8004/MPP 中两个 |
| 3 | Week 2 Module D：画 Agent 链上动作执行流程图（标注自动/人工）、设计 Agent Wallet 权限策略（预算/合约/动作/确认/撤销/日志/失败）、解释 ERC-4337/Safe/Guard 的重要性 |
| 4 | Week 2 Module F：为 Agent workflow 写 Threat Model（资产/权限/数据/工具调用/外部依赖/失败后果六维度）、设计「低风险自动/高风险人工」策略（风险分数=金额×操作×上下文×新鲜度）、加分题模拟 5 种攻击（注入/伪造/越权/上下文污染/RPC 中间人）测试基础设施层拦截效果 |
| 5 | Week 2 Module G：DAO Grants 流程拆解（七阶段×🤖/🤖→👤/👤/🗳️四阶标记）、设计 Proposal Summarizer + Meeting-to-Action Workflow + Contribution Tracker 三工具草图、标出 AI 总结 vs 人工/治理确认的结论边界 |
| 6 | Week 2 Module B 进阶：搭建 x402 + Cobo CAW 自主支付闭环 demo（架构图 + server.py + agent_client.py + pact_policy.json + audit_log.py + test_walkthrough.py），5 场景全部通过 |
| 7 | 📦 Week 2 总交付：方向深挖包 + 项目初步 Proposal（SafeAgent Wallet）— 含问题地图（6方向）、方向选择说明、问题拆解、Proposal（用户/场景/MVP/验证/风险/Week3计划）、参考资料（7条）、主方向深挖包（流程图+场景+反例+风险+验证计划）、方向Backlog（3个未选方向） |

## 2026-05-30

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：执行每日早晨学习规划（Week 3 周末巩固 + Hackathon 定向准备） |

## 2026-05-31

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：周日休整日学习规划（共学→黑客松过渡，等待 6/1 宣发） |

## 2026-06-01

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：Week 2 启动 — AI×Web3 交叉研究与方向选择，Hackathon 赛道确定 |
| 2 | Cron 定时触发 EVENING 模式：回顾今日学习，生成晚间摘要 + 打卡草稿 |

## 2026-06-02

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：Week 1 启动 — AI 与 Web3 基础知识，新一轮 Bootcamp 开营，整理 VC 分享会会议笔记 |

## 2026-06-03

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：Week 1 Day 3 — AI 与 Web3 基础知识 + Hackathon Build 第 1 天，整理 Hackathon Openday 会议笔记 |
| 2 | 提问：如果选择 Z.AI | Web3 × Long-Horizon Task 赛道，AI Agent 如何拆解复杂任务、持续调用工具、迭代修复、完成从需求到交付的 Web3 工作流 |
| 3 | 提问：画出 SafeAgent Wallet 项目最小闭环，包括用户输入、AI Agent 处理、Web3 机制、链上/SDK/工具调用、输出结果和验证材料 |
| 4 | 任务：围绕主方向选 2-3 个标准/协议/SDK/项目写阅读摘要（解决问题/边界/还缺什么） |
| 5 | 要求：更新打卡笔记草稿 |

## 2026-06-06

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 MORNING 模式：Week 3 Day 6 周末 Hackathon Build Day，SafeAgent Wallet MVP 编码启动日，整理未处理 6/3 Zoom 会议笔记 |

## 2026-06-12

| # | 要求 |
|---|------|
| 1 | Cron 定时触发 EVENING 模式：Hackathon Build Day 10，6/13 提交截止前一天，回顾 bar-fi 项目进展，生成打卡草稿 |
