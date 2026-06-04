import type { Frame, Problem } from '../types'
import { b, treePos } from '../anim/helpers'

/* ─────────────────────────── 91B Queue ─────────────────────────── */
function queueFrames(): Frame[] {
  const a = [10, 8, 5, 3, 50, 45]
  const n = a.length
  // suffix-min m[i] = min of a[i..n-1] (non-increasing left→right is false; from the RIGHT it is non-increasing as i decreases)
  const m = new Array(n).fill(0)
  let run = Infinity
  for (let i = n - 1; i >= 0; i--) { run = Math.min(run, a[i]); m[i] = run }

  const f: Frame[] = []
  f.push({
    narr: b('Each walrus i is displeased by the FURTHEST walrus ahead (j>i) that is younger (a_j<a_i). Ages, queue head on the right.',
      '每只海象 i 会被前方（j>i）最远的、比他更年轻（a_j<a_i）的海象惹恼。年龄数组，队首在右侧。'),
    arr: a, metric: [{ label: 'a', value: a.join(','), tone: 'mint' }],
  })
  f.push({
    narr: b('Scan right→left building suffix-min m[i] = min(a[i..n-1]). It is monotonic — that monotonicity is what lets us binary search.',
      '从右往左构造后缀最小值 m[i] = min(a[i..n-1])。它是单调的——正是这种单调性让我们能二分。'),
    arr: a, labels: m, metric: [{ label: 'suffix-min', value: m.join(','), tone: 'liq' }],
  })

  // representative i = 1 (a[1] = 8). Find furthest j>i with m[j] < 8.
  const i = 1
  f.push({
    narr: b(`Take walrus i=${i} (age ${a[i]}). We want the FURTHEST position j>i with m[j] < ${a[i]}. Binary search the suffix-min over (${i}, ${n - 1}].`,
      `取海象 i=${i}（年龄 ${a[i]}）。要找最远的 j>i 使 m[j] < ${a[i]}。在后缀最小值上对 (${i}, ${n - 1}] 二分。`),
    arr: a, highlight: [i], window: [i + 1, n - 1],
    metric: [{ label: 'target a_i', value: String(a[i]), tone: 'mint' }],
  })

  let lo = i + 1, hi = n - 1, ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const ok = m[mid] < a[i] // some younger walrus exists at or beyond mid
    f.push({
      narr: ok
        ? b(`mid=${mid}: m[${mid}]=${m[mid]} < ${a[i]} ✓ a younger walrus lies at/beyond ${mid} — record and push RIGHT (search further).`,
            `mid=${mid}：m[${mid}]=${m[mid]} < ${a[i]} ✓ 在 ${mid} 及更远处存在更年轻者——记录并向右（找更远）。`)
        : b(`mid=${mid}: m[${mid}]=${m[mid]} ≥ ${a[i]} ✗ no younger walrus from ${mid} onward — go LEFT.`,
            `mid=${mid}：m[${mid}]=${m[mid]} ≥ ${a[i]} ✗ 从 ${mid} 起没有更年轻者——向左。`),
      arr: a, highlight: [i], window: [lo, hi], pointers: [{ name: 'mid', idx: mid }],
      active: ok ? [mid] : [], bad: ok ? [] : [mid],
      metric: [{ label: 'lo', value: String(lo) }, { label: 'hi', value: String(hi) }, { label: 'best j', value: String(ans) }],
    })
    if (ok) { ans = mid; lo = mid + 1 } else { hi = mid - 1 }
  }

  const displeasure = ans < 0 ? -1 : ans - i - 1
  f.push({
    narr: ans < 0
      ? b(`No younger walrus ahead of i=${i}. Displeasure = −1.`, `i=${i} 前方没有更年轻者。不满 = −1。`)
      : b(`Furthest younger walrus is at j=${ans} (age ${a[ans]}). Displeasure = j−i−1 = ${displeasure} walruses between them.`,
          `最远的更年轻者在 j=${ans}（年龄 ${a[ans]}）。不满 = j−i−1 = ${displeasure}（两者之间的海象数）。`),
    arr: a, highlight: [i], done: ans < 0 ? [] : [ans],
    window: ans < 0 ? undefined : [i + 1, ans],
    metric: [{ label: 'displeasure', value: String(displeasure), tone: 'long' }],
  })
  f.push({
    narr: b('Repeat for every i in O(log n). Equivalently a monotonic stack of suffix-mins gives the same answers in O(n).',
      '对每个 i 都做 O(log n)。等价地，用后缀最小值的单调栈可在 O(n) 内得到同样答案。'),
    arr: a, metric: [{ label: 'total', value: 'O(n log n)', tone: 'mint' }],
  })
  return f
}

/* ───────────────────── 68B Energy exchange ───────────────────── */
function energyFrames(): Frame[] {
  const a = [4, 2, 9, 1]
  const k = 50 // percent loss
  const eff = 1 - k / 100
  const total = a.reduce((s, x) => s + x, 0)
  // feasible(level): supply = Σ(a_i-level)*eff over a_i>level ; demand = Σ(level-a_i) over a_i<level ; feasible iff supply>=demand
  const feasible = (level: number) => {
    let supply = 0, demand = 0
    for (const x of a) { if (x > level) supply += (x - level) * eff; else demand += level - x }
    return supply >= demand
  }
  const f: Frame[] = []
  f.push({
    narr: b(`n=${a.length} accumulators hold energy = [${a.join(',')}]. Transferring x units loses k=${k}%, receiver gets x·${eff}. Find the max EQUAL level achievable everywhere.`,
      `n=${a.length} 个蓄电池储能 = [${a.join(',')}]。转移 x 单位损耗 k=${k}%，接收方得 x·${eff}。求每个电池都能达到的最大相等水平。`),
    arr: a, metric: [{ label: 'k loss', value: `${k}%`, tone: 'liq' }],
  })
  f.push({
    narr: b('Binary-search the target LEVEL. Accumulators above the line are SUPPLY (donate at efficiency); below are DEMAND. Feasible iff supply ≥ demand — monotonically DECREASING in level.',
      '二分目标水平 LEVEL。高于水平线的电池是供给（按效率捐出），低于的是需求。可行 ⟺ 供给 ≥ 需求——可行性对水平单调递减。'),
    arr: a, metric: [{ label: 'max possible', value: String(total / a.length), tone: 'mint' }],
  })

  let lo = 0, hi = Math.max(...a), mid = 0
  for (let it = 0; it < 5; it++) {
    mid = (lo + hi) / 2
    const ok = feasible(mid)
    let supply = 0, demand = 0
    for (const x of a) { if (x > mid) supply += (x - mid) * eff; else demand += mid - x }
    f.push({
      narr: ok
        ? b(`LEVEL=${mid.toFixed(2)}: supply ${supply.toFixed(2)} ≥ demand ${demand.toFixed(2)} ✓ feasible — raise the line (lo=mid).`,
            `LEVEL=${mid.toFixed(2)}：供给 ${supply.toFixed(2)} ≥ 需求 ${demand.toFixed(2)} ✓ 可行——抬高水平线（lo=mid）。`)
        : b(`LEVEL=${mid.toFixed(2)}: supply ${supply.toFixed(2)} < demand ${demand.toFixed(2)} ✗ infeasible — lower the line (hi=mid).`,
            `LEVEL=${mid.toFixed(2)}：供给 ${supply.toFixed(2)} < 需求 ${demand.toFixed(2)} ✗ 不可行——降低水平线（hi=mid）。`),
      arr: a, levelLine: mid,
      active: a.map((x, i) => (x > mid ? i : -1)).filter((i) => i >= 0),
      bad: a.map((x, i) => (x < mid ? i : -1)).filter((i) => i >= 0),
      metric: [
        { label: 'LEVEL', value: mid.toFixed(2), tone: 'mint' },
        { label: 'supply', value: supply.toFixed(2), tone: 'long' },
        { label: 'demand', value: demand.toFixed(2), tone: 'short' },
      ],
    })
    if (ok) lo = mid; else hi = mid
  }
  f.push({
    narr: b(`After fixed iterations lo≈hi. Answer ≈ ${lo.toFixed(2)}. Precision controlled by iteration count / eps, not exact equality.`,
      `固定迭代后 lo≈hi。答案 ≈ ${lo.toFixed(2)}。精度由迭代次数 / eps 控制，而非精确相等。`),
    arr: a, levelLine: lo, metric: [{ label: 'answer', value: lo.toFixed(2), tone: 'long' }],
  })
  return f
}

/* ─────────────── 339D Xenia and Bit Operations ─────────────── */
function xeniaFrames(): Frame[] {
  // 4 leaves -> tree of 7 nodes (levels=3). Leaves ids 4,5,6,7.
  // parents 2,3 (combine leaves) use OR ; root 1 (combine parents) uses XOR.
  const levels = 3
  const leaves = [1, 6, 3, 5] // values at ids 4,5,6,7
  const val: Record<number, number> = {}
  val[4] = leaves[0]; val[5] = leaves[1]; val[6] = leaves[2]; val[7] = leaves[3]
  const orOp = (x: number, y: number) => x | y
  const xorOp = (x: number, y: number) => x ^ y
  const opName = (id: number) => (id === 1 ? 'XOR' : 'OR')
  const opFn = (id: number) => (id === 1 ? xorOp : orOp)
  function recompute(id: number) { val[id] = opFn(id)(val[2 * id], val[2 * id + 1]) }
  recompute(2); recompute(3); recompute(1)

  const nodeOf = (id: number, state?: string) => {
    const p = treePos(id, levels)
    return { id, x: p.x, y: p.y, label: val[id], sub: id <= 3 ? opName(id) : undefined, state }
  }
  const allEdges = (stateFor?: (a: number, c: number) => string) =>
    [2, 3, 4, 5, 6, 7].map((c) => ({ a: Math.floor(c / 2), b: c, state: stateFor ? stateFor(Math.floor(c / 2), c) : 'tree' }))
  const buildNodes = (states: Record<number, string> = {}) =>
    [1, 2, 3, 4, 5, 6, 7].map((id) => nodeOf(id, states[id]))

  const f: Frame[] = []
  f.push({
    narr: b('A sequence of 2^n leaves is folded bottom-up: level 1 combines pairs with OR, level 2 with XOR, alternating up to a single root value v.',
      '2^n 个叶子自底向上折叠：第 1 层相邻对取 OR，第 2 层取 XOR，交替直到单一根值 v。'),
    nodes: buildNodes(), edges: allEdges(),
    metric: [{ label: 'root v', value: String(val[1]), tone: 'mint' }],
  })
  f.push({
    narr: b(`Leaves = [${leaves.join(',')}]. Parents (ids 2,3) = OR of their pair. Root (id 1) = XOR of the two parents → v=${val[1]}.`,
      `叶子 = [${leaves.join(',')}]。父节点（id 2,3）= 对应对的 OR。根（id 1）= 两父节点的 XOR → v=${val[1]}。`),
    nodes: buildNodes(), edges: allEdges(),
    metric: [{ label: 'root v', value: String(val[1]), tone: 'mint' }],
  })

  // point update: set leaf id=5 to value 4
  const target = 5
  const newVal = 4
  f.push({
    narr: b(`Point update: set leaf id=${target} from ${val[target]} → ${newVal}. Only the path leaf→root needs recomputing (log n nodes).`,
      `点更新：把叶子 id=${target} 从 ${val[target]} 改为 ${newVal}。只需重算 叶子→根 这条路径（log n 个节点）。`),
    nodes: buildNodes({ [target]: 'cur' }), edges: allEdges(),
    metric: [{ label: 'updating leaf', value: String(target), tone: 'liq' }],
  })
  val[target] = newVal
  f.push({
    narr: b(`Leaf id=${target} is now ${newVal}. Walk up to its parent id=2.`,
      `叶子 id=${target} 现在是 ${newVal}。向上走到父节点 id=2。`),
    nodes: buildNodes({ [target]: 'done', 2: 'path' }), edges: allEdges(),
  })

  // recompute parent 2 (uses OR)
  const old2 = val[2]
  recompute(2)
  f.push({
    narr: b(`Recompute id=2 = OR(val[4], val[5]) = OR(${val[4]}, ${val[5]}) = ${val[2]} (was ${old2}).`,
      `重算 id=2 = OR(val[4], val[5]) = OR(${val[4]}, ${val[5]}) = ${val[2]}（原 ${old2}）。`),
    nodes: buildNodes({ 2: 'cur', 4: 'path', [target]: 'path' }),
    edges: allEdges((p) => (p === 2 ? 'active' : 'tree')),
    metric: [{ label: 'op', value: 'OR', tone: 'mint' }],
  })

  // recompute root 1 (uses XOR)
  const old1 = val[1]
  recompute(1)
  f.push({
    narr: b(`Recompute root id=1 = XOR(val[2], val[3]) = XOR(${val[2]}, ${val[3]}) = ${val[1]} (was ${old1}). New v=${val[1]}.`,
      `重算根 id=1 = XOR(val[2], val[3]) = XOR(${val[2]}, ${val[3]}) = ${val[1]}（原 ${old1}）。新 v=${val[1]}。`),
    nodes: buildNodes({ 1: 'cur', 2: 'path', 3: 'path' }),
    edges: allEdges((p) => (p === 1 ? 'active' : 'tree')),
    metric: [{ label: 'op', value: 'XOR', tone: 'mint' }, { label: 'root v', value: String(val[1]), tone: 'long' }],
  })
  f.push({
    narr: b('Update done in O(log n): only nodes on the path changed. It works because each combine operator is associative on its level.',
      '更新在 O(log n) 内完成：只有路径上的节点改变。之所以可行，是因为每层的合并算子在该层满足结合性。'),
    nodes: buildNodes({ 1: 'done', 2: 'done', [target]: 'done' }), edges: allEdges(),
    metric: [{ label: 'output v', value: String(val[1]), tone: 'long' }],
  })
  return f
}

/* ─────────────── 4D Mysterious Present ─────────────── */
function presentFrames(): Frame[] {
  // envelopes already filtered (all contain the card) and sorted by w ascending
  const env = [[2, 2], [3, 5], [4, 4], [5, 6]] // (w,h)
  const n = env.length
  const labels = env.map((e) => `(${e[0]},${e[1]})`)
  const dp = new Array(n).fill(1)
  const prev = new Array(n).fill(-1)
  const grid: (string | number | null)[][] = env.map(() => [null])
  const f: Frame[] = []

  f.push({
    narr: b('Filter envelopes that contain the card, sort by width w ascending. Then run LIS on height h (strict). dp[i] = longest chain ending at envelope i.',
      '先过滤出能装下卡片的信封，按宽度 w 升序排序。再对高度 h 做严格 LIS。dp[i] = 以信封 i 结尾的最长链。'),
    grid: grid.map((r) => [...r]), rowLabels: labels, colLabels: ['dp'],
    metric: [{ label: 'sorted by w', value: labels.join(' '), tone: 'mint' }],
  })

  for (let i = 0; i < n; i++) {
    dp[i] = 1; prev[i] = -1
    let bestJ = -1
    for (let j = 0; j < i; j++) {
      if (env[j][0] < env[i][0] && env[j][1] < env[i][1] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1; prev[i] = j; bestJ = j
      }
    }
    grid[i][0] = dp[i]
    const cells: { r: number; c: number; state: string }[] = [{ r: i, c: 0, state: 'cur' }]
    for (let j = 0; j < i; j++) if (env[j][0] < env[i][0] && env[j][1] < env[i][1]) cells.push({ r: j, c: 0, state: 'active' })
    f.push({
      narr: bestJ >= 0
        ? b(`i=${i} env ${labels[i]}: best predecessor is ${labels[bestJ]} (w & h both smaller, dp=${dp[bestJ]}). dp[${i}] = dp[${bestJ}]+1 = ${dp[i]}.`,
            `i=${i} 信封 ${labels[i]}：最佳前驱是 ${labels[bestJ]}（w、h 都更小，dp=${dp[bestJ]}）。dp[${i}] = dp[${bestJ}]+1 = ${dp[i]}。`)
        : b(`i=${i} env ${labels[i]}: no smaller envelope fits inside it. dp[${i}] = 1.`,
            `i=${i} 信封 ${labels[i]}：没有更小的信封能嵌进它。dp[${i}] = 1。`),
      grid: grid.map((r) => [...r]), rowLabels: labels, colLabels: ['dp'], cells,
      metric: [{ label: `dp[${i}]`, value: String(dp[i]), tone: 'long' }],
    })
  }

  // recover best chain
  let best = 0
  for (let i = 1; i < n; i++) if (dp[i] > dp[best]) best = i
  const chain: number[] = []
  for (let kk = best; kk >= 0; kk = prev[kk]) chain.push(kk)
  chain.reverse()
  f.push({
    narr: b(`Longest chain length = ${dp[best]}, ending at ${labels[best]}. Recover path via prev[]: ${chain.map((i) => labels[i]).join(' ⊂ ')}.`,
      `最长链长度 = ${dp[best]}，以 ${labels[best]} 结尾。用 prev[] 还原路径：${chain.map((i) => labels[i]).join(' ⊂ ')}。`),
    grid: grid.map((r) => [...r]), rowLabels: labels, colLabels: ['dp'],
    cells: chain.map((i) => ({ r: i, c: 0, state: 'done' })),
    metric: [{ label: 'answer', value: String(dp[best]), tone: 'long' }],
  })
  f.push({
    narr: b('This is O(n²) DP; sorting by w and binary-search / Fenwick over h gives O(n log n). Ties on a dimension must NOT count (strict <), else a chain could "self-nest".',
      '此处是 O(n²) DP；按 w 排序后对 h 用二分 / 树状数组可做到 O(n log n)。某一维相等不能算入（严格 <），否则链会“自嵌套”误判。'),
    grid: grid.map((r) => [...r]), rowLabels: labels, colLabels: ['dp'],
    cells: chain.map((i) => ({ r: i, c: 0, state: 'done' })),
    metric: [{ label: 'complexity', value: 'O(n²)→O(n log n)', tone: 'mint' }],
  })
  return f
}

/* ─────────── 459D Pashmak and Parmida's Problem ─────────── */
function pashmakFrames(): Frame[] {
  // a = [1,2,1,1,2]; L_i = f(1,i,a_i) (prefix count of a_i up to i); R_j = f(j,n,a_j) (suffix count from j)
  const a = [1, 2, 1, 1, 2]
  const n = a.length
  const L = new Array(n).fill(0)
  const R = new Array(n).fill(0)
  {
    const cnt = new Map<number, number>()
    for (let i = 0; i < n; i++) { cnt.set(a[i], (cnt.get(a[i]) || 0) + 1); L[i] = cnt.get(a[i])! }
  }
  {
    const cnt = new Map<number, number>()
    for (let j = n - 1; j >= 0; j--) { cnt.set(a[j], (cnt.get(a[j]) || 0) + 1); R[j] = cnt.get(a[j])! }
  }
  // Count pairs i<j with L_i > R_j. Sweep j left→right; BIT holds L of indices < j (the eligible i).
  // Fenwick over values 1..n; drawn as a small 3-level tree (ids 1..7) of value buckets.
  const levels = 3
  const ids = [1, 2, 3, 4, 5, 6, 7]
  const bit = new Array(n + 2).fill(0)
  const update = (i: number) => { for (; i <= n; i += i & -i) bit[i]++ }
  const queryLeq = (i: number) => { let s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s }

  const nodePos = (id: number, state?: string) => {
    const p = treePos(id, levels)
    return { id, x: p.x, y: p.y, label: id, state }
  }
  const baseEdges = [2, 3, 4, 5, 6, 7].map((c) => ({ a: Math.floor(c / 2), b: c, state: 'tree' }))
  const drawBit = (touched: Set<number>, cur?: number) =>
    ids.map((id) => nodePos(id, touched.has(id) ? 'path' : (id === cur ? 'cur' : undefined)))

  const f: Frame[] = []
  f.push({
    narr: b(`a = [${a.join(',')}]. Define L_i = f(1,i,a_i) (times a_i appeared up to i) and R_j = f(j,n,a_j) (from j to the end).`,
      `a = [${a.join(',')}]。定义 L_i = f(1,i,a_i)（a_i 截至 i 出现的次数）、R_j = f(j,n,a_j)（从 j 到末尾）。`),
    nodes: drawBit(new Set()), edges: baseEdges,
    metric: [{ label: 'L', value: L.join(','), tone: 'mint' }, { label: 'R', value: R.join(','), tone: 'liq' }],
  })
  f.push({
    narr: b('Goal: count pairs i<j with L_i > R_j. Sweep j left→right; a Fenwick tree over L-values holds the L of every index already passed (the eligible i<j).',
      '目标：数 i<j 且 L_i > R_j 的对。从左到右扫 j；用值域树状数组保存所有已扫过下标的 L（即合法的 i<j）。'),
    nodes: drawBit(new Set()), edges: baseEdges,
    metric: [{ label: 'answer', value: '0', tone: 'long' }],
  })

  let ans = 0
  for (let j = 0; j < n; j++) {
    const insertedSoFar = j // indices 0..j-1 inserted
    const le = queryLeq(R[j])
    const add = insertedSoFar - le
    const qTouched = new Set<number>()
    { let i = Math.min(R[j], 7); for (; i > 0; i -= i & -i) qTouched.add(i) }
    ans += add
    f.push({
      narr: b(`j=${j}: R_j=${R[j]}. Query Fenwick for #(inserted L ≤ ${R[j]}) = ${le}; inserted so far = ${insertedSoFar} ⇒ #(L>${R[j]}) = ${add}. answer += ${add} → ${ans}.`,
        `j=${j}：R_j=${R[j]}。查询树状数组 #(已插入 L ≤ ${R[j]}) = ${le}；已插入 = ${insertedSoFar} ⇒ #(L>${R[j]}) = ${add}。答案 += ${add} → ${ans}。`),
      nodes: drawBit(qTouched, Math.min(R[j], 7) || undefined), edges: baseEdges,
      metric: [
        { label: 'R_j', value: String(R[j]), tone: 'liq' },
        { label: '+', value: String(add), tone: 'short' },
        { label: 'answer', value: String(ans), tone: 'long' },
      ],
    })
    const uTouched = new Set<number>()
    { let i = Math.min(L[j], 7); for (; i <= 7; i += i & -i) uTouched.add(i) }
    update(Math.min(L[j], n))
    f.push({
      narr: b(`Insert this index's L_j=${L[j]} into the Fenwick so later j' can pair with i=${j}. Update path touches O(log n) nodes.`,
        `把当前下标的 L_j=${L[j]} 插入树状数组，供之后的 j' 与 i=${j} 配对。更新路径触及 O(log n) 个节点。`),
      nodes: drawBit(uTouched, Math.min(L[j], 7) || undefined), edges: baseEdges,
      metric: [{ label: 'inserted L', value: String(L[j]), tone: 'mint' }, { label: 'answer', value: String(ans), tone: 'long' }],
    })
  }
  f.push({
    narr: b(`Total ordered pairs counted = ${ans}. Each query/update is O(log n) ⇒ O(n log n). Large value ranges need coordinate compression first.`,
      `共计得到有序对 = ${ans}。每次查询/更新 O(log n) ⇒ O(n log n)。值域大时需先做离散化。`),
    nodes: drawBit(new Set()), edges: baseEdges,
    metric: [{ label: 'answer', value: String(ans), tone: 'long' }],
  })
  return f
}

/* ─────────────── 46D Parking Lot ─────────────── */
function parkingFrames(): Frame[] {
  // Street of L cells. back = gap needed behind, front = gap in front. Edges count as free.
  const L = 16
  const back = 1, front = 1
  type Car = { l: number; r: number; id: number }
  let cars: Car[] = []
  const blank = () => new Array(L).fill(0)
  const occMask = () => {
    const m = blank()
    for (const c of cars) for (let i = c.l; i <= c.r; i++) m[i] = c.id
    return m
  }
  const occIdx = () => { const m = occMask(); const o: number[] = []; for (let i = 0; i < L; i++) if (m[i]) o.push(i); return o }

  // leftmost spot for a car of length len needing back/front gaps among current cars
  function findSpot(len: number): { l: number; r: number } | null {
    for (let p = 0; p + len - 1 < L; p++) {
      const r = p + len - 1
      const needLeft = p === 0 ? p : p - back
      const needRight = r === L - 1 ? r : r + front
      let ok = true
      for (const c of cars) {
        if (!(c.r < needLeft || c.l > needRight)) { ok = false; break }
      }
      if (ok) return { l: p, r }
    }
    return null
  }

  const f: Frame[] = []
  const labels = Array.from({ length: L }, (_, i) => i)
  f.push({
    narr: b(`Street of length ${L} cells. A car needs ≥${back} free behind and ≥${front} free in front; street edges count as free. Two events: ARRIVE (find LEFTMOST valid spot) and LEAVE.`,
      `长度 ${L} 格的街道。停车后需 ≥${back} 空位在后、≥${front} 在前；街道两端视为空。两类事件：到达（找最左合法空位）与离开。`),
    arr: blank(), labels,
    metric: [{ label: 'parked', value: '0', tone: 'mint' }],
  })

  let nextId = 1
  const arrive = (len: number) => {
    const spot = findSpot(len)
    if (!spot) {
      f.push({
        narr: b(`A car of length ${len} arrives: no valid leftmost spot fits (all gaps too small). Report "−1".`,
          `一辆长 ${len} 的车到达：找不到合法的最左空位（所有间隙太小）。回报 “−1”。`),
        arr: occMask(), labels, done: occIdx(),
        metric: [{ label: 'parked', value: String(cars.length), tone: 'mint' }, { label: 'result', value: '-1', tone: 'short' }],
      })
      return
    }
    const scan: number[] = []
    for (let i = spot.l; i <= spot.r; i++) scan.push(i)
    f.push({
      narr: b(`Car length ${len} arrives. Scan gaps left→right; leftmost valid spot is cells [${spot.l}..${spot.r}] (clearances on both sides satisfied).`,
        `长 ${len} 的车到达。从左到右扫间隙；最左合法空位是格 [${spot.l}..${spot.r}]（两侧间隙满足）。`),
      arr: occMask(), labels, done: occIdx(), active: scan,
      metric: [{ label: 'parked', value: String(cars.length), tone: 'mint' }],
    })
    const id = nextId++
    cars.push({ l: spot.l, r: spot.r, id })
    f.push({
      narr: b(`Park car #${id} at [${spot.l}..${spot.r}]. Insert into the ordered set of occupied intervals.`,
        `把车 #${id} 停在 [${spot.l}..${spot.r}]。插入到占用区间的有序集合中。`),
      arr: occMask(), labels, done: occIdx(), highlight: scan,
      metric: [{ label: 'parked', value: String(cars.length), tone: 'long' }],
    })
  }
  const leave = (id: number) => {
    const car = cars.find((c) => c.id === id)!
    const span: number[] = []; for (let i = car.l; i <= car.r; i++) span.push(i)
    cars = cars.filter((c) => c.id !== id)
    f.push({
      narr: b(`Car #${id} leaves: remove [${car.l}..${car.r}] from the set; those cells become free again.`,
        `车 #${id} 离开：从集合移除 [${car.l}..${car.r}]；这些格子重新空出。`),
      arr: occMask(), labels, done: occIdx(), dim: span,
      metric: [{ label: 'parked', value: String(cars.length), tone: 'liq' }],
    })
  }

  arrive(3) // car #1 -> [0..2]
  arrive(4) // car #2 -> leftmost after back gap from car #1
  leave(1)  // free [0..2]
  arrive(2) // car #3 -> leftmost again -> [0..1]
  f.push({
    narr: b('Each event is O(log n) with a std::set of intervals: locate neighbours, check the gap between adjacent cars, insert/erase. Leftmost-first falls out of scanning gaps in order.',
      '用区间的 std::set，每个事件 O(log n)：定位邻居、检查相邻车之间的间隙、插入/删除。按顺序扫间隙天然保证最左优先。'),
    arr: occMask(), labels, done: occIdx(),
    metric: [{ label: 'parked', value: String(cars.length), tone: 'mint' }],
  })
  return f
}

/* ─────────────── 547B Mike and Feet ─────────────── */
function feetFrames(): Frame[] {
  const a = [1, 5, 4, 3, 6, 2]
  const n = a.length
  const ans = new Array(n + 2).fill(0) // ans[len] = best min for some segment of length len
  const stack: number[] = [] // monotonic increasing stack of indices
  const f: Frame[] = []
  f.push({
    narr: b(`Heights = [${a.join(',')}]. For each segment of a given length, its strength = min height. We want, per length x, the MAX strength. A monotonic stack does it in O(n).`,
      `身高 = [${a.join(',')}]。每个给定长度的区间，其强度 = 最小身高。对每个长度 x 求最大强度。单调栈 O(n) 解决。`),
    arr: a, stack: [],
    metric: [{ label: 'pass', value: 'left→right', tone: 'mint' }],
  })

  const stackVals = () => stack.map((idx) => a[idx])
  // process i in [0..n]; treat a[n] = -inf to flush the stack
  for (let i = 0; i <= n; i++) {
    const cur = i < n ? a[i] : -Infinity
    while (stack.length && a[stack[stack.length - 1]] >= cur) {
      const top = stack.pop()!
      const left = stack.length ? stack[stack.length - 1] : -1
      const len = i - left - 1 // span where a[top] is the minimum
      ans[len] = Math.max(ans[len], a[top])
      const spanL = left + 1, spanR = i - 1
      f.push({
        narr: b(`a[${i}]=${i < n ? cur : '−∞'} < stack top a[${top}]=${a[top]} → pop. a[${top}] is the min over span [${spanL}..${spanR}], length ${len}. Set ans[${len}] = max(ans[${len}], ${a[top]}).`,
          `a[${i}]=${i < n ? cur : '−∞'} < 栈顶 a[${top}]=${a[top]} → 弹出。a[${top}] 是区间 [${spanL}..${spanR}]（长度 ${len}）的最小值。令 ans[${len}] = max(ans[${len}], ${a[top]})。`),
        arr: a, stack: stackVals(), window: [spanL, spanR], highlight: [top],
        pointers: i < n ? [{ name: 'i', idx: i }] : [],
        metric: [{ label: `ans[${len}]`, value: String(ans[len]), tone: 'long' }],
      })
    }
    if (i < n) {
      stack.push(i)
      f.push({
        narr: b(`Push i=${i} (height ${a[i]}). The stack stays increasing by height — each index enters and leaves at most once ⇒ O(n) total.`,
          `压入 i=${i}（身高 ${a[i]}）。栈按身高保持递增——每个下标至多进出一次 ⇒ 总 O(n)。`),
        arr: a, stack: stackVals(), active: [i], pointers: [{ name: 'i', idx: i }],
        metric: [{ label: 'stack size', value: String(stack.length), tone: 'mint' }],
      })
    }
  }

  const ansArr = ans.slice(1, n + 1)
  f.push({
    narr: b(`Raw ans by length = [${ansArr.join(',')}]. A length-x answer is also valid for any shorter length, so take a suffix-max from large lengths down.`,
      `按长度的原始 ans = [${ansArr.join(',')}]。长度 x 的答案对更短长度也成立，故从大长度往小做后缀最大值。`),
    arr: ansArr, labels: ansArr.map((_, i) => i + 1),
    metric: [{ label: 'before sfx-max', value: ansArr.join(','), tone: 'liq' }],
  })
  for (let len = n - 1; len >= 1; len--) ans[len] = Math.max(ans[len], ans[len + 1])
  const finalArr = ans.slice(1, n + 1)
  f.push({
    narr: b(`After suffix-max: answer per length = [${finalArr.join(',')}]. Done in O(n) overall.`,
      `后缀最大值后：每个长度的答案 = [${finalArr.join(',')}]。整体 O(n) 完成。`),
    arr: finalArr, labels: finalArr.map((_, i) => i + 1), done: finalArr.map((_, i) => i),
    metric: [{ label: 'answer', value: finalArr.join(','), tone: 'long' }],
  })
  return f
}

export const problemsB: Problem[] = [
  {
    id: '91B', module: 'B', catKey: 'binary-search', cat: b('Suffix min + binary search', '后缀最值 + 二分'),
    rating: 1500, tags: ['binary search', 'data structures'], url: 'https://codeforces.com/problemset/problem/91/B',
    title: b('Queue', '队列'),
    statement: b(
      'n walruses stand in a queue numbered from the tail. The i-th has age a_i. Walrus i is displeased if some j>i ahead of him is younger (a_j < a_i); his displeasure is the number of walruses between him and the FURTHEST younger walrus ahead. Output each walrus\'s displeasure (−1 if none).',
      'n 只海象排成一队，从队尾开始编号。第 i 只年龄 a_i。若前方存在某个 j>i 比他更年轻（a_j < a_i），海象 i 就会不满；其不满值为他与前方最远的更年轻海象之间的海象数量。对每只海象输出不满值（没有则 −1）。'),
    hl: b('For each order, find the furthest "better price" to its right — essentially suffix-min + binary search. Useful for deciding whether a resting order can be filled by a later, better price, and for scanning the fillable boundary in the book.',
      '对每个订单，找右侧最远的“更优价位”——本质是后缀最小值 + 二分定位；订单簿里判断挂单能否被后续更优价吃到、扫描可成交边界都用得上。'),
    idea: b('Maintain a suffix-min array from right to left (non-increasing). For each i, binary-search on the suffix-min array for the furthest position where min < a_i; the answer is that position − i − 1, or −1 if none.',
      '从右往左维护后缀最小值数组（单调不增），对每个 i 在后缀最小值上二分最远满足 min<a_i 的位置，答案=该位置−i−1，没有则 −1。'),
    complexity: 'O(n log n)',
    interview: b('Why is the suffix-min monotonic, allowing a binary search? Could you do it in O(n) with a monotonic stack?',
      '为什么后缀最小值单调、从而能二分？能否用单调栈做到 O(n)？'),
    viz: { kind: 'array', build: queueFrames, caption: b('binary search the furthest younger walrus on a non-increasing suffix-min', '在不增的后缀最小值上二分最远的更年轻海象') },
  },
  {
    id: '68B', module: 'B', catKey: 'binary-search', cat: b('Binary search on answer', '二分答案'),
    rating: 1600, tags: ['binary search'], url: 'https://codeforces.com/problemset/problem/68/B',
    title: b('Energy exchange', '能量交换'),
    statement: b(
      'n accumulators, the i-th holds a_i energy. Energy can be transferred between them, but transferring x units loses k% (the receiver gets x·(1−k/100)). Find the maximum equal energy level achievable in every accumulator.',
      'n 个蓄电池，第 i 个储能 a_i。能量可在它们之间转移，但每转移 x 单位损耗 k%（接收方得 x·(1−k/100)）。求每个蓄电池都能达到的最大相等能量水平。'),
    hl: b('The core model of capital-efficiency: rebalancing capital/energy across accounts with slippage/fees (loss), finding the best achievable equilibrium level under a constraint. The algorithmic backbone of cross-margin redistribution and cross-sub-account transfers.',
      '资金利用效率的核心模型——把资金/能量在账户间再平衡、调拨有滑点/手续费（损耗），求约束下能达到的最优均衡水平。cross-margin 再分配、跨子账户调拨的算法骨架。'),
    idea: b('Binary-search the target level mid. Accounts above mid contribute (a_i − mid)·(1 − k%); those below need (mid − a_i). Feasible when total supply ≥ total demand. Feasibility is monotonically decreasing in mid → binary search (floating point, fixed iteration count for precision).',
      '二分目标水平 mid。高于 mid 的账户贡献 (a_i−mid)·(1−k%)，低于的需求 (mid−a_i)，可行当总供给 ≥ 总需求。可行性对 mid 单调递减 → 二分（浮点，固定迭代次数控精度）。'),
    complexity: 'O(n log(1/ε))', star: 1,
    interview: b('Why is "feasibility" monotonic in the target level? How do you control precision / floating point (eps, iteration count)? This is the interviewer\'s favorite "binary search on the answer" archetype.',
      '为什么“可行性”对目标水平单调？精度/浮点怎么控制（eps、迭代次数）？这是面试官最爱的“二分答案”母题。'),
    viz: { kind: 'array', build: energyFrames, caption: b('binary search the level where supply ≥ demand', '二分使供给 ≥ 需求的水平线') },
  },
  {
    id: '339D', module: 'B', catKey: 'segment-tree', cat: b('Segment tree (point update)', '线段树（点更新）'),
    rating: 1700, tags: ['data structures', 'trees'], url: 'https://codeforces.com/problemset/problem/339/D',
    title: b('Xenia and Bit Operations', 'Xenia 与位运算'),
    statement: b(
      'A sequence of 2^n integers is combined bottom-up: level 1 takes bitwise OR of adjacent pairs, level 2 takes XOR of adjacent pairs, alternating OR/XOR up to a single root value v. Given m point updates, after each output the new v.',
      '一个长度为 2^n 的整数序列自底向上合并：第 1 层对相邻对取按位 OR，第 2 层取 XOR，OR/XOR 交替直到单一根值 v。给定 m 次点更新，每次更新后输出新的 v。'),
    hl: b('This is the cleanest form of segment-tree point update + bottom-up pushup. When the depth at one price level in the book changes, you must recompute total depth / weighted net / an aggregate metric in O(log n) — exactly the same structure (only the merge operator changes from OR/XOR to sum/max).',
      '这是线段树点更新 + 自底向上 pushup 的纯净版。订单簿某价位挂单量变化后，要 O(log n) 增量重算总深度/加权净额/聚合指标——结构完全一样（只是合并算子从 OR/XOR 换成 sum/max）。'),
    idea: b('A perfect binary segment tree: change one leaf, recompute the log n nodes on the path to the root; choose OR or XOR as the merge operator by the level\'s parity.',
      '满二叉线段树，叶子改一个，沿到根重算 log n 个节点；按层奇偶选 OR 或 XOR 作为合并算子。'),
    complexity: 'O(log n) per update', star: 1,
    interview: b('What property must the merge operator satisfy for this incremental update (associativity)? What if you needed range queries instead of just the global root value?',
      '合并算子需要满足什么性质才能这样增量更新（结合性）？如果要支持区间查询而非全局根值呢？'),
    viz: { kind: 'segtree', build: xeniaFrames, caption: b('point update recomputes only the leaf→root path', '点更新只重算 叶子→根 路径') },
  },
  {
    id: '4D', module: 'B', catKey: 'dp', cat: b('2D longest chain (LIS)', '二维最长链 (LIS)'),
    rating: 1700, tags: ['dp', 'sortings'], url: 'https://codeforces.com/problemset/problem/4/D',
    title: b('Mysterious Present', '神秘礼物'),
    statement: b(
      'n envelopes, envelope i has width w_i and height h_i. Find the longest chain where each envelope strictly fits inside the next (both w and h strictly increasing), and the smallest envelope strictly contains the card (w>w0, h>h0). Output the longest chain.',
      'n 个信封，信封 i 有宽 w_i、高 h_i。求最长的链，使每个信封都严格装进下一个（w、h 都严格递增），且最小的信封严格装下卡片（w>w0, h>h0）。输出最长链。'),
    hl: b('The longest feasible chain under a 2D partial order (2D-LIS). When an operation must satisfy multiple monotone constraints at once (nest only when several margin/limit dimensions all hold), finding the longest feasible sequence of operations is exactly this model.',
      '二维偏序下的最长可行链（2D-LIS）。当一个操作要同时满足多重单调约束（同时满足多个保证金/限额维度才能嵌套执行）时，求最长可行操作序列就是这个模型。'),
    idea: b('First filter out envelopes that cannot contain the card. Sort by w, then run LIS on h (O(n²) DP or Fenwick-optimized O(n log n)), recording predecessors to recover the path.',
      '先过滤掉装不下卡片的信封，按 w 排序后对 h 求 LIS（O(n²) DP 或树状数组优化 O(n log n)），记录前驱还原路径。'),
    complexity: 'O(n²) or O(n log n)',
    interview: b('How do you optimize from O(n²) to O(n log n)? How do you handle equal dimensions to avoid wrongly treating them as strictly increasing?',
      '如何从 O(n²) 优化到 O(n log n)？相等维度怎么处理避免误判严格递增？'),
    viz: { kind: 'dpgrid', build: presentFrames, caption: b('fill dp[i] = longest chain ending at envelope i, then recover the path', '填 dp[i] = 以信封 i 结尾的最长链，再还原路径') },
  },
  {
    id: '459D', module: 'B', catKey: 'fenwick', cat: b('Fenwick / BIT (count pairs)', '树状数组（数对）'),
    rating: 1800, tags: ['data structures', 'sortings'], url: 'https://codeforces.com/problemset/problem/459/D',
    title: b("Pashmak and Parmida's Problem", 'Pashmak 与 Parmida 的问题'),
    statement: b(
      'Given a sequence a. Let f(l,r,x) = count of indices k in [l,r] with a_k = x. Count pairs i<j such that f(1,i,a_i) > f(j,n,a_j).',
      '给定序列 a。设 f(l,r,x) = [l,r] 内满足 a_k = x 的下标 k 的个数。求满足 f(1,i,a_i) > f(j,n,a_j) 的数对 i<j 的个数。'),
    hl: b('The representative problem for counting inversion-like pairs with a Fenwick tree. Counting "(buy, sell) pairs satisfying some condition" or "how many risk events precede another class" — all are counting order pairs along one dimension, where the BIT is the standard weapon.',
      '树状数组数偏序对的代表题。统计“满足某条件的 (买单,卖单) 对数”“有多少风险事件先于另一类发生”——都是在一维上数偏序，BIT 是标准武器。'),
    idea: b('Precompute prefix counts L_i = f(1,i,a_i) and suffix counts R_j = f(j,n,a_j); the problem reduces to counting i<j with L_i > R_j. Sweep left→right, maintain a BIT of the L values already seen, and accumulate the count larger than the current R_j.',
      '预处理前缀计数 L_i=f(1,i,a_i) 和后缀计数 R_j=f(j,n,a_j)，问题化为数 i<j 且 L_i>R_j 的对；从左到右扫，用 BIT 维护已出现的 R 值，查询比当前 L_i 小的个数累加。'),
    complexity: 'O(n log n)', star: 1,
    interview: b('Why use a BIT instead of sorting with two pointers? If the value range is large you must coordinate-compress — how?',
      '为什么用 BIT 而不是排序双指针？值域大要离散化，怎么做？'),
    viz: { kind: 'fenwick', build: pashmakFrames, caption: b('Fenwick tree counts L_i > R_j pairs in one left-to-right sweep', '树状数组一次左到右扫即数出 L_i > R_j 的对数') },
  },
  {
    id: '46D', module: 'B', catKey: 'segment-tree', cat: b('Interval allocation', '区间分配'),
    rating: 1800, tags: ['data structures', 'implementation'], url: 'https://codeforces.com/problemset/problem/46/D',
    title: b('Parking Lot', '停车场'),
    statement: b(
      'A street segment of length L. A car parking needs a gap ≥ b behind it and ≥ f in front (edges count as free). Two event types: a car arrives (find the LEFTMOST valid spot, or report it can\'t park) and a car leaves. Process online.',
      '一段长度为 L 的街道。停一辆车需要后方间隙 ≥ b、前方间隙 ≥ f（两端视为空）。两类事件：车到达（找最左合法空位，或报告无法停）与车离开。在线处理。'),
    hl: b('The classic free-slot / interval allocation: empty price levels in the book, the matching engine\'s memory/object pool, slot allocation on flush — all need to find the leftmost available gap in O(log n) and support insert/free.',
      '空位/区间分配的典型——订单簿的空价位、撮合引擎的内存池/对象池、落盘的 slot 分配，都要 O(log n) 找最左可用空隙并支持插入/释放。'),
    idea: b('Keep parked cars in an ordered structure (set / segment tree) by position. In the gaps between adjacent cars, find the first position that fits the new car (satisfying b and f). On a leave, delete it.',
      '把已停的车按位置维护在有序结构（set / 线段树）里，在相邻车之间的间隙中找第一个能容纳新车（满足 b、f）的位置；车离开则删除。'),
    complexity: 'O(log n) per event',
    interview: b('Maintain occupied intervals with std::set + check gaps between adjacent cars — complexity? How do you guarantee leftmost-first? How do you avoid fragmentation under high-frequency churn?',
      '用 std::set 维护占用区间 + 相邻车间检查间隙，复杂度？最左优先怎么保证？高频进出怎样避免碎片？'),
    viz: { kind: 'array', build: parkingFrames, caption: b('find the leftmost gap satisfying back/front clearances', '找满足前后间隙的最左空隙') },
  },
  {
    id: '547B', module: 'B', catKey: 'monotonic-stack', cat: b('Monotonic stack', '单调栈'),
    rating: 1900, tags: ['binary search', 'data structures', 'dp'], url: 'https://codeforces.com/problemset/problem/547/B',
    title: b('Mike and Feet', 'Mike 与熊'),
    statement: b(
      'n bears in a row with heights a_i. A group is a contiguous segment; its strength is the minimum height in it. For each group size x (1..n), output the maximum strength over all groups of that size.',
      'n 只熊排成一行，身高为 a_i。一个组是连续区间；其强度为其中的最小身高。对每个组大小 x（1..n），输出所有该大小的组中的最大强度。'),
    hl: b('A classic case of a monotonic stack taking O(n²) down to O(n) — exactly the kind of high-performance problem HL values: for each interval length, find the max of the minimum = the depth-price curve, the worst-case risk extreme over each window.',
      '单调栈把 O(n²) 干到 O(n) 的经典案例——这正是 HL 看重“高性能”的考点：对每个区间长度求最大的最小值 = 深度-价格曲线、各窗口的最差风险极值。'),
    idea: b('For each element, use a monotonic stack to find the maximum width len over which it is the minimum (between the first smaller elements on its left and right); it updates ans[len] = max(ans[len], a_i). Finally take a suffix-max over the ans array from large to small.',
      '对每个元素用单调栈求它作为最小值能向左右扩展的最大宽度 len（左右第一个更小元素之间），则它能更新 ans[len]=max(ans[len], a_i)，最后对 ans 从大到小做后缀取 max。'),
    complexity: 'O(n)', star: 1,
    interview: b('Why is the monotonic stack O(n) (each element pushed and popped once)? Why do you need the suffix-max over the answer array?',
      '单调栈为什么 O(n)（每个元素进出栈各一次）？为什么要对答案数组做后缀 max？'),
    viz: { kind: 'array', build: feetFrames, caption: b('monotonic stack computes each element\'s span as the minimum', '单调栈算出每个元素作为最小值的跨度') },
  },
]
