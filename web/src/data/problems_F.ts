import type { Frame, Problem } from '../types'
import { b } from '../anim/helpers'

/* ───────────────────────── 545D Queue ───────────────────────── */
function queueFrames(): Frame[] {
  const unsorted = [2, 4, 1, 3, 3]
  const sorted = [1, 2, 3, 3, 4]
  const f: Frame[] = []
  f.push({
    narr: b('Service times t_i. A person is disappointed if the wait (sum of times before them) exceeds their own t_i. Reorder to maximize NOT-disappointed people.',
      '每人服务耗时 t_i。若等待时间（前面所有人耗时之和）超过其自身 t_i 则不满意。重排队列，使满意人数最多。'),
    arr: unsorted, metric: [{ label: 'cur wait', value: '0', tone: 'mint' }, { label: 'satisfied', value: '0', tone: 'long' }],
  })
  f.push({
    narr: b('Greedy: sort by t_i ascending — serve the least-tolerant (smallest) first.',
      '贪心：按 t_i 升序排序——先处理容忍度最低（耗时最小）的。'),
    arr: sorted, metric: [{ label: 'cur wait', value: '0', tone: 'mint' }, { label: 'satisfied', value: '0', tone: 'long' }],
  })
  let cur = 0, ok = 0
  const done: number[] = [], bad: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i]
    if (cur <= t) {
      ok++; done.push(i)
      f.push({
        narr: b(`wait ${cur} ≤ t=${t} ✓ satisfied → cur += ${t} = ${cur + t}`,
          `等待 ${cur} ≤ t=${t} ✓ 满意 → cur += ${t} = ${cur + t}`),
        arr: sorted, done: [...done], bad: [...bad], highlight: [i],
        metric: [{ label: 'cur wait', value: String(cur + t), tone: 'mint' }, { label: 'satisfied', value: String(ok), tone: 'long' }],
      })
      cur += t
    } else {
      bad.push(i)
      f.push({
        narr: b(`wait ${cur} > t=${t} ✗ skip (send to the tail — doesn't affect those before). cur unchanged`,
          `等待 ${cur} > t=${t} ✗ 跳过（放到队尾——不影响前面的人）。cur 不变`),
        arr: sorted, done: [...done], bad: [...bad], highlight: [i],
        metric: [{ label: 'cur wait', value: String(cur), tone: 'short' }, { label: 'satisfied', value: String(ok), tone: 'long' }],
      })
    }
  }
  f.push({
    narr: b(`All skipped people park at the tail. Max satisfied = ${ok}.`,
      `被跳过的人全部排到队尾。最大满意人数 = ${ok}。`),
    arr: sorted, done, bad, metric: [{ label: 'satisfied', value: String(ok), tone: 'long' }],
  })
  return f
}

/* ──────────────────── 1526C2 Potions (Hard) ──────────────────── */
function potionsFrames(): Frame[] {
  const a = [-4, 3, -5, 1, -2]
  const f: Frame[] = []
  const heap: number[] = [] // values drunk (we keep negatives; min first)
  let sum = 0
  const done: number[] = [], dim: number[] = []
  const heapSorted = () => [...heap].sort((x, y) => x - y)
  f.push({
    narr: b('Walk left→right. Health starts at 0 and must stay ≥ 0. Drink every potion greedily; if you go negative, REGRET the most harmful drink so far.',
      '从左到右走。健康度从 0 开始，必须始终 ≥ 0。先贪心地都喝；一旦变负，就"反悔"之前最伤的一喝。'),
    arr: a, metric: [{ label: 'health', value: '0', tone: 'mint' }, { label: 'drunk', value: '0', tone: 'long' }], heap: [],
  })
  for (let i = 0; i < a.length; i++) {
    sum += a[i]; heap.push(a[i]); done.push(i)
    f.push({
      narr: b(`Drink a[${i}]=${a[i]}: health → ${sum}, push to heap.`,
        `喝下 a[${i}]=${a[i]}：健康度 → ${sum}，入堆。`),
      arr: a, done: [...done], dim: [...dim], highlight: [i],
      metric: [{ label: 'health', value: String(sum), tone: sum < 0 ? 'short' : 'long' }, { label: 'drunk', value: String(heap.length), tone: 'long' }],
      heap: heapSorted(),
    })
    if (sum < 0) {
      const worst = Math.min(...heap)
      heap.splice(heap.indexOf(worst), 1)
      const before = sum
      sum -= worst
      // find a still-active potion index holding that worst value
      let target = -1
      for (const idx of done) if (a[idx] === worst && !dim.includes(idx)) { target = idx; break }
      if (target < 0) target = a.indexOf(worst)
      const di = done.indexOf(target); if (di >= 0) done.splice(di, 1)
      dim.push(target)
      f.push({
        narr: b(`health ${before} < 0 ✗ REGRET: pop the most-negative drink (${worst}). health → ${sum}. (Dropping the worst is never suboptimal.)`,
          `健康度 ${before} < 0 ✗ 反悔：弹出最负的一喝（${worst}）。健康度 → ${sum}。（丢"最负的"一定不劣。）`),
        arr: a, done: [...done], dim: [...dim], bad: [target],
        metric: [{ label: 'health', value: String(sum), tone: sum < 0 ? 'short' : 'long' }, { label: 'drunk', value: String(heap.length), tone: 'long' }],
        heap: heapSorted(),
      })
    }
  }
  f.push({
    narr: b(`Done. Answer = potions kept in the heap = ${heap.length}.`,
      `结束。答案 = 堆中保留的药水数 = ${heap.length}。`),
    arr: a, done: [...done], dim: [...dim],
    metric: [{ label: 'health', value: String(sum), tone: 'long' }, { label: 'drunk', value: String(heap.length), tone: 'long' }],
    heap: heapSorted(),
  })
  return f
}

/* ─────────────────── 607A Chain Reaction ─────────────────── */
function chainFrames(): Frame[] {
  // beacons sorted by position: positions a, powers b
  const pos = [1, 3, 4, 7, 9]
  const pow = [9, 1, 1, 4, 1]
  const n = pos.length
  const maxP = pos[n - 1]
  const X = (p: number) => 0.06 + (p / (maxP + 1)) * 0.9 // normalize position → 0..1
  const f: Frame[] = []
  const mk = (states: string[], range?: { from: number; to: number; state?: string }, destroyed = 0): Frame => ({
    narr: { en: '', cn: '' },
    points: pos.map((p, k) => ({ x: X(p), label: p, sub: `b=${pow[k]}`, state: states[k] })),
    range,
    metric: [{ label: 'destroyed', value: String(destroyed), tone: 'liq' }],
  })

  const st = Array<string>(n).fill('dim')
  const dframe = mk(st)
  dframe.narr = b('5 beacons on a line at positions (label) with power b. Activated right→left; activating i destroys everything to its LEFT within distance b_i.',
    '数轴上 5 个信标，位置（标签）与功率 b。从右往左激活；激活信标 i 会摧毁其左侧距离 b_i 内的全部信标。')
  f.push(dframe)

  let destroyed = 0
  const alive = Array<boolean>(n).fill(true)
  for (let i = n - 1; i >= 0; i--) {
    if (!alive[i]) {
      const states = pos.map((_, k) => (alive[k] ? 'done' : 'bad'))
      const fr = mk(states, undefined, destroyed)
      fr.narr = b(`Beacon @${pos[i]} was already destroyed → cannot activate. Skip.`,
        `位于 @${pos[i]} 的信标已被摧毁 → 无法激活。跳过。`)
      f.push(fr)
      continue
    }
    // activate i: destroy alive beacons j<i with pos[j] >= pos[i]-pow[i]
    const left = pos[i] - pow[i]
    const statesCur = pos.map((_, k) => (k === i ? 'cur' : alive[k] ? (k < i ? 'active' : 'done') : 'bad'))
    const rng = { from: X(Math.max(0, left)), to: X(pos[i]) }
    const frA = mk(statesCur, rng, destroyed)
    frA.narr = b(`Activate @${pos[i]} (b=${pow[i]}): destroys left within distance ${pow[i]} → positions ≥ ${left}.`,
      `激活 @${pos[i]}（b=${pow[i]}）：摧毁左侧距离 ${pow[i]} 内 → 位置 ≥ ${left} 的信标。`)
    f.push(frA)
    let hit = 0
    for (let j = i - 1; j >= 0; j--) {
      if (alive[j] && pos[j] >= left) { alive[j] = false; destroyed++; hit++ }
    }
    const statesAfter = pos.map((_, k) => (alive[k] ? 'done' : 'bad'))
    const frB = mk(statesAfter, undefined, destroyed)
    frB.narr = hit > 0
      ? b(`${hit} beacon(s) destroyed in the sweep. The chain continues with the next surviving beacon to the left.`,
          `本次波及摧毁 ${hit} 个信标。链反应继续，处理左侧下一个存活信标。`)
      : b('Nothing in range — this beacon survives alone here. Continue left.',
          '范围内无信标——它在此独活。继续向左。')
    f.push(frB)
  }
  const finalStates = pos.map((_, k) => (alive[k] ? 'done' : 'bad'))
  const fr = mk(finalStates, undefined, destroyed)
  const survivors = alive.filter(Boolean).length
  fr.narr = b(`Survivors = ${survivors}, destroyed = ${destroyed}. dp[i]=dp[j−1]+1 (j = binary-searched left edge of i's range). Adding one rightmost beacon lets us wipe a chosen suffix to maximize survivors.`,
    `存活 = ${survivors}，摧毁 = ${destroyed}。dp[i]=dp[j−1]+1（j = 二分得到 i 摧毁范围的左边界）。再加一个最右信标可摧毁选定后缀，使存活最大化。`)
  f.push(fr)
  return f
}

/* ─────────────────── 865D Buy Low Sell High ─────────────────── */
function buyLowFrames(): Frame[] {
  const prices = [3, 8, 2, 5, 7]
  const f: Frame[] = []
  const heap: number[] = [] // available buy-prices (min first)
  let profit = 0
  const done: number[] = []
  const heapSorted = () => [...heap].sort((x, y) => x - y)
  f.push({
    narr: b('Prices for N days. Each day buy/sell one share or skip; start and end with 0 shares; maximize profit. Regret greedy with a min-heap of buy-prices.',
      'N 天价格。每天买/卖一股或不动；起止均为 0 股；最大化利润。用买入价小根堆做反悔贪心。'),
    arr: prices, metric: [{ label: 'profit', value: '0', tone: 'long' }], heap: [],
  })
  for (let i = 0; i < prices.length; i++) {
    const p = prices[i]
    const hadTop = heap.length > 0
    const top = hadTop ? Math.min(...heap) : Infinity
    if (p > top) {
      // sell against cheapest buy; push p twice (regret-bridge + p as a real buy)
      heap.splice(heap.indexOf(top), 1)
      profit += p - top
      heap.push(p); heap.push(p)
      done.push(i)
      f.push({
        narr: b(`Day ${i}: price ${p} > cheapest buy ${top} → sell, profit += ${p - top} = ${profit}. Push ${p} TWICE (one a regret-bridge, one a real buy).`,
          `第 ${i} 天：价格 ${p} > 最低买入价 ${top} → 卖出，利润 += ${p - top} = ${profit}。把 ${p} 压入两次（一份作反悔中转，一份作真实买入）。`),
        arr: prices, done: [...done], highlight: [i],
        metric: [{ label: 'profit', value: String(profit), tone: 'long' }], heap: heapSorted(),
      })
    } else {
      heap.push(p)
      f.push({
        narr: b(`Day ${i}: price ${p} ≤ cheapest buy ${hadTop ? top : '∞'} → no profitable sale. Push ${p} as a candidate buy.`,
          `第 ${i} 天：价格 ${p} ≤ 最低买入价 ${hadTop ? top : '∞'} → 无利可卖。把 ${p} 作为候选买入压入。`),
        arr: prices, highlight: [i], done: [...done],
        metric: [{ label: 'profit', value: String(profit), tone: 'long' }], heap: heapSorted(),
      })
    }
  }
  f.push({
    narr: b(`All days processed. Max profit = ${profit}. The "push twice" lets an earlier sale be re-routed to a higher later price — same regret idea as 1526C2, here matching buy/sell pairs.`,
      `处理完所有天。最大利润 = ${profit}。"压两次"让早先的卖出可改道到更高的后续价格——与 1526C2 同一反悔思想，此处用于配对买卖。`),
    arr: prices, done, metric: [{ label: 'profit', value: String(profit), tone: 'long' }], heap: heapSorted(),
  })
  return f
}

export const problemsF: Problem[] = [
  {
    id: '545D', module: 'F', catKey: 'greedy', cat: b('Greedy + sorting', '贪心 + 排序'),
    rating: 1300, tags: ['greedy', 'sortings'], url: 'https://codeforces.com/problemset/problem/545/D',
    title: b('Queue', '队列'),
    statement: b(
      'A queue of n people; person i needs t_i time to be served. A person is disappointed if their waiting time (sum of service times of everyone before them) exceeds their own t_i. By reordering the queue, maximize the number of NOT-disappointed people.',
      'n 个人排队；第 i 人需要 t_i 时间被服务。若某人的等待时间（排在他前面所有人服务时间之和）超过其自身 t_i，则该人不满意。通过重排队列，最大化不感到不满意的人数。'),
    hl: b('Sort by "tolerance" and maximize how many you can process smoothly. In a liquidation queue, order accounts by urgency / affordable wait, greedily handle the cheap (low-tolerance) ones first, and maximize how many accounts you stabilize before a cascade erupts.',
      '按"耐受度"排序、最大化能平稳处理的数量。清算队列里把账户按紧迫度/可承受时间排序，贪心地先处理耗时小（容忍度低）的，最大化在级联爆发前能稳住的账户数。'),
    idea: b('Sort t_i ascending; maintain cumulative time cur of those served. If cur ≤ t_i this person is satisfied and cur += t_i, otherwise skip them (parking them at the tail doesn\'t affect those before). The count of satisfied people is the answer.',
      '按 t_i 升序排序；维护已服务者累计时间 cur，若 cur ≤ t_i 则此人满意、cur += t_i，否则跳过（放到队尾不影响前面）。满意人数即答案。'),
    complexity: 'O(n log n)',
    interview: b('Why is ascending greedy optimal (exchange argument)? Why does parking a skipped person at the tail not affect those before them?',
      '为什么升序贪心最优（交换论证）？跳过的人放到最后为什么不影响前面？'),
    viz: { kind: 'array', build: queueFrames, caption: b('sort ascending, accumulate wait, count who stays satisfied', '升序排序，累计等待，数出能保持满意的人') },
  },
  {
    id: '1526C2', module: 'F', catKey: 'regret-greedy', cat: b('Regret greedy + heap', '反悔贪心 + 堆'),
    rating: 1600, tags: ['data structures', 'greedy'], url: 'https://codeforces.com/problemset/problem/1526/C2',
    title: b('Potions (Hard Version)', '药水（困难版）'),
    statement: b(
      'n potions in a row; potion i changes your health by a_i (can be negative). Start at health 0, walk left to right; at each potion drink or skip, but your health must stay non-negative at all times. Maximize the number of potions drunk.',
      'n 瓶药水排成一行；第 i 瓶使你的健康度改变 a_i（可为负）。起始健康度为 0，从左到右走；在每瓶处可喝或跳过，但任意时刻健康度都必须非负。最大化喝下的药水数。'),
    hl: b('"Regret greedy" keeps you solvent — when processing a run of positions / drawing on the insurance fund, equity (health) must stay ≥ 0; drink everything first, and the moment one drink turns you negative, roll back the most harmful one (pop the most negative). This is the algorithmic core of a liquidation engine that "stays solvent while it works".',
      '"反悔贪心"维持偿付能力——处理一连串仓位/动用保险基金时，要保证权益（健康度）始终 ≥ 0；先尽量都喝，一旦某笔让你变负，就回滚之前最伤的一笔（弹出最负的）。这是清算引擎"边处理边保持不破产"的算法内核。'),
    idea: b('Min-heap holds the negative values already drunk. Drink every potion: sum += a_i and push a_i; if sum < 0, pop the heap top (most negative) to "regret" it, sum -= top. Answer = number of elements in the heap.',
      'min-heap 存已喝的负值。每瓶都先喝：sum += a_i 并把 a_i 入堆；若 sum < 0，弹出堆顶（最负的一瓶）"反悔"，sum -= 堆顶。答案 = 堆中元素个数。'),
    complexity: 'O(n log n)', star: 2,
    interview: b('Why is regretting the "most negative" (rather than the current one) provably never worse? This is the classic regret greedy — you must be able to reproduce the proof.',
      '为什么反悔丢"最负的"而不是"当前这瓶"一定不劣？这是经典 regret greedy，务必能复述证明。'),
    viz: { kind: 'array', build: potionsFrames, caption: b('drink all, then pop the most-negative whenever health dips below zero', '全喝下，一旦健康度跌破零就弹出最负的一瓶') },
  },
  {
    id: '607A', module: 'F', catKey: 'cascade', cat: b('Cascade DP + binary search', '级联 DP + 二分'),
    rating: 1600, tags: ['binary search', 'dp'], url: 'https://codeforces.com/problemset/problem/607/A',
    title: b('Chain Reaction', '连锁反应'),
    statement: b(
      'n beacons on a line at distinct positions a_i with power b_i. Activating beacon i destroys all beacons to its LEFT within distance b_i. Beacons are activated right→left (a destroyed beacon cannot activate). You may add one beacon strictly to the right of all others (activated first), with any position/power, to minimize the total number of beacons destroyed.',
      '数轴上 n 个信标，位置 a_i 互不相同、功率 b_i。激活信标 i 会摧毁其左侧距离 b_i 内的所有信标。信标按从右到左激活（被摧毁的信标无法激活）。你可在所有信标严格右侧再加一个信标（最先激活），位置/功率任意，使被摧毁的信标总数最小。'),
    hl: b('A pure model of cascade liquidation — each liquidation "presses the price" and sweeps positions within a price band to its left, triggering them in a chain. This problem computes exactly the survive/destroy count of such a chain, and controls its reach by adding one trigger point.',
      '级联清算的纯净模型——每次清算会"压价"波及左侧一段价位内的仓位，被波及的就触发，形成链式反应。本题正是算这种链反应的存活/摧毁数量，并通过"再加一个触发点"控制波及范围。'),
    idea: b('Sort by position. dp[i] = max number of surviving beacons considering only the first i beacons when beacon i is activated. Binary-search the left edge j of i\'s destruction range; dp[i] = dp[j−1] + 1. Enumerate the new beacon wiping out the rightmost suffix; answer = n − max survivors.',
      '按位置排序，dp[i]=只考虑前 i 个信标、第 i 个被激活时左侧存活的最大数；二分找 i 的摧毁范围左边界 j，dp[i]=dp[j-1]+1。枚举新信标摧毁最右的一段后缀，答案=n−max存活。'),
    complexity: 'O(n log n)', star: 1,
    interview: b('How must the DP state be defined to achieve O(n log n)? What linear scan does the binary search replace here?',
      'DP 状态怎么定义才能 O(n log n)？二分在这里替代了什么线性扫描？'),
    viz: { kind: 'numberline', build: chainFrames, caption: b('activate right→left; each sweep destroys a left band, the chain propagates', '从右往左激活；每次波及摧毁左侧一段，链式传播') },
  },
  {
    id: '865D', module: 'F', catKey: 'regret-greedy', cat: b('Regret greedy + priority queue', '反悔贪心 + 优先队列'),
    rating: 2400, tags: ['data structures', 'greedy'], url: 'https://codeforces.com/problemset/problem/865/D',
    title: b('Buy Low Sell High', '低买高卖'),
    statement: b(
      'You know stock prices for the next N days. Each day you may buy one share, sell one share, or do nothing. You start with 0 shares and must end with 0 shares. Maximize total profit.',
      '已知未来 N 天的股票价格。每天你可以买入一股、卖出一股，或什么都不做。你以 0 股开始，且必须以 0 股结束。最大化总利润。'),
    hl: b('The advanced form of close-out PnL matching / regret greedy — clearing proceeds matched against counterparties and PnL realization are all about "pairing buy and sell at the optimal moments". Use a priority queue for regret greedy: at price p, if the heap top (some earlier buy price) is lower, sell for the spread, then push p back onto the heap (so the sale can be "regretted" into a bridge and truly sold later at a higher price).',
      '平仓盈亏匹配 / 反悔贪心的高级版——清算所得与对手方撮合、PnL 实现都是"在最优时点配对买卖"。用优先队列做反悔贪心：遇到价格 p，若堆顶（之前某买入价）更低就卖出赚差价，并把 p 再压回堆（允许"反悔"成中转，等更高价再真正卖）。'),
    idea: b('Min-heap. For each day\'s price p: if p > heap top, profit += p − top, pop the top, then push p twice (once representing this sale which may later be regretted, once representing p itself usable as a buy); otherwise just push p.',
      'min-heap。每天价格 p：若 p > 堆顶，profit += p − 堆顶、弹出堆顶，再 push p 两次（一次代表本次卖出可被反悔，一次代表 p 自身可作买入）；否则只 push p。'),
    complexity: 'O(n log n)', star: 2,
    interview: b('Why is pushing p twice correct? This is the same idea as 1526C2\'s regret greedy in a different variant — being able to articulate the connection between the two is a bonus. The hardest in this module (2400), a sprint problem.',
      '为什么把 p 压两次是对的？这和 1526C2 的反悔贪心是同一思想的不同变体——能说清两者联系是加分项。本模块最难（2400），作为冲刺。'),
    viz: { kind: 'array', build: buyLowFrames, caption: b('min-heap of buy-prices; sell on a higher price and push it back to allow regret', '买入价小根堆；遇更高价卖出并压回以允许反悔') },
  },
]
