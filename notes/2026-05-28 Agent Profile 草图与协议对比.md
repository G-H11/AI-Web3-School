# Agent Profile 草图与协议对比 — Hermes Agent

> 📅 2026-05-28 | Week 2 Module C 任务
> 🏷️ 主题：Agent 身份、能力、输入输出、协作对象、失败点 + MCP/A2A/ERC-8004 对比

---

## Part 1: Agent Profile — Hermes Agent

### Identity（身份）

| 维度 | 内容 |
|------|------|
| **名称** | Hermes Agent |
| **维护者** | [Nous Research](https://github.com/nousresearch)（开源社区驱动） |
| **类型** | 多平台 LLM Agent 框架 |
| **身份标识** | 平台账号 + `agent-registration.json`；未来可映射 ERC-8004 Identity Registry（ERC-721 NFT） |
| **迭代方式** | 持续发布，skills/persona/memory 热更新，无需重启 |

### Capability（能力矩阵）

| 能力域 | 具体功能 |
|--------|---------|
| **多平台接入** | Telegram、Discord、QQ、Slack、Signal、Matrix、飞书、元宝 |
| **工具调用** | Terminal、Web Search/Browser、文件读写、Python sandbox、GitHub API（MCP） |
| **技能系统** | SKILL.md 可复用工作流，支持 create/patch/delete，上下文注入 |
| **持久记忆** | `memory` 工具：user profile + agent notes，跨会话注入 |
| **会话回溯** | `session_search`（FTS5），发现 + 锚点滚动模式 |
| **子Agent委托** | `delegate_task`：单任务 / 批并行（最多3并发），隔离上下文 |
| **定时调度** | `cronjob`：cron 表达式、skill 绑定、script 模式、上下游链 |
| **MCP 集成** | 原生 MCP Client，stdio/HTTP transport，自动 tool discovery |
| **多模型** | 多 Provider（Anthropic、OpenAI、DeepSeek 等），可配置 fallback |

### 输入 / 输出

| 方向 | 类型 | 示例 |
|------|------|------|
| **输入** | 自然语言、图片、定时触发、事件驱动、MCP Tool 返回 | 消息、截图分析、每日规划、Webhook |
| **输出** | 文本回复、媒体文件、平台推送、文件写入、子Agent摘要 | Markdown、MEDIA 附件、cron 结果 |

### 协作对象

```
用户 ──→ Hermes ──→ 子Agent (delegate_task)
                   → MCP Server
                   → 外部 API
                   → 定时调度器 (cron)
                   → 技能系统
```

### 收费模型

| 阶段 | 模型 | 场景 |
|------|------|------|
| 当前 | 无直接收费（用户承担 API token 费） | 自用 |
| 可扩展 | x402 | API 按次付费 |
| | ERC-8183 | 大额任务托管验收 |
| | ERC-8004 | 声誉定价 |

### 验证机制

| 层 | 方式 |
|----|------|
| 工具执行 | 确定性输出（exit code、文件路径） |
| 子Agent | 主Agent 复查（stat/curl） |
| 技能 | 语法检查 + 使用中验证 |
| Cron | 独立 session + 异常告警 |
| 可扩展 | TEE / zkML 硬件级可验证性 |

### 失败点与处理

| 失败模式 | 处理策略 |
|----------|---------|
| 上下文溢出 | delegate_task 卸载重推理 |
| 工具调用失败 | 明确报错 + retry，不猜测 |
| 子Agent幻觉 | 复查副作用（stat/curl） |
| Cron 重复跑 | skill 记录为 known pitfall |
| 记忆污染 | 紧凑事实，纠正立即 replace |
| 权限越界 | toolset 分组 + cronjob 限制 |

---

## Part 2: MCP vs A2A vs ERC-8004 协议对比

### 三层定位

```
┌─────────────────────────────────┐
│  ERC-8004  ← 身份 & 信任层        │
├─────────────────────────────────┤
│  A2A      ← Agent 间协作层        │
├─────────────────────────────────┤
│  MCP      ← 工具接口标准化层      │
└─────────────────────────────────┘
```

### MCP vs A2A

| 维度 | MCP | A2A |
|------|-----|-----|
| 提出方 | Anthropic | Google |
| 解决的问题 | Agent ↔ Tool 接口标准化 | Agent ↔ Agent 协作标准化 |
| 类比 | USB-C 统一设备接口 | 团队协作协议 |
| 通信方向 | Client → Server 单向 | 双向对等 |
| 能力暴露 | `tools/`、`resources/`、`prompts/` | `AgentCard`（技能、端点、认证） |
| 发现机制 | `list_tools` | A2A Registry 或 Agent Card URL |
| 状态管理 | 无状态 | 有状态（Task 对象） |
| 适合场景 | 单Agent使用标准化工具 | 多Agent协作 |

### 各自解决的问题

- **MCP**：接口碎片化 → 统一 tool schema；即插即用工具；标准化参数/返回值/错误处理
- **A2A**：多Agent协作 → 能力协商 + 任务追踪；长任务状态管理；跨组织Agent经济
- **ERC-8004**：身份（Agent是谁？）、声誉（干得好吗？）、验证（结果是真的吗？）

### 组合使用

```
ERC-8004 → Agent 链上身份 + 声誉
   ↓
A2A → 两个 Hermes 实例互相发现并委托任务
   ↓
MCP → 各自通过 MCP 调用工具集
   ↓
ERC-8183 + x402 → 结算与支付
```

---

## 关键收获

1. Agent Profile 需要覆盖：身份、能力、IO、协作、收费、验证、失败处理 — 七个维度
2. MCP 解决工具接口标准化，A2A 解决 Agent 间协作，ERC-8004 解决信任发现 — 三个协议解决不同层次的问题，互补而非竞争
3. Web3 给 Agent 经济带来的独特价值：**无需许可的身份注册 + 链上声誉 + 托管结算 + 可验证执行**
