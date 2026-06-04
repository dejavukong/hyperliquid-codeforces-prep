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
| ★★☆☆☆ | **哈希 / 模拟** | order_id 注册表、引擎逻辑直接实现 | `hashing`, `implementation` |

> 不建议优先投入：纯数论、计算几何、博弈、字符串自动机、网络流——这些在 HL 的 CF 面里命中率低，留到后期再补。

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
