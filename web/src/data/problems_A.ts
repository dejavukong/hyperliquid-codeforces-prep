import type { Frame, Problem } from '../types'
import { b } from '../anim/helpers'

/* ───────────────────────── 230A Dragons ───────────────────────── */
function dragonsFrames(): Frame[] {
  const unsorted = [4, 7, 2]
  const sorted = [2, 4, 7]
  const bonus = [3, 5, 0] // aligned with sorted strengths
  let s = 3
  const f: Frame[] = []
  f.push({ narr: b('Given dragons (any fight order). Kirito starts at strength 3. Greedy idea: fight the weakest first.',
    '给定若干龙（可任意顺序）。Kirito 初始力量 3。贪心思路：先打最弱的。'),
    arr: unsorted, metric: [{ label: 'strength', value: '3', tone: 'mint' }] })
  f.push({ narr: b('Sort dragons by strength ascending.', '把龙按力量升序排序。'),
    arr: sorted, metric: [{ label: 'strength', value: '3', tone: 'mint' }] })
  const done: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    const win = s > sorted[i]
    f.push({
      narr: win
        ? b(`strength ${s} > ${sorted[i]} ✓ defeat, gain +${bonus[i]} → ${s + bonus[i]}`,
            `力量 ${s} > ${sorted[i]} ✓ 击败，奖励 +${bonus[i]} → ${s + bonus[i]}`)
        : b(`strength ${s} ≤ ${sorted[i]} ✗ would die`, `力量 ${s} ≤ ${sorted[i]} ✗ 会阵亡`),
      arr: sorted, done: [...done], highlight: [i], bad: win ? [] : [i],
      metric: [{ label: 'strength', value: String(s), tone: win ? 'long' : 'short' }],
    })
    if (!win) return f
    s += bonus[i]; done.push(i)
  }
  f.push({ narr: b(`All dragons defeated, final strength ${s}. Answer: YES.`, `全部击败，终力量 ${s}。答案：YES。`),
    arr: sorted, done: [0, 1, 2], metric: [{ label: 'strength', value: String(s), tone: 'long' }] })
  return f
}

/* ─────────────────── 176A Trading Business ─────────────────── */
function tradingFrames(): Frame[] {
  // for the best (buy,sell) planet pair: per-item profit + stock; capacity k
  const profit = [5, 3, 8, -1]
  const stock = [3, 5, 2, 9]
  const order = [2, 0, 1, 3] // indices sorted by profit desc
  const K = 6
  const f: Frame[] = []
  f.push({ narr: b('Fix a (buy planet → sell planet) pair. Bars = per-item profit (sell − buy). Capacity k = 6.',
    '固定一对 (买星球→卖星球)。柱子 = 每件利润 (卖价−买价)。容量 k = 6。'),
    arr: profit, metric: [{ label: 'profit', value: '0', tone: 'mint' }, { label: 'cap left', value: '6', tone: 'liq' }] })
  f.push({ narr: b('Greedy: take highest-profit goods first (ignore profit ≤ 0).', '贪心：先装利润最高的（利润 ≤ 0 的不装）。'),
    arr: profit, active: order.filter((i) => profit[i] > 0), bad: order.filter((i) => profit[i] <= 0) })
  let cap = K, total = 0
  const done: number[] = []
  for (const i of order) {
    if (profit[i] <= 0) continue
    const take = Math.min(cap, stock[i])
    if (take <= 0) break
    total += take * profit[i]; cap -= take; done.push(i)
    f.push({
      narr: b(`Take ${take}× good@profit ${profit[i]} (stock ${stock[i]}). profit += ${take * profit[i]} → ${total}`,
        `装 ${take} 件 利润${profit[i]} 的货 (库存 ${stock[i]})。利润 += ${take * profit[i]} → ${total}`),
      arr: profit, done: [...done], highlight: [i],
      metric: [{ label: 'profit', value: String(total), tone: 'long' }, { label: 'cap left', value: String(cap), tone: 'liq' }],
    })
    if (cap === 0) break
  }
  f.push({ narr: b(`Capacity full. Max profit for this pair = ${total}. Try all pairs, keep the best.`,
    `容量装满。这对的最大利润 = ${total}。对所有星球对取最优。`),
    arr: profit, done, metric: [{ label: 'best', value: String(total), tone: 'long' }] })
  return f
}

/* ─────────────── 4C Registration System ─────────────── */
function registrationFrames(): Frame[] {
  const reqs = ['abacaba', 'acaba', 'abacaba', 'acaba', 'abacaba']
  const map = new Map<string, number>()
  const f: Frame[] = []
  f.push({ narr: b('Process registration requests. Keep a hash map name → times-seen.',
    '逐个处理注册请求。维护哈希表 name → 出现次数。'), table: [] })
  for (const name of reqs) {
    const seen = map.get(name)
    if (seen === undefined) {
      map.set(name, 0)
      f.push({
        narr: b(`"${name}" not in map → insert, reply OK`, `“${name}” 不在表中 → 插入，回复 OK`),
        query: name, result: { text: 'OK', ok: true },
        table: [...map.keys()].map((k) => ({ name: k, count: map.get(k)!, state: k === name ? 'new' : 'idle' })),
        metric: [{ label: 'stored', value: String(map.size), tone: 'mint' }],
      })
    } else {
      const next = seen + 1
      map.set(name, next)
      f.push({
        narr: b(`"${name}" exists → return "${name}${next}" and store it`, `“${name}” 已存在 → 返回 “${name}${next}” 并存入`),
        query: name, result: { text: `${name}${next}`, ok: false },
        table: [...map.keys()].map((k) => ({ name: k, count: map.get(k)!, state: k === name ? 'hit' : 'idle' })),
        metric: [{ label: 'stored', value: String(map.size), tone: 'mint' }],
      })
    }
  }
  return f
}

export const problemsA: Problem[] = [
  {
    id: '230A', module: 'A', catKey: 'greedy', cat: b('Greedy + sorting', '贪心 + 排序'),
    rating: 1000, tags: ['greedy', 'sortings'], url: 'https://codeforces.com/problemset/problem/230/A',
    title: b('Dragons', '巨龙'),
    statement: b(
      'Kirito starts with strength s and must defeat all n dragons. Dragon i has strength x_i and grants bonus y_i when beaten. If his strength is strictly greater than a dragon he wins and gains y_i, otherwise he dies. He may fight in any order — can he beat them all?',
      'Kirito 初始力量为 s，要击败全部 n 条龙。第 i 条龙力量 x_i，击败后奖励 y_i。当且仅当他的力量严格大于龙的力量时获胜并 +y_i，否则阵亡。可任意顺序——他能全胜吗？'),
    hl: b('The minimal model of liquidation/processing order: sort by threshold, clear what you can afford now, bank the reward, then tackle harder ones.',
      '清算/处理顺序的最小模型：按门槛排序，先清掉当前能处理的、吃到奖励，再去啃更硬的。'),
    idea: b('Sort dragons by strength ascending and fight in that order. A greedy exchange argument shows: if any order succeeds, the ascending order also succeeds (fighting a weaker dragon first never reduces future capability).',
      '把龙按力量升序排序后依次打。交换论证：若存在可行顺序，升序也一定可行（先打更弱的龙绝不会削弱后续能力）。'),
    complexity: 'O(n log n)', star: undefined,
    interview: b('Why is the greedy correct? If bonuses could be negative (processing one position consumes margin), does ascending order still hold?',
      '为什么贪心正确？如果奖励可能为负（处理一个仓位反而消耗保证金），升序还成立吗？'),
    viz: { kind: 'array', build: dragonsFrames, caption: b('strength grows as weak dragons are cleared first', '先清弱龙，力量滚雪球') },
  },
  {
    id: '176A', module: 'A', catKey: 'greedy', cat: b('Greedy + capacity', '贪心 + 容量'),
    rating: 1200, tags: ['greedy', 'sortings'], url: 'https://codeforces.com/problemset/problem/176/A',
    title: b('Trading Business', '贸易生意'),
    statement: b(
      'There are n planets and m goods. On planet i good j has buy price a_ij, sell price b_ij and stock c_ij. You buy on one planet and sell on another (once), carrying at most k items total. Maximize profit.',
      '有 n 个星球、m 种商品。星球 i 的商品 j 有买入价 a_ij、卖出价 b_ij、库存 c_ij。在一个星球买、另一个星球卖（只做一次），最多携带 k 件，求最大利润。'),
    hl: b('Cross-venue arbitrage under a capacity (think: margin) constraint: rank goods by per-unit edge and fill the highest-edge ones first.',
      '容量（可类比保证金）约束下的跨场所套利：按单件价差排序，先把价差最大的装满。'),
    idea: b('Enumerate every (buy planet, sell planet) pair: O(n²). For a fixed pair, each good’s per-unit profit is b_sell − a_buy. Greedily fill the k slots with the highest-profit goods (bounded by stock), skipping non-positive profit. Keep the best pair overall.',
      '枚举每对 (买星球, 卖星球)：O(n²)。固定一对时，每种货单件利润 = 卖价−买价。贪心地用利润最高的货装满 k 个名额（受库存限制），利润≤0 的跳过。对所有星球对取最优。'),
    complexity: 'O(n²·m log m)',
    interview: b('If multiple trips were allowed, or goods consumed different margin, this becomes a knapsack — see 19B.',
      '若允许多次买卖、或不同货占用不同保证金，就变成背包——见 19B。'),
    viz: { kind: 'array', build: tradingFrames, caption: b('fill capacity by descending per-unit edge', '按单件价差降序填满容量') },
  },
  {
    id: '4C', module: 'A', catKey: 'hashing', cat: b('Hash map', '哈希表'),
    rating: 1300, tags: ['data structures', 'hashing'], url: 'https://codeforces.com/problemset/problem/4/C',
    title: b('Registration System', '注册系统'),
    statement: b(
      'A registration system: for each incoming name, if it is new, store it and reply OK. If it already exists, append the smallest unused integer (name1, name2, …), reply that, and store the new name too.',
      '一个注册系统：每来一个名字，若是新的则存入并回 OK；若已存在，则追加最小未用整数 (name1, name2, …) 返回并把新名也存入。'),
    hl: b('Order-id / account registries in the engine: O(1) hash-map lookup for dedup and unique-id generation on every order.',
      '引擎里的 order_id / 账户注册表：每笔订单都靠哈希表 O(1) 查重并生成唯一标识。'),
    idea: b('unordered_map<string,int> mapping each base name to the count of suffixes already handed out. New name → store 0, reply OK. Existing with count c → reply name(c+1), set count to c+1.',
      'unordered_map<string,int>，记录每个基名已发出的后缀个数。新名 → 存 0，回 OK；已存在且计数 c → 回 name(c+1)，计数置 c+1。'),
    complexity: 'O(L) per request',
    interview: b('Worst-case hash collisions / rehash jitter under heavy cancel-replace traffic — how to avoid? (open addressing vs chaining, pre-sizing)',
      '高频撤改单下的最坏冲突 / rehash 抖动如何避免？（开放寻址 vs 链式、预分配）'),
    viz: { kind: 'hashmap', build: registrationFrames, caption: b('dedup & unique-id via a single hash map', '一张哈希表搞定查重与唯一命名') },
  },
]
