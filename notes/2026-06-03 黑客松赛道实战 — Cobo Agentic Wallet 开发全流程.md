# 黑客松赛道实战 — Cobo Agentic Wallet 开发全流程

- **日期**: 2026-06-03（周三）20:02-21:07
- **主讲人**: Moon（孟老师）— Cobo Agentic Wallet 核心开发
- **主持人**: VV（LXDAO）
- **主题**: Cobo 赛道实战 — Agent Wallet 开发视角下的权限、安全与可验证流程
- **关联**: [SafeAgent Wallet MVP 架构设计](./2026-06-03%20SafeAgent%20Wallet%20最小闭环架构.md)

---

## 一、Cobo Wallet 环境与工具链

### 双环境架构

| 环境 | 用途 | 特点 |
|------|------|------|
| 正式环境（Production） | 上线使用 | App Store / Google Play 可下载 |
| 开发者环境（Dev） | 开发测试 | API 文档更完整（OpenAPI 自动生成），可"放肆"测试 |

### 核心组件

```
┌──────────────┐     ┌──────────────┐
│  cw binary   │────▶│  Cobo 后端   │  ← CLI / API 入口
│ (钱包客户端)  │     │   API 服务   │
└──────────────┘     └──────┬───────┘
                            │
┌──────────────┐            │
│  tss node    │◀───────────┘  ← MPC 签名节点
│ (TSS 签名)   │    必须运行，无法跳过
└──────────────┘
```

**关键理解**:
- `cw` binary：封装后端 API 调用，可用纯 API 替代（不装 cw 也行）
- `tss node`：MPC 多方计算签名节点，**必须运行**（即使走纯 API 也需要）
- MPC 钱包：私钥分片存储，单方无法完成签名 → 安全性提升
- Skills：安装在 Claude Code / Cursor 等 Agent 中，自动调用 Cobo 功能

### 支持的链
- ETH Sepolia（测试网）
- Base Sepolia（测试网）

---

## 二、Pact 权限策略机制（核心）

Pact 是 Cobo Agentic Wallet 的核心权限控制机制，定义了 Agent 可以做什么、有什么限制。

### Pact 创建流程

```
用户自然语言意图
      │
      ▼
Agent 解析意图 → 生成执行计划 → 申请权限（Policy 定义）
      │
      ▼
Cobo 手机 App 审核 ← 人类检查权限是否匹配原始意图
      │
      ▼
Pact 生效 → Agent 在约束内自主执行交易
```

### Pact 规则类型

| 规则 | 描述 | 示例 |
|------|------|------|
| 合约调用白名单 | 限制目标合约地址 | 只能调用 Uniswap V3 合约 |
| 转账金额限制 | rolling 24h 累计金额 | 24h 不超过 X ETH |
| 函数参数约束 | ABI 级别参数限制 | `recipient` 在白名单地址中 |
| 结束条件（时间） | Pact 有效期 | 1h / 1天 / 1年 |
| 结束条件（次数） | 最多执行次数 | 1次 / 100次 |

### Pact 的核心安全特性

1. **不可变性**：创建后不可修改，防止 hijack 后扩大权限
2. **自动失效**：到期或超过次数后自动作废 → 减少 API Key 泄露风险敞口
3. **人类审核**：每次 Pact 提交需要人在手机 App 上批准
4. **AI 洞察**：Cobo 服务端大模型分析 Pact 风险，提示用户潜在问题
5. **意图-权限不匹配检测**：Agent 说"帮你定投"却申请"转走全部资产"→ 人类拒绝

### Pact 的局限性（Hackathon 须知）

| 限制 | 详情 |
|------|------|
| 合约调用累计金额 | ❌ 暂不支持（需要模拟执行才能知道实际金额变化） |
| ABI 参数约束 | ⚠️ 部分支持（简单参数可用，数组/结构体可能有问题） |
| Pact 不可修改 | ⚠️ 需要创建新 Pact 替代旧 Pact（增加人工审核频次） |
| x402 payment 集成 | ❌ 与 Policy Engine 结合尚不完善 |
| Dry run | ⚠️ 功能存在但未完全放开，可能有 bug |

---

## 三、开发接入方式对比

| 方式 | 适用场景 | 需要安装 |
|------|----------|----------|
| **Skills（推荐）** | Agent 型产品（Claude Code / Cursor） | 仅安装 Skills |
| **CLI** | 脚本 / 自动化 / Web 服务 | `cw` binary |
| **纯 API** | 深度定制 / 后端集成 | `tss node` binary（必须） |

### API 接入流程

```
1. POST /api-keys        → 创建 API Key（后续所有请求的鉴权凭证）
2. POST /wallets         → 创建 MPC 钱包（group_type: agent）
3. 启动 tss-node         → 获取 node_id
4. 使用 wallet_id + node_id → 调用 pact / transaction 接口
```

---

## 四、Q&A 精要

### 测试流程
- Web3 vs Web2 测试**无本质区别**
- 开发环境测试通过 → 切生产环境域名即可
- 开发者环境可以"放肆"测试，不影响正式环境

### 技术支持渠道
- **Discord 群**（Cobo 产品大群）：24 小时有人值班
- 群内可 @ 提问，问题会转到对应开发团队

### Cobo 赛道偏好
- **没有明确倾向**，欢迎新奇 idea
- 平台方不约束参赛者做什么
- 更重要的是脑洞和创新

### Intent 识别
- Intent 识别由 **Agent 完成**（基于用户自然语言），不是 Cobo 平台做的
- Cobo 提供的是权限执行层，Agent 负责理解用户意图

---

## 五、对 SafeAgent Wallet MVP 的启发

| Cobo Pact | SafeAgent Wallet 对应 |
|-----------|----------------------|
| 合约调用白名单 | WhitelistRule |
| 转账金额限制（rolling 24h） | BudgetRule + CumulativeRule |
| 函数参数约束（ABI match） | FunctionRule |
| Pact 不可变 + 自动失效 | Policy Engine 的生命周期管理 |
| 人类审核（App 弹窗） | Human-in-the-loop 触发条件 |
| AI 洞察（风险分析） | AuditLogger + 五层验证 |
| 意图-权限不匹配检测 | Permission Drift Detection |

### 关键待确认问题（继承自当日笔记）

| # | 问题 | 本次会议是否解答 |
|---|------|-----------------|
| 1 | Cobo SDK 自动集成 Safe Guard 还是手动部署？ | 部分：Cobo 可控制 Safe 合约钱包（签名地址控制合约钱包资产），但具体集成方式未详述 |
| 2 | Policy Engine 规则能上链还是纯链下？ | 部分：Pact 是链下规则引擎（Cobo 后端执行检查），链上由 MPC 签名完成 |
| 3 | MPC 分片对 Hackathon 免费多久？ | ❌ 未明确解答 |
