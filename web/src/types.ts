export type Lang = 'en' | 'cn'
export type ModuleId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface Bilingual {
  en: string
  cn: string
}

export type VizKind =
  | 'array'
  | 'segtree'
  | 'fenwick'
  | 'heap'
  | 'graph'
  | 'dpgrid'
  | 'numberline'
  | 'orderbook'
  | 'hashmap'

/**
 * A Frame is one step of an animation. `narr` is the bilingual narration shown
 * under the stage. Every other field is viz-kind specific and read by the
 * matching renderer in components/viz/*. Generators in anim/* produce Frame[].
 */
export interface Frame {
  narr: Bilingual
  // generic optional payloads understood by renderers:
  arr?: number[]
  labels?: (string | number)[]
  highlight?: number[]
  active?: number[]
  dim?: number[]
  done?: number[]
  pointers?: { name: string; idx: number; color?: string }[]
  window?: [number, number]
  stack?: number[]
  heap?: number[]
  value?: string
  metric?: { label: string; value: string; tone?: 'mint' | 'long' | 'short' | 'liq' }[]
  // escape hatch for bespoke renderers
  [k: string]: unknown
}

export interface VizSpec {
  kind: VizKind
  build: () => Frame[]
  caption?: Bilingual
  /** optional fixed structural data the renderer needs (e.g. graph topology) */
  meta?: Record<string, unknown>
}

/** One rung on the brute-force → optimal solution ladder. */
export interface Approach {
  name: Bilingual          // e.g. "暴力枚举" / "Brute force"
  complexity: string       // e.g. "O(n²)"
  detail: Bilingual        // how it works + why it is/ isn't good enough
  optimal?: boolean        // the recommended final answer
}

export interface Problem {
  id: string
  module: ModuleId
  /** stable category key for filtering */
  catKey: string
  cat: Bilingual
  rating: number
  tags: string[]
  url: string
  title: Bilingual
  statement: Bilingual
  /** mapping to a Hyperliquid engine mechanism */
  hl: Bilingual
  /** the approach / answer (one-line optimal summary; ladder lives in `approaches`) */
  idea: Bilingual
  /** brute-force → optimal solution ladder, simplest first */
  approaches?: Approach[]
  complexity: string
  /** interview follow-up prompt */
  interview: Bilingual
  star?: 1 | 2
  viz: VizSpec
}

export interface ModuleMeta {
  id: ModuleId
  name: Bilingual
  blurb: Bilingual
}
