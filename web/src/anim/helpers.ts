import type { Bilingual, Frame } from '../types'

export const b = (en: string, cn: string): Bilingual => ({ en, cn })

/**
 * Position for a node in a PERFECT binary tree drawn with `levels` levels,
 * using 1-based heap indexing (root = 1, children of i are 2i, 2i+1).
 * Returns normalized x,y in 0..1 for StructViz.
 */
export function treePos(id: number, levels: number): { x: number; y: number; level: number } {
  const level = Math.floor(Math.log2(id))
  const idxInLevel = id - (1 << level)
  const countInLevel = 1 << level
  const x = (idxInLevel + 0.5) / countInLevel
  const y = levels <= 1 ? 0.5 : level / (levels - 1)
  return { x, y, level }
}

/** number of levels needed for `leaves` leaves (rounded up to power of two). */
export function levelsForLeaves(leaves: number): number {
  const p = Math.ceil(Math.log2(leaves))
  return p + 1
}

/** clone a frame-ish object shallowly (arrays copied) so generators can mutate safely */
export function snap<T extends Partial<Frame>>(o: T): T {
  return JSON.parse(JSON.stringify(o))
}
