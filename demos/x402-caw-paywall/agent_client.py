"""
agent_client.py — x402 消费方 Agent

Agent 负责:
  1. 发起服务请求
  2. 收到 402 → 解析支付要求
  3. 检查 Cobo CAW Pact 策略是否允许
  4. 通过 CAW 发起 USDC transfer
  5. 带支付证明重试
  6. 收到结果 → 写入审计日志

模拟运行: python agent_client.py
"""

import json
import time
import hashlib
import secrets
from dataclasses import dataclass, field
from typing import Optional


# ============================================================
# 模拟的 Cobo CAW 接口
# 在真实部署中替换为 Cobo CAW SDK
# ============================================================

class CoboCAWSimulator:
    """
    模拟 Cobo Agentic Wallet。
    真实版本: cobo-caw SDK → create_user_operation() → sign → submit

    CAW 核心职责:
      - 持有 Agent 的 session key（非主私钥）
      - 每笔交易前调用 Pact 策略引擎检查
      - Pact 不通过 → 拒绝签名
    """

    def __init__(self, agent_address: str, pact_policy: dict, mock_chain):
        self.address = agent_address
        self.pact = PactEngine(pact_policy)
        self.chain = mock_chain
        self.daily_spent = 0  # 今日已花费 (USDC, 最小单位)
        self.last_reset_day = self._today()

    def _today(self) -> str:
        return time.strftime("%Y-%m-%d")

    def transfer(
        self, token: str, recipient: str, amount: int
    ) -> Optional[str]:
        """
        发起 USDC transfer。

        流程:
          1. Pact 策略检查
          2. 构建 UserOperation
          3. Session key 签名
          4. 提交到链上
          5. 返回 tx_hash

        Returns:
            tx_hash 或 None（被 Pact 拒绝）
        """

        # 1. Pact 策略检查
        allowed, reason = self.pact.check(
            action="transfer",
            token=token,
            recipient=recipient,
            amount=amount,
            daily_spent=self.daily_spent,
            today=self._today(),
        )
        if not allowed:
            print(f"  [CAW] ❌ Pact rejected: {reason}")
            return None

        print(f"  [CAW] ✅ Pact passed: {reason}")

        # 2. 构建 UserOperation (模拟)
        user_op = {
            "sender": self.address,
            "to": token,
            "data": self._encode_transfer(recipient, amount),
            "nonce": secrets.token_hex(8),
        }

        # 3. Session key 签名 (模拟)
        #    真实版本: CAW SDK 在安全环境中签名
        signed_op = {
            **user_op,
            "signature": f"0x{secrets.token_hex(32)}",
        }

        # 4. 提交到链上 (模拟)
        tx_hash = f"0x{secrets.token_hex(32)}"
        self.chain._txs[tx_hash] = {
            "from": self.address,
            "to": token,
            "token": token,
            "amount": amount,
            "recipient": recipient,
            "timestamp": time.time(),
            "confirmations": 0,
        }

        # 5. 更新日消费
        self.daily_spent += amount

        print(f"  [CAW] Transfer submitted: {amount / 1_000_000} USDC → {recipient[:10]}...")
        print(f"  [CAW] tx_hash: {tx_hash}")
        return tx_hash

    @staticmethod
    def _encode_transfer(recipient: str, amount: int) -> str:
        """编码 ERC-20 transfer calldata"""
        # transfer(address,uint256)
        method_id = "0xa9059cbb"
        addr = recipient[2:].lower().zfill(64)
        amt = hex(amount)[2:].zfill(64)
        return f"{method_id}{addr}{amt}"


class PactEngine:
    """
    Cobo CAW Pact 策略引擎。

    Pact 是声明式策略语言——定义 Agent 能做什么、不能做什么。
    策略在 CAW 合约层面强制执行，Agent 无法绕过。

    策略内容见 pact_policy.json。
    """

    def __init__(self, policy: dict):
        self.policy = policy

    def check(
        self, action: str, token: str, recipient: str,
        amount: int, daily_spent: int, today: str
    ) -> tuple[bool, str]:
        """
        检查交易是否符合 Pact 策略。

        Returns:
            (allowed: bool, reason: str)
        """

        # 0. 策略是否激活
        if not self.policy.get("enabled", False):
            return False, "Policy is disabled"

        # 1. 检查有效期
        valid_until = self.policy.get("valid_until", "1970-01-01")
        if today > valid_until:
            return False, f"Policy expired on {valid_until}"

        # 2. 检查 token 白名单
        allowed_tokens = self.policy.get("allowed_tokens", [])
        if token not in allowed_tokens:
            return False, f"Token not allowed: {token}"

        # 3. 检查收款地址白名单
        allowed_recipients = self.policy.get("allowed_recipients", [])
        if recipient not in allowed_recipients:
            return False, f"Recipient not allowed: {recipient}"

        # 4. 检查单次金额上限
        per_tx_limit = self.policy.get("spending_limits", {}).get("per_transaction", 0)
        if amount > per_tx_limit:
            return False, (
                f"Amount {amount / 1_000_000} USDC exceeds per-tx limit "
                f"{per_tx_limit / 1_000_000} USDC"
            )

        # 5. 检查每日上限
        daily_limit = self.policy.get("spending_limits", {}).get("daily", 0)
        if daily_spent + amount > daily_limit:
            return False, (
                f"Daily limit exceeded: {daily_spent / 1_000_000} + "
                f"{amount / 1_000_000} > {daily_limit / 1_000_000} USDC"
            )

        # 6. 检查动作类型
        allowed_actions = self.policy.get("allowed_actions", [])
        if action not in allowed_actions:
            return False, f"Action not allowed: {action}"

        return True, (
            f"Amount {amount / 1_000_000} USDC within limits "
            f"(daily: {daily_spent / 1_000_000} + {amount / 1_000_000} "
            f"≤ {daily_limit / 1_000_000})"
        )


# ============================================================
# x402 Agent 客户端
# ============================================================

@dataclass
class X402PaymentRequest:
    """解析后的 402 支付信息"""
    address: str
    amount: int
    token: str
    chain: int
    nonce: str
    deadline: int


class X402AgentClient:
    """
    x402 Agent 客户端。

    完整流程:
      1. 请求 → 收到 402
      2. 解析支付要求
      3. CAW Pact 检查
      4. CAW 执行支付
      5. 等待确认
      6. 带证明重试
      7. 记录审计日志
    """

    def __init__(self, caw: CoboCAWSimulator, server, agent_id: str):
        self.caw = caw
        self.server = server  # X402PaywallServer 实例
        self.agent_id = agent_id

    def request_service(self, text: str, model: str = "gpt-4o-mini") -> dict:
        """
        发起服务请求。完整自动化流程。
        """
        print(f"\n{'='*50}")
        print(f"  Agent [{self.agent_id}] 请求服务")
        print(f"  任务: 摘要 ({len(text)} 字符)")
        print(f"{'='*50}")

        # ─── Step 1: 首次请求 ───
        print("\n── Step 1: 发起请求 ──")
        response = self.server.handle_request(
            headers={},
            body={"text": text, "model": model},
        )

        # ─── Step 2: 收到 402 ───
        if response["status"] != 402:
            return response["body"]  # 不需要付款 (不应发生)

        print(f"\n── Step 2: 收到 402 Payment Required ──")
        payment = self._parse_402(response["headers"])
        print(f"  要求: {payment.amount / 1_000_000} USDC")
        print(f"  收款: {payment.address[:10]}...")
        print(f"  Nonce: {payment.nonce[:16]}...")
        print(f"  截止: {time.ctime(payment.deadline)}")

        # ─── Step 3: CAW Pact 检查 ───
        print(f"\n── Step 3: Cobo CAW Pact 策略检查 ──")
        tx_hash = self.caw.transfer(
            token=payment.token,
            recipient=payment.address,
            amount=payment.amount,
        )
        if not tx_hash:
            return {
                "error": "Payment blocked by Pact policy",
                "detail": "Check pact_policy.json and adjust limits",
            }

        # ─── Step 4: 等待链上确认 ───
        print(f"\n── Step 4: 等待链上确认 ──")
        for i in range(30):  # 最多等 30 秒
            status = self.caw.chain.get_tx_status(tx_hash)
            if status and status["status"] == "confirmed":
                print(f"  ✅ Confirmed after {i+1}s ({status['confirmations']} confirmations)")
                break
            time.sleep(1)
        else:
            print(f"  ⚠️ Timeout waiting for confirmation (模拟可能太快)")

        # ─── Step 5: 带证明重试 ───
        print(f"\n── Step 5: 带支付证明重试 ──")
        response = self.server.handle_request(
            headers={
                "X-402-Payment-Tx": tx_hash,
                "X-402-Payment-Nonce": payment.nonce,
            },
            body={"text": text, "model": model},
        )

        # ─── Step 6: 处理结果 ───
        print(f"\n── Step 6: 结果 ──")
        if response["status"] == 200:
            result = response["body"]
            print(f"  ✅ 服务成功!")
            print(f"  摘要: {result['summary'][:80]}...")
            print(f"  Token 用量: in={result['usage']['input_tokens']}, out={result['usage']['output_tokens']}")
            print(f"  支付: {result['payment']['amount'] / 1_000_000} USDC (tx: {tx_hash[:16]}...)")

            # 审计日志
            server_audit.log("serve", {
                "agent": self.agent_id,
                "nonce": payment.nonce,
                "tx_hash": tx_hash,
                "amount": payment.amount,
                "model": model,
                "tokens": result["usage"],
            })

            return result
        else:
            print(f"  ❌ 失败: {response['body']}")
            return response["body"]

    def _parse_402(self, headers: dict) -> X402PaymentRequest:
        """解析 402 响应头中的支付信息"""
        return X402PaymentRequest(
            address=headers["X-402-Payment-Address"],
            amount=int(headers["X-402-Payment-Amount"]),
            token=headers["X-402-Payment-Token"],
            chain=int(headers["X-402-Payment-Chain"]),
            nonce=headers["X-402-Payment-Nonce"],
            deadline=int(headers["X-402-Payment-Deadline"]),
        )


# ============================================================
# 审计日志
# ============================================================

from audit_log import AuditLogger

server_audit = AuditLogger("demos/x402-caw-paywall/audit/server")


# ============================================================
# 运行入口
# ============================================================

if __name__ == "__main__":
    print("  Run test_walkthrough.py to see the full flow.")
    print("  Or import X402AgentClient in your own agent code.")
