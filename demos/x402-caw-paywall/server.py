"""
server.py — x402 Paywall AI 推理服务

服务提供方：部署 AI 推理 API，受 x402 保护。
未付款 → 返回 402 + 支付信息
已付款 → 验证 tx → 返回推理结果

模拟运行: python server.py --port 8080 --chain base-sepolia
"""

import json
import time
import hashlib
import secrets
from dataclasses import dataclass, field
from typing import Optional

# ============================================================
# 模拟的链交互层 — 在真实部署中替换为 web3.py / ethers.js
# ============================================================

class MockChain:
    """模拟区块链：在真实部署中替换为 RPC 调用"""

    def __init__(self):
        self._txs: dict[str, dict] = {}  # tx_hash → tx_info
        self._balances: dict[str, dict[str, int]] = {}  # addr → {token → amount}

    def get_tx_status(self, tx_hash: str) -> Optional[dict]:
        """查询交易状态"""
        tx = self._txs.get(tx_hash)
        if not tx:
            return None
        # 模拟: > 12 秒后确认
        if time.time() - tx["timestamp"] > 12:
            tx["confirmations"] = tx.get("confirmations", 0) + 1
        return {
            "hash": tx_hash,
            "status": "confirmed" if tx.get("confirmations", 0) >= 1 else "pending",
            "confirmations": tx.get("confirmations", 0),
        }

    def get_transfer_details(self, tx_hash: str) -> Optional[dict]:
        """解析交易详情"""
        tx = self._txs.get(tx_hash)
        if not tx:
            return None
        return {
            "from": tx.get("from"),
            "to": tx.get("to"),
            "token": tx.get("token"),
            "amount": tx.get("amount"),
            "recipient": tx.get("recipient"),
        }


# ============================================================
# 配置
# ============================================================

@dataclass
class ServerConfig:
    """服务端配置"""
    # 服务方收款地址 (Cobo CAW 地址)
    payment_address: str = "0xServiceProviderCAW..."
    # 接受 USDC (Base Sepolia)
    accepted_token: str = "0x036CbD53842c5426634e792954f7C8BC70DEcbA1"
    chain_id: int = 84532  # Base Sepolia
    # 定价: $0.01 USDC per summarization (USDC 有 6 decimals → 10000)
    price_per_call: int = 10_000  # 0.01 USDC
    # 支付有效期
    deadline_seconds: int = 300  # 5 分钟

    # ----- 以下为模拟链数据 -----
    chain: MockChain = field(default_factory=MockChain)
    used_nonces: set = field(default_factory=set)


# ============================================================
# x402 Paywall 服务端
# ============================================================

class X402PaywallServer:
    """
    x402 保护的服务端。

    工作流程:
        1. 收到请求 → 检查是否带支付证明
        2. 无证明 → 返回 402 + 支付信息
        3. 有证明 → 链上验证 → 返回结果或拒绝
    """

    def __init__(self, config: ServerConfig):
        self.config = config

    def handle_request(self, headers: dict, body: dict) -> dict:
        """
        处理 API 请求。

        Args:
            headers: HTTP headers (含可选的 X-402-Payment-* 头)
            body: 请求体 {"text": "...", "model": "..."}

        Returns:
            {"status": 200|402, "headers": {...}, "body": {...}}
        """
        # 检查是否携带支付证明
        payment_tx = headers.get("X-402-Payment-Tx")
        payment_nonce = headers.get("X-402-Payment-Nonce")

        if not payment_tx:
            # ─── 无支付证明 → 返回 402 ───
            return self._build_402_response()

        # ─── 有支付证明 → 验证 ───
        return self._verify_and_serve(payment_tx, payment_nonce, body)

    # ── 402 响应构建 ──

    def _build_402_response(self) -> dict:
        """构建 HTTP 402 Payment Required 响应"""
        nonce = secrets.token_hex(16)

        return {
            "status": 402,
            "headers": {
                "X-402-Payment-Address": self.config.payment_address,
                "X-402-Payment-Amount": str(self.config.price_per_call),
                "X-402-Payment-Token": self.config.accepted_token,
                "X-402-Payment-Chain": str(self.config.chain_id),
                "X-402-Payment-Nonce": nonce,
                "X-402-Payment-Deadline": str(
                    int(time.time()) + self.config.deadline_seconds
                ),
            },
            "body": {
                "error": "Payment Required",
                "message": (
                    f"Send {self.config.price_per_call / 1_000_000} USDC to "
                    f"{self.config.payment_address} on chain {self.config.chain_id}. "
                    f"Include X-402-Payment-Tx and X-402-Payment-Nonce headers on retry."
                ),
                "nonce": nonce,
            },
        }

    # ── 支付验证 ──

    def _verify_and_serve(self, tx_hash: str, nonce: str, body: dict) -> dict:
        """
        验证支付 + 返回服务结果。

        验证链:
          1. nonce 未被使用 → 防重放
          2. tx 在链上确认 ≥ 1
          3. 收款地址 = 我方地址
          4. 金额 ≥ 定价
          5. deadline 未过期

        只有全部通过才返回推理结果。
        """

        # 1. 防重放: nonce 只能用一次
        if nonce in self.config.used_nonces:
            return self._error(403, "Nonce already used")

        # 2. 检查 tx 状态
        tx_status = self.config.chain.get_tx_status(tx_hash)
        if not tx_status:
            return self._error(402, "Transaction not found on chain")
        if tx_status["status"] != "confirmed":
            return self._error(402, f"Transaction pending ({tx_status['confirmations']} confirmations). Retry.")

        # 3. 解析转账详情
        details = self.config.chain.get_transfer_details(tx_hash)
        if not details:
            return self._error(402, "Cannot parse transfer details")

        # 4. 验证收款地址
        if details["recipient"] != self.config.payment_address:
            return self._error(403, f"Payment sent to wrong address: {details['recipient']}")

        # 5. 验证金额
        if details["amount"] < self.config.price_per_call:
            return self._error(402, f"Insufficient payment: {details['amount']} < {self.config.price_per_call}")

        # 6. 验证 token
        if details["token"] != self.config.accepted_token:
            return self._error(403, f"Wrong token: {details['token']}")

        # ─── 全部通过 → 消费 nonce + 返回结果 ───
        self.config.used_nonces.add(nonce)

        return {
            "status": 200,
            "headers": {},
            "body": self._serve_ai_result(body, tx_hash, details["amount"]),
        }

    # ── AI 推理 ──

    def _serve_ai_result(self, request: dict, tx_hash: str, amount_paid: int) -> dict:
        """
        执行 AI 推理。
        在真实部署中调用 OpenAI / Anthropic API。
        这里用模拟。
        """
        text = request.get("text", "")
        model = request.get("model", "gpt-4o-mini")

        # 模拟: 截取前 200 字符作为"摘要"
        summary = text[:200] + ("..." if len(text) > 200 else "")

        return {
            "summary": summary,
            "model": model,
            "usage": {
                "input_tokens": len(text) // 4,
                "output_tokens": len(summary) // 4,
            },
            "payment": {
                "tx_hash": tx_hash,
                "amount": amount_paid,
                "token": self.config.accepted_token,
            },
        }

    # ── 错误响应 ──

    def _error(self, status: int, message: str) -> dict:
        return {
            "status": status,
            "headers": {},
            "body": {"error": message},
        }


# ============================================================
# 审计日志（服务端记录）
# ============================================================

from audit_log import AuditLogger

server_audit = AuditLogger("demos/x402-caw-paywall/audit/server")


# ============================================================
# 运行入口（模拟）
# ============================================================

if __name__ == "__main__":
    config = ServerConfig()
    server = X402PaywallServer(config)

    print("=" * 60)
    print("  x402 AI Inference Server")
    print(f"  Payment Address: {config.payment_address}")
    print(f"  Price: {config.price_per_call / 1_000_000} USDC/call")
    print(f"  Chain: {config.chain_id}")
    print("=" * 60)
    print("  Waiting for requests... (Ctrl+C to stop)")
    print()
    print("  Run test_walkthrough.py to simulate a full flow.")
