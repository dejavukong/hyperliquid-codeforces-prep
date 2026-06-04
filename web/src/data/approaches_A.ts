import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesA: Record<string, Approach[]> = {
  '230A': [
    {
      name: b('Brute force all orders', '暴力枚举所有顺序'),
      complexity: 'O(n!·n)',
      detail: b(
        'Try every permutation of the fight order and simulate; report YES if any survives. Correct but blows up past n≈10.',
        '枚举每一种出战顺序并模拟，只要有一种能全胜就 YES。正确，但 n≈10 以上就爆炸。'),
    },
    {
      name: b('Greedy: fight the weakest first', '贪心：先打最弱的'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Sort dragons by strength ascending and fight in that order. Exchange argument: if any order wins, ascending wins too — clearing a weaker dragon first only raises your strength for later ones. Sorting dominates the cost.',
        '按龙的力量升序排序后依次打。交换论证：若存在可行顺序，升序也可行——先清更弱的龙只会抬高之后的力量。瓶颈是排序。'),
    },
  ],
  '176A': [
    {
      name: b('Enumerate item subsets', '枚举商品子集'),
      complexity: 'O(n²·2^m)',
      detail: b(
        'For each (buy, sell) planet pair, try every subset of goods to carry. Exponential in the number of goods — only sane for tiny m.',
        '对每对 (买, 卖) 星球，枚举携带哪些商品的所有子集。对商品数指数级，只有 m 极小才可行。'),
    },
    {
      name: b('Greedy fill per planet pair', '每对星球贪心装满'),
      complexity: 'O(n²·m log m)',
      optimal: true,
      detail: b(
        'Enumerate the O(n²) (buy, sell) pairs. For a fixed pair each good has per-unit profit b_sell−a_buy; greedily fill the k capacity with the highest-profit goods (bounded by stock), skipping profit ≤ 0. Keep the global best.',
        '枚举 O(n²) 个 (买, 卖) 星球对。固定一对时每种货单件利润 = 卖价−买价；用利润最高的货贪心装满 k 个容量（受库存限制），利润≤0 的跳过。对所有对取全局最优。'),
    },
  ],
  '4C': [
    {
      name: b('List + linear scan', '列表 + 线性扫描'),
      complexity: 'O(n²·L)',
      detail: b(
        'Keep a list of stored names; for each request scan it to check existence and to find the smallest free suffix. Simple but quadratic.',
        '用列表存已注册名字；每个请求线性扫描判断是否存在、并找最小可用后缀。简单但平方级。'),
    },
    {
      name: b('Hash map name → suffix count', '哈希表 name → 后缀计数'),
      complexity: 'O(L) per request',
      optimal: true,
      detail: b(
        'unordered_map from base name to the number of suffixes already issued. New name → store 0, reply OK. Existing with count c → reply name(c+1) and set count to c+1. O(1) amortized lookup, no scanning.',
        'unordered_map：基名 → 已发出的后缀个数。新名 → 存 0、回 OK；已存在且计数 c → 回 name(c+1) 并置为 c+1。均摊 O(1) 查找，无需扫描。'),
    },
  ],
}
