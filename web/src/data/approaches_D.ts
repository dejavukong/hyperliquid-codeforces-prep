import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesD: Record<string, Approach[]> = {
  '2046C': [
    {
      name: b('Try all dividing points with prefix sums', '前缀和枚举所有分割点'),
      complexity: 'O(n²)',
      detail: b(
        'Candidate divider coordinates (x0, y0) only need to come from the points\' own coordinates, giving O(n²) choices. For each, count the four quadrants via 2D prefix sums in O(1) and track the best minimum quadrant count. Correct but quadratic in the number of distinct coordinates.',
        '候选分割坐标 (x0, y0) 只需取自这些点自身的坐标，共 O(n²) 种选择。对每一种用二维前缀和 O(1) 数出四个象限的点数，并记录「四象限最小值」的最大值。正确，但对不同坐标数是平方级。'),
    },
    {
      name: b('Sweep x + merge-sort tree / persistent segment tree + binary search on y', '扫描 x + 归并树 / 可持久化线段树 + 对 y 二分'),
      complexity: 'O(n log² n)',
      optimal: true,
      detail: b(
        'Sweep the vertical divider x0 left to right, moving points from the right side to the left side as it passes them. With a merge-sort tree or persistent segment tree you can, for any y, instantly read how many left/right points fall below vs. above it. For each x0 binary-search the horizontal divider y0 that maximizes the minimum of the four quadrant counts, since each side\'s below/above counts move monotonically in y. Both the sweep and the per-step query/binary-search cost O(log² n).',
        '从左到右扫描竖直分割线 x0，每越过一个点就把它从右侧移到左侧。借助归并树或可持久化线段树，对任意 y 都能立即查出左/右两侧各有多少点落在其下方与上方。对每个 x0 二分横向分割线 y0，使四象限点数的最小值最大——因为每一侧的「下方/上方」计数关于 y 单调变化。扫描与每步的查询/二分都是 O(log² n)。'),
    },
  ],
}
