import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesC: Record<string, Approach[]> = {
  '45C': [
    {
      name: b('Rescan every step', '每步重新扫描'),
      complexity: 'O(n²)',
      detail: b(
        'Each round, scan all adjacent pairs to find the minimum skill-difference (ties broken by leftmost), remove that couple, close the gap, and repeat. Correct but rescans the whole line up to n/2 times.',
        '每一轮都扫描所有相邻对，找出技能差最小的一对（平局取最左），移除这对、合拢队列，然后重复。正确，但要对整条队列重复扫描多达 n/2 次。'),
    },
    {
      name: b('Min-heap + doubly-linked list + lazy deletion', '小根堆 + 双向链表 + 懒删除'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Keep the line as a doubly-linked list and push every adjacent pair into a min-heap keyed by (diff, left index). Pop the top: if either node is already removed, discard this stale entry; otherwise pair them up, splice both out, relink their neighbors, and push the one newly-formed adjacent pair. Each node is created and destroyed once, so the heap does O(n log n) total work.',
        '用双向链表维护队列，把每个相邻对按 (技能差, 左下标) 压入小根堆。弹出堆顶：若其中任一节点已被删除，则丢弃这个过期条目；否则把这对配成一组、从链表中摘掉两人、重连其左右邻居，并把新产生的那一个相邻对压入堆。每个节点只生成和销毁一次，因此堆总共做 O(n log n) 的工作。'),
    },
  ],
  '292E': [
    {
      name: b('Apply each copy directly', '直接执行每次复制'),
      complexity: 'O(k) per copy → O(n·q) worst',
      detail: b(
        'For a copy operation, physically write the chosen subsegment of a into b element by element; a point query is then O(1). Simple, but a single copy can touch up to n cells, so q large copies degrade to O(n·q).',
        '对于复制操作，把 a 的指定子段逐个元素实际写入 b；之后单点查询为 O(1)。实现简单，但一次复制最多可能改动 n 个位置，因此 q 次大复制会退化到 O(n·q)。'),
    },
    {
      name: b('Lazy segment tree with timestamped interval-assign', '带时间戳区间赋值的懒标记线段树'),
      complexity: 'O(log n) per op',
      optimal: true,
      detail: b(
        'Build a segment tree over b. Each copy is an interval-assign: tag the covered nodes with the source offset (so position p maps to a[p − offset]) plus the operation timestamp. A point query walks root-to-leaf and takes the covering tag with the newest timestamp, falling back to the original b value if none. Every operation touches O(log n) nodes.',
        '在 b 上建线段树。每次复制是一个区间赋值：给覆盖到的节点打上「源偏移量」（使位置 p 映射到 a[p − 偏移]）以及该操作的时间戳。单点查询从根走到叶，取覆盖该点且时间戳最新的标记，若没有标记则回退到 b 的原始值。每次操作只触及 O(log n) 个节点。'),
    },
  ],
  '19B': [
    {
      name: b('Brute force over subsets', '暴力枚举子集'),
      complexity: 'O(2^n)',
      detail: b(
        'Try every subset of items to pay for; while paying for item i you steal t_i others for free, so a subset is valid if the paid items plus the freebies they grant cover all n. Take the cheapest valid subset. Exponential, only feasible for tiny n.',
        '枚举「付钱购买」的所有子集；购买第 i 件时可顺手免费偷走 t_i 件，因此一个子集合法当且仅当付费物品加上它们带来的免费物品能覆盖全部 n 件。取代价最小的合法子集。指数级，只适用于极小的 n。'),
    },
    {
      name: b('0/1 knapsack DP', '0/1 背包 DP'),
      complexity: 'O(n²)',
      optimal: true,
      detail: b(
        'Buying item i covers itself and t_i stolen ones, i.e. it fills min(t_i + 1, n) "slots" at cost c_i. Let dp[j] be the minimum cost to fill at least j slots; process items as a 0/1 knapsack where each item has volume min(t_i + 1, n) and value c_i. The answer is dp[n]. Two nested loops give O(n²).',
        '购买第 i 件会覆盖它自己加上偷来的 t_i 件，即以代价 c_i 填满 min(t_i + 1, n) 个「名额」。设 dp[j] 为填满至少 j 个名额的最小代价；把每件物品当作体积 min(t_i + 1, n)、价值 c_i 的物品做 0/1 背包。答案为 dp[n]。两重循环即 O(n²)。'),
    },
  ],
  '61E': [
    {
      name: b('Brute force all triples', '暴力枚举三元组'),
      complexity: 'O(n³)',
      detail: b(
        'Enumerate every i < j < k and check whether a_i > a_j > a_k. Straightforward but cubic, hopeless beyond a few hundred elements.',
        '枚举每个 i < j < k，检查是否 a_i > a_j > a_k。直观但立方级，几百个元素以上就无望。'),
    },
    {
      name: b('Per-middle counting by scanning', '以中间元素为枢轴线性统计'),
      complexity: 'O(n²)',
      detail: b(
        'Fix the middle index j. Count how many elements to its left are greater than a_j and how many to its right are smaller, by linear scans; multiply and sum over all j. Quadratic — better, but still too slow for large n.',
        '固定中间下标 j。用线性扫描数出左边比 a_j 大的个数与右边比 a_j 小的个数，相乘后对所有 j 求和。平方级——有所改进，但对大 n 仍然太慢。'),
    },
    {
      name: b('Two Fenwick passes', '两遍树状数组'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Discretize the values. Sweep left to right with one Fenwick tree to get, for each j, the count of earlier elements greater than a_j; sweep right to left with another to get the count of later elements smaller than a_j. Sum the products over all j. Each BIT query/update is O(log n).',
        '先对值离散化。从左到右用一棵树状数组求出每个 j 左侧比 a_j 大的元素个数；再从右到左用另一棵求出右侧比 a_j 小的元素个数。对所有 j 把两者乘积累加。每次树状数组的查询/更新为 O(log n)。'),
    },
  ],
  '380C': [
    {
      name: b('Per-query stack scan', '每次询问栈扫描'),
      complexity: 'O(n) per query → O(n·q)',
      detail: b(
        'For each query scan the substring [l, r] with a stack, matching each ")" against an unmatched "(", and count matched characters; the answer is twice the matched-pair count. Correct but rescans the range every time, so q queries cost O(n·q).',
        '对每个询问用栈扫描子串 [l, r]，每遇到 ")" 就与一个未匹配的 "(" 配对，统计被匹配的字符数；答案是匹配对数的两倍。正确，但每次都重扫整个区间，q 次询问花费 O(n·q)。'),
    },
    {
      name: b('Mergeable segment tree', '可合并线段树'),
      complexity: 'O((n + q) log n)',
      optimal: true,
      detail: b(
        'Each node stores (matched, open, close): the number of already-matched characters, plus leftover unmatched "(" and ")" in its range. Pushup pairs the left child\'s leftover open with the right child\'s leftover close: m = m_L + m_R + 2·min(open_L, close_R), with the surpluses carried up. A query merges the O(log n) canonical nodes of [l, r] in order and reports the matched count.',
        '每个节点存 (matched, open, close)：已匹配字符数，以及该区间内多余未匹配的 "(" 和 ")"。上推时把左孩子多余的 "(" 与右孩子多余的 ")" 配对：m = m_L + m_R + 2·min(open_L, close_R)，剩余量继续上传。询问时按顺序合并 [l, r] 对应的 O(log n) 个规范节点，输出匹配字符数。'),
    },
  ],
}
