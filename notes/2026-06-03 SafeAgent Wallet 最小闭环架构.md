# 2026-06-03 SafeAgent Wallet 最小闭环架构

> 📅 2026-06-03 | 提问：QQ | 关联：Track 1 Cobo Agent Economy / Hackathon MVP

## 最小闭环全链路

```
用户设定权限规则 → AI Agent 意图解析 → 策略查询 → 风险评分
    → Policy Engine (预算/白名单/函数/累积 四层检查)
    → Safe Guard (链上 checkTransaction 钩子)
    → ERC-4337 Smart Account
    → Cobo Agentic Wallet SDK (swap/transfer)
    → 链上 RPC (Bundler → EntryPoint → Uniswap)
    → 输出：tx receipt + 16 字段审计日志 + 安全验证报告 + Merkle root
```

## 四色风险路径

| 路径 | 风险分 | 行为 |
|------|--------|------|
| 🟢 全自动 | 1–8 | AI→Policy→Guard→执行 |
| 🟡 半自动 | 9–27 | 通知用户，15min无否决自动放行 |
| 🔴 人工 | 28–64 | 暂停，人工确认后执行 |
| 🛑 冻结 | 65–125 | 冻结，多签/Guardian 解冻 |

## 五层验证

| 层 | 验证内容 | 证据 |
|----|---------|------|
| AI 层 | 意图解析正确性 | 用户输入 vs AI 理解日志 |
| Policy Engine | 四规则全部通过 | 预算/累积/白名单/函数 结果 |
| Safe Guard | calldata 合法 | checkTransaction() 返回值 |
| 链上执行 | 交易成功 | tx receipt + Etherscan |
| 审计追踪 | 全链路可回溯 | 16 字段日志 + Merkle root |

## 关键点

- 安全边界在 AI 之外（Policy Engine + Safe Guard）
- Policy Engine 拦截率 90%（确定性规则）
- AI 层拦截率 0%（不可依赖）
- MVP 目标：跑通一次 ETH→USDC swap，带完整权限验证+审计日志
