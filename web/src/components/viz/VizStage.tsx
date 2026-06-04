import type { Frame, Lang, VizKind } from '../../types'
import { ArrayViz } from './ArrayViz'
import { StructViz } from './StructViz'
import { DPGridViz } from './DPGridViz'
import { NumberLineViz } from './NumberLineViz'
import { MatchViz } from './MatchViz'
import { HashMapViz } from './HashMapViz'

interface Props {
  kind: VizKind
  frame: Frame
  meta?: Record<string, unknown>
  lang: Lang
}

export function VizStage({ kind, frame, lang }: Props) {
  if (!frame) return null
  switch (kind) {
    case 'array': return <ArrayViz frame={frame} />
    // segtree / fenwick / heap / graph all share the node+edge SVG renderer;
    // generators emit per-frame node positions & states.
    case 'segtree':
    case 'fenwick':
    case 'heap':
    case 'graph': return <StructViz frame={frame} />
    case 'dpgrid': return <DPGridViz frame={frame} />
    case 'numberline': return <NumberLineViz frame={frame} />
    case 'orderbook': return <MatchViz frame={frame} lang={lang} />
    case 'hashmap': return <HashMapViz frame={frame} />
    default: return null
  }
}
