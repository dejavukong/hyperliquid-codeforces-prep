import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesF: Record<string, Approach[]> = {
  '545D': [
    {
      name: b('Brute force all orderings', '暴力枚举所有排队顺序'),
      complexity: 'O(n!·n)',
      detail: b(
        'Try every permutation of the queue, simulate the running wait time, and count how many people are not disappointed (wait ≤ their own service time). Correct but explodes past n≈10.',
        '枚举队列的每一种排列，模拟累计等待时间，统计有多少人不失望（等待时间≤自己的服务时间）。正确，但 n≈10 以上就爆炸。'),
    },
    {
      name: b('Sort ascending + greedy', '按服务时间升序 + 贪心'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Sort people by service time ascending and process the shortest-service first, keeping a running waited-time. A person counts as satisfied when waited ≤ t_i, and only then do we add t_i to the wait; disappointed people are sent to the back and never affect those ahead. Exchange argument: serving shorter jobs first maximizes the satisfied count. Sorting dominates the cost.',
        '按服务时间升序排序，先处理服务时间最短的人，维护一个累计等待时间。当累计等待≤t_i 时此人满意，此时才把 t_i 计入等待；失望的人被推到队尾，不影响前面的人。交换论证：先服务短任务能使满意人数最大化。瓶颈是排序。'),
    },
  ],
  '1526C2': [
    {
      name: b('DP over prefix and health', '前缀与血量上的 DP'),
      complexity: 'O(n·ΣA)',
      detail: b(
        'Let dp[i][drunk] = the maximum health achievable after the first i potions having drunk a given count. This is the easy-version solution: correct, but too slow and memory-heavy when n and the values get large.',
        '令 dp[i][drunk] = 处理完前 i 瓶、喝了指定数量后能达到的最大血量。这是简单版的做法：正确，但当 n 和数值变大时太慢且内存吃紧。'),
    },
    {
      name: b('Regret greedy + min-heap', '反悔贪心 + 小根堆'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Walk left to right and drink every potion, pushing each value onto a min-heap and adding it to current health. Whenever health goes negative, pop the most-negative potion drunk so far and undo it (regret), which restores health. The final heap size is the answer. Greedy exchange: dropping the worst past mistake is always optimal.',
        '从左到右把每瓶都喝下，将每个值压入小根堆并累加到当前血量。一旦血量为负，就弹出至今喝过的最负的那瓶并撤销（反悔），从而恢复血量。最终堆的大小即为答案。贪心交换：丢掉过去最糟的一次选择总是最优的。'),
    },
  ],
  '607A': [
    {
      name: b('Brute force boundaries', '暴力求摧毁边界'),
      complexity: 'O(n²)',
      detail: b(
        'For each beacon, linearly scan to find how far its destruction reaches to the left, and try every possible coverage of the added beacon. Simple but quadratic.',
        '对每个信标线性扫描，找出它向左摧毁能波及多远，并枚举新增信标的每种覆盖范围。简单但平方级。'),
    },
    {
      name: b('DP + binary search', 'DP + 二分查找'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Sort beacons by position. Let dp[i] = the max number of beacons that survive when beacon i activates; binary-search the left boundary of i\'s destruction range to find the nearest surviving predecessor, then dp[i] = dp[that] + 1. The added far-right beacon can wipe out any suffix, so the answer minimizes destroyed = n − (best surviving suffix). Binary search keeps it log-linear.',
        '按位置排序信标。令 dp[i] = 当信标 i 激活时存活的信标数；二分查找 i 摧毁范围的左边界，定位最近的存活前驱，则 dp[i] = dp[那个] + 1。新增的最右信标可摧毁任意后缀，故答案即最小化被毁数 = n −（最优存活后缀）。二分查找使整体保持对数线性。'),
    },
  ],
  '865D': [
    {
      name: b('DP / naive pairing', 'DP / 朴素配对'),
      complexity: 'O(n²)',
      detail: b(
        'Match buy days with later sell days by trying pairings, tracking profit. Correct but quadratic, too slow for large N.',
        '通过枚举配对方式把买入日与之后的卖出日匹配，并记录利润。正确但平方级，N 大时太慢。'),
    },
    {
      name: b('Regret greedy + priority queue', '反悔贪心 + 优先队列'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Keep a min-heap of available buy prices. For each price p, if p > heap top, sell now: profit += p − top, pop the top, and push p twice — one copy lets this resale be "regretted" into a longer-held transit later, the other registers p itself as a fresh buy. Each share nets one buy and one sell; the regret mechanism recovers the global optimum.',
        '维护一个可买入价格的小根堆。对每个价格 p，若 p > 堆顶，则立即卖出：利润 += p − 堆顶，弹出堆顶，并把 p 压入两次——一份让这次转卖之后可被「反悔」改为持有更久的中转，另一份把 p 本身登记为一次新的买入。每股净买卖各一次；反悔机制保证恢复全局最优解。'),
    },
  ],
}
