"""
audit_log.py — 审计日志模块

双方独立记录，仅追加写入，定期生成 Merkle root 可上链锚定。
"""

import json
import os
import time
import hashlib
from datetime import datetime


class AuditLogger:
    """
    仅追加日志记录器。

    在 x402 场景中:
      - 服务端记录: 谁调用了、哪个 nonce、支付了多少、返回了什么
      - Agent 端记录: 请求了什么服务、支付了多少、收到了什么结果

    双方日志独立但可交叉验证——如果出现争议，对比双方日志即可。
    """

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)
        today = datetime.now().strftime("%Y-%m-%d")
        self.log_file = os.path.join(base_dir, f"audit-{today}.jsonl")
        self._entries = []  # 内存缓冲区

    def log(self, actor: str, details: dict) -> dict:
        """
        写入一条审计记录。

        Args:
            actor: "server" | "agent"
            details: 自由格式事件数据

        Returns:
            写入的完整记录
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "actor": actor,
            **details,
        }

        # 追加到 JSONL 文件
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        self._entries.append(entry)
        return entry

    def get_entries(self, actor: str = None, limit: int = 100) -> list:
        """查询最近的审计记录"""
        results = []
        try:
            with open(self.log_file, "r", encoding="utf-8") as f:
                for line in f:
                    entry = json.loads(line)
                    if actor and entry.get("actor") != actor:
                        continue
                    results.append(entry)
        except FileNotFoundError:
            pass
        return results[-limit:]

    def merkle_root(self) -> str:
        """
        生成当日日志的 Merkle root。
        可用于每日上链锚定，确保日志不可篡改。
        """
        if not os.path.exists(self.log_file):
            return hashlib.sha256(b"").hexdigest()

        hashes = []
        with open(self.log_file, "r", encoding="utf-8") as f:
            for line in f:
                hashes.append(hashlib.sha256(line.encode()).digest())

        if not hashes:
            return hashlib.sha256(b"").hexdigest()

        # 构建 Merkle tree (简化版: 两两 hash)
        while len(hashes) > 1:
            if len(hashes) % 2 == 1:
                hashes.append(hashes[-1])  # 奇数个 → 复制最后一个
            hashes = [
                hashlib.sha256(hashes[i] + hashes[i + 1]).digest()
                for i in range(0, len(hashes), 2)
            ]

        return hashes[0].hex() if hashes else hashlib.sha256(b"").hexdigest()

    def summary(self) -> dict:
        """当日审计摘要"""
        entries = self.get_entries()
        total_served = sum(
            1 for e in entries if e.get("action") == "serve"
        )
        total_revenue = sum(
            e.get("amount", 0)
            for e in entries
            if e.get("action") == "serve"
        )
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "total_entries": len(entries),
            "total_served": total_served,
            "total_revenue_usdc": total_revenue / 1_000_000,
            "merkle_root": self.merkle_root(),
        }


# ============================================================
# 快速测试
# ============================================================

if __name__ == "__main__":
    logger = AuditLogger("demos/x402-caw-paywall/audit/test")

    logger.log("server", {
        "action": "serve",
        "agent": "agent-01",
        "nonce": "abc123",
        "tx_hash": "0xtest",
        "amount": 10000,
        "model": "gpt-4o-mini",
    })

    logger.log("agent", {
        "action": "pay_and_call",
        "service": "summarize",
        "cost": 10000,
        "tx_hash": "0xtest",
        "result": "success",
    })

    print("Entries:", logger.get_entries())
    print("Merkle root:", logger.merkle_root())
    print("Summary:", json.dumps(logger.summary(), indent=2))
