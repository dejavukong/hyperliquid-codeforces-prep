import type { Frame, Lang } from '../../types'
import { Metrics } from './parts'

/**
 * Matching-engine renderer (45C Dancing Lessons / order-book style pairing).
 * Frame contract:
 *  people: { id:number, skill:number, state? }[]   state: pair|leaving|gone|idle
 *  pairs:  { l:number, r:number, diff:number, state? }[]  heap of adjacent candidate pairs
 *           (l,r = people ids), state: top|cand|dead
 *  metric?
 */
export function MatchViz({ frame, lang }: { frame: Frame; lang: Lang }) {
  const people = (frame.people ?? []) as { id: number; skill: number; state?: string }[]
  const pairs = (frame.pairs ?? []) as { l: number; r: number; diff: number; state?: string }[]
  const present = people.filter((p) => p.state !== 'gone')

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-1 w-full">
        {frame.metric && <div className="mb-3"><Metrics frame={frame} /></div>}
        <div className="eyebrow text-faint mb-2">{lang === 'cn' ? '队列（撮合后闭合）' : 'line (closes after a match)'}</div>
        <div className="flex items-end gap-1.5 flex-wrap">
          {people.map((p) => {
            const gone = p.state === 'gone'
            const pair = p.state === 'pair'
            const leaving = p.state === 'leaving'
            return (
              <div key={p.id} className="flex flex-col items-center transition-all duration-500"
                style={{ opacity: gone ? 0.2 : 1, transform: leaving ? 'translateY(-10px)' : undefined }}>
                <div className={`tick text-sm h-11 w-11 flex items-center justify-center rounded-lg border-2 transition-all duration-300
                  ${pair ? 'bg-mint/80 text-base border-mint shadow-glow'
                    : leaving ? 'bg-long/50 border-long text-base'
                    : gone ? 'bg-line/40 border-dashed border-faint/40 text-faint line-through'
                    : 'bg-panel-2 border-faint/40 text-ink'}`}>
                  {p.skill}
                </div>
                <div className="eyebrow text-faint mt-1">#{p.id}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 text-[11px] font-mono text-faint">
          {lang === 'cn' ? `当前在场 ${present.length} 人` : `${present.length} present`}
        </div>
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
