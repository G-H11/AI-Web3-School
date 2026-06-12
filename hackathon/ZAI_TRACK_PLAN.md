# Zai 赛道 Hackathon 完成计划

> **创建**: 2026-06-06 | **赛道**: z.ai（智谱 GLM-5 API）
> **提交截止**: 6/13 | **Demo Day**: 6/14
> **剩余**: 7 天 | **每天投入**: 2h+

---

## 一、赛道理解

z.ai 是智谱 AI 的免费 AI 平台，基于 GLM-5 模型。赛道要求：**使用 z.ai API 构建 AI 应用**，必须是 AI × Web3 结合方向。

### z.ai API 能力

| 能力 | 说明 |
|------|------|
| 对话生成 | GLM-5 多轮对话、推理、代码生成 |
| Function Calling | AI 调用外部工具 / 合约 |
| Coding Plan | 全栈代码生成（支持 Claude Code / Cursor 等） |
| Skills | 可安装技能扩展（类似 MCP） |
| 多模态 | 图片分析、视频分析 |

### 已选项目

**Vinothèque（酒藏）** — 酒业 NFT 吧台。详见 [`VINOTHEQUE_PLAN.md`](./VINOTHEQUE_PLAN.md)

---

## 二、阶段划分

```
Phase 0   Phase 1     Phase 2     Phase 3     Phase 4
研究设计   核心 MVP    前端+体验   打磨+Demo   提交
[Day1]    [Day2-3]    [Day4-5]   [Day6]      [Day7]
6/6       6/7-8       6/9-10     6/11-12     6/13
```

---

## 三、Phase 0：研究设计（Day 1 — 6/6 周六）⏱ ~2h

### 3.1 z.ai API 调研
- [ ] 注册 z.ai 账号，获取 API Key
- [ ] 阅读 API 文档，确认 Function Calling 支持情况
- [ ] 测试基本调用：`curl` 发送 prompt，验证返回
- [ ] 测试 Function Calling：定义 tool schema，验证 AI 能否正确调用

### 3.2 项目概念确定
- [ ] 确定项目名称和一句话描述
- [ ] 明确核心用户场景（谁、做什么、得到什么）
- [ ] 画出用户流程：用户输入 → z.ai 推理 → 合约调用 → 结果返回

### 3.3 技术选型
| 层 | 技术 |
|----|------|
| AI 推理 | z.ai GLM-5 API（Function Calling 模式） |
| 后端 | Python（FastAPI）或 Node.js（Express） |
| 合约 | Solidity（Foundry）— 复用 SafeAgent Wallet 的安全设计 |
| 前端 | Next.js + Tailwind（或纯 HTML 快速原型） |
| 部署 | Vercel（前端）+ 本地/服务器（后端） |

### 交付物
- [ ] `PROPOSAL.md` — 项目名称、问题、方案、技术栈、2 周路线

---

## 四、Phase 1：核心 MVP 编码（Day 2-3 — 6/7-8 周日/周一）⏱ ~4h

### 4.1 后端 Agent 服务
- [ ] 初始化项目结构 `hackathon/`
- [ ] 实现 z.ai API 调用层（封装 prompt、tool 定义、响应解析）
- [ ] 实现 Agent 主循环：用户意图 → z.ai 推理 → 生成交易参数 → 返回
- [ ] 实现 Function Calling tools 定义（至少 2 个工具，如 `swap`、`transfer`、`check_balance`）

### 4.2 智能合约（可选，取决于项目方向）
- [ ] 如果涉及链上交互，编写 1-2 个简单合约
- [ ] 合约测试（Foundry，至少 5 个 case）

### 4.3 最小可演示闭环
- [ ] 用户输入自然语言请求 → Agent 调用 z.ai 解析 → 执行动作 → 返回结果
- [ ] 验证端到端流程可用

### 交付物
- [ ] `README.md` — 项目介绍、架构图、本地运行步骤
- [ ] 后端服务代码可运行
- [ ] 1 个端到端演示视频片段（30s）

---

## 五、Phase 2：前端 + 体验优化（Day 4-5 — 6/9-10 周二/周三）⏱ ~4h

### 5.1 前端界面
- [ ] 聊天界面：用户输入框 + 对话历史 + Agent 响应
- [ ] 钱包连接（RainbowKit / wagmi）
- [ ] 执行状态展示（pending → confirmed → done）
- [ ] 交易历史列表

### 5.2 体验打磨
- [ ] 错误处理：API 失败、链上 revert 的用户友好提示
- [ ] 加载状态：AI 思考中的动画（"z.ai is thinking..." ）
- [ ] 响应式适配（移动端也要能演示）

### 交付物
- [ ] 前端可访问（Vercel 部署或本地 localhost）
- [ ] 完成一个完整交互流程的录屏

---

## 六、Phase 3：打磨 + Demo 准备（Day 6 — 6/11-12 周四/周五）⏱ ~4h

### 6.1 质量打磨
- [ ] 边界情况处理（余额不足、权限不足、网络切换）
- [ ] 安全审查（Prompt Injection 防护、合约权限检查）
- [ ] 代码清理 + 注释

### 6.2 Demo 准备
- [ ] Demo 脚本（3 分钟：问题 → 方案 → 演示 → 亮点）
- [ ] Demo 视频录制（如果线上演示出问题，有备份视频）
- [ ] Slide / Pitch Deck（5 页以内：Problem / Solution / Demo / Tech / Future）

### 6.3 文档
- [ ] `README.md` 完善（架构图、Quick Start、技术亮点）
- [ ] 合约部署地址 + 验证链接（如果部署到测试网）

### 交付物
- [ ] Demo 脚本
- [ ] Demo 视频
- [ ] 完善的 README

---

## 七、Phase 4：提交（Day 7 — 6/13 周六）⏱ ~2h

### 7.1 提交清单检查
- [ ] 代码仓库公开（GitHub）
- [ ] README 完整
- [ ] Demo 视频上传（YouTube / Bilibili）
- [ ] 提交表单填写（项目名称、描述、链接、赛道）

### 7.2 最终验证
- [ ] 从零 clone + 运行，确保 README 步骤可用
- [ ] 所有外部链接可访问

---

## 八、风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| z.ai API 不稳定或限流 | 中 | 准备 fallback prompt 缓存；关键演示用预录制 |
| Function Calling 效果不佳 | 中 | 用 prompt engineering 补强；降级为纯文本解析 |
| 时间不够 | 高 | 优先保证最小闭环可演示，砍掉非核心功能 |
| 合约部署测试网失败 | 低 | 优先用本地 Anvil 演示 |

---

## 九、最小可交付定义（MVP）

如果时间极度紧张（只剩 3 天），按以下 MVP 保底：

```
MVP = 
  1 个聊天界面（输入框 + 对话）
  + z.ai API 调用（能返回有意义的回复）
  + 1 个链上动作（如查询余额 or 发送测试币）
  + README 说明
```

这个 3 天就能完成，且有差异化（z.ai + Web3 结合）。

---

## 十、参考资源

| 资源 | 链接 |
|------|------|
| z.ai 官网 | https://z.ai → https://chat.z.ai |
| z.ai API 文档 | https://z.ai （注册后查看 API 文档） |
| GLM-5 模型能力 | 搜索 "GLM-5 function calling" |
| SafeAgent Wallet 架构参考 | `notes/2026-06-03 SafeAgent Wallet 最小闭环架构.md` |
| Cobo 权限机制参考 | `notes/2026-06-03 黑客松赛道实战 — Cobo Agentic Wallet 开发全流程.md` |
