# 撮合引擎 · 算法训练场 — 前端教程

Hyperliquid 面试备战的交互式刷题页面：把 27 道 Codeforces 真题按**撮合 / 共识 / 清算**考点分类，每题支持中英切换、点开答案、配交互动画讲解。

## 跑起来

```bash
cd web
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 产物输出到 dist/，可静态托管（GitHub Pages 等）
npm run preview  # 预览构建产物
```

技术栈：Vite + React + TypeScript + Tailwind CSS + Framer Motion。视觉为 Hyperliquid 风格的交易终端暗色主题。

## 功能

- **分类浏览**：按模块 A–F（热身 / 订单簿核心 / 撮合与状态 / 压轴分片 / P2P 与共识 / 清算）和难度（≤1500 / 1600–1900 / ≥2000）筛选，支持搜索。
- **中英切换**：详情页右上角 `中文 / EN`，**只切换题目内容**（标题、题面、讲解、答案），不影响界面框架。
- **点开答案**：每题"点击显示答案与解释"，展开解法 + 复杂度 + 面试追问。
- **交互动画**：每题配逐帧动画（播放 / 步进 / 倍速），由真实算法模拟驱动——数组、线段树、树状数组、堆、图、DP 网格、数轴、撮合、哈希表等。

## 结构

```
src/
  types.ts                  核心类型（Problem / Frame / VizSpec）
  App.tsx                   路由（目录 ↔ 详情）
  components/
    Catalog.tsx             目录页（筛选 + 分组卡片）
    ProblemDetail.tsx       详情页（中英切换 + 点开答案 + 动画）
    AnimationPlayer.tsx     逐帧播放器（播放/步进/倍速）
    viz/                    可视化渲染器
      ArrayViz · StructViz（线段树/树状数组/堆/图）· DPGridViz
      NumberLineViz · MatchViz（撮合）· HashMapViz
  anim/helpers.ts           动画助手（树布局等）
  data/
    modules.ts              模块元数据
    problems_A..F.ts        27 题数据（双语 + 帧生成器）
    index.ts                聚合
```

每道题是一个 `Problem` 对象：双语 `title/statement/hl/idea/interview`，加一个 `viz.build()` 帧生成器。新增题目：在对应 `problems_X.ts` 里加一个对象即可。

## 数据来源

题号、难度、tags 经 Codeforces 官方 API 核验；题面逐题抓取真实 statement 校对。动画为真实算法的逐步模拟。
