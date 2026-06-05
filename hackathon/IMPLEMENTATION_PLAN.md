# NFT Collection DApp 实施计划

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**目标：** 构建一个功能完整的以太坊 NFT 馆藏 DApp，支持 ERC-721 / ERC-721A / ERC-1155 三种标准，包含铸造、展示、详情、浏览、购买、后台管理六大功能模块。

**技术栈：** Scaffold-ETH 2 + Foundry + Next.js + TypeScript + Viem + Wagmi + Tailwind CSS + shadcn/ui + IPFS/Pinata

**项目路径：** `F:\Work\collaborativeLearning\AI-Web3-School\hackathon`

---

## 架构设计

```
hackathon/
├── packages/
│   ├── foundry/                    # Smart Contracts (Foundry)
│   │   ├── src/
│   │   │   ├── BasicNFT.sol        # ERC-721 基础 NFT
│   │   │   ├── BatchNFT.sol        # ERC-721A 批量铸造 NFT
│   │   │   ├── MultiTokenNFT.sol   # ERC-1155 多代币 NFT
│   │   │   └── NFTMarketplace.sol  # 交易市场
│   │   ├── script/
│   │   │   └── DeployAll.s.sol     # 一键部署脚本
│   │   ├── test/
│   │   │   ├── BasicNFT.t.sol
│   │   │   ├── BatchNFT.t.sol
│   │   │   ├── MultiTokenNFT.t.sol
│   │   │   └── NFTMarketplace.t.sol
│   │   └── foundry.toml
│   └── nextjs/                     # Frontend (Next.js 14+)
│       ├── app/
│       │   ├── page.tsx            # 首页 — NFT 浏览/Gallery
│       │   ├── mint/
│       │   │   └── page.tsx        # 铸造页面（支持批量）
│       │   ├── nft/
│       │   │   └── [address]/
│       │   │       └── [tokenId]/
│       │   │           └── page.tsx # NFT 详情页
│       │   ├── admin/
│       │   │   └── page.tsx        # 后台管理
│       │   └── layout.tsx
│       ├── components/
│       │   ├── nft/
│       │   │   ├── NFTCard.tsx     # NFT 卡片组件
│       │   │   ├── NFTGrid.tsx     # NFT 网格/列表
│       │   │   ├── MintForm.tsx    # 铸造表单
│       │   │   ├── BatchMintForm.tsx # 批量铸造表单
│       │   │   └── PurchaseModal.tsx # 购买弹窗
│       │   ├── admin/
│       │   │   ├── AdminPanel.tsx  # 管理面板
│       │   │   └── ContractSelector.tsx # 合约选择器
│       │   ├── layout/
│       │   │   ├── Header.tsx      # 导航头
│       │   │   └── Footer.tsx      # 页脚
│       │   └── ui/                 # shadcn/ui 组件库
│       ├── hooks/
│       │   ├── useNFTContract.ts   # NFT 合约交互 hook
│       │   ├── useMarketplace.ts   # 市场交互 hook
│       │   └── useIPFS.ts          # IPFS 上传 hook
│       ├── lib/
│       │   ├── pinata.ts           # Pinata API 封装
│       │   └── metadata.ts         # NFT 元数据生成
│       ├── types/
│       │   └── nft.ts              # NFT 类型定义
│       └── .env.example            # 环境变量模板
├── .env.example                    # 根环境变量模板
└── README.md
```

## 模块设计（低耦合）

### 合约层
| 合约 | 标准 | 核心功能 |
|------|------|----------|
| BasicNFT | ERC-721 | 铸造、转账、URI 管理、ownerOnly |
| BatchNFT | ERC-721A | 批量铸造、gas 优化、白名单 |
| MultiTokenNFT | ERC-1155 | 多代币/多版次、批量铸造/转账 |
| NFTMarketplace | 自定义 | 上架(List)、下架(Unlist)、购买(Buy)、版税 |

### 前端模块
| 模块 | 页面 | 组件 | 依赖 |
|------|------|------|------|
| Gallery(浏览) | `/` | NFTGrid, NFTCard | useNFTContract |
| Mint(铸造) | `/mint` | MintForm, BatchMintForm | useNFTContract, useIPFS |
| Detail(详情) | `/nft/[addr]/[id]` | NFTCard, PurchaseModal | useNFTContract, useMarketplace |
| Admin(管理) | `/admin` | AdminPanel, ContractSelector | useNFTContract, useMarketplace |
| Purchase(购买) | Modal | PurchaseModal | useMarketplace |

---

## 任务分解

### Phase 1: 环境搭建

#### Task 1.1: 安装 Foundry 工具链
**Objective:** 安装 forge、cast、anvil
**Steps:**
1. `curl -L https://foundry.paradigm.xyz | bash`
2. `foundryup`
3. 验证: `forge --version && cast --version`

#### Task 1.2: 创建 Scaffold-ETH 2 项目 (Foundry版)
**Objective:** 使用 create-eth 初始化项目
**Command:** `npx create-eth@latest hackathon --foundry`
**预期结构:** packages/foundry + packages/nextjs

#### Task 1.3: 安装 shadcn/ui 并初始化
**Objective:** 在 Next.js 中配置 shadcn/ui
**Steps:**
1. 进入 packages/nextjs
2. `npx shadcn@latest init` (选择默认配置)
3. 安装基础组件: button, card, input, dialog, tabs, badge, separator, toast, form, select, label

#### Task 1.4: 安装 Pinata SDK 和 IPFS 依赖
**Objective:** 添加 IPFS 相关包
**Command:** `yarn add @pinata/sdk axios` (在 packages/nextjs)
**And:** `yarn add -D @types/node` (类型)

#### Task 1.5: 创建 .env.example 和环境变量模板
**Objective:** 列出所有需要的密钥，方便用户后续填写
**Files:**
- 根 `.env.example`
- `packages/nextjs/.env.example`

---

### Phase 2: 智能合约开发 (TDD)

#### Task 2.1: BasicNFT.sol — ERC-721 基础合约
**Features:**
- 继承 OpenZeppelin ERC721 + ERC721URIStorage + Ownable
- mint(to, uri) — owner only
- batchMint(address[] tos, string[] uris) — owner only
- tokenURI 查询
- maxSupply 限制

**Tests (BasicNFT.t.sol):**
- testMint: 铸造单个 NFT，验证 owner 和 tokenURI
- testBatchMint: 批量铸造，验证所有 token
- testOnlyOwner: 非 owner 铸造应 revert
- testMaxSupply: 超过上限应 revert
- testTokenURI: URI 存储和查询正确

#### Task 2.2: BatchNFT.sol — ERC-721A 批量优化合约
**Features:**
- 继承 ERC721A + Ownable
- 批量铸造（ERC-721A 原生支持，gas 极低）
- setBaseURI — 统一 base URI
- 白名单机制 (Merkle Tree 或简单 mapping)
- 预售/公售阶段控制

**Tests (BatchNFT.t.sol):**
- testBatchMintGas: 批量铸造 5 个，验证 gas 优化
- testWhitelist: 白名单铸造
- testPublicSale: 公售阶段
- testBaseURI: base URI 设置

#### Task 2.3: MultiTokenNFT.sol — ERC-1155 多代币合约
**Features:**
- 继承 ERC1155 + Ownable
- mintBatch(to, ids[], amounts[]) — 多种代币批量铸造
- 每种代币有独立 URI
- 版次管理（限量版）

**Tests (MultiTokenNFT.t.sol):**
- testMintBatch: 批量铸造多种代币
- testTransfer: ERC-1155 转账
- testBalanceOf: 余额查询
- testURI: 各代币 URI 独立

#### Task 2.4: NFTMarketplace.sol — 交易市场合约
**Features:**
- listNFT(nftContract, tokenId, price) — 上架
- unlistNFT(listingId) — 下架
- buyNFT(listingId) — 购买 (支付 ETH)
- updatePrice(listingId, newPrice) — 修改价格
- 版税机制 (可选: 二次销售版税)
- 平台手续费 (可选)

**Tests (NFTMarketplace.t.sol):**
- testList: 上架 NFT
- testBuy: 购买流程，验证 ETH 转账
- testUnlist: 下架
- testUpdatePrice: 改价
- testNotOwner: 非 owner 不能操作
- testInsufficientPayment: 支付不足 revert

#### Task 2.5: DeployAll.s.sol — 部署脚本
**Objective:** 一键部署所有合约并输出地址
**Steps:**
1. 部署 BasicNFT
2. 部署 BatchNFT
3. 部署 MultiTokenNFT
4. 部署 NFTMarketplace
5. 输出所有合约地址

---

### Phase 3: 前端开发

#### Task 3.1: 类型定义 & 数据层
**Files:** `packages/nextjs/types/nft.ts`, `packages/nextjs/lib/metadata.ts`, `packages/nextjs/lib/pinata.ts`
- NFT 类型: NFTMetadata, Listing, ContractInfo
- metadata.ts: 生成 NFT JSON metadata
- pinata.ts: 上传文件/JSON 到 Pinata IPFS

#### Task 3.2: useNFTContract hook
**File:** `packages/nextjs/hooks/useNFTContract.ts`
- 封装 viem + wagmi 合约交互
- 读取: tokenURI, ownerOf, balanceOf, totalSupply, maxSupply, isWhitelisted
- 写入: mint, batchMint, setBaseURI
- 事件监听: Transfer

#### Task 3.3: useMarketplace hook
**File:** `packages/nextjs/hooks/useMarketplace.ts`
- listNFT, unlistNFT, buyNFT, updatePrice
- 查询: getListings, getListing
- 事件监听: Listed, Unlisted, Purchased

#### Task 3.4: useIPFS hook
**File:** `packages/nextjs/hooks/useIPFS.ts`
- uploadImage(file: File): Promise<string> — 上传图片到 IPFS
- uploadMetadata(metadata: NFTMetadata): Promise<string> — 上传 JSON
- 进度回调

#### Task 3.5: shadcn/ui 基础组件
**安装组件:** Button, Card, Input, Dialog, Tabs, Badge, Separator, Toast, Form, Select, Label, Textarea
**额外组件:** Skeleton (加载占位), ScrollArea

#### Task 3.6: NFTCard 组件
**File:** `packages/nextjs/components/nft/NFTCard.tsx`
- 显示 NFT 图片、名称、描述
- 合约类型 badge (ERC-721 / 721A / 1155)
- Token ID 和 Owner 截断地址
- 点击跳转详情页
- Loading skeleton 状态
- 空状态处理

#### Task 3.7: NFTGrid 组件
**File:** `packages/nextjs/components/nft/NFTGrid.tsx`
- 响应式网格布局 (1/2/3/4 列)
- 接收 NFT 列表分页渲染
- 空状态提示
- 支持筛选 (按合约/类型)

#### Task 3.8: MintForm 组件
**File:** `packages/nextjs/components/nft/MintForm.tsx`
- 图片上传 (拖拽/点击)
- 名称、描述输入
- 属性列表 (动态添加 trait)
- 合约选择 (BasicNFT / BatchNFT / MultiTokenNFT)
- 铸造数量 (BatchNFT 支持批量)
- 上传进度条
- 钱包连接状态检查

#### Task 3.9: BatchMintForm 组件
**File:** `packages/nextjs/components/nft/BatchMintForm.tsx`
- 批量上传多张图片
- 自动生成元数据
- 批量铸造按钮
- Gas 预估

#### Task 3.10: PurchaseModal 组件
**File:** `packages/nextjs/components/nft/PurchaseModal.tsx`
- 显示 NFT 信息和价格
- 当前 listing 状态
- 购买按钮 (ETH 支付)
- 交易确认和状态反馈
- Toast 通知

#### Task 3.11: 首页 — NFT Gallery
**File:** `packages/nextjs/app/page.tsx`
- 默认展示所有已铸造 NFT
- 合约类型 Tab 筛选
- 搜索功能
- 分页/无限滚动
- 响应式布局

#### Task 3.12: 铸造页面
**File:** `packages/nextjs/app/mint/page.tsx`
- 合约类型选择 Tabs
- MintForm / BatchMintForm 切换
- 铸造历史记录
- 操作提示和错误处理

#### Task 3.13: NFT 详情页
**File:** `packages/nextjs/app/nft/[address]/[tokenId]/page.tsx`
- 大图展示 + 元数据信息
- 属性/特质列表
- 合约信息 (标准、地址)
- 所有权信息
- 如果在市场挂单 → 购买按钮
- 如果是 owner → 上架/下架/改价 操作

#### Task 3.14: 后台管理页
**File:** `packages/nextjs/app/admin/page.tsx`
- 合约选择器 (需要 owner 权限)
- 合约信息面板 (totalSupply, maxSupply, baseURI)
- Owner 操作: setBaseURI, toggleWhitelist, withdraw
- 市场上架管理 (所有 listing 列表)
- 收益统计

#### Task 3.15: Layout 布局组件
**Files:** `Header.tsx`, `Footer.tsx`, `layout.tsx`
- 导航: Gallery | Mint | Admin
- 钱包连接按钮 (RainbowKit 自带)
- 网络切换
- 响应式移动端菜单

---

### Phase 4: 集成与测试

#### Task 4.1: 合约编译 & 部署到本地链
- `cd packages/foundry && forge build`
- 启动 anvil 本地链
- 部署所有合约
- 验证合约 ABI 生成

#### Task 4.2: 前端与合约 AB 集成
- 将部署地址写入 `packages/nextjs/contracts/`
- 验证 wagmi 配置正确
- 验证所有 hook 读写操作

#### Task 4.3: 端到端测试
- 本地链 + 前端完整流程测试
- 铸造 → 查看 → 上架 → 购买 → 后台管理

#### Task 4.4: 问题汇总 & .env 整理
- 汇总所有需要用户填写的密钥/配置
- 完善 .env.example 文件
- 生成 README.md 项目说明

---

## 依赖关系

```
Phase 1 (环境) → Phase 2 (合约) → Phase 3 (前端) → Phase 4 (集成)
                                    ↓
                        Phase 3.5 (shadcn/ui) 可与合约并行
```

Phase 2 各合约独立，可并行开发。
Phase 3 组件间低耦合：hooks → 页面组件 → 布局组件。

---

## 需要用户后续填写的密钥清单 (.env.example)

```
# Pinata IPFS
NEXT_PUBLIC_PINATA_JWT=
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud

# Wallet (部署用)
PRIVATE_KEY=

# 网络 RPC
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_ALCHEMY_API_KEY=

# 合约地址 (部署后自动填充)
NEXT_PUBLIC_BASIC_NFT_ADDRESS=
NEXT_PUBLIC_BATCH_NFT_ADDRESS=
NEXT_PUBLIC_MULTI_TOKEN_NFT_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_ADDRESS=
```

---

## 验证标准

- [ ] 所有合约测试通过 (`forge test`)
- [ ] 前端 TypeScript 编译无错误
- [ ] 本地链完整流程可用
- [ ] 所有组件独立可复用
- [ ] .env.example 覆盖所有密钥
- [ ] README.md 包含完整部署指南
