import type { Frame } from '../../types'
import { Metrics } from './parts'

/**
 * Generic node + edge SVG renderer for segment trees, Fenwick trees, heaps, graphs.
 * Frame contract:
 *  nodes: { id, x, y, label, sub?, state? }[]   x,y normalized 0..1
 *  edges: { a, b, state?, dir?, label? }[]       a,b are node ids
 *  metric?
 *
 * node.state: 'cur' | 'path' | 'active' | 'done' | 'bad' | 'dim' | undefined
 * edge.state: 'path' | 'tree' | 'bridge' | 'active' | 'dim' | undefined
 */
type Node = { id: string | number; x: number; y: number; label: string | number; sub?: string; state?: string }
type Edge = { a: string | number; b: string | number; state?: string; dir?: boolean; label?: string }

const NODE_FILL: Record<string, string> = {
  cur: '#98FCE4', path: '#2DD4BF', active: '#1f6b5e', done: '#34D399', bad: '#FB7185', dim: '#0C2420',
}
const NODE_STROKE: Record<string, string> = {
  cur: '#98FCE4', path: '#2DD4BF', active: '#2DD4BF', done: '#34D399', bad: '#FB7185', dim: '#16352E',
}
const NODE_TEXT: Record<string, string> = {
  cur: '#04110F', done: '#04110F',
}
const EDGE_STROKE: Record<string, string> = {
  path: '#98FCE4', tree: '#34D399', bridge: '#FBBF24', active: '#2DD4BF', dim: '#16352E',
}

export function StructViz({ frame }: { frame: Frame }) {
  const nodes = (frame.nodes ?? []) as Node[]
  const edges = (frame.edges ?? []) as Edge[]
  const W = 600, H = 300, pad = 38
  const px = (x: number) => pad + x * (W - 2 * pad)
  const py = (y: number) => pad + y * (H - 2 * pad)
  const byId = new Map(nodes.map((n) => [n.id, n]))

  return (
    <div className="w-full flex flex-col gap-2">
      {frame.metric && <div className="self-end px-2"><Metrics frame={frame} /></div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="#2DD4BF" />
          </marker>
        </defs>
        {/* edges */}
        {edges.map((e, k) => {
          const a = byId.get(e.a), b = byId.get(e.b)
          if (!a || !b) return null
          const isBridge = e.state === 'bridge'
          return (
            <g key={k}>
              <line
                x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)}
                stroke={EDGE_STROKE[e.state ?? 'dim'] ?? '#16352E'}
                strokeWidth={e.state === 'path' || isBridge ? 3 : e.state ? 2.2 : 1.4}
                strokeDasharray={isBridge ? '6 4' : undefined}
                className={isBridge ? 'dash-flow' : undefined}
                markerEnd={e.dir ? 'url(#arrow)' : undefined}
                opacity={e.state ? 1 : 0.6}
              />
              {e.label && (
                <text x={(px(a.x) + px(b.x)) / 2} y={(py(a.y) + py(b.y)) / 2 - 4}
                  fill="#6FA89B" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">{e.label}</text>
              )}
            </g>
          )
        })}
        {/* nodes */}
        {nodes.map((n) => {
          const st = n.state ?? ''
          const r = 17
          return (
            <g key={n.id} className="transition-all duration-300">
              {st === 'cur' && <circle cx={px(n.x)} cy={py(n.y)} r={r + 6} fill="none" stroke="#98FCE4" strokeWidth="1" opacity="0.35" className="animate-flicker" />}
              <circle cx={px(n.x)} cy={py(n.y)} r={r}
                style={{ fill: NODE_FILL[st] ?? '#081A16', stroke: NODE_STROKE[st] ?? '#2a6657', transition: 'fill .35s, stroke .35s' }}
                strokeWidth={st === 'cur' ? 2.5 : 1.6} />
              <text x={px(n.x)} y={py(n.y) + 4} textAnchor="middle"
                fill={NODE_TEXT[st] ?? '#E8FFF9'} fontSize="13" fontWeight="700" fontFamily="JetBrains Mono">{n.label}</text>
              {n.sub && (
                <text x={px(n.x)} y={py(n.y) + r + 14} textAnchor="middle"
                  fill="#6FA89B" fontSize="10.5" fontFamily="JetBrains Mono">{n.sub}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
