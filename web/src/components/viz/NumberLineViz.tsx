import type { Frame } from '../../types'
import { Metrics } from './parts'

/**
 * Cascade / number-line renderer (e.g. 607A Chain Reaction beacons).
 * Frame contract:
 *  points: { x:number(0..1), label, sub?, state? }[]   state: cur|active|done|bad(destroyed)|dim
 *  range?: { from:number, to:number, state? }           current destruction sweep (0..1)
 *  metric?
 */
const DOT: Record<string, string> = {
  cur: 'fill-mint', active: 'fill-teal', done: 'fill-long', bad: 'fill-short', dim: 'fill-faint',
}
export function NumberLineViz({ frame }: { frame: Frame }) {
  const pts = (frame.points ?? []) as { x: number; label: string | number; sub?: string; state?: string }[]
  const range = frame.range as { from: number; to: number; state?: string } | undefined
  const W = 600, H = 200, pad = 40, yLine = 130
  const px = (x: number) => pad + x * (W - 2 * pad)

  return (
    <div className="w-full flex flex-col gap-2">
      {frame.metric && <div className="self-end px-2"><Metrics frame={frame} /></div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* destruction sweep band */}
        {range && (
          <rect x={px(Math.min(range.from, range.to))} y={yLine - 56}
            width={Math.abs(px(range.to) - px(range.from))} height={70}
            fill="rgba(251,113,133,0.12)" stroke="rgba(251,113,133,0.5)" strokeDasharray="5 4" className="dash-flow" rx="4" />
        )}
        {/* axis */}
        <line x1={pad - 10} y1={yLine} x2={W - pad + 10} y2={yLine} stroke="#2a6657" strokeWidth="1.5" />
        {pts.map((p, k) => {
          const st = p.state ?? ''
          const destroyed = st === 'bad'
          return (
            <g key={k} className="transition-all duration-300" opacity={st === 'dim' ? 0.4 : 1}>
              <line x1={px(p.x)} y1={yLine} x2={px(p.x)} y2={yLine - 34} stroke={destroyed ? '#FB7185' : '#2DD4BF'} strokeWidth="1.4" opacity={destroyed ? 0.5 : 1} />
              <circle cx={px(p.x)} cy={yLine - 40} r={st === 'cur' ? 11 : 8}
                className={DOT[st] ?? 'fill-panel-2'} stroke={st === 'cur' ? '#98FCE4' : '#2a6657'} strokeWidth="1.6" />
              {destroyed && <text x={px(p.x)} y={yLine - 36} textAnchor="middle" fontSize="11" fill="#04110F" fontWeight="700">✕</text>}
              <text x={px(p.x)} y={yLine + 16} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono"
                fill={st === 'cur' ? '#98FCE4' : destroyed ? '#FB7185' : '#9fd4c8'}>{p.label}</text>
              {p.sub && <text x={px(p.x)} y={yLine + 30} textAnchor="middle" fontSize="9.5" fontFamily="JetBrains Mono" fill="#6FA89B">{p.sub}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
