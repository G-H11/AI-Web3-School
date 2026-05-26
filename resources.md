# 学习资源包

> 本文件收录 AI × Web3 School 学习过程中推荐的课程、文档、工具和社区资源。内容按学习路径分层整理，可根据个人进度选择性使用。所有外部资源均来自官方文档或社区公认的学习材料。

## 一、核心入口

| 资源 | 链接 | 说明 |
|------|------|------|
| Learning Agent 启动 Prompt | https://aiweb3.school/learning-agent.zh.txt | Agent 初始化指导规范 |
| Handbook（学习手册） | https://aiweb3.school/zh/handbook/ | 核心概念与知识地图 |
| WCB 课程页面 | https://web3career.build/zh/programs/AI-Web3-School | 训练营介绍、日程与报名 |
| WCB Learning 页面 | https://web3career.build/zh/programs/AI-Web3-School#tab=learning | 课程学习与进度管理 |
| WCB Agent API 文档 | https://web3career.build/llms.txt | Agent 开发 API 参考 |

## 二、AI 基础

### 官方 Handbook 章节
- [LLM：大模型能做什么，不能替代什么](https://aiweb3.school/zh/handbook/ai/llm/)
- [Prompt：如何把任务目标、边界和输出格式写清楚](https://aiweb3.school/zh/handbook/ai/prompt/)
- [Context：模型一次能看见什么](https://aiweb3.school/zh/handbook/ai/context/)
- [RAG：如何把外部知识接入模型](https://aiweb3.school/zh/handbook/ai/rag/)
- [Agent：如何让模型进入工具调用和多步执行](https://aiweb3.school/zh/handbook/ai/agent/)
- [Frameworks：LangChain、LangGraph 等框架对比](https://aiweb3.school/zh/handbook/ai/frameworks/)
- [MCP：模型、工具和上下文连接协议](https://aiweb3.school/zh/handbook/ai/mcp/)
- [Evaluation：测试与回放机制](https://aiweb3.school/zh/handbook/ai/evaluation/)

### 外部课程与文章
- [小白进入 web3+AI，该怎么做？](http://mp.weixin.qq.com/s?__biz=MzE5ODY1NjYxOQ==&mid=2247484357&idx=1&sn=9d880b3fdcfae526fe6e3955240bcbe6)（含 AI 工具入门清单：ChatGPT、Claude、Prompt 等）
- [Coursera：Generative AI and Blockchain](https://www.coursera.org/)（AI 与区块链交叉入门）
- [RPI CSCI 4190：Decentralized AI 课程大纲](https://rpi.catalog.acalog.com/preview_course_nopop.php?catoid=33&coid=90423)（涵盖联邦学习、去中心化应用等）

## 三、Web3 基础

### 官方 Handbook 章节
- [Web3 基础大纲](https://aiweb3.school#web3-基础)（区块链、钱包、签名、交易、智能合约核心概念）

### 入门指南
- [How to Become a Web3 Developer Roadmap](https://www.quicknode.com/guides/web3-fundamentals-security/how-to-become-a-web3-developer-roadmap)（QuickNode，2026 年 5 月更新）
- [区块链 Web3 项目开发](https://developer.aliyun.com/article/1704389)（阿里云，2026 年国内开发路径与选型）
- [Blockchain Developer Roadmap 2026：4 Levels to Pro](https://www.guvi.in/)（四个阶段路线图）

### 智能合约教程
- [How to Create a "Hello World" Smart Contract with Solidity](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-create-a-hello-world-smart-contract-with-solidity)（Solidity 新手入门）
- [University of Belgrade：Development of Blockchain Applications 模块](https://en.elab.fon.bg.ac.rs/module-development-of-blockchain-applications/)（含 Remix、Solidity 教学大纲）
- [Arbitrum：Build a dApp with Solidity (Quickstart)](https://docs.arbitrum.io/)

### 开发工具
- [Node.js & npm](https://nodejs.org/en/)
- 代码编辑器：[VSCode](https://code.visualstudio.com/)、[Cursor](https://www.cursor.com/)（AI 辅助编程）
- 智能合约框架：Hardhat、Foundry、OpenZeppelin[reference:10]
- 钱包：MetaMask、Trust Wallet
- 区块链浏览器：Etherscan

## 四、AI × Web3 交叉实践

### 课程与训练营
- [AI+Web3 速成班：免费课程 + 前沿洞察](https://foresightnews.pro/article/detail/76145)（OpenBuild，含 LangChain、Dify.ai 工具链）[reference:12]
- [深度创作营：加密、AI 与 Web3 创新中心 2026](https://gate.tv/)（链上数据分析、情绪驱动 AI 交易模型）

### Agent 开发教程（分类整理）

**生态官方教程**：
- [Rootstock：Conversational AI Agent with Blockchain Actions](https://dev.rootstock.io/ja/use-cases/ai-automation/ai-agent-rootstock/)（NextJS + Groq API，可执行 DeFi 操作）
- [Linea：Build an AI Agent with ElizaOS](https://docs.linea.build/network/tutorials/aiagent-quickstart)（ElizaOS 框架，交互 Linea 区块链）[reference:15]
- [Ethereum.org：Make your own AI trading agent](https://ethereum.org/)（以太坊官方 AI 交易代理教程）

**聚合与生态工具**：
- [QuickNode：How to Build Web3-Enabled AI Agents with Eliza](https://www.quicknode.com/)（插件系统详解）
- [Hedera Agent Lab](https://hedera.com/)（无代码 Agent 构建工具，支持人工确认签名流程）
- [Metaplex：Mint an Agent](https://www.metaplex.com/)（MPL Core 资产 + Agent Identity PDA）
- [Sei Docs：Cambrian Agent Kit Ecosystem Tutorial](https://v2.docs.sei.io/)（Sei 区块链 DeFi Agent 开发 SDK）
- [Crypto.com AI Agent SDK 快速入门指南](https://ai-agent-sdk-docs.crypto.com/)（含模拟环境配置）

### 开发工具与框架
- [ElizaOS](https://github.com/elizaOS/eliza)（AI Agent 开源框架）
- LangChain / LangGraph（AI Agent 编排框架）
- Dify.ai / Coze（AI 应用开发平台）
- The Graph（链上数据索引）
- Chainlink（预言机 + AI 模型接入）

## 五、前沿探索

- [Binance Academy & Marlin Foundation：TEE Coprocessors for Web3 and AI 免费技术课程](https://www.tmcnet.com/)（TEE + 可验证 AI 推理）
- [SMU Academy：Advanced Certificate in Metaverse and AI Module 6（Web 3.0）](https://academy.smu.edu.sg/)（去中心化内容、区块链版权管理）
- [CRCP 6370：Artificial Intelligence in the Metaverse](https://smu.catalog.acalog.com/)（AI 作为 Web3 创意媒介）
- [Lithium AI-Native Smart Contract Language（Lithic）](https://www.advfn.com/)（AI 可验证执行框架）
- [Nexchain Smart Actions：AI-powered blockchain automation](https://www.gate.com/)（去中心化网络自主优化）

## 六、社区与安全

- [GitHub 官网](https://github.com/)（学习仓库托管）
- [GitHub CLI](https://cli.github.com/)（命令行仓库管理）
- 安全提醒：学习过程中切勿将私钥、助记词、API Key 上传至公开仓库；大额资产建议使用冷钱包存储
>>>>>>> a62dde5 (Week 2 Day 1: 每日规划 + Cobo 会议笔记 + AI×Web3 问题地图 + prompts/logs 记录系统)
