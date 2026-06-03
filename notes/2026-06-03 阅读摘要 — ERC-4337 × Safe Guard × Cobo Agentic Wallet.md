# 2026-06-03 阅读摘要 — ERC-4337 × Safe Guard × Cobo Agentic Wallet

> 📅 2026-06-03 | 任务：围绕主方向选 3 个标准/协议/SDK，写阅读摘要（解决问题 / 边界 / 还缺什么）

---

## 一、ERC-4337 — Account Abstraction

### 解决的问题
EOA 私钥丢失=资产归零、无法设定花钱限额、每次要签名。ERC-4337 让智能合约成为"账户"，账户可编程。

### 边界
- EntryPoint 不可升级
- UserOp 不走 mempool → 依赖 Bundler（新中心化点）
- 跨链地址不同
- `validateUserOp` 本身的 bug = 私钥泄露

### 还缺什么
- Bundler 去中心化
- Session Key 创建/撤销/过期的统一标准
- 可验证的 Paymaster 链上策略
- Agent → Smart Account 的标准化桥接接口

---

## 二、Safe + Guard 框架

### 解决的问题
Safe Guard 提供了链上 `checkTransaction()` 钩子——交易执行前强制校验，无法绕过。是 Agent Wallet 安全模型的最后一道链上防线。

### 边界
- Guard 只能检查 calldata，不感知意图
- 只能设一个 Guard（多 Guard 需手动聚合）
- checkTransaction 有 gas 限制
- Guard 只能阻止（revert），不能自动修正参数

### 还缺什么
- Oracle 多源验证（目前单源投毒风险）
- Guard 分层标准（安全/业务分离）
- Agent 感知的 Guard（区分人/Agent 调用者）
- 可升级 Guard（不适合 Agent 频繁迭代策略）

---

## 三、Cobo Agentic Wallet SDK

### 解决的问题
封装 Agent 账户创建、链上操作、权限策略。MPC 密钥分片 = Agent 被攻破也拿不到完整私钥。

### 边界
- 以 EVM 为主
- 策略层在 Cobo 托管端（非自主）
- Guard 兼容性待验证
- 长期收费模型待确认

### 还缺什么
- 开放自定义 Policy 合约
- A2A 支付（Agent-to-Agent）
- 多 Agent 层级权限继承
- 对个人开发者的上手文档

---

## 三者关系

ERC-4337（账户可编程地基）→ Safe Guard（链上强制拦截墙）→ Cobo SDK（MPC密钥+策略屋顶）→ SafeAgent Wallet

## Workshop 待确认
1. SDK 自动集成 Guard 还是手动部署？
2. Policy Engine 规则能上链吗？
3. MPC 对 Hackathon 免费多久？
