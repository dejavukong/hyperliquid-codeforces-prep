import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesB: Record<string, Approach[]> = {
  '91B': [
    {
      name: b('Brute force', '暴力枚举'),
      complexity: 'O(n²)',
      detail: b(
        'For each i, scan every j > i and keep the furthest position whose a_j < a_i. Straightforward but quadratic, so it dies on large n.',
        '对每个 i，向后扫描所有 j > i，记录满足 a_j < a_i 的最远位置。思路直接，但是平方级，n 大时会超时。'),
    },
    {
      name: b('Suffix-min + binary search', '后缀最小值 + 二分'),
      complexity: 'O(n log n)',
      detail: b(
        'Build suffix-min m[i] = min(a[i..]); scanning from the right it is monotonically non-decreasing, so for a fixed a_i the positions with m[j] < a_i form one contiguous run. Binary-search the furthest such position. The log factor comes from the binary search.',
        '构造后缀最小值 m[i] = min(a[i..])，从右往左看它单调不减，所以对固定的 a_i，满足 m[j] < a_i 的位置构成一段连续区间。二分找出最远的那个位置即可。log 因子来自二分。'),
    },
    {
      name: b('Monotonic stack', '单调栈'),
      complexity: 'O(n)',
      optimal: true,
      detail: b(
        'Process the suffix-mins with a decreasing stack so every i is answered in amortized constant time, giving a single linear pass with no log factor. This is the tightest possible since you must at least read the whole array.',
        '用一个递减的单调栈处理后缀最小值，每个 i 都能均摊 O(1) 回答，整体一遍线性扫描，没有 log 因子。因为至少要读完整个数组，这已是最优复杂度。'),
    },
  ],
  '68B': [
    {
      name: b('Scan candidate levels', '枚举候选水平'),
      complexity: 'O(R/ε · n)',
      detail: b(
        'Sample many target levels across the value range and test each for feasibility. Both slow and tied to the sampling step, so accuracy and speed fight each other.',
        '在取值范围内采样大量目标水平，逐个检验是否可行。既慢又受采样步长限制，精度和速度互相矛盾。'),
    },
    {
      name: b('Binary search on the level', '对水平二分'),
      complexity: 'O(n log(1/ε))',
      optimal: true,
      detail: b(
        'Feasibility is monotonic: at a lower target level supply exceeds demand, and once the level is too high it becomes infeasible, so binary-search the threshold. Each check sums the surplus that can be transferred (after the k% loss) against the deficit; the iteration count fixes the precision.',
        '可行性是单调的：目标水平越低，能供应的就越多于需求；一旦水平过高就不可行，所以可以二分这个阈值。每次检验把多出来的部分（扣掉 k% 损耗后）转给不足的部分比较即可。迭代次数决定精度。'),
    },
  ],
  '339D': [
    {
      name: b('Recompute the whole pyramid each update', '每次更新重算整个金字塔'),
      complexity: 'O(2^n) per update',
      detail: b(
        'After each point update, rebuild every level of the pyramid from the bottom up. Correct but reconstructs the entire structure every time, far too slow when there are many queries.',
        '每次单点修改后，自底向上把金字塔的每一层都重算一遍。正确，但每次都重建整个结构，查询一多就太慢了。'),
    },
    {
      name: b('Segment tree, recompute only the root-path', '线段树，只重算到根的路径'),
      complexity: 'O(n) per update',
      optimal: true,
      detail: b(
        'Mirror the pyramid as a segment tree where each level alternates the OR / XOR combine operator. A point update changes only one leaf, so recombine just its O(log size) ancestors along the path to the root — n levels of work instead of 2^n.',
        '把金字塔看成一棵线段树，每一层交替使用 OR / XOR 合并运算。单点修改只改动一个叶子，于是只需沿着到根的路径重新合并它的 O(log size) 个祖先——工作量是 n 层而非 2^n。'),
    },
  ],
  '4D': [
    {
      name: b('Brute all orderings/subsets', '暴力枚举所有顺序/子集'),
      complexity: 'O(2^n·n)',
      detail: b(
        'Enumerate subsets of envelopes and check whether each can be chained in some order. Exponential, so it only works for tiny n.',
        '枚举信封的子集，检验每个子集能否按某种顺序嵌套。指数级，只对极小的 n 可行。'),
    },
    {
      name: b('Sort by width, O(n²) LIS on height', '按宽排序，对高做 O(n²) LIS'),
      complexity: 'O(n²)',
      detail: b(
        'Keep only envelopes strictly larger than the card, sort by width ascending (break ties so equal widths cannot chain), then run a strictly-increasing LIS on heights with parent pointers to recover the actual chain. Solid and easy to code for n ≤ 5000.',
        '先筛掉装不下卡片的信封，按宽度升序排序（处理相等宽度，使其无法互相嵌套），再对高度做严格递增的最长上升子序列，用父指针回溯出具体的链。在 n ≤ 5000 时稳妥且好写。'),
    },
    {
      name: b('BIT / patience-sorting LIS', '树状数组 / 耐心排序 LIS'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Coordinate-compress the heights and drive the same LIS with a Fenwick tree (or patience sorting), shaving the inner loop down to a log. This is the asymptotically optimal version and the right tool once n grows large.',
        '把高度离散化，用树状数组（或耐心排序）驱动同样的 LIS，把内层循环降到 log。这是渐进最优的版本，n 变大时就该用它。'),
    },
  ],
  '459D': [
    {
      name: b('Brute force', '暴力枚举'),
      complexity: 'O(n²)',
      detail: b(
        'Precompute L_i = prefix count of a_i up to i and R_j = suffix count of a_j from j, then test every pair i < j for L_i > R_j. Correct but quadratic.',
        '先预处理 L_i = a_i 在前缀 [1..i] 中的出现次数、R_j = a_j 在后缀 [j..n] 中的出现次数，再枚举每对 i < j 检验 L_i > R_j。正确但是平方级。'),
    },
    {
      name: b('Fenwick (BIT) sweep', '树状数组扫描'),
      complexity: 'O(n log n)',
      optimal: true,
      detail: b(
        'Sweep j from left to right, maintaining a Fenwick tree over the R-values seen so far. At each position, query how many already-seen R_j are strictly less than the current L_i and add to the answer; the sweep order guarantees those j sit to the left. The BIT turns each count query into a log-time operation.',
        '从左到右扫描，用树状数组维护已经见过的 R 值。处理到当前位置时，查询已见的 R_j 中有多少严格小于当前的 L_i 并累加到答案；扫描顺序保证这些 j 都在左边。树状数组把每次计数查询降到 log 时间。'),
    },
  ],
  '46D': [
    {
      name: b('Linear scan per event', '每个事件线性扫描'),
      complexity: 'O(n) per event → O(n·q)',
      detail: b(
        'On each arrival, rescan the whole street (or the list of gaps) to find the leftmost valid spot; departures just mark the car gone. Simple but every event costs a full pass.',
        '每次有车到达就重新扫描整条街（或所有空隙），找到最左的合法位置；离开时直接标记该车走了。简单，但每个事件都要扫一整遍。'),
    },
    {
      name: b('Ordered set / balanced BST of occupied cars', '有序集合 / 平衡 BST 维护占位车'),
      complexity: 'O(log n) per event',
      optimal: true,
      detail: b(
        'Keep the occupied positions in an ordered set. For an arrival, examine the gap between each pair of neighbors (plus the two street ends) and pick the leftmost that fits; departures erase in log time. The ordered structure gives leftmost-fit without scanning the whole street.',
        '把已占用的位置存进有序集合。车到达时，检查相邻两辆车之间（以及街道两端）的空隙，取第一个放得下的最左位置；离开时用 log 时间删除。有序结构让我们无需扫描整条街就能做到最左适配。'),
    },
  ],
  '547B': [
    {
      name: b('Brute all segments', '暴力枚举所有区间'),
      complexity: 'O(n²)',
      detail: b(
        'For every segment length and start position, compute the minimum height inside (incrementally, or naively in O(n³)). Direct but quadratic, too slow for large n.',
        '对每个区间长度和起点，求其中的最小高度（增量维护，或朴素地 O(n³)）。直接但是平方级，n 大时太慢。'),
    },
    {
      name: b('Per-element expand', '逐元素向两侧扩张'),
      complexity: 'O(n²)',
      detail: b(
        'For each element, extend left and right while it stays the minimum, recording the longest span over which it is the strength. Worst case is still quadratic on a near-sorted array.',
        '对每个元素，向左右扩张，直到它不再是区间最小值，记录它作为「强度」能覆盖的最长跨度。在近乎有序的数组上最坏仍是平方级。'),
    },
    {
      name: b('Monotonic stack', '单调栈'),
      complexity: 'O(n)',
      optimal: true,
      detail: b(
        'Use a monotonic stack to find, for each element, the nearest strictly-smaller neighbor on each side; the distance between them is the largest window where that element is the minimum. Update ans[span] with that height, then take a suffix-max so every group size x inherits the best feasible larger window. A single linear pass.',
        '用单调栈求出每个元素左右两侧最近的严格更小邻居，二者之间的距离就是该元素作为最小值能覆盖的最大窗口。用这个高度更新 ans[span]，最后做一次后缀最大值，使每个组大小 x 都能继承更大窗口里的最优解。整体一遍线性扫描。'),
    },
  ],
}
