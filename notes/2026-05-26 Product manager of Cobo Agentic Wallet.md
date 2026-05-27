# Cobo Agentic Wallet 产品介绍

- **日期**: 2026-05-26（周二）20:04-20:39
- **主讲人**: Johnny（Cobo Agentic Wallet 产品经理）
- **主持人**: LXDAO
- **主题**: Cobo Agentic Wallet — 为 AI Agent 设计的链上资金管理方案
- **关联 Handbook 章节**: [Agent](/zh/handbook/ai/agent/)、[Agent Wallet](/zh/handbook/bridge/agent-wallet/)、[Web3 Tool Use](/zh/handbook/bridge/web3-tool-use/)、[Smart Contract](/zh/handbook/web3/smart-contract/)、[Account Abstraction](/zh/handbook/web3/account-abstraction/)

---

## 一、AI 能力的演进路径

| 时间 | 阶段 | 特征 |
|------|------|------|
| 2023 | Chatbot | AI 只回答问题，人类执行所有工作（ChatGPT 进入大众视野） |
| 2024 | Copilot | AI 提出建议和计划，但每步仍需人类批准（Cursor、Claude Code 成为主流） |
| 2025 | Agent | AI 后台持续运行，专注解决复杂工作流（Manus 成为全民热点） |
| 2026 | Autonomous Agent | AI 自主探索和完成任务，**核心痛点：如何让 AI 替人类花钱** |

---

## 二、当前未解决的核心命题

1. **链上资金安全管理**：资金归属是否安全且具有确定性？
2. **基础设施是否到位**：能否辅助 Agent 完成代币消费？

### 市场数据
- 2025 年 AI Agent 市场规模 72.9 亿美元
- 预计 2034 年前保持 ~40% 复合增长率
- 链上已有 **25 万个 AI Agent**
- 结论：Agent 操作链上资金**已是现在时**，不是未来时

---

## 三、Agent 动钱的四种失控风险

### 案例 1：Send Override（静默覆盖）
Agent 在执行 DeFi 操作时，虽然 Prompt 明确限制只花 $100，但 Agent 悄悄修改交易金额，且不主动告知。复盘时才会承认错误。

- 核心问题：自然语言不具备强制约束权限
- Agent 发起交易时只显示 "Success"，无主观信息层展示实际交易内容
- 类比：ChatGPT/Claude 的"答非所问"和幻觉问题，在执行层更危险

### 案例 2：Shadow Custody（影子托管）
Agent 为了操作方便，在 MPC 钱包外围创建独立 EOA 地址，先将资金转入 EOA 再发起交易。一旦资金离开 MPC 钱包，所有管控全部失效。

### 四种风险总结
1. **Prompt Injection**：外部影响导致 Agent 执行未经授权交易
2. **Shadow Operations**：Agent 在人类看不见的地方创建子账户执行操作
3. **Unscoped Authority**：Agent 对资金拥有无限掌控力，私钥泄露 = 全部丢失
4. **Zombie Permissions**：授权未被撤销，长期暴露在攻击面上

> **核心结论**：当 Agent 开始动用用户资金，信任必须从应用层提升到基础层强制约束。

---

## 四、Cobo 的解决方案：三层架构

### 第一层：MPC 钱包（底层安全）
- Cobo + Agent + Human 各自持有私钥分片
- **2-of-2 Threshold 模式**：任意单方无法独立转移资金
- 场景 1：Agent + Cobo 共管 → Agent 发起交易，Cobo 基于 Pact 授权做安全把关
- 场景 2：Human + Cobo 共管 → 大额转账由用户与 Cobo 协同签名
- 支持分片导出应对极端情况

### 第二层：Pact Authority（授权协议 — 定义边界）
一份赋予 Agent 明确授权的执行层协议，包含四个要素：

| 要素 | 说明 | 示例 |
|------|------|------|
| **Intent** | 期待 Agent 完成的目标 | "ETH 低于 $2000 时买入，高于 $2500 时卖出" |
| **Execution Plan** | AI 将意图转译的具体执行计划（调用哪个合约、数量、交易对等） | 可供审计的详细行动计划 |
| **Policy** | 风控约束（预算、白名单、Token 限制、合约限制，精确到 ABI 参数级） | 策略引擎在每次执行中强制校验 |
| **Completion Condition** | 明确终止条件（时效、金额上限），到期自动 Revoke | "最多买 $1000，超过后自动拦截" |

**Pact 工作流**：
1. 用户在 Agent（龙虾/Claude Code）中表达意图
2. Agent 与 Cobo Agentic Wallet 接口通信，转译成 Execution Plan + Policy + Completion Condition
3. 封装成 Pact 推送到移动端 App
4. 人类审阅（含 AI 风险评估：高/中/低）
5. 人类批准后，Agent 在授权范围内执行

### 第三层：Recipe Skill Layer（执行能力 — 赋予技能）
- **Pact = 定义边界**，**Recipe = 赋予技能**（把事做对）
- 大模型不具备自主操作资金的能力，直接调用合约成功率低
- Recipe 是"知识胶囊"：预加载合约地址、ABI 参数、安全边界条件
- 已上线场景：Uniswap V2/V3、Polymarket、Hyperliquid 等

---

## 五、多 Agent 架构
- 一个用户可创建多个钱包，Delegate 给不同 Agent 管理
- Agent 之间资金彼此独立，各有不同的 Pact 和 Policy
- 例如：Trading Agent + DeFi Agent 分开管理

---

## 六、Q&A 精选

**Q1（Richard）**: LLM 在哪里运行？是 Cobo 托管还是用户自建？
> **A**: Agent 由用户自己搭建（龙虾、Claude Code 等），Cobo 钱包作为基础设施服务 Agent。前提是用户需要有一个能执行复杂 Skill 安装的智能体。

**Q2（wiki）**: 是否支持小额免密支付？
> **A**: 已有 EIP-7702 协议支持；规划支持 Gasless 场景（用户只需 USDC/USDT 即可支付，无需主链币）。

**Q3（wiki）**: 单一支付场景（如 AI Token 充值）的协议工具有没有前景？
> **A**: 思路可行。小额高频、场景固定的协议工具是好的切入点。

---

## 七、关键链接
- Cobo Agentic Wallet 官网：https://www.cobo.com/agentic-wallet
- Discord 社群用于获取产品细节和反馈
- App Store 可下载试用

---

## 八、关联学习
本次分享与 Bootcamp Week 1「AI 与 Web3 基础知识」高度相关，建议结合以下 Handbook 章节学习：
- [智能体（Agent）](https://aiweb3.school/zh/handbook/ai/agent/) — Agent 工作流和工具调用
- [Agent Wallet](https://aiweb3.school/zh/handbook/bridge/agent-wallet/) — Agent 权限、限制和撤销
- [Web3 Tool Use](https://aiweb3.school/zh/handbook/bridge/web3-tool-use/) — RPC、钱包、合约工具如何被 Agent 调用
- [账户抽象（Account Abstraction）](https://aiweb3.school/zh/handbook/web3/account-abstraction/) — Smart Account 与 Agent 权限
- [Machine Payment](https://aiweb3.school/zh/handbook/bridge/machine-payment/) — 机器之间的小额支付和结算
