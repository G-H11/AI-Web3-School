# AI × Web3 项目拆解：Virtuals Protocol & ORA / opAgent

> 日期：2026-05-27
> 来源：AI × Web3 School · Week 2 Module B 拓展
>
> 方法论：每个项目按「解决什么问题 → AI 部分 → Web3 部分 → 可验证材料 → 我的判断」五步拆解

---

## 项目一：Virtuals Protocol

> 一句话：**把 AI Agent 变成可共同拥有、可产生收入、可交易的链上资产。**

### 1. 它在解决什么问题

传统 AI Agent 有三个问题：

| 问题 | 传统 AI Agent | Virtuals 的方案 |
|------|---------------|-----------------|
| **所有权** | Agent 归开发公司私有，用户只是调用者 | Agent 被**代币化**，任何人都可以持有份额 |
| **收益分配** | 收入全部归公司，用户贡献数据/反馈无回报 | Agent 产生的收入按代币持有比例**自动分润** |
| **信任** | Agent 是黑盒，行为不可审计 | Agent 的关键决策和收入流**上链可查** |

> Virtuals 把 "AI Agent" 从 SaaS 订阅模式变成了 **"生产力资产"** ——就像你可以买一个自动交易机器人的股份，它赚了钱你按比例分。

### 2. AI 部分是什么

| 组件 | 说明 |
|------|------|
| **Agent 核心** | 每个 Virtuals Agent 是一个 LLM 驱动的自主代理，可以执行特定任务（如游戏 NPC、交易 bot、内容创作者） |
| **行为引擎** | Agent 拥有目标（goal）、记忆（memory）、工具调用能力——由 LLM 驱动决策 |
| **多模态** | 支持文本、语音、图像生成（游戏角色可以有表情、语音对话） |

### 3. Web3 部分是什么

| 组件 | 说明 | 关键技术 |
|------|------|----------|
| **Agent 代币化** | 每个 Agent 发行自己的代币，持有者 = 共同所有者 | ERC-20 / NFT |
| **收入分配** | Agent 产生的收入（如用户付费使用）自动按代币比例分配 | 链上分红合约 |
| **治理** | 代币持有者可对 Agent 的升级、行为参数进行投票 | DAO 治理 |
| **链上身份** | 每个 Agent 在链上有唯一身份，行为可追溯 | ERC-721 或类似标准 |
| **ERC-8183 协议** | Virtuals 团队成员是 ERC-8183（Agentic Commerce）的**共同作者**——Agent 可以通过该协议接任务、收托管资金、被验收后收款 | ERC-8183 |

> ⚡ 重点：Virtuals 不只是"另一个 Agent 平台"——它的团队成员在**推动 Agent 商业协议标准化**（ERC-8183），这是差异化的 proof-of-work。

### 4. 可验证材料

| 类型 | 链接 / 证据 |
|------|------------|
| 官网 | https://virtuals.io |
| 白皮书 | https://whitepaper.virtuals.io |
| 产品 | https://app.virtuals.io（Agent 市场 + 创建工具） |
| 标准贡献 | ERC-8183 作者含 Bryan Lim (@ai-virtual-b) 和 Tay Weixiong (@twx-virtuals) |
| 链上 | Base L2 上的 Agent 代币合约（可通过区块浏览器验证） |
| 公开案例 | Luna（AI 虚拟偶像/直播 Agent）在 Virtuals 上发行代币 |

### 5. 我的判断

**亮点**：
- ✅ **商业模式清晰**：Agent 代币化 + 收入分润，不是纯叙事——有实际现金流模型
- ✅ **标准化参与**：团队在推动 ERC-8183，说明有长期生态思维
- ✅ **使用 Base L2**：低成本高频交易，适合 Agent 的小额支付场景

**疑问**：
- ❓ Agent 的「生产力」是否真的能持续产生收入？目前很多 Agent 的收入来自代币投机而非实际服务付费
- ❓ 代币持有者如何判断 Agent 的质量？会不会出现「土狗 Agent」——发币后 Agent 根本不工作？
- ❓ 与 ERC-8004（Trustless Agents）的集成计划？Agent 代币化后，声誉机制如何建立？

**启发**：Virtuals 把 Agent 变成了「链上生产力资产」——这不只是技术问题，更是**经济模型创新**。未来可能出现「Agent IPO」——一个新 Agent 发布时，投资者评估其能力后决定是否买入代币。这需要 ERC-8004 那样的声誉系统做信任基础。

---

## 项目二：ORA Protocol / opAgent

> 一句话：**让 AI 模型在链上运行，结果可被任何人验证和挑战——不需要信任任何中心化服务器。**

### 1. 它在解决什么问题

核心问题：**你怎么知道 AI 给你返回的结果是真的？**

| 场景 | 传统问题 | ORA 的方案 |
|------|----------|-----------|
| 智能合约需要 AI 判断 | 依赖中心化 Oracle（如 Chainlink Functions）→ 单点信任 | AI 推理结果上链，**任何人可以在挑战窗口内质疑并提交欺诈证明** |
| AI Agent 管理链上资产 | Agent 私钥存在 TEE 或服务器中 → 密钥泄露 = 资产被盗 | **AI Agent 钱包是智能合约**，没有私钥，行为由合约代码约束 |
| Agent 被关停 | Agent 跑在中心化服务器上 → 运营商可随时关停 | Agent 部署后**永久存在于链上**，没有人能关停 |

> ORA 把 AI 从「相信 OpenAI 的服务器返回了正确结果」变成了「**数学上可验证**」——这是去信任化的关键一步。

### 2. AI 部分是什么

| 组件 | 说明 |
|------|------|
| **opML（Optimistic ML）** | 乐观机器学习——AI 推理在链下执行，结果提交到链上；在挑战窗口内，任何验证者可以**重新执行推理**并提交欺诈证明。如果挑战成功，提交者被罚没。 |
| **支持的模型** | MNIST（DNN）、LLaMA / LLaMA 2（大语言模型）、ONNX（通用模型支持中） |
| **OAO（Onchain AI Oracle）** | 智能合约通过 OAO 发起 AI 请求 → opML 节点执行推理 → 结果上链 → 挑战期后最终确认 |
| **opAgent** | 基于 opML 的**永续链上 Agent**——Agent 存在于智能合约中，由 OAO 驱动的 AI 推理控制其行为 |

### 3. Web3 部分是什么

| 组件 | 说明 | 创新点 |
|------|------|--------|
| **opML 欺诈证明** | 类似 Optimistic Rollup：结果先信任，后验证。在链上运行一个 MIPS 虚拟机来执行单步验证 | 把 AI 推理的验证变成了**确定性的链上计算** |
| **OAO 合约** | 已部署到 ETH Mainnet、Sepolia、Optimism、Manta | 地址公开可查（如 `0x0A0f4321...`） |
| **AI Agent 合约钱包** | Agent 的钱包不是 EOA（无私钥），而是**智能合约**——权限由合约代码定义，行为由 OAO 的 AI 推理结果驱动 | 没有私钥可泄露！ |
| **opAgent 框架** | 开发者只需写 Solidity 合约继承 `OPAgent`，即可创建链上永续 Agent | 支持自定义链上操作：转账、DEX 交易、部署合约 |

### 4. 可验证材料

| 类型 | 链接 / 证据 |
|------|------------|
| OAO GitHub | https://github.com/ora-io/OAO（⭐ 39） |
| opML GitHub | https://github.com/hyperoracle/opml |
| opAgent GitHub | https://github.com/ora-io/opagent（⭐ 14） |
| opAgent 设计文章 | https://github.com/ora-io/opagent/blob/main/article.md |
| 链上合约 | OAO 已部署：ETH Mainnet `0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0` |
|  | Sepolia: `0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0` |
|  | Optimism Mainnet: `0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0` |

### 5. 我的判断

**亮点**：
- ✅ **技术扎实**：opML 不是简单的 "AI + 区块链" 口号——它有可运行的代码（Go + MIPS VM + Solidity）、有欺诈证明机制、有多个已部署合约
- ✅ **安全模型颠覆性**：AI Agent 合约钱包没有私钥——这是对 TEE Agent（如 Virtuals 的部分 Agent）安全模型的根本性改进
- ✅ **可组合**：OAO 是通用 Oracle，任何智能合约都可以调用；opAgent 是框架，开发者可自由定制

**疑问**：
- ❓ opML 挑战窗口期间谁来监督？验证者的激励机制是什么？目前 Star 数低（39），验证者网络是否活跃？
- ❓ LLaMA 级别的模型在 opML 的 MIPS 虚拟机中做单步挑战验证，计算成本是否可行？目前只看到 MNIST 和 LLaMA 示例，大模型的挑战成本可能很高
- ❓ 与 ERC-8004 / ERC-8183 的互操作性？opAgent 可以作为 ERC-8183 的 Provider 参与 Agent 商业市场吗？
- ❓ OAO 仍然是中心化的 AI 推理执行节点（opML node 运行在链下），如果所有 opML 节点串谋提交错误结果而没有人挑战，系统会被欺骗——这依赖于「至少有一个诚实验证者」的假设

**启发**：ORA 展示了 AI × Web3 的**最硬核路径**——不是在链下跑 AI、链上只记结果，而是试图让 AI 推理的**验证过程**本身在链上可执行。这是真正意义上的「去信任化 AI」。

---

## 六、两个项目的视角对比

| 维度 | Virtuals Protocol | ORA / opAgent |
|------|-------------------|---------------|
| **核心问题** | AI Agent 的所有权和收益分配 | AI 推理的可验证性 |
| **AI 角色** | Agent 的生产力（做事） | Agent 的可信度（验证） |
| **Web3 角色** | 资产代币化 + 自动分润 | 欺诈证明 + 去信任化执行 |
| **Agent 钱包** | 代币化钱包（可能有私钥） | 智能合约钱包（无私钥） |
| **标准化参与** | ERC-8183（Agentic Commerce） | opML / OAO（Onchain AI Oracle） |
| **成熟度** | 🟢 有产品、有用户、有代币 | 🟡 技术验证阶段，Star 数低 |
| **风险偏好** | 产品-市场匹配风险 | 技术可行性风险 |

---

## 七、我学到的

1. **AI × Web3 不是一个赛道，是两个维度**：Virtuals 解决「Agent 经济学」问题，ORA 解决「AI 可信验证」问题——两者可以互补。一个理想场景：一个 opAgent（ORA）在 Virtuals 市场上被代币化，通过 ERC-8183 接单收款。

2. **标准化是 proof-of-work 的强信号**：Virtuals 团队参与 ERC-8183 标准制定，比单纯「发了个 Agent 代币」更能证明他们对生态的长期投入。

3. **「私钥问题」在 AI Agent 场景下被放大了**：ORA 的设计直击要害——如果 AI Agent 自治地管理资产，它就不能依赖传统的私钥模型，必须用智能合约钱包解决。

4. **目前 AI × Web3 还处于「叙事 > 验证」阶段**：两个项目都有真实的 GitHub 仓库和链上合约，比纯白皮书项目强，但仍需关注实际使用量和验证者网络的活跃度。

---

## 八、还想深挖的问题

- opML 的挑战者激励模型具体是什么？如果没有人挑战，系统是否等同于中心化？
- Virtuals 上的 Agent 收入数据是否公开可查？有多少 Agent 是真正在产生收入而非仅靠代币投机？
- ERC-8183 的 Evaluator 如果就是一个 opAgent（AI 自动验收），是否形成「AI 审 AI」的信任循环？这个问题在 ORA 的框架下能否被 opML 验证解决？
