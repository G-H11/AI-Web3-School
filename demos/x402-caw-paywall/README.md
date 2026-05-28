# x402 Paywall + Cobo CAW Agent 自主支付闭环

> 📅 2026-05-28 | Week 2 Module B 进阶任务
> 🎯 展示 x402 保护的服务 → Agent 识别付款要求 → CAW 受限支付 → 获取服务 → 可审计记录

---

## 🏗️ 架构全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                   x402 + Cobo CAW 支付闭环                            │
└─────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │   Cobo CAW       │
                          │   (Agent Wallet) │
                          │                  │
                          │  ┌────────────┐  │
                          │  │ Pact Policy │  │  ← 预算/白名单/时间窗
                          │  │  · $0.01/次 │  │
                          │  │  · $1/天    │  │
                          │  │  · 仅 USDC  │  │
                          │  │  · 30天有效 │  │
                          │  └────────────┘  │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  3. CAW 执行 USDC transfer   │
                    │     (Pact 校验通过才放行)      │
                    └──────────────┬──────────────┘
                                   │
     ┌─────────────────┐          │          ┌─────────────────┐
     │  Agent Client   │          │          │  AI Service     │
     │  (消费方)        │          ▼          │  (服务提供方)    │
     │                 │  ┌──────────────┐   │                 │
     │ 1. 请求服务 ────►│  │   Blockchain  │◄──│ 2. 返回 402    │
     │                 │  │   (Testnet)   │   │    + 收款地址  │
     │ 4. 带 tx_hash   │  └──────────────┘   │    + 金额      │
     │    重试 ────────►│                     │    + nonce     │
     │                 │                     │                 │
     │ 5. 收到结果 ◄────│                     │ 5. 验证 tx     │
     │                 │                     │    → 返回结果  │
     └─────────────────┘                     └─────────────────┘

     ┌─────────────────┐                     ┌─────────────────┐
     │  Audit Logger   │◄────────────────────│  Audit Logger   │
     │  (消费方)        │   双向记录           │  (服务方)        │
     └─────────────────┘                     └─────────────────┘
```

---

## 📂 文件结构

```
demos/x402-caw-paywall/
├── README.md              ← 本文件：架构说明 + 流程 + 风险边界
├── server.py              ← 服务端：x402 paywall + AI 推理 API
├── agent_client.py        ← 消费端：Agent 识别 402 + CAW 支付 + 重试
├── pact_policy.json       ← Cobo CAW Pact 策略配置
├── audit_log.py           ← 审计日志模块（双方共用）
└── test_walkthrough.py    ← 端到端走通脚本（模拟链交互）
```

---

## 🔄 交互流程（详细）

```
步骤 1: Agent → 请求服务
  POST /api/v1/summarize
  Body: {"text": "long article...", "model": "gpt-4o-mini"}
  Header: (无 x402 相关头)

步骤 2: Server → 返回 402 Payment Required
  HTTP 402
  Header:
    X-402-Payment-Address: 0xServiceProvider...
    X-402-Payment-Amount: 1000000          # 1 USDC (6 decimals)
    X-402-Payment-Token: 0xUSDC...         # USDC on Base Sepolia
    X-402-Payment-Chain: 84532             # Base Sepolia chain ID
    X-402-Payment-Nonce: abc123...         # 唯一 nonce
    X-402-Payment-Deadline: 1716900000     # Unix timestamp

步骤 3: Agent → 检查 CAW Pact 策略
  ✅ 金额 $1 USDC ≤ 单次上限 $10 USDC
  ✅ 今日累计 $0 + $1 = $1 ≤ 每日上限 $100
  ✅ 收款地址 0xServiceProvider 在白名单
  ✅ USDC 是允许的 token
  ✅ 策略未过期 (有效期至 2026-06-28)
  → Pact 通过，允许支付

步骤 4: Agent → Cobo CAW 发起 USDC transfer
  → CAW 构建 UserOperation:
    to: 0xUSDC...
    data: transfer(0xServiceProvider, 1000000)
  → CAW 用 session key 签名
  → Bundler 提交到 Base Sepolia
  → 收到 tx_hash: 0xtxabc...

步骤 5: Agent → 带支付证明重试
  POST /api/v1/summarize
  Body: {"text": "long article...", "model": "gpt-4o-mini"}
  Header:
    X-402-Payment-Tx: 0xtxabc...
    X-402-Payment-Nonce: abc123...

步骤 6: Server → 验证支付
  → 查询链上 tx 状态: confirmed ✅
  → 验证收款地址 = 自己地址 ✅
  → 验证金额 ≥ 要求 ✅
  → 验证 nonce 未使用过 ✅
  → 验证 deadline 未过期 ✅

步骤 7: Server → 返回结果
  HTTP 200
  Body: {"summary": "This article discusses...", "model": "gpt-4o-mini"}

步骤 8: 双方写入审计日志
  Agent:  记录 {action: "pay_and_call", service, cost, tx_hash, result}
  Server: 记录 {action: "serve", client, nonce, tx_hash, cost}
```

---

## 🔐 风险边界

| 风险 | 缓解 | 在代码中的体现 |
|------|------|--------------|
| Agent 超额支付 | CAW Pact 硬限制：单次 $10、每日 $100 | `pact_policy.json` → `spending_limits` |
| Agent 向错误地址付款 | Pact 白名单：只能向 `allowed_recipients` 转账 | `pact_policy.json` → `allowed_recipients` |
| Nonce 重放攻击 | Server 记录已用 nonce，拒绝重复 | `server.py` → `_verify_payment()` |
| 付款后服务方不返回结果 | Deadline 机制 + 链上可查 | `server.py` → `deadline` 检查 |
| Agent 私钥泄露 | CAW 使用 session key，非主私钥 | `agent_client.py` → 通过 CAW SDK 签名 |
| 链上 tx 未确认就请求 | Server 检查 confirmations ≥ 1 | `server.py` → `_check_tx_status()` |
| 审计日志被篡改 | 双方独立记录 + 定期上链锚定 | `audit_log.py` → `merkle_root` |

---

## 🚫 故意不做的事（安全边界）

- ❌ Agent **不能**直接持有 USDC 私钥（通过 CAW）
- ❌ Agent **不能**超过 Pact 预算（CAW 合约层面拒绝）
- ❌ Server **不能**在未确认付款时返回结果
- ❌ Agent **不能**在 Pact 过期后继续支付
- ❌ 任何一方 **不能**单方面删除审计日志（仅追加）

---

## 🧪 测试方式

```bash
# 1. 启动服务端（模拟）
python server.py --port 8080 --chain base-sepolia

# 2. 运行端到端走通脚本
python test_walkthrough.py

# 3. 预期输出
# [Agent] 请求服务 → 收到 402 Payment Required
# [Agent] Pact 检查通过: $0.01 ≤ 单次上限 $10
# [Agent] CAW 发起支付 → tx_hash: 0xmock...
# [Agent] 带证明重试 → 收到结果: {"summary": "..."}
# [Audit] 写入日志: demos/x402-caw-paywall/audit/
```

---

## 📊 与 Module F Threat Model 的对齐

本 demo 覆盖了 Threat Model 中以下防御层：

| 防御层 | 本 demo 对应 |
|--------|-------------|
| L1: AI/LLM | ❌ 未覆盖（不是本次范围） |
| L2: Policy Engine | ✅ **Pact 预算/白名单/时间窗** |
| L3: Safe/Guard | ✅ **CAW 合约层面拒绝超额** |
| L4: 链上执行 | ✅ **nonce 防重放 + deadline** |

---

## 🔗 参考

- [x402 Protocol](https://github.com/x402-foundation/x402) — HTTP 402 支付标准
- [Cobo CAW Docs](https://www.cobo.com/agentic-wallet) — Agentic Wallet + Pact
- [ERC-8183](https://eips.ethereum.org/EIPS/eip-8183) — 大额托管结算（本 demo 用小额 x402）
- 本项目 `references/agent-commerce-protocols.md` — 协议速查
