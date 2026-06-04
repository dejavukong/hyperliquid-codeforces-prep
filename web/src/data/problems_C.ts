import type { Frame, Problem } from '../types'
import { b, treePos } from '../anim/helpers'

/* ───────────────────── 45C Dancing Lessons (matching engine) ───────────────────── */
function dancingFrames(): Frame[] {
  // skills laid out in a line; match the adjacent pair with the smallest diff (leftmost on ties)
  const skills = [2, 4, 5, 8]
  type P = { id: number; skill: number; state?: 'pair' | 'leaving' | 'gone' | 'idle' }
  type Pair = { l: number; r: number; diff: number; state?: 'top' | 'cand' | 'dead' }
  const f: Frame[] = []

  // Initial: all idle, every adjacent pair into the heap, smallest is 'top'
  let people: P[] = skills.map((s, i) => ({ id: i + 1, skill: s, state: 'idle' }))
  let pairs: Pair[] = [
    { l: 1, r: 2, diff: 2, state: 'cand' },
    { l: 2, r: 3, diff: 1, state: 'top' },
    { l: 3, r: 4, diff: 3, state: 'cand' },
  ]
  f.push({
    narr: b(
      'Line of skills [2,4,5,8]. Push every ADJACENT pair into a min-heap keyed by |skill diff| (leftmost wins ties). Diffs: (2,4)Δ2, (4,5)Δ1, (5,8)Δ3.',
      '一排技能 [2,4,5,8]。把每个相邻对按 |技能差| 入小根堆（平局取左）。差值：(2,4)Δ2、(4,5)Δ1、(5,8)Δ3。',
    ),
    people, pairs, metric: [{ label: 'matched', value: '0', tone: 'mint' }],
  })

  // Pop the top → pair (4,5)
  people = people.map((p) => (p.id === 2 || p.id === 3 ? { ...p, state: 'pair' } : p))
  pairs = pairs.map((p) => (p.l === 2 ? { ...p, state: 'top' } : { ...p, state: 'cand' }))
  f.push({
    narr: b(
      'Pop heap top: pair (4,5) with the minimal diff 1. These two leave to dance — like the best-priced order matching first.',
      '弹出堆顶：差值最小的对 (4,5)，差 1。这两人出列共舞——好比最优价格的订单最先撮合。',
    ),
    people, pairs, metric: [{ label: 'matched', value: '0', tone: 'mint' }],
  })

  // leaving
  people = people.map((p) => (p.id === 2 || p.id === 3 ? { ...p, state: 'leaving' } : p))
  f.push({
    narr: b(
      'They leave the line. Any heap pairs touching person 2 or 3 — (2,4) and (5,8) — are now STALE: mark them dead (lazy deletion).',
      '他们离开队列。堆里凡涉及 2 号或 3 号的对 ——(2,4) 与 (5,8)—— 都失效：标记为 dead（惰性删除）。',
    ),
    people,
    pairs: [
      { l: 1, r: 2, diff: 2, state: 'dead' },
      { l: 2, r: 3, diff: 1, state: 'dead' },
      { l: 3, r: 4, diff: 3, state: 'dead' },
    ],
    metric: [{ label: 'matched', value: '0', tone: 'mint' }],
  })

  // gone + relink + new pair
  people = people.map((p) => (p.id === 2 || p.id === 3 ? { ...p, state: 'gone' } : p))
  f.push({
    narr: b(
      'Matched pair #1 = (4,5). The doubly-linked list closes the gap: person 1 (skill 2) and person 4 (skill 8) become adjacent. Push the NEW pair (2,8)Δ6 into the heap.',
      '撮合对 #1 = (4,5)。双向链表把缺口接上：1 号(技能2) 与 4 号(技能8) 成为相邻。把新产生的相邻对 (2,8)Δ6 入堆。',
    ),
    people,
    pairs: [
      { l: 2, r: 3, diff: 1, state: 'dead' },
      { l: 1, r: 4, diff: 6, state: 'top' },
    ],
    metric: [{ label: 'matched', value: '1', tone: 'long' }],
  })

  // pop new top (1,4)
  people = people.map((p) => (p.id === 1 || p.id === 4 ? { ...p, state: 'pair' } : p))
  f.push({
    narr: b(
      'Heap top is now the only live entry (2,8)Δ6. Pop it: pair (2,8). Lazy-deleted stale entries were skipped automatically on the way.',
      '现在堆顶是唯一有效项 (2,8)Δ6。弹出并配对 (2,8)。途中被惰性删除的失效项已自动跳过。',
    ),
    people,
    pairs: [{ l: 1, r: 4, diff: 6, state: 'top' }],
    metric: [{ label: 'matched', value: '1', tone: 'long' }],
  })

  // leaving
  people = people.map((p) => (p.id === 1 || p.id === 4 ? { ...p, state: 'leaving' } : p))
  f.push({
    narr: b(
      'Pair (2,8) leaves. No live neighbors remain on either side, so no new pair is created.',
      '(2,8) 出列。两侧都没有有效邻居了，因此不再产生新对。',
    ),
    people,
    pairs: [{ l: 1, r: 4, diff: 6, state: 'dead' }],
    metric: [{ label: 'matched', value: '1', tone: 'long' }],
  })

  // gone
  people = people.map((p) => (p.id === 1 || p.id === 4 ? { ...p, state: 'gone' } : p))
  f.push({
    narr: b(
      'Matched pair #2 = (2,8). Heap is empty and ≤1 person remains — done. Output order: (4,5) then (2,8).',
      '撮合对 #2 = (2,8)。堆空、剩余 ≤1 人——结束。出列顺序：(4,5) 然后 (2,8)。',
    ),
    people,
    pairs: [],
    metric: [{ label: 'matched', value: '2', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Each of the n−1 initial pairs and each relink pushes O(1) heap ops; lazy deletion skips dead tops. Total O(n log n) — the core of a real matching engine.',
      '初始 n−1 个相邻对加每次重连各做 O(1) 次堆操作；惰性删除跳过失效堆顶。总复杂度 O(n log n)——真实撮合引擎的内核。',
    ),
    people,
    pairs: [],
    metric: [{ label: 'matched', value: '2', tone: 'long' }],
  })

  return f
}

/* ───────────────────── 292E Copying Data (interval cover / latest write) ───────────────────── */
function copyingFrames(): Frame[] {
  // segment tree over 8 leaves (levels=4). leaves are heap ids 8..15.
  const levels = 4
  const node = (id: number, label: string, sub?: string, state?: string) => {
    const p = treePos(id, levels)
    return { id, x: p.x, y: p.y, label, sub, state }
  }
  const baseEdges = [
    { a: 1, b: 2 }, { a: 1, b: 3 },
    { a: 2, b: 4 }, { a: 2, b: 5 },
    { a: 3, b: 6 }, { a: 3, b: 7 },
    { a: 4, b: 8 }, { a: 4, b: 9 },
    { a: 5, b: 10 }, { a: 5, b: 11 },
    { a: 6, b: 12 }, { a: 6, b: 13 },
    { a: 7, b: 14 }, { a: 7, b: 15 },
  ]
  const leafLabel = (id: number) => `b${id - 7}` // leaf id 8 → b1 ... id 15 → b8
  const allNodes = (over: Record<number, string>) =>
    [...Array(15)].map((_, k) => {
      const id = k + 1
      const lbl = id >= 8 ? leafLabel(id) : '·'
      return node(id, lbl, undefined, over[id])
    })
  const f: Frame[] = []

  f.push({
    narr: b(
      'Two arrays a, b over n=8 indices. Build a lazy segment tree on b: each node can carry a tag "latest copy: source offset + timestamp".',
      '两个数组 a、b，下标 n=8。在 b 上建带 lazy 的线段树：每个节点可挂标记“最近一次拷贝：来源偏移 + 时间戳”。',
    ),
    nodes: allNodes({ 1: 'dim' }), edges: baseEdges.map((e) => ({ ...e, state: 'tree' })),
    metric: [{ label: 'ts', value: '0', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Op1 (copy a[x..x+k) into b[2..5]) at timestamp t=7. Descend from the root toward the range [2..5].',
      '操作1（把 a[x..x+k) 拷入 b[2..5]），时间戳 t=7。从根向区间 [2..5] 下降。',
    ),
    nodes: allNodes({ 1: 'path' }),
    edges: baseEdges.map((e) =>
      e.a === 1 && (e.b === 2 || e.b === 3) ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'ts', value: '7', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'The range [2..5] decomposes into canonical covering nodes: leaf b2, the internal node for b3..b4, leaf b5. Stamp the tag {srcOff, ts=7} onto each (interval assign).',
      '区间 [2..5] 分解为典范覆盖节点：叶 b2、覆盖 b3..b4 的内部节点、叶 b5。给每个打上标记 {来源偏移, ts=7}（区间赋值）。',
    ),
    nodes: allNodes({ 9: 'active', 5: 'active', 12: 'active' }),
    edges: baseEdges.map((e) =>
      (e.a === 1 && (e.b === 2 || e.b === 3)) || (e.a === 2 && e.b === 5)
        ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'ts', value: '7', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Covering nodes now hold tag ts=7. Tag means: b[i] := a[srcOff + i]. Children inherit lazily only when we push down.',
      '覆盖节点现在挂着 ts=7 的标记。标记含义：b[i] := a[来源偏移 + i]。子节点仅在下推时才惰性继承。',
    ),
    nodes: allNodes({ 9: 'done', 5: 'done', 12: 'done' }),
    edges: baseEdges.map((e) => ({ ...e, state: 'tree' })),
    metric: [{ label: 'ts', value: '7', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Op2: query b[4] (leaf id 11). Walk root → … → leaf, collecting lazy tags along the path.',
      '操作2：查询 b[4]（叶 id 11）。沿根 → … → 叶下行，收集路径上的 lazy 标记。',
    ),
    nodes: allNodes({ 1: 'path', 2: 'path', 5: 'path' }),
    edges: baseEdges.map((e) =>
      (e.a === 1 && e.b === 2) || (e.a === 2 && e.b === 5)
        ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'ts', value: '7', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'The node covering b3..b4 carries ts=7 — the LATEST write covering b[4]. Resolve b[4] = a[srcOff + 4]; the original b value is overridden.',
      '覆盖 b3..b4 的节点带 ts=7——覆盖 b[4] 的最新写。解析 b[4] = a[来源偏移 + 4]；原始 b 值被覆盖。',
    ),
    nodes: allNodes({ 5: 'active', 11: 'cur' }),
    edges: baseEdges.map((e) =>
      (e.a === 1 && e.b === 2) || (e.a === 2 && e.b === 5)
        ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'answer', value: 'a[srcOff+4]', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Timestamps guarantee newest-write-wins; lazy pushdown keeps it O(log n) per op. This is exactly a versioned ledger / snapshot model: the latest write to a key dominates.',
      '时间戳保证最新写胜出；lazy 下推使每次操作 O(log n)。这正是版本化 ledger / 快照模型：对某键的最新写覆盖旧写。',
    ),
    nodes: allNodes({ 11: 'done' }),
    edges: baseEdges.map((e) => ({ ...e, state: 'tree' })),
    metric: [{ label: 'answer', value: 'a[srcOff+4]', tone: 'long' }],
  })

  return f
}

/* ───────────────────── 19B Checkout Assistant (knapsack) ───────────────────── */
function checkoutFrames(): Frame[] {
  // n=4 items. picking item i "covers" t_i+1 slots (itself + t_i stolen). volume=min(t_i+1, n), value=c_i.
  const items = [
    { c: 6, t: 0 }, // vol 1
    { c: 1, t: 1 }, // vol 2
    { c: 5, t: 2 }, // vol 3
    { c: 3, t: 0 }, // vol 1
  ]
  const n = items.length
  const INF = Infinity
  const dp: number[] = Array(n + 1).fill(INF)
  dp[0] = 0
  const cell = (v: number) => (v === INF ? '∞' : String(v))
  const row = (a: number[]) => a.map(cell)
  const f: Frame[] = []
  const colLabels = ['j=0', 'j=1', 'j=2', 'j=3', 'j=4']

  f.push({
    narr: b(
      'Reframe: choosing item i "covers" t_i+1 slots (itself + the t_i others Bob steals). 0/1 knapsack: dp[j] = min cost to cover j slots. dp[0]=0, rest ∞.',
      '换框：选第 i 件“覆盖” t_i+1 个名额（它自己 + Bob 偷的 t_i 件）。0/1 背包：dp[j] = 覆盖 j 个名额的最小花费。dp[0]=0，其余 ∞。',
    ),
    grid: [row(dp)], colLabels, rowLabels: ['dp'],
    cells: [{ r: 0, c: 0, state: 'done' }],
    metric: [{ label: 'item', value: '—', tone: 'mint' }],
  })

  for (let i = 0; i < n; i++) {
    const vol = Math.min(items[i].t + 1, n)
    const val = items[i].c
    f.push({
      narr: b(
        `Item ${i + 1}: price c=${val}, time t=${items[i].t} → volume min(t+1, n)=${vol}. Iterate j from n down to vol (0/1, reverse).`,
        `第 ${i + 1} 件：价 c=${val}，时间 t=${items[i].t} → 体积 min(t+1, n)=${vol}。j 从 n 倒推到 ${vol}（0/1 背包，逆序）。`,
      ),
      grid: [row(dp)], colLabels, rowLabels: ['dp'],
      cells: [{ r: 0, c: vol, state: 'cur' }],
      metric: [{ label: 'item', value: `c${val}/v${vol}`, tone: 'mint' }],
    })
    for (let j = n; j >= vol; j--) {
      const from = Math.max(0, j - vol) // clamp: a big item still only needs to cover up to n
      if (dp[from] !== INF && dp[from] + val < dp[j]) {
        dp[j] = dp[from] + val
        f.push({
          narr: b(
            `dp[${j}] = min(dp[${j}], dp[${from}] + ${val}) = ${cell(dp[j])}. (j−vol clamped at 0: a big item covering ≥n satisfies all.)`,
            `dp[${j}] = min(dp[${j}], dp[${from}] + ${val}) = ${cell(dp[j])}。（j−vol 夹到 0：覆盖 ≥n 的大件即满足全部。）`,
          ),
          grid: [row(dp)], colLabels, rowLabels: ['dp'],
          cells: [
            { r: 0, c: from, state: 'active' },
            { r: 0, c: j, state: 'done' },
          ],
          metric: [{ label: 'item', value: `c${val}/v${vol}`, tone: 'long' }],
        })
      }
    }
  }

  f.push({
    narr: b(
      `Answer = dp[n] = dp[4] = ${cell(dp[n])} — minimum money to cover all 4 slots. Clamping volume at n is what makes "steal more than remain" legal.`,
      `答案 = dp[n] = dp[4] = ${cell(dp[n])}——覆盖全部 4 个名额的最小花费。把体积夹到 n，才能合法处理“偷得比剩下还多”。`,
    ),
    grid: [row(dp)], colLabels, rowLabels: ['dp'],
    cells: [{ r: 0, c: n, state: 'done' }],
    metric: [{ label: 'answer', value: cell(dp[n]), tone: 'long' }],
  })

  return f
}

/* ───────────────────── 61E Enemy is Weak (BIT triple inversions) ───────────────────── */
function enemyFrames(): Frame[] {
  // array a = [5,2,6,1,4] (distinct). For each j: Lg = #left greater, Rs = #right smaller.
  // answer = Σ Lg_j * Rs_j.
  const a = [5, 2, 6, 1, 4]
  const levels = 4 // BIT drawn as 8-leaf tree shape via treePos
  const baseEdges = [
    { a: 1, b: 2 }, { a: 1, b: 3 },
    { a: 2, b: 4 }, { a: 2, b: 5 },
    { a: 3, b: 6 }, { a: 3, b: 7 },
    { a: 4, b: 8 }, { a: 4, b: 9 },
    { a: 5, b: 10 }, { a: 5, b: 11 },
    { a: 6, b: 12 }, { a: 6, b: 13 },
    { a: 7, b: 14 }, { a: 7, b: 15 },
  ]
  const node = (id: number, label: string, state?: string) => {
    const p = treePos(id, levels)
    return { id, x: p.x, y: p.y, label, state }
  }
  const nodes = (over: Record<number, string>) =>
    [...Array(15)].map((_, k) => {
      const id = k + 1
      return node(id, id >= 8 ? `v${id - 7}` : '·', over[id])
    })
  const f: Frame[] = []

  f.push({
    narr: b(
      'Count triplets i<j<k with a_i>a_j>a_k. Array a=[5,2,6,1,4] (distinct). Idea: for each middle j, ans += (#left greater) × (#right smaller).',
      '统计三元组 i<j<k 满足 a_i>a_j>a_k。数组 a=[5,2,6,1,4]（互不相同）。思路：对每个中间元 j，ans += (左边更大的个数) × (右边更小的个数)。',
    ),
    arr: a, metric: [{ label: 'triplets', value: '0', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Discretize values 1..5. Pass 1 (left→right) over a BIT counts, for each j, how many already-inserted left elements are GREATER than a_j → Lg_j.',
      '把值离散化到 1..5。第 1 遍（从左到右）用 BIT 计数：对每个 j，已插入的左侧元素中比 a_j 大的个数 → Lg_j。',
    ),
    arr: a, pointers: [{ name: 'j', idx: 0 }],
    nodes: nodes({}), edges: baseEdges.map((e) => ({ ...e, state: 'tree' })),
    metric: [{ label: 'triplets', value: '0', tone: 'mint' }],
  })

  // Lg per j: j0 a5→0, j1 a2→1(5), j2 a6→0, j3 a1→3, j4 a4→2
  // Rs per j: j0 a5→3, j1 a2→1(1), j2 a6→2, j3 a1→0, j4 a4→0
  // products: 0,1,0,0,0 → only j1 contributes: Lg=1,Rs=1 → 1.  (5,2,1) is the lone triplet.
  f.push({
    narr: b(
      'At j=1 (a_j=2): query the BIT for left-seen values >2 → only 5 → Lg=1. BIT path nodes are touched in O(log n).',
      '在 j=1 (a_j=2)：查 BIT 中左侧已出现且值 >2 的个数 → 只有 5 → Lg=1。BIT 路径节点 O(log n) 被访问。',
    ),
    arr: a, pointers: [{ name: 'j', idx: 1 }], highlight: [0], active: [1],
    nodes: nodes({ 1: 'path', 3: 'path', 13: 'cur' }),
    edges: baseEdges.map((e) =>
      (e.a === 1 && e.b === 3) || (e.a === 6 && e.b === 13) ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'Lg(j=1)', value: '1', tone: 'mint' }, { label: 'triplets', value: '0', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Pass 2 (right→left) over a fresh BIT gives Rs_j = #right elements smaller than a_j. At j=1 (a_j=2): right side {6,1,4}, smaller → {1} → Rs=1.',
      '第 2 遍（从右到左）用新的 BIT 求 Rs_j = 右侧比 a_j 小的个数。在 j=1 (a_j=2)：右侧 {6,1,4}，更小的 → {1} → Rs=1。',
    ),
    arr: a, pointers: [{ name: 'j', idx: 1 }], active: [1], dim: [0], done: [3],
    nodes: nodes({ 1: 'path', 2: 'path', 8: 'cur' }),
    edges: baseEdges.map((e) =>
      (e.a === 1 && e.b === 2) || (e.a === 4 && e.b === 8) ? { ...e, state: 'path' } : { ...e, state: 'tree' },
    ),
    metric: [{ label: 'Rs(j=1)', value: '1', tone: 'mint' }, { label: 'triplets', value: '0', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Accumulate at j=1: Lg·Rs = 1·1 = 1. This counts the triplet (5,2,1) at positions (0,1,3).',
      '在 j=1 累加：Lg·Rs = 1·1 = 1。它对应位置 (0,1,3) 的三元组 (5,2,1)。',
    ),
    arr: a, highlight: [0, 1, 3], active: [1],
    metric: [{ label: 'product', value: '1', tone: 'long' }, { label: 'triplets', value: '1', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Other middles contribute 0 (e.g. j=2 a=6 has Lg=0; j=4 a=4 has Rs=0). Sum of all Lg·Rs = 1.',
      '其余中间元贡献 0（如 j=2 a=6 的 Lg=0；j=4 a=4 的 Rs=0）。所有 Lg·Rs 之和 = 1。',
    ),
    arr: a, dim: [0, 2, 3, 4], active: [1],
    metric: [{ label: 'triplets', value: '1', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Two BIT passes, each O(n log n). Generalizes 2-element inversions to 3-element ordered-and-decreasing counts — like counting cascading liquidations with strictly decreasing intensity.',
      '两遍 BIT，各 O(n log n)。把二元逆序对推广到“顺序且递减”的三元计数——好比统计强度严格递减的清算级联三连击。',
    ),
    arr: a, done: [0, 1, 2, 3, 4],
    metric: [{ label: 'answer', value: '1', tone: 'long' }],
  })

  return f
}

/* ───────────────────── 380C Sereja and Brackets (mergeable segtree) ───────────────────── */
function bracketsFrames(): Frame[] {
  // bracket string "(()))(()" length 8. leaves 8..15.
  const levels = 4
  const node = (id: number, label: string, sub?: string, state?: string) => {
    const p = treePos(id, levels)
    return { id, x: p.x, y: p.y, label, sub, state }
  }
  const baseEdges = [
    { a: 1, b: 2 }, { a: 1, b: 3 },
    { a: 2, b: 4 }, { a: 2, b: 5 },
    { a: 3, b: 6 }, { a: 3, b: 7 },
    { a: 4, b: 8 }, { a: 4, b: 9 },
    { a: 5, b: 10 }, { a: 5, b: 11 },
    { a: 6, b: 12 }, { a: 6, b: 13 },
    { a: 7, b: 14 }, { a: 7, b: 15 },
  ]
  // leaves (ids 8..15): ( ( ) ) ) ( ( )  → triples (matched|open|close)
  // node4=merge(l8,l9)="((" → (0,2,0); node5="))" → (0,0,2); node6=")(" → (0,1,1); node7="()" add=1 → (2,0,0)
  // node2=merge(n4,n5) add=min(2,2)=2 → (4,0,0); node3=merge(n6,n7) add=min(1,0)=0 → (2,1,1)
  // root1=merge(n2,n3) add=min(0,1)=0 → matched=4+2=6 → (6,1,1)
  const subOf: Record<number, string> = {
    8: '0|1|0', 9: '0|1|0', 10: '0|0|1', 11: '0|0|1', 12: '0|0|1', 13: '0|1|0', 14: '0|1|0', 15: '0|0|1',
    4: '0|2|0', 5: '0|0|2', 6: '0|1|1', 7: '2|0|0',
    2: '4|0|0', 3: '2|1|1', 1: '6|1|1',
  }
  const lblOf: Record<number, string> = {
    8: '(', 9: '(', 10: ')', 11: ')', 12: ')', 13: '(', 14: '(', 15: ')',
  }
  const nodes = (shownSub: number[], over: Record<number, string>) =>
    [...Array(15)].map((_, k) => {
      const id = k + 1
      const lbl = id >= 8 ? lblOf[id] : '·'
      const sub = shownSub.includes(id) ? subOf[id] : undefined
      return node(id, lbl, sub, over[id])
    })
  const tree = baseEdges.map((e) => ({ ...e, state: 'tree' }))
  const leaves = [8, 9, 10, 11, 12, 13, 14, 15]
  const f: Frame[] = []

  f.push({
    narr: b(
      'String s = "(()))(()" (len 8). Each segtree node stores (matched, open, close): matched pairs, leftover unmatched "(" and ")".',
      '串 s = "(()))(()"（长 8）。线段树每个节点存 (matched, open, close)：已配对数、剩余未配对的 "(" 和 ")"。',
    ),
    nodes: nodes(leaves, {}), edges: tree,
    metric: [{ label: 'fmt', value: 'm|o|c', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Leaves: "(" → (0,1,0), ")" → (0,0,1). No matches yet, each holds one stray bracket.',
      '叶子：「(」→ (0,1,0)，「)」→ (0,0,1)。尚无配对，各持一个孤立括号。',
    ),
    nodes: nodes(leaves, leaves.reduce((m, id) => ({ ...m, [id]: 'active' }), {} as Record<number, string>)),
    edges: tree,
    metric: [{ label: 'fmt', value: 'm|o|c', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'pushup: add = min(L.open, R.close) new pairs; matched = L.m+R.m+2·add; open = L.o−add+R.o; close = L.c+R.c−add. Merge node7 = "()" → add=1 → (2,0,0).',
      'pushup：add = min(L.open, R.close) 个新对；matched = L.m+R.m+2·add；open = L.o−add+R.o；close = L.c+R.c−add。合并 node7 = "()" → add=1 → (2,0,0)。',
    ),
    nodes: nodes([14, 15, 7], { 14: 'path', 15: 'path', 7: 'cur' }),
    edges: baseEdges.map((e) => (e.a === 7 ? { ...e, state: 'path' } : { ...e, state: 'tree' })),
    metric: [{ label: 'add', value: '1', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Merge node6 = ")(" → add=min(0,1)=0 → (0,1,1); node5 = "))" → (0,0,2); node4 = "((" → (0,2,0). Unmatched brackets bubble up.',
      '合并 node6 = ")(" → add=min(0,1)=0 → (0,1,1)；node5 = "))" → (0,0,2)；node4 = "((" → (0,2,0)。未配对括号向上冒泡。',
    ),
    nodes: nodes([4, 5, 6, 7], { 4: 'done', 5: 'done', 6: 'done', 7: 'done' }),
    edges: tree,
    metric: [{ label: 'fmt', value: 'm|o|c', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Merge node2 = node4∘node5: add=min(open 2, close 2)=2 → matched=0+0+4=4, open=0, close=0 → (4,0,0). Left strays "((" pair with right strays "))".',
      '合并 node2 = node4∘node5：add=min(open 2, close 2)=2 → matched=0+0+4=4，open=0，close=0 → (4,0,0)。左侧多余 "((" 与右侧多余 "))" 互相配对。',
    ),
    nodes: nodes([4, 5, 2], { 4: 'path', 5: 'path', 2: 'cur' }),
    edges: baseEdges.map((e) => (e.a === 2 ? { ...e, state: 'path' } : { ...e, state: 'tree' })),
    metric: [{ label: 'add', value: '2', tone: 'long' }],
  })

  f.push({
    narr: b(
      'Merge node3 = node6∘node7: add=min(open 1, close 0)=0 → matched=0+2+0=2, open=1, close=1 → (2,1,1).',
      '合并 node3 = node6∘node7：add=min(open 1, close 0)=0 → matched=0+2+0=2，open=1，close=1 → (2,1,1)。',
    ),
    nodes: nodes([6, 7, 3], { 6: 'path', 7: 'path', 3: 'cur' }),
    edges: baseEdges.map((e) => (e.a === 3 ? { ...e, state: 'path' } : { ...e, state: 'tree' })),
    metric: [{ label: 'add', value: '0', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Root = node2∘node3: add=min(open 0, close 1)=0 → matched=4+2+0=6 → (6,1,1). Max correct bracket subsequence length over [0..7] = 2·matched = 6.',
      '根 = node2∘node3：add=min(open 0, close 1)=0 → matched=4+2+0=6 → (6,1,1)。区间 [0..7] 的最长合法括号子序列长度 = 2·matched = 6。',
    ),
    nodes: nodes([2, 3, 1], { 2: 'path', 3: 'path', 1: 'cur' }),
    edges: baseEdges.map((e) => (e.a === 1 ? { ...e, state: 'path' } : { ...e, state: 'tree' })),
    metric: [{ label: 'answer', value: '6', tone: 'long' }],
  })

  f.push({
    narr: b(
      'A query (l,r) merges O(log n) canonical nodes the same way — the associative pushup means any split recombines correctly. This "mergeable state + pushup" is how you aggregate net matchable volume over a range.',
      '查询 (l,r) 同样合并 O(log n) 个典范节点——pushup 满足结合律，任意切分都能正确重组。这套“可合并状态 + pushup”正是聚合区间内净可成交量的范式。',
    ),
    nodes: nodes([1], { 1: 'done' }), edges: tree,
    metric: [{ label: 'answer', value: '6', tone: 'long' }],
  })

  return f
}

export const problemsC: Problem[] = [
  {
    id: '45C', module: 'C', catKey: 'matching', cat: b('Heap + linked list (matching engine)', '堆 + 链表（撮合引擎）'),
    rating: 1900, tags: ['data structures'], url: 'https://codeforces.com/problemset/problem/45/C',
    title: b('Dancing Lessons', '舞蹈课'),
    statement: b(
      'n people stand in a line, person i has dancing skill a_i. While at least one adjacent boy-girl couple exists, the adjacent couple with the minimal skill difference (leftmost on ties) leaves to dance; the line then closes (neighbors become adjacent). Output the pairs in the order they leave.',
      'n 个人站成一排，第 i 人的舞蹈水平为 a_i。只要还存在相邻的男女搭档，技能差最小（平局取最左）的相邻搭档就出列共舞；队列随即闭合（两侧成为相邻）。按出列顺序输出这些搭档对。',
    ),
    hl: b(
      'This is a matching engine itself. A priority_queue (taking the best pair by diff/price) + a doubly-linked list (maintaining adjacency, relinking after a match and pushing the new neighbor pair) + lazy deletion (stale popped pairs are marked invalid in the heap) — price-time priority, cancel-invalidation, and post-match relink all live in this one problem.',
      '这就是撮合引擎本体。priority_queue（按差值/价格取最优对）+ 双向链表（维护“相邻”关系，撮合后把两侧接上并产生新相邻对入堆）+ 惰性删除（已出列的对在堆里标记失效）——price-time priority、撤单失效、撮合后重连，全在这一题里。',
    ),
    idea: b(
      'Push all adjacent pairs into a min-heap (key: diff, ties by left index); keep prev/next of a doubly-linked list plus an alive[] flag; when popping, skip stale pairs, then on a match delete both nodes, link their left and right neighbors, and push the newly created adjacent pair.',
      '所有相邻对入小根堆（键：差值，平局取左下标）；双向链表 prev/next + alive[] 标记；弹堆时跳过失效对，配对后删两点、连接它们的左右邻居、把新产生的相邻对入堆。',
    ),
    complexity: 'O(n log n)', star: 2,
    interview: b(
      'How do you handle stale elements in the heap (lazy deletion vs. a deletable heap)? Why is it O(n log n)? This problem is the closest to a real matching engine — make sure you fully internalize it.',
      '堆里失效元素怎么处理（惰性删除 vs 可删堆）？为什么是 O(n log n)？这题和真实撮合最像，务必吃透。',
    ),
    viz: { kind: 'orderbook', build: dancingFrames, caption: b('heap picks the closest pair; the linked list relinks after each match', '堆取最近的一对；每次撮合后链表重连') },
  },
  {
    id: '292E', module: 'C', catKey: 'segment-tree', cat: b('Interval cover / latest write', '区间覆盖 / 最新写'),
    rating: 1900, tags: ['data structures'], url: 'https://codeforces.com/problemset/problem/292/E',
    title: b('Copying Data', '拷贝数据'),
    statement: b(
      'Two arrays a and b of length n. Operation 1: copy a subsegment of a (length k from position x) into b starting at position y (b[y+q]=a[x+q] for 0≤q<k). Operation 2: query b[x]. Answer each query.',
      '两个长度为 n 的数组 a 和 b。操作 1：把 a 的一段子区间（从位置 x 起长度 k）拷贝到 b 中从位置 y 起的位置（对 0≤q<k 有 b[y+q]=a[x+q]）。操作 2：查询 b[x]。回答每个查询。',
    ),
    hl: b(
      'Interval-assign + newest-write-wins — the snapshot / flush model: after batched interval writes, point-query the "current value", and whoever wrote latest prevails. Versioned ledgers and incremental snapshots share this structure.',
      '区间覆盖 + 最新写胜出——状态快照/落盘的模型：批量区间写入后点查“当前值”，谁写得晚谁有效。版本化 ledger、增量快照都是这个结构。',
    ),
    idea: b(
      'A lazy segment tree where each segment records the "source offset and timestamp of the most recent copy"; to query b[x], look at the latest write covering it — on a hit, map back to the corresponding position in a, otherwise take the original b.',
      '线段树带 lazy，每段记录“最近一次拷贝的来源偏移与时间戳”；查 b[x] 时看覆盖它的最新写，命中则映射回 a 的对应位置，否则取原 b。',
    ),
    complexity: 'O(log n) per op',
    interview: b(
      'How do you guarantee "the newest write overrides the old" (timestamps / lazy pushdown order)? How does this relate to persistence / versioning?',
      '如何保证“最新写覆盖旧写”（时间戳 / lazy 下推顺序）？和持久化 / 版本化的关系？',
    ),
    viz: { kind: 'segtree', build: copyingFrames, caption: b('interval-assign a lazy tag, then a point-query reads the latest covering write', '区间打 lazy 标记，点查读取覆盖它的最新写') },
  },
  {
    id: '19B', module: 'C', catKey: 'dp', cat: b('Knapsack', '背包'),
    rating: 1900, tags: ['dp'], url: 'https://codeforces.com/problemset/problem/19/B',
    title: b('Checkout Assistant', '收银助理'),
    statement: b(
      'n items; item i has price c_i and the assistant spends t_i seconds on it. While the assistant processes one item, Bob can steal another item every 1 second (so during item i he can steal t_i other items). Bob orders the items. Find the minimum total money paid.',
      'n 件物品；第 i 件价格 c_i，收银员处理它要花 t_i 秒。收银员处理一件时，Bob 每 1 秒可以偷走另一件（处理第 i 件期间可偷 t_i 件）。Bob 自行决定物品顺序。求最少需付的总金额。',
    ),
    hl: b(
      'A knapsack variant — picking item i "covers" t_i+1 slots (itself + the t_i stolen ones), and we want to cover all n slots at minimum total price. This is optimal capital allocation under a limited processing-time / compute budget: each operation consumes budget and produces output, minimize the cost to cover all demand.',
      '背包变形——选一件 i “覆盖” t_i+1 个名额（它自己 + 偷的 t_i 件），要用最小总价覆盖全部 n 个名额。这是有限处理时间/算力预算下的最优资金分配：每笔操作消耗预算并产出，求覆盖所有需求的最小成本。',
    ),
    idea: b(
      '0/1 knapsack where dp[j] = min cost to cover j items; item i has volume = min(t_i+1, n) and value = c_i; answer is dp[n] (init dp to +∞, dp[0]=0, clamp the index to n when j would exceed it).',
      '0/1 背包，dp[j]=覆盖 j 件的最小花费，物品 i 体积=min(t_i+1, n)、价值=c_i，求 dp[n]（dp 初始化 +∞、dp[0]=0，j 可超过 n 时夹到 n）。',
    ),
    complexity: 'O(n²)', star: 1,
    interview: b(
      'Why must the volume be min-ed with n? How does this map to the "exactly full" boundary of the classic 0/1 knapsack?',
      '为什么体积要对 n 取 min？这和经典 0/1 背包的“恰好装满”边界如何对应？',
    ),
    viz: { kind: 'dpgrid', build: checkoutFrames, caption: b('dp[j] = min cost to cover j slots, filled item by item', 'dp[j] = 覆盖 j 个名额的最小花费，逐件填充') },
  },
  {
    id: '61E', module: 'C', catKey: 'fenwick', cat: b('BIT triple inversions', '树状数组三元逆序'),
    rating: 1900, tags: ['data structures'], url: 'https://codeforces.com/problemset/problem/61/E',
    title: b('Enemy is Weak', '敌人很弱'),
    statement: b(
      'Given a sequence a of distinct integers, count triplets i<j<k with a_i>a_j>a_k.',
      '给定一个由互不相同的整数组成的序列 a，统计满足 a_i>a_j>a_k 的三元组 i<j<k 的个数。',
    ),
    hl: b(
      'Multi-leg / cascading-event counting. The "three consecutive hits that occur in order and decrease in intensity" inside a liquidation cascade, or combinations satisfying order + magnitude constraints in multi-leg arbitrage, are 3-element (or higher) partial orders, and two BIT passes is the standard solution.',
      '多腿/级联事件计数。清算级联里“先后发生且强度递减的三连击”、多腿套利里满足顺序+大小关系的组合计数，都是三元（乃至多元）偏序，BIT 两遍是标准解法。',
    ),
    idea: b(
      'For each j, find Lg_j = how many elements to the left are greater, and Rs_j = how many to the right are smaller; the answer is Σ_j Lg_j·Rs_j. After discretization, two BIT passes (one left-to-right, one right-to-left).',
      '对每个 j，求左边比它大的个数 Lg_j 和右边比它小的个数 Rs_j，答案 = Σ_j Lg_j·Rs_j。离散化后两遍 BIT（一遍从左、一遍从右）。',
    ),
    complexity: 'O(n log n)',
    interview: b(
      'How do you generalize from 2-element inversion counts (merge sort / BIT) to 3-element ones? Where is the O(n log n) bottleneck?',
      '从二元逆序对（归并 / BIT）如何推广到三元？O(n log n) 的瓶颈在哪？',
    ),
    viz: { kind: 'fenwick', build: enemyFrames, caption: b('two BIT passes give #left-greater × #right-smaller per middle element', '两遍 BIT 求每个中间元的 左边更大数 × 右边更小数') },
  },
  {
    id: '380C', module: 'C', catKey: 'segment-tree', cat: b('Mergeable segment tree', '可合并线段树'),
    rating: 2000, tags: ['data structures'], url: 'https://codeforces.com/problemset/problem/380/C',
    title: b('Sereja and Brackets', 'Sereja 与括号'),
    statement: b(
      "A bracket string s of '(' and ')'. Answer m queries (l,r): the length of the maximum correct bracket subsequence of s[l..r].",
      '一个由 “(” 和 “)” 组成的括号串 s。回答 m 个查询 (l,r)：s[l..r] 的最长合法括号子序列的长度。',
    ),
    hl: b(
      'A segment tree over mergeable interval info — the essence of matching is "how many pairs can be matched within a range". Each node stores (matched count, leftover unmatched "(", leftover unmatched ")"); on merge, the left side\'s spare "(" pair with the right side\'s spare ")". This is exactly a range matchable-volume / net aggregate query: how much of the buys and sells within a range can be matched off.',
      '可合并区间信息的线段树——撮合的精髓是“区间内能配对多少”。每个节点存 (已匹配数, 剩余未匹配的左括号, 剩余未匹配的右括号)，合并时左边多余的 “(” 和右边多余的 “)” 再配对。这正是区间可成交量/净额聚合查询：买卖在区间内能撮合掉多少。',
    ),
    idea: b(
      "Segment-tree node stores a triple (matched, open, close); pushup: add = min(L.open, R.close); matched = L.matched + R.matched + 2·add; open = L.open − add + R.open; close = L.close + R.close − add. A query merges several nodes' triples.",
      '线段树节点存三元组 (matched, open, close)；pushup: add=min(L.open,R.close); matched=L.matched+R.matched+2*add; open=L.open-add+R.open; close=L.close+R.close-add。查询区间合并若干节点的三元组。',
    ),
    complexity: 'O((n+m) log n)', star: 2,
    interview: b(
      'Why is the merge rule correct, and is it associative? "Define a mergeable state + pushup" is the general paradigm for advanced segment trees — be sure to explain it clearly.',
      '合并规则为什么正确、是否满足结合律？“定义可合并状态 + pushup”是线段树进阶的通用范式，务必讲清。',
    ),
    viz: { kind: 'segtree', build: bracketsFrames, caption: b('node = (matched, open, close); merge pairs left-open with right-close', '节点 = (matched, open, close)；合并时左多余“(”与右多余“)”配对') },
  },
]
