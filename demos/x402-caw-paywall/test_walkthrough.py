"""
test_walkthrough.py — 端到端走通 x402 + Cobo CAW 支付闭环

运行: python test_walkthrough.py

模拟完整的自动化支付流程:
  Agent 请求服务 → 收到 402 → CAW Pact 检查 → 支付 → 重试 → 收到结果 → 审计
"""

import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(__file__))

from server import ServerConfig, X402PaywallServer, server_audit
from agent_client import CoboCAWSimulator, X402AgentClient
from audit_log import AuditLogger

# ============================================================
# 配置
# ============================================================

# 服务提供方收款地址
SERVICE_PROVIDER_ADDRESS = "0xServiceProviderCAW..."

# Agent 的 CAW 地址
AGENT_CAW_ADDRESS = "0xAgentCAWAddressOnBaseSepolia"

# USDC on Base Sepolia
USDC_TOKEN = "0x036CbD53842c5426634e792954f7C8BC70DEcbA1"

# ============================================================
# 加载 Pact 策略
# ============================================================

import json

PACT_POLICY_PATH = os.path.join(os.path.dirname(__file__), "pact_policy.json")
with open(PACT_POLICY_PATH, "r") as f:
    pact_policy = json.load(f)

# 替换为 demo 中的地址
pact_policy["wallet_address"] = AGENT_CAW_ADDRESS
pact_policy["allowed_recipients"] = [SERVICE_PROVIDER_ADDRESS]
pact_policy["allowed_tokens"] = [USDC_TOKEN]

# ============================================================
# 初始化组件
# ============================================================

print("=" * 70)
print("  x402 + Cobo CAW 自主支付闭环 — 端到端走通")
print("=" * 70)

# 共享的模拟链
from server import MockChain
chain = MockChain()

# 服务端
server_config = ServerConfig(
    payment_address=SERVICE_PROVIDER_ADDRESS,
    accepted_token=USDC_TOKEN,
    chain_id=84532,
    price_per_call=10_000,  # 0.01 USDC
    deadline_seconds=300,
)
server_config.chain = chain
server = X402PaywallServer(server_config)

# Agent 端 (含 Cobo CAW)
caw = CoboCAWSimulator(
    agent_address=AGENT_CAW_ADDRESS,
    pact_policy=pact_policy,
    mock_chain=chain,
)
agent = X402AgentClient(
    caw=caw,
    server=server,
    agent_id="agent-summarizer-01",
)

# 审计日志
audit = AuditLogger("demos/x402-caw-paywall/audit/walkthrough")

# ============================================================
# 场景 1: 正常支付 → 成功
# ============================================================

print("\n" + "=" * 70)
print("  场景 1: 正常支付流程")
print("=" * 70)

sample_text = """
区块链技术正在重塑数字经济的底层架构。从比特币的诞生到以太坊的智能合约，
再到如今的 Layer 2 扩展方案和账户抽象，每一次技术演进都在降低用户门槛、
提升系统吞吐量。AI Agent 的引入更是将自动化带入了链上交互——
但这也带来了新的安全挑战：如何确保 Agent 在预设的权限范围内操作？
x402 协议和 Cobo CAW 的组合提供了一种答案：
通过 HTTP 402 实现按需付费，通过 Pact 策略引擎约束 Agent 行为。
"""

result = agent.request_service(sample_text)

assert result.get("summary"), "Should get summary back"
assert result["payment"]["amount"] == 10000, "Should pay exactly 0.01 USDC"

audit.log("test", {
    "scenario": 1,
    "description": "Normal payment flow",
    "status": "PASS",
    "tx_hash": result["payment"]["tx_hash"],
    "amount": result["payment"]["amount"],
})

print(f"\n  ✅ 场景 1 通过: 支付 {result['payment']['amount'] / 1_000_000} USDC, 获取摘要成功")

# ============================================================
# 场景 2: Pact 超额拦截
# ============================================================

print("\n" + "=" * 70)
print("  场景 2: Pact 超额拦截 (金额 > 单次上限)")
print("=" * 70)

# 临时修改服务端定价为 $15 USDC (超过 Pact 的 $10/tx 限制)
original_price = server_config.price_per_call
server_config.price_per_call = 15_000_000  # $15 USDC

result = agent.request_service(sample_text)

# 恢复定价
server_config.price_per_call = original_price

assert "error" in result, "Should be blocked by Pact"
print(f"  ✅ 场景 2 通过: Pact 正确拦截超额支付 ({result.get('detail', '')})")

audit.log("test", {
    "scenario": 2,
    "description": "Pact over-limit rejection",
    "status": "PASS",
    "error": result.get("error"),
})

# ============================================================
# 场景 3: Nonce 重放防护
# ============================================================

print("\n" + "=" * 70)
print("  场景 3: Nonce 重放防护")
print("=" * 70)

# 模拟: 直接发送一个已使用的 nonce 再次请求
# (server.used_nonces 中已有场景 1 的 nonce)

# 我们通过 server 直接调用，模拟重放
used_nonce = next(iter(server_config.used_nonces)) if server_config.used_nonces else "no-nonce"
response = server.handle_request(
    headers={
        "X-402-Payment-Tx": "0xreplay_attack",
        "X-402-Payment-Nonce": used_nonce,
    },
    body={"text": "replay attack"},
)

assert response["status"] == 403, f"Should be 403, got {response['status']}"
assert "already used" in response["body"]["error"].lower()
print(f"  ✅ 场景 3 通过: Nonce 重放被拦截 ({response['body']['error']})")

audit.log("test", {
    "scenario": 3,
    "description": "Nonce replay protection",
    "status": "PASS",
    "nonce": used_nonce,
})

# ============================================================
# 场景 4: 收款地址白名单
# ============================================================

print("\n" + "=" * 70)
print("  场景 4: Pact 收款地址白名单拦截")
print("=" * 70)

# 尝试向不在白名单的地址转账
tx_hash = caw.transfer(
    token=USDC_TOKEN,
    recipient="0xMaliciousAddressNotInWhitelist",
    amount=10_000,
)

assert tx_hash is None, "Should be blocked by Pact"
print(f"  ✅ 场景 4 通过: Pact 拦截非白名单收款地址")

audit.log("test", {
    "scenario": 4,
    "description": "Recipient whitelist enforcement",
    "status": "PASS",
})

# ============================================================
# 场景 5: 每日限额
# ============================================================

print("\n" + "=" * 70)
print("  场景 5: 每日累计限额")
print("=" * 70)

# 先手动增加今日已消费到接近上限
caw.daily_spent = 99_000_000  # $99 USDC (每日上限 $100)

# 再尝试支付 $2 USDC (会超 $100 上限)
server_config.price_per_call = 2_000_000  # $2
result = agent.request_service(sample_text)

assert "error" in result, "Should be blocked by daily limit"
print(f"  ✅ 场景 5 通过: 每日限额拦截 ({caw.daily_spent / 1_000_000} + 2 > 100 USDC)")

audit.log("test", {
    "scenario": 5,
    "description": "Daily spending limit",
    "status": "PASS",
    "daily_spent": caw.daily_spent,
})

# ============================================================
# 审计摘要
# ============================================================

print("\n" + "=" * 70)
print("  审计日志摘要")
print("=" * 70)

summary = audit.summary()
print(f"  总条目:    {summary['total_entries']}")
print(f"  Merkle root: {summary['merkle_root'][:16]}...")

server_summary = server_audit.summary()
print(f"\n  服务端审计:")
print(f"  服务次数:  {server_summary['total_served']}")
print(f"  总收入:    {server_summary['total_revenue_usdc']} USDC")

# ============================================================
# 最终结果
# ============================================================

print("\n" + "=" * 70)
print("  🎉 全部 5 个场景通过!")
print("=" * 70)
print("""
  场景 1: ✅ 正常支付 → 获取服务
  场景 2: ✅ Pact 超额拦截
  场景 3: ✅ Nonce 重放防护
  场景 4: ✅ 收款地址白名单
  场景 5: ✅ 每日限额

  结论: x402 + Cobo CAW + Pact 三层协同
  实现了预算受控、可审计的 Agent 自主支付闭环。
""")

# 审计日志文件位置
print(f"  审计日志: {os.path.abspath(audit.log_file)}")
