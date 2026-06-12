# 酒业 NFT 吧台 — Zai 赛道完整开发计划

> **赛道**: z.ai（智谱 GLM-5 API）
> **框架**: Scaffold-ETH-2（Foundry 合约 + Next.js 前端）
> **提交截止**: 6/13 | **Demo Day**: 6/14 | **剩余**: 7 天

---

## 一、项目概览

### 1.1 项目名称

**Vinothèque（酒藏）** — 链上酒业 NFT 品鉴与收藏平台

备选：**CaskVault** / **BarrelChain** / **Sip3**

### 1.2 一句话描述

让每一瓶酒都有链上身份。酒庄铸造 NFT 代表真实酒品，收藏者可以在「NFT 吧台」浏览、收藏、AI 品鉴。

### 1.3 核心叙事

```
现实世界                      链上世界
┌──────────┐                ┌──────────────┐
│ 酒庄酿造 │ ──── 铸造 ────▶ │  WineNFT     │
│ 限量酒品 │                │  (ERC-721)   │
└──────────┘                └──────┬───────┘
                                   │
┌──────────┐                ┌──────▼───────┐
│ 收藏者   │ ◀── 购买/收藏 ─│  NFT 吧台    │
│          │                │  展示+交易    │
└──────────┘                └──────┬───────┘
                                   │
┌──────────┐                ┌──────▼───────┐
│ AI 侍酒师│ ◀── z.ai API ─│  智能品鉴    │
│          │                │  搭配推荐    │
└──────────┘                └──────────────┘
```

### 1.4 用户角色

| 角色 | 能做什么 |
|------|---------|
| 酒庄（Minter） | 铸造酒品 NFT，填写元数据（产区、年份、品种） |
| 收藏者（Collector） | 浏览吧台、购买/收藏 NFT、查看收藏柜 |
| AI 侍酒师（z.ai） | 自动生成品鉴笔记、推荐搭配、回答酒类问题 |

---

## 二、智能合约设计（Foundry）

### 2.1 合约架构

```
packages/foundry/
├── contracts/
│   ├── WineNFT.sol          # ERC-721 酒品 NFT
│   └── NFTBar.sol           # 吧台主合约（铸造+交易）
├── script/
│   └── Deploy.s.sol         # 部署脚本
└── test/
    ├── WineNFT.t.sol
    └── NFTBar.t.sol
```

### 2.2 WineNFT.sol — ERC-721 合约

```solidity
// 每个 NFT 代表一瓶/一批真实酒品

struct WineMetadata {
    string name;           // 酒名（如 "Château Margaux 2015"）
    string winery;         // 酒庄
    string region;         // 产区（波尔多/勃艮第/纳帕...）
    string vintage;        // 年份
    string varietal;       // 品种（赤霞珠/黑皮诺/霞多丽...）
    string alcoholContent; // 酒精度
    string bottleNumber;   // 瓶号/批次号
    WineCategory category; // 类别
    Rarity rarity;         // 稀有度
}

enum WineCategory { RED, WHITE, ROSE, SPARKLING, SPIRITS, SAKE }
enum Rarity { STANDARD, PREMIUM, RESERVE, LIMITED, COLLECTORS }
```

**核心功能**:

| 函数 | 说明 |
|------|------|
| `mintWine(metadata, quantity)` | 铸造酒品 NFT（仅酒庄角色） |
| `tokenURI(tokenId)` | 返回链上 + IPFS 混合元数据 |
| `getWineMetadata(tokenId)` | 读取酒品信息 |
| `getWinesByOwner(owner)` | 查询某地址拥有的所有酒品 |

### 2.3 NFTBar.sol — 吧台主合约

```solidity
// 吧台 = 展示 + 交易

struct BarItem {
    uint256 tokenId;       // NFT ID
    uint256 price;         // 售价（wei）
    address seller;        // 卖家
    bool isListed;         // 是否上架
    uint256 listedAt;      // 上架时间
}

// 事件
event WineListed(uint256 indexed tokenId, uint256 price, address seller);
event WineSold(uint256 indexed tokenId, address buyer, uint256 price);
event AIReviewAdded(uint256 indexed tokenId, string review, uint256 timestamp);
```

**核心功能**:

| 函数 | 说明 |
|------|------|
| `listWine(tokenId, price)` | 上架到吧台 |
| `buyWine(tokenId)` | 购买（ETH 支付） |
| `unlistWine(tokenId)` | 下架 |
| `getBarItems()` | 获取所有上架酒品 |
| `addAIReview(tokenId, review)` | AI 生成品鉴记录上链 |
| `setMinterRole(addr, bool)` | 管理酒庄白名单 |

---

## 三、前端界面设计

### 3.1 页面结构

```
/                          # 首页 — NFT 吧台展示
/mint                      # 铸造页 — 酒庄铸造新 NFT
/collection                # 收藏柜 — 我的藏酒
/collection/[address]      # 他人收藏柜
/wine/[tokenId]            # 酒品详情页
/sommelier                 # AI 侍酒师 — z.ai 对话
/about                     # 关于页
```

### 3.2 设计语言

| 要素 | 方案 |
|------|------|
| 主色调 | 深棕色（橡木桶）+ 暗金（酒标金箔）+ 深红（红酒） |
| 背景 | 深色木质纹理 |
| 字体 | 标题：Serif（Georgia/Playfair Display 类）；正文：Sans-serif |
| 卡片 | 暖色毛玻璃 + 金色边框 |
| 氛围 | 高端酒窖 / 私人品酒室 |

```
配色方案：
  主背景:  #1a1a2e（深藏蓝）
  面板:    #16213e（暗蓝）
  暖木色:  #8b6914（橡木金）
  酒红:    #722f37（红酒）
  香槟金:  #c9a96e（标签金）
  奶油色:  #f5f0e1（纸张色）
  高亮:    #e8c547（金色高亮）
```

### 3.3 组件树

```
layout/
├── Header.tsx              # 导航栏（Logo + 菜单 + 钱包连接）
├── Footer.tsx              # 页脚
├── WineCard.tsx            # 酒品卡片（展示在吧台/收藏柜）
├── WineCardSkeleton.tsx    # 加载骨架屏
├── ConnectPrompt.tsx       # 未连接钱包提示

home/
├── BarHero.tsx             # 首页 Hero（大图 + 标题 + CTA）
├── BarCounter.tsx          # NFT 吧台主展示区（网格/列表）
├── CategoryFilter.tsx      # 按类别/稀有度筛选
├── FeaturedWines.tsx       # 精选推荐区

mint/
├── MintForm.tsx            # 铸造表单（酒名/产区/年份/图片上传到 IPFS）
├── WinePreview.tsx         # 实时预览 NFT 卡片效果
├── MintProgress.tsx        # 铸造进度（上传 IPFS → 合约确认）

wine/[id]/
├── WineHero.tsx            # 酒品大图 + 基本信息
├── WineMetadata.tsx        # 详细元数据（表格形式）
├── AIReview.tsx            # AI 品鉴笔记（z.ai 生成）
├── BuyAction.tsx           # 购买按钮 + 价格
├── TransactionHistory.tsx  # 交易历史

sommelier/
├── ChatInterface.tsx       # z.ai 对话界面
├── ChatMessage.tsx         # 消息气泡
├── QuickPrompts.tsx        # 快捷提问按钮
├── PairingCard.tsx         # 搭配推荐卡片

collection/
├── CollectionGrid.tsx      # 收藏品网格
├── CollectionStats.tsx     # 收藏统计（数量/总价值/稀有度分布）
├── ShareButton.tsx         # 分享收藏柜
```

---

## 四、数据库与存储

### 4.1 数据存储策略

| 数据 | 存储位置 | 说明 |
|------|---------|------|
| NFT 元数据（JSON） | IPFS（Pinata） | 酒品信息、图片 |
| NFT 图片 | IPFS（Pinata） | 酒标图片/瓶身照片 |
| 合约状态 | 链上（合约 storage） | 所有权、上架信息 |
| AI 品鉴记录 | 合约 events + IPFS | 品鉴笔记存 IPFS，hash 上链 |
| 用户收藏列表 | 链上查询 | `getWinesByOwner(owner)` |

### 4.2 IPFS 元数据 JSON Schema

```json
{
  "name": "Château Margaux 2015",
  "description": "一级庄玛歌正牌，波尔多左岸梅多克产区...",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "Winery", "value": "Château Margaux" },
    { "trait_type": "Region", "value": "Bordeaux, Médoc" },
    { "trait_type": "Vintage", "value": "2015" },
    { "trait_type": "Varietal", "value": "Cabernet Sauvignon" },
    { "trait_type": "Category", "value": "Red" },
    { "trait_type": "Rarity", "value": "Collectors" },
    { "trait_type": "Bottle Number", "value": "042/500" }
  ],
  "ai_tasting_notes": "ipfs://Qm..."
}
```

---

## 五、z.ai AI 功能设计

### 5.1 AI 侍酒师（核心差异化）

场景：用户在 `/sommelier` 页面与 AI 对话

```
用户: "这瓶 2015 年玛歌适合搭配什么菜？"
  │
  ▼
z.ai GLM-5 API（Function Calling 模式）
  │
  ├─ 识别意图：wine_pairing_recommendation
  ├─ 查询链上酒品元数据
  ├─ 生成搭配建议
  │
  ▼
返回: "2015 年的 Château Margaux 单宁细腻，带有黑加仑和紫罗兰香气，
      适合搭配烤羊排、松露烩饭或陈年芝士。建议醒酒 2 小时..."
```

### 5.2 AI 功能模块

| 功能 | 触发方式 | z.ai 的 role |
|------|---------|-------------|
| 智能品鉴笔记 | 铸造时自动生成 / 详情页手动触发 | 根据元数据生成专业品鉴笔记（颜色/香气/口感/余味 四段式） |
| 餐酒搭配 | 用户提问 | 搜索链上酒品 + 推荐搭配菜系 |
| 酒品对比 | 用户选 2 瓶 | 对比两瓶酒的评分、价格、风格 |
| 收藏建议 | 收藏柜页面 | 分析收藏风格，推荐未收藏的酒款 |
| 酒类知识问答 | 自由对话 | 回答产区、品种、酿造工艺等问题 |

### 5.3 z.ai API 调用示例（Function Calling）

```typescript
// 定义 tool schema
const tools = [
  {
    name: "get_wine_metadata",
    description: "Get metadata of a wine NFT by token ID",
    parameters: {
      type: "object",
      properties: {
        tokenId: { type: "number", description: "The NFT token ID" }
      }
    }
  },
  {
    name: "get_bar_items",
    description: "Get all wines currently listed on the bar",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_collection",
    description: "Get wines owned by an address",
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Ethereum address" }
      }
    }
  }
];

// 调用 z.ai
const response = await fetch("https://z.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { "Authorization": `Bearer ${ZAI_API_KEY}` },
  body: JSON.stringify({
    model: "glm-5",
    messages: [{ role: "user", content: userMessage }],
    tools: tools,
    tool_choice: "auto"
  })
});
```

---

## 六、分阶段开发计划

### Phase 0 — 项目初始化（Day 1: 6/6 周六）⏱ 2h

- [ ] **0.1** 用 Scaffold-ETH-2 初始化项目
  ```bash
  npx create-eth@latest hackathon --flavor foundry
  ```
- [ ] **0.2** 安装额外依赖
  ```bash
  cd hackathon
  # shadcn/ui 初始化
  npx shadcn@latest init
  npx shadcn@latest add button card dialog input textarea toast tabs badge separator slider
  # IPFS
  yarn add @pinata/sdk
  # 酒类图标（可选）
  yarn add lucide-react
  ```
- [ ] **0.3** 配置 Pinata API Key 到 `.env`
- [ ] **0.4** 注册 z.ai 获取 API Key，测试一次基本调用
- [ ] **0.5** 创建 `PROPOSAL.md`

### Phase 1 — 智能合约（Day 2: 6/7 周日）⏱ 2h

- [ ] **1.1** 编写 `WineNFT.sol`
  - ERC-721 基础功能（OpenZeppelin）
  - `WineMetadata` 结构体 + mapping
  - `mintWine()` + `tokenURI()` + `getWinesByOwner()`
  - 酒庄白名单（`onlyMinter` modifier）
- [ ] **1.2** 编写 `NFTBar.sol`
  - 上架/下架/购买逻辑
  - 事件：`WineListed`, `WineSold`
  - `getBarItems()` 分页查询
- [ ] **1.3** 编写测试 `WineNFT.t.sol` + `NFTBar.t.sol`
  - 铸造测试（正常 + 非酒庄拒绝）
  - 上架/购买测试
  - 余额检查测试
- [ ] **1.4** 部署到 Anvil 本地链验证
  ```bash
  yarn chain    # 终端1
  yarn deploy   # 终端2
  ```

### Phase 2 — 前端核心（Day 3-4: 6/8-9 周一/周二）⏱ 4h

#### 2.1 主题与布局（Day 3 前半）
- [ ] **2.1.1** Tailwind 主题配置（`tailwind.config.ts` 扩展颜色）
  ```typescript
  colors: {
    oak: { DEFAULT: '#8b6914', light: '#c9a96e', dark: '#5c3d0e' },
    wine: { DEFAULT: '#722f37', light: '#a0525a', dark: '#4a1a24' },
    cream: '#f5f0e1',
    cellar: { DEFAULT: '#1a1a2e', panel: '#16213e' }
  }
  ```
- [ ] **2.1.2** Header 组件（Logo: 葡萄酒杯图标 + "Vinothèque" / 导航: 吧台/铸造/AI侍酒师/收藏 / 钱包按钮）
- [ ] **2.1.3** Footer 组件
- [ ] **2.1.4** WineCard 组件（核心卡片：红酒瓶插画/NFT图片 + 名称 + 产区 + 年份 + 稀有度徽章 + 价格）

#### 2.2 首页 — NFT 吧台（Day 3 后半）
- [ ] **2.2.1** BarHero — 大标题 "Discover Fine Wines on Chain" + 副标题 + "Explore the Bar" 按钮
- [ ] **2.2.2** CategoryFilter — 按类别（红/白/气泡/烈酒）和稀有度筛选
- [ ] **2.2.3** BarCounter — 从合约读取 `getBarItems()`，渲染 WineCard 网格
- [ ] **2.2.4** 加载状态：WineCardSkeleton 骨架屏（深色主题下暖色 shimmer）

#### 2.3 铸造页（Day 4 前半）
- [ ] **2.3.1** MintForm — 表单字段：酒名/酒庄/产区/年份/品种/类别/稀有度/图片上传
  - 图片先上传 Pinata，拿到 IPFS hash
  - 元数据 JSON 上传 Pinata
  - 调用 `mintWine()` 合约
- [ ] **2.3.2** WinePreview — 实时预览 NFT 卡片（与 WineCard 复用组件）
- [ ] **2.3.3** MintProgress — 步骤指示器（① 上传图片 → ② 上传元数据 → ③ 合约铸造 → ④ 完成）

#### 2.4 酒品详情页（Day 4 后半）
- [ ] **2.4.1** WineHero — 大图展示 + 酒名 + 酒庄 + 价格
- [ ] **2.4.2** WineMetadata — 属性表格（年份/品种/产区/酒精度/瓶号/稀有度）
- [ ] **2.4.3** BuyAction — 购买按钮（先判断是否已上架 + 是否是自己的）
- [ ] **2.4.4** TransactionHistory — 该 NFT 的交易历史（解析合约 events）

### Phase 3 — AI 集成 + 收藏柜（Day 5: 6/10 周三）⏱ 2h

#### 3.1 AI 侍酒师页面
- [ ] **3.1.1** ChatInterface — 对话界面（类似 ChatGPT 风格，但用酒窖暗色主题）
  - 用户输入框
  - 消息气泡（用户右对齐，AI 左对齐带葡萄酒杯头像）
  - 加载动画（"Sommelier is tasting..." + 摇晃红酒杯动画）
- [ ] **3.1.2** QuickPrompts — 快捷提问按钮
  - "这瓶酒适合搭配什么？"
  - "给我推荐一款入门红酒"
  - "分析我的收藏口味"
  - "什么酒适合送礼？"
- [ ] **3.1.3** z.ai API 集成（封装到 `lib/zai.ts`）
  - Function Calling tool 定义
  - 对话历史管理
  - 流式响应（如果 z.ai 支持）
- [ ] **3.1.4** PairingCard — 搭配推荐结果卡片（酒 + 菜 + 理由）

#### 3.2 收藏柜页面
- [ ] **3.2.1** CollectionGrid — 调用 `getWinesByOwner(address)` 展示
- [ ] **3.2.2** CollectionStats — 统计卡片（总数/总价值/稀有度分布饼图）
- [ ] **3.2.3** 空状态设计：暖色基调 + "你的酒窖还是空的，去吧台逛逛吧~" + CTA 按钮

#### 3.3 AI 品鉴笔记
- [ ] **3.3.1** 详情页增加 "生成 AI 品鉴笔记" 按钮
- [ ] **3.3.2** 调用 z.ai 生成四段式品鉴（外观/香气/口感/余味）
- [ ] **3.3.3** 品鉴笔记可存储到 IPFS，hash 上链（`addAIReview`）

### Phase 4 — 打磨 + Demo 准备（Day 6: 6/11-12 周四/周五）⏱ 4h

- [ ] **4.1** 移动端响应式适配
- [ ] **4.2** 错误处理完善（合约交互失败、IPFS 上传失败、API 超时）
- [ ] **4.3** 加载状态全覆盖（Skeleton + Spinner + Toast 通知）
- [ ] **4.4** 过渡动画（Framer Motion 或 CSS transition）
  - 卡片 hover 上浮效果
  - 页面切换淡入
  - 购买成功弹窗动画
- [ ] **4.5** 黑暗模式（默认深色，已是酒窖主题）
- [ ] **4.6** SEO 基础（title / description / og:image）
- [ ] **4.7** README 完善（架构图/跑起来步骤/技术栈/合约地址/截图）
- [ ] **4.8** Demo 脚本撰写（3 分钟）
  ```
  0:00-0:30  问题：酒品收藏市场缺乏链上溯源和 AI 品鉴
  0:30-1:30  方案：Vinothèque 如何解决（铸造 → 吧台 → AI 侍酒师）
  1:30-2:30  演示：铸造一瓶酒 → 上架吧台 → AI 对话品鉴 → 购买
  2:30-3:00  亮点总结 + 未来规划
  ```
- [ ] **4.9** Demo 视频录制

### Phase 5 — 提交（Day 7: 6/13 周六）⏱ 2h

- [ ] **5.1** 将合约部署到 Sepolia 测试网
- [ ] **5.2** 在 Sepolia 上铸造 3-5 个示例 NFT
- [ ] **5.3** 前端部署到 Vercel
- [ ] **5.4** 最终验证：从头 clone + 运行 README 步骤
- [ ] **5.5** 提交表单填写

---

## 七、技术架构总结

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  Next.js 14 (App Router) + TypeScript               │
│  Tailwind CSS + shadcn/ui + Framer Motion           │
│  Wagmi + Viem + RainbowKit                          │
│  @pinata/sdk (IPFS upload)                          │
├─────────────────────────────────────────────────────┤
│                  API / Backend                       │
│  z.ai GLM-5 API (Function Calling)                  │
│  Next.js API Routes (/api/sommelier)                │
├─────────────────────────────────────────────────────┤
│                Smart Contracts                       │
│  WineNFT.sol (ERC-721)  +  NFTBar.sol (Marketplace) │
│  Foundry (Solidity + Forge tests)                   │
├─────────────────────────────────────────────────────┤
│                   Storage                            │
│  IPFS (Pinata) — NFT metadata + images              │
│  Ethereum Sepolia — contract state + events         │
└─────────────────────────────────────────────────────┘
```

---

## 八、关键 npm 依赖

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "viem": "2.x",
    "wagmi": "2.x",
    "@rainbow-me/rainbowkit": "2.x",
    "@pinata/sdk": "2.x",
    "tailwindcss": "3.x",
    "lucide-react": "latest",
    "framer-motion": "11.x",
    "clsx": "2.x",
    "class-variance-authority": "latest",
    "react-hot-toast": "latest"
  },
  "devDependencies": {
    "@shadcn/ui": "latest",
    "eslint": "8.x",
    "prettier": "3.x"
  }
}
```

---

## 九、风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| z.ai API Function Calling 不稳定 | 中 | 降级为纯 prompt engineering，不依赖 tool calling |
| 时间不够完成全部功能 | 高 | 优先保证：首页吧台展示 + 详情页 + AI 品鉴笔记。砍掉：AI 对话页面、收藏统计 |
| IPFS 上传慢 | 中 | 限制图片大小（< 2MB），前端压缩 |
| 合约 Bug | 低 | 只用标准 ERC-721 + 简单 listing 逻辑，不写复杂 DeFi |

---

## 十、MVP 保底定义（3 天极限交付）

如果只剩 3 天，按以下顺序做：

```
Day 1: WineNFT.sol + NFTBar.sol → 测试通过 → 本地部署
Day 2: 首页吧台展示 + 详情页 + WineCard 组件（3 个页面）
Day 3: z.ai 品鉴笔记（详情页 AI 按钮）+ IPFS 上传 + README
```

可交付：铸造 NFT → 吧台展示 → 点开详情 → AI 品鉴笔记 的完整闭环。
