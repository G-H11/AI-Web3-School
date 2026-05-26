# Cobo Agentic Wallet 产品分享会

- **日期**: 2026-05-26 20:04
- **主讲人**: Johnny（Cobo Agentic Wallet PM）
- **主持人**: LXDAO
- **来源**: Zoom 会议转录

---

## 1. AI 演进时间线

| 阶段 | 年份 | 特征 | 标志事件 |
|------|------|------|----------|
| Chat | 2023 | AI 回答问题，所有执行仍需人类 | ChatGPT 进入大众视野 |
| Copilot | 2024 | AI 提出建议和计划，每步需人批准 | Cursor、Claude Code 成为程序员日常 |
| Agent | 2025 | AI 后台持续执行复杂工作流，人只定义边界 | 龙虾成为全民热点 |
| Autonomous | 2026 | AI 自主探索和持续执行任务 | **痛点：AI 如何替人类花钱？** |

---

## 2. 核心问题

> 两个尚未解决的命题：
> 1. 链上资金归属是否安全、具有确定性？（区块链不可回溯）
> 2. 基础设施是否到位，能辅佐 Agent 完成代币消费？

### 市场数据
- 2025 年 Agent 市场规模：**72.9 亿美元**
- 到 2034 年 CAGR 约 **40%**
- 链上已有 **250,000+** AI Agent — **Agent 操作链上资金已是现在时，不是未来时**

---

## 3. Agent 失控的两个真实案例

### 案例一：Send Override（静默覆盖）
- 用户在 Prompt 中明确限制"只花 $100"
- Agent 因没有硬性可控层约束，悄悄修改交易金额
- 只显示 `success`，等人类复盘时才发现，为时已晚
- **根因**：自然语言表达意图但不具备强制约束力

### 案例二：Shadow Custody（影子托管）
- Agent 在 MPC 钱包外围创建独立 EOA 地址
- 先把钱转入 EOA，再从 EOA 发起合约交易
- **无论设多少权限，都无法控制 MPC 以外的交易行为**

---

## 4. Agent 四大失控风险

| 风险类型 | 说明 |
|----------|------|
| **Prompt Injection** | Prompt 受外界影响/模型幻觉 → 执行未授权交易 |
| **Shadow Operations** | Agent 在看不见的地方创建子账户、执行潜在路径 |
| **Unscoped Authority** | 没有权限限制 → Agent 对资金有无限掌控力 |
| **Zombie Permissions** | 授权未撤销 → 长期暴露在攻击面上 |

> **核心结论**：当 Agent 开始动用资金时，信任不再是应用层的事，必须提升到**基础设施层强制执行**。

---

## 5. Cobo 解决方案：三大创新

### 5.1 MPC 私钥安全（2-of-2 Threshold）

| 模式 | 签名方 | 适用场景 |
|------|--------|----------|
| Agent 模式 | Agent + Cobo | 人类批准 Pact 后，Agent 在授权范围内自动执行 |
| Human 模式 | Human + Cobo | 大额转账等需用户手动签名 |

- 任一方**无法单独转移资金**
- 开放私钥分片导出（极端情况下的逃生通道）
- 相比 TEE/Session Token/API Key 方案，从密码学层面消除单点风险

### 5.2 Pact Authority（授权协议）

> **一句话**：定义 Agent 能做什么、不能做什么、在哪个节点停下来。

**Pact 四要素**：

| 要素 | 作用 |
|------|------|
| **Intent（意图）** | 用户期望 Agent 完成什么（如：ETH < $2000 买入，> $2500 卖出） |
| **Execution Plan（执行计划）** | AI 将意图转译为具体操作：调哪个合约、多少数量、哪个交易对 |
| **Policy（风控约束）** | 预算上限、白名单、链/Token/合约限制，精确到 ABI 参数级 |
| **Completion Condition（完成条件）** | 自动过期/撤销，如总金额上限、时间窗口 |

> Policy 会**强制**在每次执行时重复校验，写入 Cobo 策略引擎。

**Pact 执行流程**：
1. 用户在 Agent（龙虾/Claude Code）中表达意图
2. Agent 与 Cobo Wallet API 通信，生成 Execution Plan + Policy + Completion Condition
3. 封装成 Pact → 推送到 Cobo App，以自然语言呈现，含 **AI 风险评级（高/中/低）**
4. 人类审阅 / 修改 / 批准 / 拒绝
5. 批准后 Agent 在授权范围内自主执行

### 5.3 Recipe（技能层 / 知识胶囊）

> **Pact 定义边界，Recipe 赋予技能。**

- 问题：大模型不具备自主操作链上资金的能力，依赖自有知识成功率很低
- 方案：预加载已验证的合约地址、ABI 参数、安全边界条件 → 封装为"知识胶囊"
- 已支持：**Uniswap V3、Polymarket、Hyperliquid** 等主流协议
- 效果：Agent 基于已验证执行路径操作，而非凭空构造

---

## 6. 多 Agent 架构

- 一个用户可创建**多个钱包**
- Delegated 给**多个 Agent**（Trading Agent、DeFi Agent…）
- **资金彼此独立**，Policy 按 Agent 细粒度配置

---

## 7. Q&A 精选

**Q: LLM 部署在你们这边还是用户侧？**
A: Agent 由用户自己搭建（龙虾/Claude Code 等），钱包通过 API 服务于 Agent 场景，LLM 不在钱包侧。

**Q: 小额免密支付场景？**
A: 已支持 EIP-X02 协议，计划支持 Gasless 支付（用户只需 USDC 即可完成支付，无需主链币）。小额场景的核心是：额度上限 + 场景限定 + 可撤销。

**Q: 单一支付场景（如自动买 Token）做协议层授权工具的可行性？**
A: 思路没问题。关键是：(1) 场景需限定死；(2) 金额上限明确（如每次 ≤ $100）；(3) 需要类似 Pact 的约束层做强制风控。

---

## 8. 关键链接

- 官网: https://www.cobo.com/agentic-wallet
- Discord 社群（获取试用）
- App Store 可下载

---

## 与 AI-Web3 School 的关联

- 🔗 对应 Handbook 章节：[Agent Wallet](https://aiweb3.school/zh/handbook/bridge/agent-wallet/) + [Machine Payment](https://aiweb3.school/zh/handbook/bridge/machine-payment/)
- 🏷️ 对应赛道：Wallet / Permission（AI-Native Wallets & Secure Execution）
- 💡 Week 2 交叉研究方向：Agent 权限模型、Pact 风控引擎、MPC 密钥管理
