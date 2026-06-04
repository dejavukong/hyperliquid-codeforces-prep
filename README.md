# Hyperliquid 面试 · Codeforces 刷题清单

> 为面试 **Hyperliquid** 准备的算法刷题路线。核心假设：HL 的撮合引擎（on-chain CLOB）对**资金利用效率**和**高性能**有极致要求，所以它在 Codeforces 上筛的题，本质是在筛**数据结构 + 二分/贪心/DP 的工程级硬功夫**。
>
> 本清单里的**每一道题都来自 Codeforces 官方 API 核验**（题号、难度 rating、tags 真实存在），题意也逐题抓取真实题面校对过，不是凭记忆编的。

---

## 0. 先理解 Hyperliquid 在考什么

Hyperliquid 不是普通合约链。它的 **HyperCore** 在自研 L1（HyperBFT 共识）上跑了一个**完全链上的中央限价订单簿（CLOB）**，撮合走 **price-time priority（价格优先、同价时间优先）**。这意味着引擎每秒要做海量的：

- **插入 / 撤单 / 撮合**：订单簿是 `价格 → 该价位的 FIFO 队列` 的有序结构，最优买卖价要 O(log n) 拿到 → **有序集合 / 平衡树 / 堆**。
- **状态聚合与落盘**：深度、净额、保证金占用要可增量更新、可快照、可确定性重放 → **线段树 / 树状数组 / 区间覆盖**。
- **清算**：维护保证金检查、按风险排序、级联处理 → **排序 + 贪心 + 区间/计数**。
- **资金利用效率**：在保证金/容量约束下最大化利用率（cross-margin、unified account、Account Abstraction 一层层推进就是为了这个）→ **二分答案 / 背包 / 贪心**。
- **性能**：用 O(log n)、O(n) 摊还、单调栈/队列替代暴力 O(n²) → 这正是 CF 的核心训练目标。

所以 HL 的 CF 筛选，**不会考冷门数论或几何**，而是高度集中在下面几类。

---

## 1. HL 最可能筛的题目类别（按重要度排序）

| 优先级 | 类别 | 对应 HL 引擎的什么 | CF tag |
|---|---|---|---|
| ★★★★★ | **有序数据结构**（平衡树 / 有序集合 / 堆 / 单调栈队列） | 订单簿本体：最优价、插入撤单撮合 | `data structures` |
| ★★★★★ | **线段树 / 树状数组（BIT）** | 深度聚合、区间净额、计数统计、落盘快照 | `data structures` |
| ★★★★☆ | **二分 / 二分答案** | 资金利用效率：约束下最大化利用率 | `binary search` |
| ★★★★☆ | **贪心 + 排序** | 撮合配对、清算顺序、资源分配 | `greedy`, `sortings` |
| ★★★☆☆ | **动态规划（背包/偏序链）** | 有限预算/算力下的最优资金分配 | `dp` |
| ★★★☆☆ | **双指针 / 滑动窗口** | 吞吐窗口、限速、区间统计 | `two pointers` |
| ★★★☆☆ | **图论（连通性 / SCC / 桥 / MST / 最短路 / 拓扑序）** | **HyperBFT 共识 + P2P gossip 网络**：连通性、容错、定序 | `graphs`, `dfs and similar`, `dsu` |
| ★★☆☆☆ | **哈希 / 模拟** | order_id 注册表、引擎逻辑直接实现 | `hashing`, `implementation` |

> 不建议优先投入：纯数论、计算几何、字符串自动机、网络流——这些在 HL 的 CF 面里命中率低，留到后期再补。

---

## 2. 刷题路线（从易到难，16 道）

完整逐题详解见 **[ROADMAP.md](./ROADMAP.md)**，勾选进度用 **[PROGRESS.md](./PROGRESS.md)**。

| # | 难度 | 题号 | 题名 | 核心考点 | 对应 HL 环节 |
|---|---|---|---|---|---|
| 1 | 1000 | [230A](https://codeforces.com/problemset/problem/230/A) | Dragons | 贪心 + 排序 | 清算顺序：按风险门槛排序处理 |
| 2 | 1200 | [176A](https://codeforces.com/problemset/problem/176/A) | Trading Business | 贪心 + 容量约束 | 价差套利、有限容量下最优配置 |
| 3 | 1300 | [4C](https://codeforces.com/problemset/problem/4/C) | Registration System | 哈希表 | order_id / 用户注册表查重 |
| 4 | 1500 | [91B](https://codeforces.com/problemset/problem/91/B) | Queue | 后缀最值 + 二分 | "右侧更优价"查询、价格优先级 |
| 5 | 1600 | [68B](https://codeforces.com/problemset/problem/68/B) | Energy exchange | **二分答案** + 损耗 | **资金再平衡/调拨（带滑点费用）** |
| 6 | 1700 | [339D](https://codeforces.com/problemset/problem/339/D) | Xenia and Bit Operations | **线段树**点更新 | 价位量变后增量重算聚合 |
| 7 | 1700 | [4D](https://codeforces.com/problemset/problem/4/D) | Mysterious Present | 二维偏序最长链 DP | 多维约束下的最长可行序列 |
| 8 | 1800 | [459D](https://codeforces.com/problemset/problem/459/D) | Pashmak and Parmida | **树状数组**数偏序对 | 统计满足条件的(买,卖)对 / 风险计数 |
| 9 | 1800 | [46D](https://codeforces.com/problemset/problem/46/D) | Parking Lot | 线段树找最左可用 | 空位/slot 分配（订单簿、内存池、落盘） |
| 10 | 1900 | [547B](https://codeforces.com/problemset/problem/547/B) | Mike and Feet | **单调栈** O(n) | 区间风险极值、深度曲线，干掉 O(n²) |
| 11 | 1900 | [45C](https://codeforces.com/problemset/problem/45/C) | Dancing Lessons | **堆 + 双向链表** | **撮合引擎本体**：取最优配对 + 撤单失效 |
| 12 | 1900 | [292E](https://codeforces.com/problemset/problem/292/E) | Copying Data | 线段树区间覆盖 | 快照/状态落盘，区间批量写 + 点查 |
| 13 | 1900 | [19B](https://codeforces.com/problemset/problem/19/B) | Checkout Assistant | **背包** DP | 有限处理预算下的最优资金分配 |
| 14 | 1900 | [61E](https://codeforces.com/problemset/problem/61/E) | Enemy is weak | BIT 三元逆序 | 多腿/级联事件计数 |
| 15 | 2000 | [380C](https://codeforces.com/problemset/problem/380/C) | Sereja and Brackets | **线段树可合并区间** | 区间可成交量/净额聚合查询 |
| 16 | 2100 | [2046C](https://codeforces.com/problemset/problem/2046/C) | Adventurers | 合并排序树 + 二分 | **分片/负载均衡**：二维切分订单簿 |

难度分布：1000→2100，覆盖 HL 面最可能的区间（典型考 **1400–2100**）。先吃透 1–13，再冲 14–16。

### 2b. P2P 与共识专项（7 道，对应 HyperBFT + gossip 网络）

Hyperliquid 的 **HyperBFT** 是 HotStuff 系的 leader-based BFT 共识，节点间靠 **P2P gossip** 传播区块/投票。这一类在 CF 上几乎全是**图论**：网络连通性、容错（单点故障）、消息定序、广播树。逐题详解见 [ROADMAP.md 模块 E](./ROADMAP.md#模块-e--p2p-与共识hyperbft--gossip-网络)。

| # | 难度 | 题号 | 题名 | 核心考点 | 对应共识/P2P 环节 |
|---|---|---|---|---|---|
| E1 | 1600 | [510C](https://codeforces.com/problemset/problem/510/C) | Fox And Names | **拓扑排序** | 从局部约束推全局总序 = 交易定序 / DAG 共识 |
| E2 | 1700 | [427C](https://codeforces.com/problemset/problem/427/C) | Checkposts | **SCC（Tarjan）** | 强连通组 = 互达节点群 / 选集群代表 |
| E3 | 1900 | [20C](https://codeforces.com/problemset/problem/20/C) | Dijkstra? | 最短路 + 路径还原 | min-latency 消息路由 |
| E4 | 1900 | [1245D](https://codeforces.com/problemset/problem/1245/D) | Shichikuji and Power Grid | **MST**（虚拟源点） | 最小代价 overlay / 广播树 |
| E5 | 2000 | [999E](https://codeforces.com/problemset/problem/999/E) | Reachability from the Capital | SCC 缩点 + 贪心 | 保证从 leader 可达全网的最少连接（修复分区） |
| E6 | 2000 | [118E](https://codeforces.com/problemset/problem/118/E) | Bertown roads | **桥** + 边定向（DFS 树） | 链路定向后仍全连通；桥 = 单点故障链路 |
| E7 | 2100 | [1000E](https://codeforces.com/problemset/problem/1000/E) | We Need More Bosses | **桥树** + 树直径 | 网络中必经关键链路 = 最故障敏感路径 |

> 补充心法（共识本身的算法直觉，不一定有对应 CF 题）：**Quorum 交集**（3f+1 中任意两个 2f+1 必相交）本质是计数 / 鸽巢；**leader 轮换 / view-change** 是定序；**DAG-based 共识**（Narwhal/Bullshark 系）就是对依赖 DAG 做拓扑排序——E1 是它的入门版。

### 2c. 清算专项（Liquidation，4 道 + 子问题全景）

清算是 perp DEX 最"算法密集"的场景。下表是**子问题 → 算法**的全景（面试可主动讲的框架），完整版 + 练习题详解见 [ROADMAP.md 模块 F](./ROADMAP.md#模块-f--清算liquidation)。

| 清算子问题 | 算法 | 练习题 |
|---|---|---|
| 监控维持保证金、找越线仓位 | 有序集合/堆/线段树（按清算价排序） | — |
| mark price（多源抗操纵） | **两个堆维护动态中位数** | — |
| 决定部分清算数量 | **二分答案** | 见模块 B `68B` |
| 清算单吃进订单簿、算深度滑点 | 前缀和 + 二分 | — |
| **级联清算**（压价触发更多清算） | 模拟 + 单调栈 / BFS / DP | **F3 `607A`** |
| 按风险紧迫度优先处理 | 排序 + 堆 | **F1 `545D`** |
| 边处理边保持不破产 | **反悔贪心 + 堆** | **F2 `1526C2`** |
| ADL 自动减仓排序 | 堆 / 排序（盈利×杠杆打分） | — |
| 平仓盈亏匹配、清算所得实现 | **反悔贪心 + 优先队列** | **F4 `865D`** |

| # | 难度 | 题号 | 题名 | 核心考点 | 对应清算环节 |
|---|---|---|---|---|---|
| F1 | 1300 | [545D](https://codeforces.com/problemset/problem/545/D) | Queue | 贪心 + 排序 | 按紧迫度排序，最大化平稳处理数 |
| F2 | 1600 | [1526C2](https://codeforces.com/problemset/problem/1526/C2) | Potions (Hard) | **反悔贪心 + 堆** | 边处理边保持权益 ≥ 0（不破产） |
| F3 | 1600 | [607A](https://codeforces.com/problemset/problem/607/A) | Chain Reaction | **级联 DP + 二分** | 清算压价的链式触发与波及范围 |
| F4 | 2400 | [865D](https://codeforces.com/problemset/problem/865/D) | Buy Low Sell High | **反悔贪心 + 优先队列** | 平仓盈亏匹配 / PnL 实现（冲刺） |

---

## 3. 怎么用这个仓库

1. **按顺序刷**，每题先独立想 20–40 分钟再看题解。
2. 每题写完，把代码放进 `solutions/`（命名 `230A.cpp` 等），在 [PROGRESS.md](./PROGRESS.md) 勾掉。
3. **重点不是 AC，而是能讲清楚**：用了什么数据结构、复杂度、为什么这个结构最优——面试官会追问。每道题在 ROADMAP 里都标了"**面试会怎么追问**"。
4. C++ 优先（引擎是性能敏感代码，面试默认 C++/Rust 思维）。重点练 `std::set` / `std::priority_queue` / 手写线段树 / BIT。
5. 刷完这 16 道，再用 CF 的 `data structures` + `1400~2000` tag 自助扩展（API：`https://codeforces.com/api/problemset.problems`）。

---

## 4. 数据来源

- 题目元数据：Codeforces 官方 API `problemset.problems`（2026-06 抓取，11223 道题中筛选）。
- 题意：逐题抓取 `codeforces.com/problemset/problem/{c}/{i}` 真实题面校对。
- rating / tags 真实可查，链接均可点。
