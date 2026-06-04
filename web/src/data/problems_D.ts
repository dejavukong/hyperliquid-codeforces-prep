import type { Frame, Problem } from '../types'
import { b } from '../anim/helpers'

/* ───────────────────── 2046C Adventurers (2D partition / load balance) ───────────────────── */
function adventurersFrames(): Frame[] {
  // 6x6 grid; ~8 points. Choose a divider (x0,y0) splitting into 4 quadrants;
  // maximize the minimum count among the 4. We sweep x0 right across a couple positions.
  // Grid rows are y (top row = high y), columns are x. We'll lay points out and count quadrants.
  // Points (col x, row r) with r in grid-space (0=top). Use 8 points:
  //   (1,1) (4,1) (2,2) (5,2) (1,4) (3,4) (4,5) (5,4)
  const pts = [
    { x: 1, r: 1 }, { x: 4, r: 1 }, { x: 2, r: 2 }, { x: 5, r: 2 },
    { x: 1, r: 4 }, { x: 3, r: 4 }, { x: 4, r: 5 }, { x: 5, r: 4 },
  ]
  const N = 6
  const blank = (): (string | null)[][] =>
    Array.from({ length: N }, () => Array<string | null>(N).fill(null))
  const withPts = (g: (string | null)[][]) => {
    for (const p of pts) g[p.r][p.x] = '•'
    return g
  }
  const ptCells = () => pts.map((p) => ({ r: p.r, c: p.x, state: 'active' as const }))

  // count quadrants for divider at column cx (x0 between cx-1 and cx) and row cr (y0 between cr-1 and cr).
  // In grid-space, smaller r = higher y. Define: top = r < cr, bottom = r >= cr; left = x < cx, right = x >= cx.
  const counts = (cx: number, cr: number) => {
    let tl = 0, tr = 0, bl = 0, br = 0
    for (const p of pts) {
      const top = p.r < cr
      const left = p.x < cx
      if (top && left) tl++
      else if (top && !left) tr++
      else if (!top && left) bl++
      else br++
    }
    return { tl, tr, bl, br, min: Math.min(tl, tr, bl, br) }
  }

  const dividerCells = (cx: number, cr: number) => {
    const cells: { r: number; c: number; state: 'cur' }[] = []
    for (let r = 0; r < N; r++) cells.push({ r, c: cx, state: 'cur' })
    for (let c = 0; c < N; c++) cells.push({ r: cr, c, state: 'cur' })
    return cells
  }

  const quadMetric = (cx: number, cr: number) => {
    const c = counts(cx, cr)
    return [
      { label: 'TL', value: String(c.tl), tone: 'mint' as const },
      { label: 'TR', value: String(c.tr), tone: 'mint' as const },
      { label: 'BL', value: String(c.bl), tone: 'mint' as const },
      { label: 'BR', value: String(c.br), tone: 'mint' as const },
      { label: 'min', value: String(c.min), tone: 'long' as const },
    ]
  }

  const f: Frame[] = []

  f.push({
    narr: b(
      'n city points in the plane. Pick a dividing point (x0,y0) splitting the plane into 4 quadrants — one merchant each. Goal: maximize the MINIMUM quadrant count (balance the busiest shard down).',
      '平面上 n 个城市点。选一个分割点 (x0,y0) 把平面切成 4 个象限——每个象限一个商人。目标：最大化象限计数的最小值（把最繁忙的分片压到最优）。',
    ),
    grid: withPts(blank()), cells: ptCells(),
    metric: [{ label: 'points', value: '8', tone: 'mint' }],
  })

  f.push({
    narr: b(
      'Discretize coordinates and sweep x0 left→right. Maintain the y-distribution of points on each side (merge-sort tree / persistent segtree). Start with the divider at column 2.',
      '离散化坐标，从左到右扫描 x0。用合并排序树 / 可持久化线段树维护两侧点的 y 分布。先把分割线放在列 2。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(2, 3)],
    metric: quadMetric(2, 3),
  })

  // x0=2, y0 between rows 2 and 3 (cr=3): left x<2 = {(1,1),(2,2)? no 2>=2 so x<2: (1,1),(1,4)}; let's just show counts.
  f.push({
    narr: b(
      'At x0=col2, y0=row3: the four quadrant counts appear as metrics TL/TR/BL/BR. The bottleneck is min(TL,TR,BL,BR). Now we tune y0 to lift that minimum.',
      '在 x0=列2、y0=行3：四象限计数显示为指标 TL/TR/BL/BR。瓶颈是 min(TL,TR,BL,BR)。现在调 y0 抬高这个最小值。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(2, 3)],
    metric: quadMetric(2, 3),
  })

  f.push({
    narr: b(
      'For a fixed x0, the best y0 is found by binary search / scan over the y-axis: as y0 rises, top counts grow and bottom shrink — pick the y0 maximizing the min of the four.',
      '固定 x0 时，最佳 y0 由 y 轴上的二分 / 扫描确定：y0 上移则上方计数增、下方减——取使四象限最小值最大的 y0。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(2, 2)],
    metric: quadMetric(2, 2),
  })

  f.push({
    narr: b(
      'Advance the sweep: move x0 right to column 3. Points crossing the line move from the right structure to the left; update the y-distributions incrementally.',
      '推进扫描：把 x0 右移到列 3。跨过分割线的点从右侧结构移入左侧；增量更新 y 分布。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(3, 3)],
    metric: quadMetric(3, 3),
  })

  f.push({
    narr: b(
      'At x0=col3, re-tune y0 (here row3): four counts rebalance, giving a more even split. Track the best min seen across all (x0,y0).',
      '在 x0=列3，重新调 y0（此处行3）：四象限重新平衡，得到更均匀的切分。记录所有 (x0,y0) 中见到的最优最小值。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(3, 3)],
    metric: quadMetric(3, 3),
  })

  f.push({
    narr: b(
      'Over all O(n) candidate x0 columns, each needing an O(log n) y-binary-search inside an O(log n) structure, the total is O(n log² n). "Maximize the minimum" ⇒ binary-search / greedy sweep; the chosen split balances the load across all 4 shards.',
      '遍历全部 O(n) 个候选 x0 列，每个在 O(log n) 结构内做 O(log n) 的 y 二分，总复杂度 O(n log² n)。“最大化最小值” ⇒ 二分 / 贪心扫描；选定的切分让 4 个分片负载均衡。',
    ),
    grid: withPts(blank()), cells: [...ptCells(), ...dividerCells(3, 3)],
    metric: quadMetric(3, 3),
  })

  return f
}

export const problemsD: Problem[] = [
  {
    id: '2046C', module: 'D', catKey: 'sharding', cat: b('2D partition / load balance', '二维分片 / 负载均衡'),
    rating: 2100, tags: ['binary search', 'data structures', 'sortings'], url: 'https://codeforces.com/problemset/problem/2046/C',
    title: b('Adventurers', '冒险家'),
    statement: b(
      'Given points (cities) in the plane, choose a dividing point (x0,y0) splitting the plane into 4 quadrants, one per merchant. Maximize the minimum number of points among the 4 quadrants.',
      '给定平面上的若干点（城市），选择一个分割点 (x0,y0) 把平面划分为 4 个象限，每个商人一个象限。最大化 4 个象限中点数的最小值。',
    ),
    hl: b(
      'Sharding / load balancing — split the order book / accounts along two dimensions (e.g. price × time, or two risk axes) into multiple shards so the busiest shard\'s load is minimized. When an engine like Hyperliquid scales horizontally for high throughput, this is exactly "partition so the worst shard is as good as possible".',
      '分片 / 负载均衡——把订单簿/账户按二维（如价格×时间、或两类风险维度）切分成多个 shard，使最繁忙的 shard 负载最小化。HL 这种高吞吐引擎做水平扩展时正是这种“切分使最坏分片最优”。',
    ),
    idea: b(
      'Discretize coordinates and sweep x0; maintain the current left/right y-distributions with a merge-sort tree / persistent segment tree, and for each x0 binary-search over y to maximize the minimum of the four quadrants.',
      '离散化坐标，扫描线枚举 x0，用合并排序树 / 可持久化线段树维护当前左右两侧的 y 分布，对每个 x0 在 y 上二分使四象限的最小值最大化。',
    ),
    complexity: 'O(n log² n)', star: 1,
    interview: b(
      'Why does "maximize the minimum" hint at binary search / a greedy sweep? What are the time/space trade-offs of a merge-sort tree vs. a persistent segment tree?',
      '为什么“最大化最小值”暗示二分 / 贪心扫描？合并排序树和可持久化线段树各自的时空权衡？',
    ),
    viz: { kind: 'dpgrid', build: adventurersFrames, caption: b('sweep the divider; 4 quadrant counts as metrics, maximize their minimum', '扫描分割线；四象限计数作指标，最大化其最小值') },
  },
]
