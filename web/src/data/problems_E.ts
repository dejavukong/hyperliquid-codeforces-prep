import type { Frame, Problem } from '../types'
import { b } from '../anim/helpers'

/* ───────────────── 510C Fox And Names (toposort) ───────────────── */
function foxNamesFrames(): Frame[] {
  // 5 letter-nodes a,b,c,d,e laid out; constraints derived from adjacent names.
  // edges: c→a, a→b, b→d (d,e otherwise free) → topo order c a b d e
  type N = { id: string; x: number; y: number; label: string; sub?: string; state?: string }
  type E = { a: string; b: string; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 'a', x: 0.2, y: 0.3, label: 'a' },
    { id: 'b', x: 0.5, y: 0.3, label: 'b' },
    { id: 'c', x: 0.2, y: 0.7, label: 'c' },
    { id: 'd', x: 0.5, y: 0.7, label: 'd' },
    { id: 'e', x: 0.8, y: 0.5, label: 'e' },
  ]
  const ns = (over: Record<string, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Names are pre-sorted by an unknown alphabet. Each adjacent pair gives one constraint "letter u before v". Build a constraint graph over the 26 letters.',
      '名字已按未知字母表排好序。每对相邻名字给出一条约束「字母 u 排在 v 前」。对 26 个字母建约束图。',
    ),
    nodes: ns(), edges: [],
    metric: [{ label: 'order', value: '·····', tone: 'mint' }],
  })
  const edges: E[] = []
  const steps: [string, string, string, string][] = [
    ['c', 'a', 'compare "c.." < "a.." → c before a', '比较 “c..” < “a..” → c 在 a 前'],
    ['a', 'b', 'compare "a.." < "b.." → a before b', '比较 “a..” < “b..” → a 在 b 前'],
    ['b', 'd', 'compare "b.." < "d.." → b before d', '比较 “b..” < “d..” → b 在 d 前'],
  ]
  for (const [u, v, en, cn] of steps) {
    edges.push({ a: u, b: v, dir: true, state: 'active' })
    f.push({
      narr: b(en, cn),
      nodes: ns({ [u]: { state: 'cur' }, [v]: { state: 'active' } }),
      edges: edges.map((e) => ({ ...e })),
      metric: [{ label: 'order', value: '·····', tone: 'mint' }],
    })
  }
  f.push({
    narr: b(
      'No prefix-violation (a longer word never precedes its own prefix), so it is feasible. Now Kahn topo-sort: repeatedly peel a zero-indegree letter.',
      '没有前缀违规（长词从不排在它自己的前缀之前），所以可行。现在用 Kahn 拓扑排序：反复剥掉一个入度为 0 的字母。',
    ),
    nodes: ns(), edges: edges.map((e) => ({ ...e, state: undefined })),
    metric: [{ label: 'order', value: '·····', tone: 'mint' }],
  })
  const order: string[] = []
  const peelSeq = ['c', 'a', 'b', 'd', 'e']
  for (const u of peelSeq) {
    order.push(u)
    const done = order.slice(0, -1)
    f.push({
      narr: b(
        `indegree(${u}) = 0 → output it. order = ${order.join(' ')}…`,
        `入度(${u}) = 0 → 输出它。顺序 = ${order.join(' ')}…`,
      ),
      nodes: ns(
        Object.fromEntries([
          [u, { state: 'cur' }],
          ...done.map((d) => [d, { state: 'done' }] as [string, Partial<N>]),
        ]),
      ),
      edges: edges.map((e) => ({ ...e, state: done.includes(e.a) ? 'dim' : undefined })),
      metric: [{ label: 'order', value: order.join(''), tone: 'long' }],
    })
  }
  f.push({
    narr: b(
      'All letters peeled with no cycle → a consistent global order exists. Append the remaining 21 unconstrained letters anywhere. A cycle would mean Impossible.',
      '全部剥完且无环 → 存在一致的全局序。其余 21 个无约束字母可随意拼接。若有环则 Impossible。',
    ),
    nodes: ns(Object.fromEntries(peelSeq.map((d) => [d, { state: 'done' }]))),
    edges: edges.map((e) => ({ ...e, state: 'dim' })),
    metric: [{ label: 'order', value: 'cabde…', tone: 'long' }],
  })
  return f
}

/* ───────────────── 427C Checkposts (SCC / Tarjan) ───────────────── */
function checkpostsFrames(): Frame[] {
  // 6 nodes, 2 SCCs: {0,1,2} cycle and {3,4,5} cycle, one-way bridge 2→3.
  // costs: 0:5 1:3 2:3 | 3:8 4:2 5:9 → minCost SCC1=3 (nodes 1,2 tie → 2 ways), SCC2=2 (node 4 only → 1 way)
  type N = { id: number; x: number; y: number; label: number; sub?: string; state?: string }
  type E = { a: number; b: number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 0, x: 0.15, y: 0.25, label: 0, sub: 'c=5' },
    { id: 1, x: 0.15, y: 0.75, label: 1, sub: 'c=3' },
    { id: 2, x: 0.4, y: 0.5, label: 2, sub: 'c=3' },
    { id: 3, x: 0.6, y: 0.5, label: 3, sub: 'c=8' },
    { id: 4, x: 0.85, y: 0.25, label: 4, sub: 'c=2' },
    { id: 5, x: 0.85, y: 0.75, label: 5, sub: 'c=9' },
  ]
  const ED: E[] = [
    { a: 0, b: 1, dir: true }, { a: 1, b: 2, dir: true }, { a: 2, b: 0, dir: true },
    { a: 2, b: 3, dir: true },
    { a: 3, b: 4, dir: true }, { a: 4, b: 5, dir: true }, { a: 5, b: 3, dir: true },
  ]
  const ns = (over: Record<number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      '6 junctions, one-way roads. A checkpost at i protects everyone mutually reachable with i — i.e. its whole SCC. Find min total cost + #ways.',
      '6 个路口，单向路。在 i 建检查站可保护所有与 i 相互可达的点——即它所在的 SCC。求最小总代价 + 方案数。',
    ),
    nodes: ns(), edges: es(),
    metric: [{ label: 'cost', value: '0' }, { label: 'ways', value: '1' }],
  })
  f.push({
    narr: b(
      'Run Tarjan. DFS finds the first strongly-connected component: {0,1,2} — they form a cycle so each reaches the others.',
      '跑 Tarjan。DFS 找到第一个强连通分量：{0,1,2}——它们成环，互相可达。',
    ),
    nodes: ns({ 0: { state: 'active' }, 1: { state: 'active' }, 2: { state: 'active' } }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 2: { state: 'tree' } }),
    metric: [{ label: 'cost', value: '0' }, { label: 'ways', value: '1' }],
  })
  f.push({
    narr: b(
      'In SCC {0,1,2} the cheapest cost is 3 — achieved by node 1 AND node 2 (two nodes tie). cost += 3; ways ×2.',
      'SCC {0,1,2} 内最便宜代价是 3——节点 1 和节点 2 都取到（两个并列）。cost += 3；方案数 ×2。',
    ),
    nodes: ns({ 0: { state: 'done' }, 1: { state: 'cur' }, 2: { state: 'cur' } }),
    edges: es({ 0: { state: 'dim' }, 1: { state: 'dim' }, 2: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '3', tone: 'long' }, { label: 'ways', value: '2', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Edge 2→3 leaves the component (one-way, no return) — it does NOT merge them. DFS continues into the second SCC: {3,4,5}.',
      '边 2→3 离开分量（单向、不能返回）——不会合并它们。DFS 继续进入第二个 SCC：{3,4,5}。',
    ),
    nodes: ns({
      0: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'active' }, 4: { state: 'active' }, 5: { state: 'active' },
    }),
    edges: es({ 4: { state: 'tree' }, 5: { state: 'tree' }, 6: { state: 'tree' }, 3: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '3', tone: 'long' }, { label: 'ways', value: '2', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'In SCC {3,4,5} the cheapest cost is 2 — only node 4 achieves it (unique). cost += 2 → 5; ways ×1 stays 2.',
      'SCC {3,4,5} 内最便宜代价是 2——只有节点 4 取到（唯一）。cost += 2 → 5；方案数 ×1 仍为 2。',
    ),
    nodes: ns({
      0: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'done' }, 4: { state: 'cur' }, 5: { state: 'done' },
    }),
    edges: es({ 3: { state: 'dim' }, 4: { state: 'dim' }, 5: { state: 'dim' }, 6: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '5', tone: 'long' }, { label: 'ways', value: '2', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'All SCCs covered. Answer = Σ minCost = 3 + 2 = 5. #ways = Π(#cheapest per SCC) = 2 × 1 = 2.',
      '所有 SCC 覆盖完毕。答案 = Σ minCost = 3 + 2 = 5。方案数 = Π(每个 SCC 的最便宜节点个数) = 2 × 1 = 2。',
    ),
    nodes: ns({
      0: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'done' },
    }),
    edges: es(),
    metric: [{ label: 'cost', value: '5', tone: 'long' }, { label: 'ways', value: '2', tone: 'long' }],
  })
  return f
}

/* ───────────────── 20C Dijkstra? (shortest path + recovery) ───────────────── */
function dijkstraFrames(): Frame[] {
  // 6-node weighted undirected graph, vertices 1..6 (n=6).
  // 1-2:7 1-3:9 2-3:10 2-4:15 3-4:11 3-5:2 5-6:9 4-6:6
  // shortest 1→6: 1-3(9)-5(11)-6(20), dist 20.
  type N = { id: number; x: number; y: number; label: number; sub?: string; state?: string }
  type E = { a: number; b: number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 1, x: 0.1, y: 0.5, label: 1, sub: '0' },
    { id: 2, x: 0.35, y: 0.2, label: 2, sub: '∞' },
    { id: 3, x: 0.35, y: 0.8, label: 3, sub: '∞' },
    { id: 4, x: 0.65, y: 0.2, label: 4, sub: '∞' },
    { id: 5, x: 0.65, y: 0.8, label: 5, sub: '∞' },
    { id: 6, x: 0.9, y: 0.5, label: 6, sub: '∞' },
  ]
  const ED: E[] = [
    { a: 1, b: 2, label: '7' }, { a: 1, b: 3, label: '9' }, { a: 2, b: 3, label: '10' },
    { a: 2, b: 4, label: '15' }, { a: 3, b: 4, label: '11' }, { a: 3, b: 5, label: '2' },
    { a: 5, b: 6, label: '9' }, { a: 4, b: 6, label: '6' },
  ]
  const ns = (dist: Record<number, string>, over: Record<number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, sub: dist[n.id] ?? n.sub, ...(over[n.id] ?? {}) }))
  const edgeIdx = (a: number, c: number) =>
    ED.findIndex((e) => (e.a === a && e.b === c) || (e.a === c && e.b === a))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Weighted undirected graph; find the shortest path 1 → 6 (output the vertices). dist[1]=0, all others ∞. Min-heap + prev[] for recovery.',
      '带权无向图；求 1 → 6 的最短路（输出经过的点）。dist[1]=0，其余 ∞。最小堆 + prev[] 用于还原。',
    ),
    nodes: ns({ 1: '0' }, { 1: { state: 'cur' } }), edges: es(),
    metric: [{ label: 'dist[6]', value: '∞' }],
  })
  f.push({
    narr: b(
      'Pop 1 (dist 0). Relax: dist[2]=7, dist[3]=9, prev[2]=prev[3]=1. Settle vertex 1.',
      '弹出 1 (dist 0)。松弛：dist[2]=7、dist[3]=9，prev[2]=prev[3]=1。确定顶点 1。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9' }, { 1: { state: 'done' }, 2: { state: 'active' }, 3: { state: 'active' } }),
    edges: es({ 0: { state: 'active' }, 1: { state: 'active' } }),
    metric: [{ label: 'dist[6]', value: '∞' }],
  })
  f.push({
    narr: b(
      'Smallest unsettled is 2 (dist 7). Relax 2→4: dist[4]=7+15=22, prev[4]=2. 2→3=17 > 9, no update. Settle 2.',
      '未确定中最小的是 2 (dist 7)。松弛 2→4：dist[4]=7+15=22，prev[4]=2。2→3=17 > 9，不更新。确定 2。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '22' },
      { 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'active' }, 4: { state: 'active' } }),
    edges: es({ 3: { state: 'active' } }),
    metric: [{ label: 'dist[6]', value: '∞' }],
  })
  f.push({
    narr: b(
      'Smallest unsettled is 3 (dist 9). Relax 3→5: dist[5]=9+2=11, prev[5]=3. 3→4=9+11=20 < 22 → update dist[4]=20, prev[4]=3. Settle 3.',
      '未确定中最小的是 3 (dist 9)。松弛 3→5：dist[5]=9+2=11，prev[5]=3。3→4=9+11=20 < 22 → 更新 dist[4]=20，prev[4]=3。确定 3。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '20', 5: '11' },
      { 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'active' }, 5: { state: 'active' } }),
    edges: es({ 5: { state: 'active' }, 4: { state: 'active' } }),
    metric: [{ label: 'dist[6]', value: '∞' }],
  })
  f.push({
    narr: b(
      'Smallest unsettled is 5 (dist 11). Relax 5→6: dist[6]=11+9=20, prev[6]=5. Settle 5.',
      '未确定中最小的是 5 (dist 11)。松弛 5→6：dist[6]=11+9=20，prev[6]=5。确定 5。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '20', 5: '11', 6: '20' },
      { 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 5: { state: 'done' }, 4: { state: 'active' }, 6: { state: 'active' } }),
    edges: es({ 6: { state: 'active' } }),
    metric: [{ label: 'dist[6]', value: '20', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Smallest unsettled is 4 (dist 20). Relax 4→6: 20+6=26 > 20, no update. Settle 4.',
      '未确定中最小的是 4 (dist 20)。松弛 4→6：20+6=26 > 20，不更新。确定 4。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '20', 5: '11', 6: '20' },
      { 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'done' }, 6: { state: 'active' } }),
    edges: es({ 7: { state: 'dim' } }),
    metric: [{ label: 'dist[6]', value: '20', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Pop 6 (dist 20) — target settled. Recover by following prev: 6←5←3←1. Reverse → path 1 3 5 6.',
      '弹出 6 (dist 20)——目标已确定。沿 prev 回溯：6←5←3←1。反转 → 路径 1 3 5 6。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '20', 5: '11', 6: '20' },
      { 1: { state: 'path' }, 3: { state: 'path' }, 5: { state: 'path' }, 6: { state: 'cur' }, 2: { state: 'dim' }, 4: { state: 'dim' } }),
    edges: es({
      [edgeIdx(1, 3)]: { state: 'path' },
      [edgeIdx(3, 5)]: { state: 'path' },
      [edgeIdx(5, 6)]: { state: 'path' },
    }),
    metric: [{ label: 'dist[6]', value: '20', tone: 'long' }],
  })
  f.push({
    narr: b(
      'Answer: shortest distance 20, path 1 → 3 → 5 → 6. (If 6 stayed ∞, output −1.) Distances use 64-bit to avoid overflow on large weights.',
      '答案：最短距离 20，路径 1 → 3 → 5 → 6。（若 6 仍为 ∞，输出 −1。）距离用 64 位防大权重溢出。',
    ),
    nodes: ns({ 1: '0', 2: '7', 3: '9', 4: '20', 5: '11', 6: '20' },
      { 1: { state: 'path' }, 3: { state: 'path' }, 5: { state: 'path' }, 6: { state: 'path' }, 2: { state: 'dim' }, 4: { state: 'dim' } }),
    edges: es({
      [edgeIdx(1, 3)]: { state: 'path' },
      [edgeIdx(3, 5)]: { state: 'path' },
      [edgeIdx(5, 6)]: { state: 'path' },
    }),
    metric: [{ label: 'dist[6]', value: '20', tone: 'long' }],
  })
  return f
}

/* ───────────────── 1245D Shichikuji and Power Grid (MST + virtual source) ───────────────── */
function powerGridFrames(): Frame[] {
  // virtual source S (⚡) + 5 cities. S→i = build cost c_i ; i→j = connection cost.
  // MST = S→1 (build, 3), 1-2(2), 2-3(2), 1-4(4), 4-5(3) → total 14.
  type N = { id: string | number; x: number; y: number; label: string | number; sub?: string; state?: string }
  type E = { a: string | number; b: string | number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 'S', x: 0.5, y: 0.12, label: '⚡', sub: 'source' },
    { id: 1, x: 0.2, y: 0.45, label: 1 },
    { id: 2, x: 0.2, y: 0.82, label: 2 },
    { id: 3, x: 0.5, y: 0.82, label: 3 },
    { id: 4, x: 0.8, y: 0.45, label: 4 },
    { id: 5, x: 0.8, y: 0.82, label: 5 },
  ]
  const ED: E[] = [
    { a: 'S', b: 1, label: '3', dir: true }, // build at 1, c=3
    { a: 'S', b: 4, label: '7', dir: true }, // build at 4, c=7 (unused)
    { a: 1, b: 2, label: '2' },
    { a: 2, b: 3, label: '2' },
    { a: 1, b: 4, label: '4' },
    { a: 4, b: 5, label: '3' },
    { a: 3, b: 5, label: '8' }, // unused
  ]
  const ns = (over: Record<string | number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Each city needs power: BUILD a station (cost c_i) or CONNECT to an already-powered city. Add a virtual source ⚡: edge ⚡→i costs c_i. Now it is one MST.',
      '每个城市都要通电：自建电站（花费 c_i）或接入已通电城市。加虚拟源点 ⚡：边 ⚡→i 权 = c_i。问题就化为一棵 MST。',
    ),
    nodes: ns({ S: { state: 'cur' } }), edges: es(),
    metric: [{ label: 'cost', value: '0' }],
  })
  f.push({
    narr: b(
      'Prim from ⚡. Cheapest edge out of the tree is ⚡→1 (build station at city 1, cost 3). Take it.',
      '从 ⚡ 跑 Prim。离开树的最便宜边是 ⚡→1（在城市 1 建站，花费 3）。选它。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' } }),
    metric: [{ label: 'cost', value: '3', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Frontier edges: 1→2 (2), 1→4 (4), ⚡→4 (7). Cheapest is 1→2 = 2 (connect city 2 to powered city 1). Take it.',
      '边界边：1→2 (2)、1→4 (4)、⚡→4 (7)。最便宜的是 1→2 = 2（把城市 2 接到已通电的 1）。选它。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 2: { state: 'tree' } }),
    metric: [{ label: 'cost', value: '5', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Cheapest frontier now is 2→3 = 2 (connect city 3). Take it. cost = 7.',
      '现在最便宜的边界边是 2→3 = 2（接入城市 3）。选它。cost = 7。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' } }),
    metric: [{ label: 'cost', value: '7', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Cheapest frontier is 1→4 = 4 (connect city 4) — beats ⚡→4 = 7, so we do NOT build a station at 4. Take 1→4. cost = 11.',
      '最便宜的边界边是 1→4 = 4（接入城市 4）——优于 ⚡→4 = 7，所以不在 4 建站。选 1→4。cost = 11。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' }, 1: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '11', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Last city 5: edges 4→5 = 3 vs 3→5 = 8. Take 4→5 = 3. DSU rejects 3→5 (would form a cycle). cost = 14.',
      '最后城市 5：边 4→5 = 3 与 3→5 = 8。选 4→5 = 3。DSU 拒绝 3→5（会成环）。cost = 14。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' }, 5: { state: 'tree' }, 1: { state: 'dim' }, 6: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '14', tone: 'long' }],
  })
  f.push({
    narr: b(
      'MST done. Edges from ⚡ in the tree = "build a station" (only city 1). All other tree edges = "connect". Min total cost = 14.',
      'MST 完成。树中来自 ⚡ 的边 = 「建站」（仅城市 1）。其余树边 = 「连线」。最小总代价 = 14。',
    ),
    nodes: ns({ S: { state: 'done' }, 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'done' } }),
    edges: es({ 0: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' }, 5: { state: 'tree' }, 1: { state: 'dim' }, 6: { state: 'dim' } }),
    metric: [{ label: 'cost', value: '14', tone: 'long' }],
  })
  return f
}

/* ───────────────── 999E Reachability from the Capital (SCC condensation + greedy) ───────────────── */
function reachabilityFrames(): Frame[] {
  // 6 directed nodes. Capital = 1.
  // Components: A={1,2} (1↔2), B={3} reached via 1→3, C={4,5} (4↔5), D={6}.
  // Condensation only edge: A→B. zero-indeg non-capital comps: C, D → answer 2.
  type N = { id: number; x: number; y: number; label: number; sub?: string; state?: string }
  type E = { a: number; b: number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 1, x: 0.15, y: 0.3, label: 1, sub: 'capital' },
    { id: 2, x: 0.15, y: 0.7, label: 2 },
    { id: 3, x: 0.45, y: 0.5, label: 3 },
    { id: 4, x: 0.75, y: 0.3, label: 4 },
    { id: 5, x: 0.75, y: 0.7, label: 5 },
    { id: 6, x: 0.92, y: 0.5, label: 6 },
  ]
  const ED: E[] = [
    { a: 1, b: 2, dir: true }, { a: 2, b: 1, dir: true },
    { a: 1, b: 3, dir: true },
    { a: 4, b: 5, dir: true }, { a: 5, b: 4, dir: true },
  ]
  const ns = (over: Record<number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Capital = 1. Add the fewest one-way roads so EVERY city is reachable from the capital. First find SCCs.',
      '首都 = 1。添加最少的单向路，使每个城市都能从首都到达。先求 SCC。',
    ),
    nodes: ns({ 1: { state: 'cur' } }), edges: es(),
    metric: [{ label: 'add', value: '?' }],
  })
  f.push({
    narr: b(
      'SCCs: A = {1,2} (the capital lives here, mutual cycle), B = {3}, C = {4,5} (cycle), D = {6}. Four components.',
      'SCC：A = {1,2}（首都在此，互相成环）、B = {3}、C = {4,5}（成环）、D = {6}。共四个分量。',
    ),
    nodes: ns({
      1: { state: 'cur' }, 2: { state: 'active' },
      3: { state: 'path' },
      4: { state: 'active' }, 5: { state: 'active' },
      6: { state: 'path' },
    }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' } }),
    metric: [{ label: 'add', value: '?' }],
  })
  f.push({
    narr: b(
      'Condense each SCC to a super-node → a DAG. The only inter-component edge is A → B (from road 1→3). Compute each component’s indegree.',
      '把每个 SCC 缩成超级点 → 得到 DAG。分量间唯一的边是 A → B（来自 1→3）。计算每个分量的入度。',
    ),
    nodes: ns({
      1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'path' },
      4: { state: 'active' }, 5: { state: 'active' },
      6: { state: 'path' },
    }),
    edges: es({ 2: { state: 'active' } }),
    metric: [{ label: 'add', value: '?' }],
  })
  f.push({
    narr: b(
      'indeg(A)=0 but A holds the capital → ignore. indeg(B)=1 (A→B) → already reachable. indeg(C)=0, indeg(D)=0, and neither holds the capital.',
      '入度(A)=0 但 A 含首都 → 忽略。入度(B)=1 (A→B) → 已可达。入度(C)=0、入度(D)=0，且都不含首都。',
    ),
    nodes: ns({
      1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'done' },
      4: { state: 'bad' }, 5: { state: 'bad' },
      6: { state: 'bad' },
    }),
    edges: es({ 2: { state: 'dim' } }),
    metric: [{ label: 'add', value: '?' }],
  })
  f.push({
    narr: b(
      'Every zero-indegree component that is NOT the capital’s needs at least one new incoming edge — otherwise it is unreachable. Here: C and D.',
      '每个非首都的入度为 0 的分量，至少需要一条新入边——否则无从到达。这里是：C 和 D。',
    ),
    nodes: ns({
      1: { state: 'done' }, 2: { state: 'done' },
      3: { state: 'done' },
      4: { state: 'bad' }, 5: { state: 'bad' },
      6: { state: 'bad' },
    }),
    edges: es({ 2: { state: 'dim' } }),
    metric: [{ label: 'add', value: '2', tone: 'short' }],
  })
  f.push({
    narr: b(
      'Add e.g. 1→4 and 1→6 (one edge into C, one into D). Now all reachable from the capital. Answer = #(zero-indegree non-capital components) = 2.',
      '例如添加 1→4 和 1→6（C 一条、D 一条入边）。现在全部从首都可达。答案 = 非首都入度为 0 的分量数 = 2。',
    ),
    nodes: ns({
      1: { state: 'cur' }, 2: { state: 'done' },
      3: { state: 'done' },
      4: { state: 'done' }, 5: { state: 'done' },
      6: { state: 'done' },
    }),
    edges: [
      ...es({ 2: { state: 'dim' } }),
      { a: 1, b: 4, dir: true, state: 'path' },
      { a: 1, b: 6, dir: true, state: 'path' },
    ],
    metric: [{ label: 'add', value: '2', tone: 'long' }],
  })
  return f
}

/* ───────────────── 118E Bertown Roads (bridges + orientation) ───────────────── */
function bertownFrames(): Frame[] {
  // 6 nodes, 2-edge-connected: cycle 1-2-3-4-5-6-1 plus chord 1-4 → no bridge → Possible.
  // DFS from 1: tree edges 1-2,2-3,3-4,4-5,5-6 ; back edges 6-1 and 1-4(chord).
  type N = { id: number; x: number; y: number; label: number; sub?: string; state?: string }
  type E = { a: number; b: number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 1, x: 0.5, y: 0.12, label: 1 },
    { id: 2, x: 0.85, y: 0.32, label: 2 },
    { id: 3, x: 0.78, y: 0.78, label: 3 },
    { id: 4, x: 0.5, y: 0.9, label: 4 },
    { id: 5, x: 0.22, y: 0.78, label: 5 },
    { id: 6, x: 0.15, y: 0.32, label: 6 },
  ]
  const ED: E[] = [
    { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 1 },
    { a: 1, b: 4 }, // chord
  ]
  const ns = (over: Record<number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Connected, undirected. Can we orient every road one-way so the result is strongly connected? Robbins: yes ⇔ the graph has NO bridge (is 2-edge-connected). Run DFS.',
      '连通无向图。能否把每条路定向成单向，使结果强连通？Robbins 定理：可以 ⇔ 图中无桥（2-边连通）。跑 DFS。',
    ),
    nodes: ns({ 1: { state: 'cur' } }), edges: es(),
    metric: [{ label: 'bridges', value: '0' }],
  })
  f.push({
    narr: b(
      'DFS tree from 1: 1→2→3→4→5→6, building a spine of tree edges. dfn assigns discovery times 1..6.',
      '从 1 出发的 DFS 树：1→2→3→4→5→6，构成一条树边骨架。dfn 赋予发现时间 1..6。',
    ),
    nodes: ns({
      1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' },
      4: { state: 'done' }, 5: { state: 'done' }, 6: { state: 'cur' },
    }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' } }),
    metric: [{ label: 'bridges', value: '0' }],
  })
  f.push({
    narr: b(
      'From 6 we see edge 6–1: 1 is already visited and is an ancestor → it is a BACK edge. It lets low[6] reach dfn[1].',
      '在 6 处看到边 6–1：1 已访问且是祖先 → 这是一条返祖边。它让 low[6] 能到达 dfn[1]。',
    ),
    nodes: ns({
      1: { state: 'active' }, 2: { state: 'done' }, 3: { state: 'done' },
      4: { state: 'done' }, 5: { state: 'done' }, 6: { state: 'cur' },
    }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' }, 5: { state: 'active' } }),
    metric: [{ label: 'bridges', value: '0' }],
  })
  f.push({
    narr: b(
      'Consider tree edge 3–4 alone: without the chord, low[4] would equal dfn[4] > dfn[3] → 3–4 would be a BRIDGE (a single point of failure). Check the chord.',
      '单看树边 3–4：若无弦边，low[4] = dfn[4] > dfn[3] → 3–4 会是一座桥（单点故障）。检查弦边。',
    ),
    nodes: ns({ 3: { state: 'active' }, 4: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 2: { state: 'bridge' }, 3: { state: 'tree' }, 4: { state: 'tree' } }),
    metric: [{ label: 'bridges', value: '0?' }],
  })
  f.push({
    narr: b(
      'But chord 1–4 is a back edge from 4 to ancestor 1 → low[4] ≤ dfn[1] < dfn[3]. So 3–4 is NOT a bridge — the back edge covers it.',
      '但弦边 1–4 是从 4 到祖先 1 的返祖边 → low[4] ≤ dfn[1] < dfn[3]。所以 3–4 不是桥——返祖边把它盖住了。',
    ),
    nodes: ns({ 1: { state: 'active' }, 3: { state: 'done' }, 4: { state: 'cur' } }),
    edges: es({ 0: { state: 'tree' }, 1: { state: 'tree' }, 2: { state: 'tree' }, 3: { state: 'tree' }, 4: { state: 'tree' }, 6: { state: 'active' } }),
    metric: [{ label: 'bridges', value: '0' }],
  })
  f.push({
    narr: b(
      'Every tree edge is covered by some back edge → ZERO bridges → Possible. Orient: tree edges downward (parent→child), back edges upward (descendant→ancestor).',
      '每条树边都被某条返祖边盖住 → 零座桥 → Possible。定向规则：树边向下（父→子），返祖边向上（后代→祖先）。',
    ),
    nodes: ns({ 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'done' }, 6: { state: 'done' } }),
    edges: es({
      0: { state: 'tree', dir: true }, 1: { state: 'tree', dir: true }, 2: { state: 'tree', dir: true },
      3: { state: 'tree', dir: true }, 4: { state: 'tree', dir: true },
    }),
    metric: [{ label: 'bridges', value: '0' }],
  })
  f.push({
    narr: b(
      'Final orientation: 1→2→3→4→5→6 down the tree, plus back edges 6→1 and 4→1 climbing up. The result is strongly connected.',
      '最终定向：树上 1→2→3→4→5→6 向下，外加返祖边 6→1、4→1 向上。结果强连通。',
    ),
    nodes: ns({ 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' }, 4: { state: 'done' }, 5: { state: 'done' }, 6: { state: 'done' } }),
    edges: [
      { a: 1, b: 2, dir: true, state: 'tree' }, { a: 2, b: 3, dir: true, state: 'tree' },
      { a: 3, b: 4, dir: true, state: 'tree' }, { a: 4, b: 5, dir: true, state: 'tree' },
      { a: 5, b: 6, dir: true, state: 'tree' },
      { a: 6, b: 1, dir: true, state: 'path' }, { a: 4, b: 1, dir: true, state: 'path' },
    ],
    metric: [{ label: 'bridges', value: '0', tone: 'long' }],
  })
  return f
}

/* ───────────────── 1000E We Need More Bosses (bridge tree + diameter) ───────────────── */
function moreBossesFrames(): Frame[] {
  // 6 nodes: block X={1,2,3} triangle (2-edge-connected) ; bridges 3-4, 4-5, 5-6.
  // Bridge tree: X — 4 — 5 — 6 (3 bridges in a path) → diameter = 3.
  type N = { id: number; x: number; y: number; label: number; sub?: string; state?: string }
  type E = { a: number; b: number; state?: string; dir?: boolean; label?: string }
  const base: N[] = [
    { id: 1, x: 0.12, y: 0.3, label: 1 },
    { id: 2, x: 0.12, y: 0.7, label: 2 },
    { id: 3, x: 0.32, y: 0.5, label: 3 },
    { id: 4, x: 0.55, y: 0.5, label: 4 },
    { id: 5, x: 0.76, y: 0.5, label: 5 },
    { id: 6, x: 0.95, y: 0.5, label: 6 },
  ]
  const ED: E[] = [
    { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 1 }, // triangle X
    { a: 3, b: 4 }, // bridge
    { a: 4, b: 5 }, // bridge
    { a: 5, b: 6 }, // bridge
  ]
  const ns = (over: Record<number, Partial<N>> = {}): N[] =>
    base.map((n) => ({ ...n, ...(over[n.id] ?? {}) }))
  const es = (over: Record<number, Partial<E>> = {}): E[] =>
    ED.map((e, i) => ({ ...e, ...(over[i] ?? {}) }))
  const f: Frame[] = []

  f.push({
    narr: b(
      'Pick s, t to maximize the number of bridges that MUST be crossed on every s→t path. Connected undirected graph. First find all bridges.',
      '选 s、t 使每条 s→t 路径都必经的桥数最多。连通无向图。先找出所有桥。',
    ),
    nodes: ns(), edges: es(),
    metric: [{ label: 'diameter', value: '?' }],
  })
  f.push({
    narr: b(
      'Edges 1–2, 2–3, 3–1 form a triangle: each lies on a cycle, so NONE is a bridge — they are a 2-edge-connected block X.',
      '边 1–2、2–3、3–1 构成三角：每条都在环上，所以都不是桥——它们构成一个 2-边连通块 X。',
    ),
    nodes: ns({ 1: { state: 'active' }, 2: { state: 'active' }, 3: { state: 'active' } }),
    edges: es({ 0: { state: 'active' }, 1: { state: 'active' }, 2: { state: 'active' } }),
    metric: [{ label: 'diameter', value: '?' }],
  })
  f.push({
    narr: b(
      'Edges 3–4, 4–5, 5–6 each lie on no cycle → removing any one disconnects the graph → all three are BRIDGES.',
      '边 3–4、4–5、5–6 都不在任何环上 → 删掉任一条都会使图断开 → 三条都是桥。',
    ),
    nodes: ns({ 1: { state: 'done' }, 2: { state: 'done' }, 3: { state: 'done' } }),
    edges: es({
      0: { state: 'active' }, 1: { state: 'active' }, 2: { state: 'active' },
      3: { state: 'bridge' }, 4: { state: 'bridge' }, 5: { state: 'bridge' },
    }),
    metric: [{ label: 'diameter', value: '?' }],
  })
  f.push({
    narr: b(
      'Contract each 2-edge-connected block to one super-node: block X={1,2,3} → node X. The bridges become tree edges. This is the BRIDGE TREE.',
      '把每个 2-边连通块缩成一个超级点：块 X={1,2,3} → 节点 X。桥变成树边。这就是桥树。',
    ),
    nodes: [
      { id: 3, x: 0.22, y: 0.5, label: 3, sub: 'X={1,2,3}', state: 'path' },
      { id: 4, x: 0.48, y: 0.5, label: 4, state: 'path' },
      { id: 5, x: 0.72, y: 0.5, label: 5, state: 'path' },
      { id: 6, x: 0.95, y: 0.5, label: 6, state: 'path' },
    ],
    edges: [
      { a: 3, b: 4, state: 'bridge' }, { a: 4, b: 5, state: 'bridge' }, { a: 5, b: 6, state: 'bridge' },
    ],
    metric: [{ label: 'diameter', value: '?' }],
  })
  f.push({
    narr: b(
      'The bridge tree is a path: X — 4 — 5 — 6. BFS #1 from X finds the farthest node → node 6 (distance 3 bridges).',
      '桥树是一条链：X — 4 — 5 — 6。第一次 BFS 从 X 找最远点 → 节点 6（距离 3 座桥）。',
    ),
    nodes: [
      { id: 3, x: 0.22, y: 0.5, label: 3, sub: 'X', state: 'cur' },
      { id: 4, x: 0.48, y: 0.5, label: 4, sub: 'd=1', state: 'active' },
      { id: 5, x: 0.72, y: 0.5, label: 5, sub: 'd=2', state: 'active' },
      { id: 6, x: 0.95, y: 0.5, label: 6, sub: 'd=3', state: 'done' },
    ],
    edges: [
      { a: 3, b: 4, state: 'active' }, { a: 4, b: 5, state: 'active' }, { a: 5, b: 6, state: 'active' },
    ],
    metric: [{ label: 'diameter', value: '?' }],
  })
  f.push({
    narr: b(
      'BFS #2 from node 6 finds the farthest node → X, distance 3. That is the tree diameter = 3 bridges. So s ∈ X, t = 6.',
      '第二次 BFS 从节点 6 找最远点 → X，距离 3。这就是桥树直径 = 3 座桥。于是 s ∈ X、t = 6。',
    ),
    nodes: [
      { id: 3, x: 0.22, y: 0.5, label: 3, sub: 'X (d=3)', state: 'done' },
      { id: 4, x: 0.48, y: 0.5, label: 4, state: 'path' },
      { id: 5, x: 0.72, y: 0.5, label: 5, state: 'path' },
      { id: 6, x: 0.95, y: 0.5, label: 6, sub: 'start', state: 'cur' },
    ],
    edges: [
      { a: 3, b: 4, state: 'path' }, { a: 4, b: 5, state: 'path' }, { a: 5, b: 6, state: 'path' },
    ],
    metric: [{ label: 'diameter', value: '3', tone: 'mint' }],
  })
  f.push({
    narr: b(
      'Map back to the original graph: choosing s = 1 (inside block X) and t = 6 forces crossing all 3 bridges 3–4, 4–5, 5–6. Answer = 3.',
      '映射回原图：取 s = 1（在块 X 内）、t = 6，必然经过全部 3 座桥 3–4、4–5、5–6。答案 = 3。',
    ),
    nodes: ns({
      1: { state: 'cur' }, 2: { state: 'done' }, 3: { state: 'path' },
      4: { state: 'path' }, 5: { state: 'path' }, 6: { state: 'done' },
    }),
    edges: es({
      0: { state: 'dim' }, 1: { state: 'dim' }, 2: { state: 'dim' },
      3: { state: 'path' }, 4: { state: 'path' }, 5: { state: 'path' },
    }),
    metric: [{ label: 'diameter', value: '3', tone: 'long' }],
  })
  return f
}

export const problemsE: Problem[] = [
  {
    id: '510C', module: 'E', catKey: 'toposort', cat: b('Topological sort', '拓扑排序'),
    rating: 1600, tags: ['dfs and similar', 'graphs', 'sortings'],
    url: 'https://codeforces.com/problemset/problem/510/C',
    title: b('Fox And Names', '狐狸与名字'),
    statement: b(
      'Given a list of names already sorted by some unknown alphabet order, find an order of the 26 letters making the list lexicographically increasing (or report Impossible).',
      '给定一份已按某个未知字母表顺序排好序的名字列表，求一个 26 个字母的顺序，使该列表按字典序递增（或报告 Impossible）。',
    ),
    hl: b(
      'Deriving one globally-consistent total order from a pile of local precedence constraints — exactly what consensus does: each adjacent name pair gives a directed edge "letter a must come before b", and a topo-sort of the constraint graph yields the global order. DAG-based consensus (Narwhal/Bullshark) ordering a transaction-dependency DAG is the scaled-up version.',
      '从一堆局部先后约束推出一个全局一致的总序——这正是共识要干的事：每对相邻名字给出一条「字母 a 必须排在 b 前」的有向边，对约束图拓扑排序得到全局序。DAG-based 共识（Narwhal/Bullshark）对交易依赖 DAG 定序就是放大版。',
    ),
    idea: b(
      'Compare each adjacent pair of names; the first differing character gives a directed edge u→v (u must precede v). A longer prefix placed before its own prefix is illegal → Impossible. Topo-sort the edge graph (Kahn / DFS); a cycle means Impossible.',
      '相邻名字两两比较，第一个不同的字符给出一条有向边 u→v（u 必须在 v 前）；前缀更长却排在前是非法 → Impossible；对边图做拓扑排序（Kahn / DFS），有环则 Impossible。',
    ),
    complexity: 'O(sum|name| + 26²)', star: 1,
    interview: b(
      'How does topo-sort detect a cycle (a constraint contradiction = no agreeable order)? When several valid orders exist, how to pick one (deterministic tie-break for consensus)?',
      '拓扑排序如何检测环（约束矛盾=无法达成一致序）？多个合法序怎么选（共识的确定性 tie-break）？',
    ),
    viz: { kind: 'graph', build: foxNamesFrames, caption: b('peel zero-indegree letters → global order', '剥入度为 0 的字母 → 全局序') },
  },
  {
    id: '427C', module: 'E', catKey: 'scc', cat: b('SCC (Tarjan)', '强连通分量'),
    rating: 1700, tags: ['dfs and similar', 'graphs'],
    url: 'https://codeforces.com/problemset/problem/427/C',
    title: b('Checkposts', '检查站'),
    statement: b(
      'n junctions, m one-way roads. A checkpost at junction i protects every j that is mutually reachable with i (i→…→j and back). Building at i costs c_i. Find the minimum total cost to protect all junctions, and the number of ways achieving that minimum.',
      'n 个路口，m 条单向路。在路口 i 建检查站可保护每个与 i 相互可达（i→…→j 且能返回）的 j。在 i 建造花费 c_i。求保护所有路口的最小总代价，以及达到该最小值的方案数。',
    ),
    hl: b(
      'An SCC (strongly connected component) = a group of mutually-reachable nodes in a P2P network. Within each SCC you only need one cheapest "representative" to cover the whole group — like electing a leader/witness inside an interconnected subnet. #ways = the product, over SCCs, of how many nodes tie for the cheapest.',
      'SCC（强连通分量）= P2P 网络里相互可达的一组节点。在每个 SCC 里只需选一个最便宜的「代表」即可覆盖全组——对应在一个互连子网里选 leader/见证者。方案数 = 各 SCC 内最便宜节点的个数之积。',
    ),
    idea: b(
      'Find SCCs (Tarjan/Kosaraju); within each SCC take the minimum cost minCost; total answer = Σ minCost; #ways = Π(number of nodes attaining the minimum cost in that SCC).',
      'Tarjan/Kosaraju 求 SCC；每个 SCC 取最小代价 minCost，总答案 = Σ minCost；方案数 = Π(该 SCC 内取到最小代价的节点个数)。',
    ),
    complexity: 'O(n+m)', star: 1,
    interview: b(
      'How does Tarjan’s low-link work? After condensing SCCs the graph is a DAG — what does that mean for "each subnet advances independently after partitioning"?',
      'Tarjan 的 low-link 原理？SCC 缩点后是 DAG，对「分区后各子网独立推进」意味着什么？',
    ),
    viz: { kind: 'graph', build: checkpostsFrames, caption: b('one cheapest representative per SCC', '每个 SCC 选一个最便宜代表') },
  },
  {
    id: '20C', module: 'E', catKey: 'shortest-path', cat: b('Dijkstra + path recovery', '最短路 + 还原'),
    rating: 1900, tags: ['graphs', 'shortest paths'],
    url: 'https://codeforces.com/problemset/problem/20/C',
    title: b('Dijkstra?', 'Dijkstra?'),
    statement: b(
      'Weighted undirected graph, vertices 1..n. Find the shortest path between vertex 1 and vertex n (output the path itself), or −1 if unreachable.',
      '带权无向图，顶点 1..n。求顶点 1 与顶点 n 之间的最短路（输出路径本身），不可达则输出 −1。',
    ),
    hl: b(
      'Minimum-latency message routing — sending a message from one node to a target with the lowest cumulative delay during gossip/block propagation is a shortest path; path recovery = tracing the propagation route. With large n and weights, use a heap-optimized Dijkstra + 64-bit to avoid overflow.',
      '最小延迟消息路由——gossip/区块传播时从某节点把消息以最低累计延迟送到目标，就是最短路；路径还原 = 传播链路追踪。注意 n、权重大要堆优化 Dijkstra + 64 位防溢出。',
    ),
    idea: b(
      'Priority-queue Dijkstra; maintain dist[] and predecessor prev[], pop the smallest-dist unsettled node and relax its neighbors; backtrack prev[] from the target to recover the path. Use 64-bit distances.',
      '优先队列 Dijkstra；维护 dist[] 与前驱 prev[]，弹出未确定的最小 dist 节点松弛邻边；终点回溯 prev 还原路径。距离用 64 位。',
    ),
    complexity: 'O(m log n)',
    interview: b(
      'Why can’t plain BFS handle weights? What happens with negative weights (motivates the "latency cannot be negative" assumption)? Heap-optimized complexity O(m log n).',
      '为什么不能用普通 BFS（带权）？负权会怎样（引出「延迟不可为负」假设）？堆优化复杂度 O(m log n)。',
    ),
    viz: { kind: 'graph', build: dijkstraFrames, caption: b('settle nodes by dist, then backtrack prev[] for the path', '按 dist 确定节点，再回溯 prev[] 得路径') },
  },
  {
    id: '1245D', module: 'E', catKey: 'mst', cat: b('MST (virtual source)', '最小生成树（虚拟源）'),
    rating: 1900, tags: ['dsu', 'graphs', 'shortest paths', 'trees'],
    url: 'https://codeforces.com/problemset/problem/1245/D',
    title: b('Shichikuji and Power Grid', '七喜与电网'),
    statement: b(
      'n cities; city i needs electricity, provided either by building a power station there (cost c_i) or connecting it to an already-powered city (connection cost from a given formula). Minimize total cost; output which stations/connections.',
      'n 个城市；城市 i 需要电，可在本地建电站（花费 c_i）或连接到一个已通电的城市（连接费由给定公式决定）。最小化总代价；输出建站/连线方案。',
    ),
    hl: b(
      'Minimum-cost construction of a P2P overlay / broadcast tree — a node either self-builds a "seed" (a station) or joins the already-powered network, minimizing total construction cost. Classic trick: add a virtual source whose edge to each city weighs its build cost, turning the whole problem into a single MST.',
      '最小代价构建 P2P overlay / 广播树——节点要么自建「种子」（建站），要么接入已通电的网络，求最小生成代价。经典技巧：建一个虚拟源点，到每个城市的边权=自建电站花费，整个问题就变成一棵 MST。',
    ),
    idea: b(
      'Add a virtual source 0 with edge 0→i of weight c_i (build a station), and edge i→j of weight the connection fee; run Kruskal/Prim for the MST (DSU tracks connectivity). A chosen 0→i edge means "build a station", the rest are "connections".',
      '加虚拟源点 0，0→i 边权=c_i（建站），i→j 边权=连接费；对这张图跑 Kruskal/Prim 求 MST（DSU 维护连通性），选中 0→i 的边即「建站」，其余即「连线」。',
    ),
    complexity: 'O(n²) Prim / O(m log m) Kruskal', star: 1,
    interview: b(
      'Why is the virtual-source modeling correct? Prim O(n²) vs Kruskal O(m log m) — which to choose on a dense graph?',
      '虚拟源点建模为什么对？Prim O(n²) vs Kruskal O(m log m) 在稠密图怎么选？',
    ),
    viz: { kind: 'graph', build: powerGridFrames, caption: b('MST over a virtual source: ⚡→i edge = build a station', '虚拟源上的 MST：⚡→i 边 = 建站') },
  },
  {
    id: '999E', module: 'E', catKey: 'scc', cat: b('SCC condensation + greedy', 'SCC 缩点 + 贪心'),
    rating: 2000, tags: ['dfs and similar', 'graphs'],
    url: 'https://codeforces.com/problemset/problem/999/E',
    title: b('Reachability from the Capital', '从首都可达'),
    statement: b(
      'n cities, m one-way roads, a given capital. Find the minimum number of new one-way roads to add so that every city is reachable from the capital.',
      'n 个城市，m 条单向路，给定一个首都。求最少新增多少条单向路，使每个城市都能从首都到达。',
    ),
    hl: b(
      'The minimum links needed so the leader can reach the whole network = repairing a network partition. In BFT the leader must deliver its proposal to all honest nodes; this problem is its graph-theoretic core: condense SCCs into a DAG, then count the components with indegree 0 that do not contain the capital — each needs at least one new incoming edge.',
      '保证从 leader 可达全网所需的最少连接 = 修复网络分区。BFT 里 leader 必须能把提案送达所有诚实节点；本题是它的图论内核：SCC 缩点成 DAG 后，统计入度为 0 且非首都所在的分量数，每个至少补一条边。',
    ),
    idea: b(
      'Find SCCs → condense into a DAG → count the components with indegree 0 (excluding the capital’s component); that count is the answer.',
      '求 SCC → 缩点成 DAG → 统计入度为 0 的分量数（首都所在分量不算），即答案。',
    ),
    complexity: 'O(n+m)',
    interview: b(
      'Why is the answer = the number of zero-indegree components? Why does condensation simplify the problem (everything inside a strongly-connected component is already mutually reachable)?',
      '为什么答案=入度为 0 的分量数？缩点为什么能简化问题（强连通内部已互达）？',
    ),
    viz: { kind: 'graph', build: reachabilityFrames, caption: b('condense to a DAG; each zero-indegree non-capital component needs one edge', '缩点成 DAG；每个非首都的入度 0 分量补一条边') },
  },
  {
    id: '118E', module: 'E', catKey: 'bridges', cat: b('Bridges + edge orientation', '桥 + 边定向'),
    rating: 2000, tags: ['dfs and similar', 'graphs'],
    url: 'https://codeforces.com/problemset/problem/118/E',
    title: b('Bertown Roads', 'Bertown 的路'),
    statement: b(
      'n junctions, m bidirectional roads, the graph is connected. Decide whether the roads can each be oriented (made one-way) so the result is strongly connected (any junction reachable from any other); if yes, output an orientation.',
      'n 个路口，m 条双向路，图连通。判断能否把每条路各自定向（改成单向），使结果强连通（任意路口可达任意路口）；若可以，输出一种定向。',
    ),
    hl: b(
      'A critical fault-tolerance test — all undirected links can be oriented while staying fully connected iff the graph has no bridge (is 2-edge-connected). A bridge is a single-point-of-failure link: deleting it splits the network in two, mirroring a consensus link whose loss causes a partition and a lost majority.',
      '网络容错的临界判定——能把无向链路全部定向且仍全连通，当且仅当图里没有桥（2-边连通）。桥=单点故障链路：删掉它网络就裂成两半，对应共识里会导致分区、无法达成多数的关键链路。',
    ),
    idea: b(
      'Build a DFS spanning tree; if a bridge exists (low[v] > dfn[u]) → Impossible; otherwise orient tree edges along the DFS direction (downward) and back edges upward — this yields a strongly connected orientation (Robbins’ theorem).',
      'DFS 生成树；若存在桥（low[v]>dfn[u]）则 Impossible；否则把树边按 DFS 方向（向下）、返祖边按向上定向，即得强连通（Robbins 定理）。',
    ),
    complexity: 'O(n+m)', star: 1,
    interview: b(
      'Why does low[v] > dfn[u] identify a bridge? How to intuitively understand "no bridge ⇔ a strongly-connected orientation exists" (Robbins’ theorem)?',
      '桥的判定 low[v]>dfn[u] 原理？「无桥 ⇔ 可强连通定向」（Robbins 定理）怎么直观理解？',
    ),
    viz: { kind: 'graph', build: bertownFrames, caption: b('no bridge → orient tree edges down, back edges up', '无桥 → 树边向下、返祖边向上定向') },
  },
  {
    id: '1000E', module: 'E', catKey: 'bridges', cat: b('Bridge tree + diameter', '桥树 + 直径'),
    rating: 2100, tags: ['dfs and similar', 'graphs', 'trees'],
    url: 'https://codeforces.com/problemset/problem/1000/E',
    title: b('We Need More Bosses', '我们需要更多 Boss'),
    statement: b(
      'n locations, m bidirectional passages, connected. Choose start s and end t maximizing the number of passages that MUST be crossed on every s→t path (i.e. bridges on the path). Output that maximum.',
      'n 个地点，m 条双向通道，连通。选择起点 s 和终点 t，使每条 s→t 路径都必经的通道数（即路径上的桥数）最多。输出该最大值。',
    ),
    hl: b(
      'Finding the most "fragile" path in the network — the one with the most mandatory critical links. Those mandatory bridges are the most failure-sensitive link set. Method: contract every 2-edge-connected component to a node to get the bridge tree (a tree whose edges are all bridges); the answer is the diameter of that bridge tree.',
      '找网络中最「脆弱」的一条路径——必经的关键链路最多。这些必经桥就是最故障敏感的链路集合。做法：把 2-边连通分量缩成点得到桥树（一棵树，树边都是桥），答案=桥树的直径。',
    ),
    idea: b(
      'Find bridges → contract each 2-edge-connected component into a node, with the bridges between them becoming tree edges → obtain the "bridge tree"; the answer = the diameter of the bridge tree (two BFS/DFS passes).',
      '求桥 → 把 2-边连通分量缩成点，分量间的桥成为树边 → 得到「桥树」；答案 = 桥树的直径（两次 BFS/DFS）。',
    ),
    complexity: 'O(n+m)', star: 2,
    interview: b(
      'Why is the bridge tree a tree? Why does "most mandatory bridges" = the bridge-tree diameter? This problem chains "bridges + condensation + tree diameter" into one capstone.',
      '桥树为什么是树？为什么「必经桥最多」=桥树直径？这题把「桥+缩点+树直径」串成综合压轴。',
    ),
    viz: { kind: 'graph', build: moreBossesFrames, caption: b('collapse 2-edge blocks → bridge tree → its diameter', '缩 2-边块 → 桥树 → 求直径') },
  },
]
