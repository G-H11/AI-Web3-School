# 2026-06-02 Hackathon Openday — 赛制详解与赛道指南

> 📅 2026-06-02 20:00–21:30 | Zoom | 主讲：LXDAO 主持 + Z.AI (Hazel Wang) + Cobo (Brad Bao)

## 会议概要

AI×Web3 School 的共学阶段结束，正式进入两周 Hackathon 冲刺。本次 Openday 详细介绍了赛制、赛道要求、奖金分配、提交规范和评审标准。

---

## 一、Hackathon 时间线

| 日期 | 事件 |
|------|------|
| 6/2 | 🚀 Open Day（本次会议） |
| 6/2–6/12 | 🛠 Build 阶段 + 每日 Workshop + Office Hour |
| 6/13 12:00 | ⏰ 项目提交截止 |
| 6/14 | 🎤 Demo Day（5 分钟演示 + 评委问答） |
| 6/15–16 | 📋 赞助商内部评审 |
| 6/17 | 🏆 获奖公示 |
| 6/17 后 1-2 周 | 💰 奖金发放 |

---

## 二、两条赛道

### Track 1 — Cobo Agent Economy（总奖池 3500 USDT）

**核心主题**：Agent 如何管理资金、支付、交易、结算

**赛道要求**：
- 项目必须围绕资金操作场景
- 实现可运行的最小闭环（用户需求 → Agent 理解 → 权限边界 → 执行 → 验证）
- 必须使用 Cobo Agentic Wallet 完成至少一次真实链上资金操作
- 不能是纯概念 PPT，必须是可演示的 MVP

**Cobo 侧重点（Brad Bao）**：
> "Agent 开始参与真实经济活动时，问题不只是能不能完成任务，而是能不能在安全可控、可审计的边界内完成。"

- 回答三问：为什么一定需要 Agent？为什么必须是 Web3？为什么中心化做不到？
- 不追求宏大网络，把一个小闭环做透：一次支付、一笔交易、一次 A2A 协作
- 权限边界和安全是核心加分项

**评审维度**（50 分制）：
1. 创新性（10 分）
2. 技术实现（10 分）
3. 用户体验（10 分）
4. 生态影响（10 分）
5. 演示质量（10 分）

**Cobo 额外考核**：资金操作完整度、可演示性、风险边界说明

### Track 2 — Z.AI 开放赛道（总奖池 3500 USDT）

**核心主题**：AI Agent 完成复杂的 Web3 长周期任务（Long Horizon Tasks）

**Z.AI 三个建议方向**：
1. DevTools：Agent 辅助开发工具（调用多工具、迭代修复）
2. 3D World Builder：Agent 生成 3D 世界 + Web3 集成
3. Creator Economy：Agent 驱动的内容创作经济

**要求**：必须调用 GLM 模型，展示多步骤计划、工具调用、迭代修复、从需求到交付的完整工作流。

**GLM 模型亮点（Hazel Wang）**：
- GLM-5.1 是首个在 SWE-bench 上超越 OpenAI o4.6 的开源模型
- 8 小时自主执行：给 Agent 一个任务，去睡觉，醒来它已完成
- 参与 Hackathon 可申请新模型 Early Access

---

## 三、提交要求（通用）

| 要求 | 说明 |
|------|------|
| 可运行 MVP | 不能只交 PPT，必须有可演示的最小产品 |
| Demo 视频 | 建议提前录制（5 分钟以内），避免现场突发状况 |
| README | 清晰的运行说明、架构图、使用流程 |
| GitHub 开源 | 代码仓库公开可访问 |
| AI Agent 自主执行链路 | 从需求发现 → 计划 → 执行 → 验证 → 修复 → 交付 |

---

## 四、关键时间提醒（与 G-H11 相关）

| 时间 | 事件 | 重要性 |
|------|------|--------|
| **6/3（今晚）20:00** | **Cobo Agentic Wallet 专场 Workshop** | 🔴 必参加！技术专家手把手教学 |
| **6/3（今晚）19:00** | Office Hour（助教答疑） | 🟡 有问题可去 |
| 每晚 20:00–21:00 | 每日 Workshop（本周） | 🟡 选听 |

---

## 五、对 SafeAgent Wallet 项目的启示

1. **Cobo 赛道高度契合**：SafeAgent Wallet 天然属于 Agent Economy 赛道（支付 + 权限管理），与 Brad 强调的"权限边界、安全可控"完全对位。
2. **MVP 聚焦**：不追求宏大，跑通一个最小闭环——用户设定授权规则 → Agent 在边界内执行一次支付 → 结果可审计。
3. **今晚 Cobo Workshop 必须参加**：会手把手教如何使用 Cobo Agentic Wallet SDK，是 MVP 搭建的关键前置步骤。
4. **Demo 演示策略**：建议提前录制视频（避免现场网络/紧张），5 分钟内展示完整链路。
5. **评审加分项**：权限策略说明 + 风险边界分析 + Threat Model（已有！）→ 直接复用现有资产。

---

## 六、资源链接

- Hackathon 报名网站：见 LXDAO 群公告
- Cobo Agentic Wallet 文档：见 Hackathon 报名页参考资料
- Z.AI API 文档：见 Hackathon 报名页
- 社群入口：TG `@aiweb3school` / 微信加 `Lynn2024` 备注 "hackathon"
