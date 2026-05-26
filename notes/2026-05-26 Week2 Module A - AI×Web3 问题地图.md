# Week 2 Module A：AI × Web3 问题地图

> 基于 [Handbook Bridge 章节](https://aiweb3.school/zh/handbook/bridge/chain-aware-context/) + [Cobo 分享会](notes/2026-05-26%20Cobo%20Agentic%20Wallet%20产品分享会.md)

---

## 一、AI × Web3 问题地图（6 方向）

```
                          ┌─────────────────────────────────────────────────┐
                          │              AI × Web3 问题空间                   │
                          └─────────────────────────────────────────────────┘
                                                  │
        ┌─────────────┬─────────────┬─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ ①支付/  │  │ ②身份/  │  │ ③钱包/   │  │ ④隐私/   │  │ ⑤开发工具│  │ ⑥治理/   │
   │ 清算    │  │ 声誉    │  │ 权限     │  │ 安全     │  │ /工作流  │  │ 公共物品 │
   └────┬────┘  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
        │            │            │             │             │             │
   ┌────┴────┐  ┌────┴────┐  ┌───┴──────┐  ┌───┴──────┐  ┌───┴──────┐  ┌───┴──────┐
   │AI: 意图  │  │AI: 能力  │  │AI: 执行  │  │AI: 推理  │  │AI: 理解  │  │AI: 分析  │
   │→ 交易    │  │→ 信任    │  │→ 约束    │  │→ 验证    │  │→ 编排    │  │→ 协调    │
   │         │  │         │  │         │  │         │  │         │  │         │
   │W3: 结算  │  │W3: 凭证  │  │W3: 签名  │  │W3: 证明  │  │W3: 溯源  │  │W3: 共识  │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### ① Payment / Commerce / Settlement（支付·清算·商业）

| 维度 | 内容 |
|------|------|
| **核心问题** | Agent 之间如何完成服务发现 → 报价 → 支付 → 结算的闭环？ |
| **AI 作用** | 意图理解（用户说"帮我买 ETH"）、服务发现（匹配最优报价方）、自动协商（多 Agent 竞价）、任务拆解（复杂交易序列编排） |
| **Web3 机制** | Stablecoin 支付、x402 协议、小额免密支付（Micropayment）、链上结算（Settlement & Escrow）、Subscription 订阅、Budget 预算上限 |
| **Handbook 节点** | [Machine Payment](https://aiweb3.school/zh/handbook/bridge/machine-payment/) · [Settlement & Escrow](https://aiweb3.school/zh/handbook/bridge/settlement-and-escrow/) |
| **关键张力** | AI 擅长"理解想要什么"，Web3 保证"给了钱一定收到货"——两者之间缺少标准化接口 |

### ② Identity / Reputation / Capability / Interoperability（身份·声誉·能力·互通）

| 维度 | 内容 |
|------|------|
| **核心问题** | 当多个 Agent 互相调用时，谁是谁？谁能做什么？事后找谁？ |
| **AI 作用** | Agent Profile 生成（自然语言描述能力）、能力评估（Benchmark + 自报告）、A2A 协议（Agent-to-Agent 通信协商）、服务发现与匹配 |
| **Web3 机制** | DID / VC（去中心化身份与可验证凭证）、链上 Registry（能力注册表）、链上声誉（不可篡改的行为记录）、Ownership（Agent 归属权） |
| **Handbook 节点** | [Agent Identity](https://aiweb3.school/zh/handbook/bridge/agent-identity/) · [Agent Trust & Reputation](https://aiweb3.school/zh/handbook/bridge/agent-trust-and-reputation/) |
| **关键张力** | AI 的"能力"是概率性的、会变化的，而 Web3 的"凭证"是不变的——如何表达动态能力？ |

### ③ Wallet / Permission / Safe Execution（钱包·权限·安全执行）

| 维度 | 内容 |
|------|------|
| **核心问题** | Agent 能拿什么权限？出事时能不能一键冻结？ |
| **AI 作用** | 执行计划生成（Intent → Execution Plan）、风险预判（交易前 AI 风险评估，如 Cobo 的高/中/低风险标签）、上下文感知（读取链上状态后再决策） |
| **Web3 机制** | AA Wallet / Smart Account、Session Key（临时授权）、Policy（预算/白名单/合约/ABI 参数约束）、Guard（交易前后钩子）、Simulation（交易模拟）、Revocation（即时撤销） |
| **Handbook 节点** | [Agent Wallet](https://aiweb3.school/zh/handbook/bridge/agent-wallet/) · [Agent Workflow](https://aiweb3.school/zh/handbook/bridge/agent-workflow/) |
| **关键张力** | AI 需要"自由度"才能发挥价值，Web3 需要"强约束"才能保证安全——**授权粒度是核心设计空间** |

### ④ Privacy / Security / Sovereignty（隐私·安全·主权）

| 维度 | 内容 |
|------|------|
| **核心问题** | Agent 执行过程中，用户数据、链上身份、模型推理如何不被泄露或篡改？ |
| **AI 作用** | 推理过程保护（模型输入/输出隐私）、风险检测（Prompt Injection / Tool Abuse 实时识别）、异常行为告警 |
| **Web3 机制** | TEE（可信执行环境）、ZK / zkML（零知识证明模型推理）、Permission Isolation（权限沙箱）、Audit Log（不可篡改审计日志）、Key Safety（MPC 私钥分片） |
| **Handbook 节点** | [AI Security](https://aiweb3.school/zh/handbook/bridge/ai-security/) · [AI Privacy](https://aiweb3.school/zh/handbook/bridge/ai-privacy/) · [Verifiable AI](https://aiweb3.school/zh/handbook/bridge/verifiable-ai/) |
| **关键张力** | AI 推理需要"看见"数据才能工作，安全要求"尽量少看"——**信息最小化 + 可验证计算**是解法 |

### ⑤ Dev Tooling / Agent Workflow（开发工具·Agent 工作流）

| 维度 | 内容 |
|------|------|
| **核心问题** | 开发者如何让 Agent 理解合约、读写链上状态、编排多步交易？ |
| **AI 作用** | 合约理解（自然语言 → 合约交互）、代码生成（从意图到交易构造）、上下文编排（Chain-aware Context 注入 Agent）、工作流自动化（多步 DeFi 操作编排） |
| **Web3 机制** | RPC / Indexing（链上数据查询层）、ABI / Event（合约接口描述）、Transaction History（历史交易上下文）、Simulation（交易前模拟）、Citation（链上数据溯源引用） |
| **Handbook 节点** | [Chain-aware Context](https://aiweb3.school/zh/handbook/bridge/chain-aware-context/) · [Web3 Tool Use](https://aiweb3.school/zh/handbook/bridge/web3-tool-use/) |
| **关键张力** | AI 用自然语言理解世界，链上世界是字节码和哈希——**中间翻译层是瓶颈** |

### ⑥ Governance / Coordination / Public Goods（治理·协调·公共物品）

| 维度 | 内容 |
|------|------|
| **核心问题** | AI 如何辅助 DAO 治理、公共资源分配和跨组织协调？ |
| **AI 作用** | 提案摘要（复杂治理提案 → 可读摘要）、投票辅助（基于历史立场推荐）、公共资源分配优化（算法辅助 quadratic funding）、协作调度（多 DAO 协调） |
| **Web3 机制** | 链上投票（Snapshot / Governor）、声誉权重、资金托管（多签 / 时间锁）、透明执行（链上可审计） |
| **Handbook 节点** | [Governance AI](https://aiweb3.school/zh/handbook/bridge/governance-ai/) |
| **关键张力** | AI 的建议可能成为"隐形权威"——治理的核心是人的选择，AI 只能辅助不能替代 |

---

## 二、双方向深度分析：为什么不是纯 AI 也不是纯 Web3？

### 🅰️ 方向 ③：Wallet / Permission / Safe Execution

**为什么不是纯 AI 问题？**

AI 可以做到：
- 理解用户意图并生成 Execution Plan
- 对交易进行风险预判

AI **做不到**：
- **硬性阻止**一笔交易。Prompt "你不能花超过 $100" 是无约束力的自然语言——Agent 可以悄悄修改金额（Send Override）
- **物理隔离**资金。Agent 可以创建影子 EOA 绕过 MPC 钱包（Shadow Custody）
- 提供**不可伪造的审计记录**。LLM 的自报告不可信——它可能"承认错误"但钱已经没了

纯 AI 方案的本质问题是：**建议层和执行层是同一方**。需要引入**第三方策略引擎在链上强制校验**——这是 Web3 的领域。

**为什么不是纯 Web3 问题？**

Web3 可以提供：
- 多签 / MPC 确保私钥安全
- 链上 Policy 合约限制额度
- 交易模拟（Simulation）

Web3 **做不到**：
- **理解自然语言意图**。Policy 合约只能校验参数（amount < 100 USDC），无法判断"这笔交易是否符合用户的本意"
- **动态风险评估**。同一个合约调用，在牛市中安全、熊市中可能是 Rug——需要 AI 理解和判断上下文
- **跨协议工作流编排**。用户说"帮我把 ETH 换成 USDC 然后存入 Aave"，涉及 Uniswap swap + Aave deposit 两步——Web3 可以执行每一步，但无法理解"这两步是一件事"

纯 Web3 方案的盲区：**规则是死的，但攻击面是活的**。Prompt Injection、模型幻觉、社会工程——这些不是合约审计能覆盖的。

> **交叉点**：AI 提供"意图 → 执行计划"的智能，Web3 提供"执行计划 → 强约束"的安全。Pact（Cobo）是这个交叉点的典型实践。

---

### 🅱️ 方向 ⑤：Dev Tooling / Agent Workflow

**为什么不是纯 AI 问题？**

AI 可以做到：
- 理解 Solidity 源码并生成自然语言解释
- 从用户意图生成交易 calldata
- 自动编写测试和文档

AI **做不到**：
- **确权**。AI 说"这是 Uniswap V3 Router 合约"——谁担保这个地址没被篡改？
- **溯源**。链上数据是哈希和字节码，AI 可能产生幻觉引用不存在的交易
- **状态一致性**。AI 读到的链上状态是 2 个区块前的——如果此时有新交易改变了状态，AI 不知道

纯 AI 方案的问题：**它对链上世界没有真实的连接**，只能通过 API 间接读取，而 API 返回的数据可能不完整、过期或被中间人篡改。

**为什么不是纯 Web3 问题？**

Web3 可以提供：
- RPC + Indexing 提供原始链上数据
- ABI 描述合约接口
- 交易哈希可验证

Web3 **做不到**：
- **将原始数据转化为 Agent 可理解的上下文**。一个地址的 1000 笔交易历史 → Agent 需要的是"这个地址是一个 MEV Bot，最近 24h 盈利 $X"
- **跨合约语义理解**。"把 WETH 换成 USDC"涉及 approve + swap 两步，且 approve 的 spender 必须是正确的 Router 地址——Web3 只提供接口，不提供"这两步必须一起做"的语义
- **自然语言 → ABI 参数映射**。用户说"用 1 ETH 买尽可能多的 USDC"，AI 需要知道 Uniswap 的 `amountOutMin` 参数应该设为当前报价的 95%（滑点保护）——这不是合约能告诉你的

> **交叉点**：Chain-aware Context 是这个方向的基石——AI 负责"理解 + 编排"，Web3 负责"精确数据 + 可验证引用"。

---

## 三、Week 2 主线选择：③ Wallet / Permission / Safe Execution

### 选择理由

| 维度 | 说明 |
|------|------|
| **与 Cobo 分享会直接对齐** | 刚听完 Johnny 的产品分享，MPC + Pact + Recipe 三层架构是最新鲜的输入 |
| **与 Handbook 匹配** | 对应 [Agent Wallet](https://aiweb3.school/zh/handbook/bridge/agent-wallet/) + [Agent Workflow](https://aiweb3.school/zh/handbook/bridge/agent-workflow/)，有完整知识节点 |
| **与你背景匹配** | 你有 Hermes Agent 日常使用经验 + Solidity 开发经验，对"工具调用 + 权限边界"有直觉 |
| **问题定义清晰** | 四大风险（Prompt Injection / Shadow Ops / Unscoped Authority / Zombie Permissions）可直接作为后续拆解的起点 |
| **可实践** | 可以在 Hermes 上开发 Web3 Tool Use 插件 → 接入 Cobo Wallet API → 实现最小 Pact 流程 |

### 后续推进路线（Week 2+）

```
Week 2 主线: Wallet / Permission / Safe Execution
│
├── 拆解 1: 授权模型对比
│   Session Key vs MPC vs Pact Authority vs Smart Account Policy
│
├── 拆解 2: 风险面分析
│   Prompt Injection → Shadow Custody → Unscoped Authority → Zombie Permissions
│
├── 拆解 3: 最小实践
│   在 Hermes 上实现 Agent Wallet 工具调用 + Policy 校验
│
└── Proposal: Agent Wallet 插件 / 风控引擎设计
```

---

## 附录：Handbook 交叉引用

| 方向 | Bridge 章节 | 赛道 |
|------|------------|------|
| ① Payment | Machine Payment · Settlement & Escrow | Agentic Commerce |
| ② Identity | Agent Identity · Trust & Reputation · Verifiable AI | Verifiable Agents |
| ③ Wallet | Agent Wallet · Agent Workflow | Wallet / Permission |
| ④ Security | AI Security · AI Privacy · Verifiable AI | AI Security |
| ⑤ Dev Tooling | Chain-aware Context · Web3 Tool Use | Dev Tooling |
| ⑥ Governance | Governance AI | Governance |
