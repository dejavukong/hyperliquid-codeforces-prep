import type { ModuleMeta } from '../types'

export const MODULES: ModuleMeta[] = [
  { id: 'A', name: { en: 'Warmup · Greedy / Hash', cn: '热身 · 贪心 / 哈希' },
    blurb: { en: 'Sorted sequential processing & order registries.', cn: '排序顺序处理与订单注册表。' } },
  { id: 'B', name: { en: 'Order Book Core', cn: '订单簿核心' },
    blurb: { en: 'Ordered structures, binary search, segment tree, BIT, monotonic stack.', cn: '有序结构、二分、线段树、树状数组、单调栈。' } },
  { id: 'C', name: { en: 'Matching & State', cn: '撮合与状态' },
    blurb: { en: 'Heap + linked list matching, interval cover, mergeable segment tree.', cn: '堆+链表撮合、区间覆盖、可合并线段树。' } },
  { id: 'D', name: { en: 'Capstone · Sharding', cn: '压轴 · 分片' },
    blurb: { en: 'Partition / load balancing the book.', cn: '订单簿分片 / 负载均衡。' } },
  { id: 'E', name: { en: 'P2P & Consensus', cn: 'P2P 与共识' },
    blurb: { en: 'HyperBFT + gossip: connectivity, fault tolerance, ordering.', cn: 'HyperBFT + gossip：连通性、容错、定序。' } },
  { id: 'F', name: { en: 'Liquidation', cn: '清算' },
    blurb: { en: 'Regret greedy, cascade, urgency ordering, PnL matching.', cn: '反悔贪心、级联、紧迫度排序、盈亏匹配。' } },
]

export const MODULE_COLOR: Record<string, string> = {
  A: 'text-long border-long/40', B: 'text-mint border-mint/40', C: 'text-teal border-teal/40',
  D: 'text-liq border-liq/40', E: 'text-[#8BB4FF] border-[#8BB4FF]/40', F: 'text-short border-short/40',
}

export function ratingTone(r: number): string {
  if (r < 1400) return 'text-long'
  if (r < 1800) return 'text-mint'
  if (r < 2100) return 'text-liq'
  return 'text-short'
}
