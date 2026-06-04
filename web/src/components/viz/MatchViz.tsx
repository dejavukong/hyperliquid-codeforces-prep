import type { Frame, Lang } from '../../types'
import { Metrics } from './parts'

/**
 * Matching-engine renderer (45C Dancing Lessons / order-book style pairing).
 * Frame contract:
 *  people: { id:number, skill:number, state? }[]   state: pair|leaving|gone|idle
 *  pairs:  { l:number, r:number, diff:number, state? }[]  heap of adjacent candidate pairs
 *           (l,r = people ids), state: top|cand|dead
 *  output?: string[]   matched pairs already emitted (e.g. "(4,5)")
 *  metric?
 */
const PITCH = 52 // px per person slot

export function MatchViz({ frame, lang }: { frame: Frame; lang: Lang }) {
  const people = (frame.people ?? []) as { id: number; skill: number; state?: string }[]
  const pairs = (frame.pairs ?? []) as { l: number; r: number; diff: number; state?: string }[]
  const output = (frame.output ?? []) as string[]
  const present = people.map((p, i) => ({ p, i })).filter((x) => x.p.state !== 'gone')
  const railW = Math.max(1, people.length) * PITCH

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-1 w-full">
        {frame.metric && <div className="mb-3"><Metrics frame={frame} /></div>}
        <div className="eyebrow text-faint mb-2">{lang === 'cn' ? '队列（撮合后闭合）' : 'line (closes after a match)'}</div>

        <div className="relative" style={{ width: railW, maxWidth: '100%' }}>
          <div className="flex" style={{ gap: PITCH - 44 }}>
            {people.map((p) => {
              const gone = p.state === 'gone'
              const pair = p.state === 'pair'
              const leaving = p.state === 'leaving'
              return (
                <div key={p.id} className="flex flex-col items-center transition-all duration-500" style={{ width: 44 }}>
                  <div className={`tick text-sm h-11 w-11 flex items-center justify-center rounded-lg border-2 transition-all duration-300
                    ${pair ? 'bg-mint/80 text-base border-mint shadow-glow scale-110'
                      : leaving ? 'bg-long/50 border-long text-base -translate-y-1.5'
                      : gone ? 'bg-line/40 border-dashed border-faint/40 text-faint line-through opacity-30'
                      : 'bg-panel-2 border-faint/40 text-ink'}`}>
                    {p.skill}
                  </div>
                  <div className="eyebrow text-faint mt-1">#{p.id}</div>
                </div>
              )
            })}
          </div>

          {/* adjacency rail: connect consecutive PRESENT people; a connector spanning a gap is the freshly relinked pair */}
          <svg width={railW} height="26" className="block mt-0.5" style={{ maxWidth: '100%' }}>
            {present.slice(0, -1).map(({ i }, k) => {
              const j = present[k + 1].i
              const x1 = i * PITCH + 22, x2 = j * PITCH + 22
              const spanning = j - i > 1 // hops over a gap → new adjacency
              return (
                <g key={k}>
                  <path d={`M ${x1} 2 L ${x1} 12 L ${x2} 12 L ${x2} 2`} fill="none"
                    stroke={spanning ? '#98FCE4' : '#2a6657'} strokeWidth={spanning ? 2 : 1.4}
                    strokeDasharray={spanning ? '5 4' : undefined} className={spanning ? 'dash-flow' : undefined} />
                  {spanning && <text x={(x1 + x2) / 2} y={24} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#98FCE4">relink</text>}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="mt-1 text-[11px] font-mono text-faint">
          {lang === 'cn' ? `当前在场 ${present.length} 人` : `${present.length} present`}
        </div>

        {/* matched output strip */}
        {output.length > 0 && (
          <div className="mt-4">
            <div className="eyebrow text-faint mb-1.5">{lang === 'cn' ? '出列顺序' : 'matched order'}</div>
            <div className="flex flex-wrap gap-1.5">
              {output.map((o, k) => (
                <span key={k} className="chip bg-long/12 border border-long/40 text-long">{k + 1}. {o}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* candidate-pair min-heap */}
      <div className="w-full md:w-56 shrink-0">
        <div className="eyebrow text-faint mb-2">{lang === 'cn' ? '相邻对 · 小根堆 (按差值)' : 'adjacent pairs · min-heap (by diff)'}</div>
        <div className="flex flex-col gap-1.5">
          {pairs.length === 0 && <div className="text-faint text-xs font-mono">∅</div>}
          {pairs.map((pr, k) => (
            <div key={k}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-mono transition-all duration-300
                ${pr.state === 'top' ? 'bg-mint/15 border-mint/60 text-mint shadow-glow'
                  : pr.state === 'dead' ? 'bg-line/30 border-line text-faint line-through opacity-50'
                  : 'bg-panel-2 border-line text-muted'}`}>
              <span>(#{pr.l},#{pr.r})</span>
              <span className="tabular-nums">Δ{pr.diff}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
