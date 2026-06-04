import type { Frame } from '../../types'
import { Metrics, SideStack } from './parts'

/**
 * Frame contract:
 *  arr: number[]              bar values (supports negatives)
 *  labels?: (string|number)[] under-bar labels (default = value)
 *  highlight?: number[]       current focus  (mint)
 *  active?: number[]          in-consideration (teal)
 *  done?: number[]            finalized (green/long)
 *  dim?: number[]             removed/ignored (faint)
 *  bad?: number[]             rejected (short/red)
 *  pointers?: {name,idx,color}[]
 *  window?: [l,r]             shaded inclusive band
 *  stack?: number[]           side stack (monotonic)
 *  heap?: number[]            side heap list (regret greedy)
 *  metric?: {...}[]
 */
export function ArrayViz({ frame }: { frame: Frame }) {
  const arr = frame.arr ?? []
  const labels = frame.labels ?? arr
  const set = (xs?: number[]) => new Set(xs ?? [])
  const hl = set(frame.highlight), act = set(frame.active), done = set(frame.done),
    dim = set(frame.dim), bad = set(frame.bad as number[] | undefined)
  const win = frame.window
  const ptrs = (frame.pointers ?? []) as { name: string; idx: number; color?: string }[]

  const maxV = Math.max(1, ...arr.map((v) => Math.abs(v)))
  const hasNeg = arr.some((v) => v < 0)
  const H = 150

  const barColor = (k: number) => {
    if (bad.has(k)) return 'bg-short/70 border-short'
    if (done.has(k)) return 'bg-long/60 border-long'
    if (hl.has(k)) return 'bg-mint/80 border-mint shadow-glow'
    if (act.has(k)) return 'bg-teal/50 border-teal'
    if (dim.has(k)) return 'bg-line/50 border-line opacity-40'
    return 'bg-panel-2 border-faint/40'
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {frame.metric && <div className="self-end"><Metrics frame={frame} /></div>}
      <div className="flex items-stretch justify-center gap-6">
        {/* bars */}
        <div className="relative flex items-end justify-center gap-1.5" style={{ height: H + 46 }}>
          {hasNeg && <div className="absolute left-0 right-0 border-t border-dashed border-faint/40" style={{ bottom: 46 + H / 2 }} />}
          {arr.map((v, k) => {
            const inWin = win && k >= win[0] && k <= win[1]
            const h = (Math.abs(v) / maxV) * (hasNeg ? H / 2 : H)
            return (
              <div key={k} className="relative flex flex-col items-center justify-end" style={{ width: 30, height: H + 46 }}>
                {inWin && <div className="absolute inset-x-[-3px] top-0 bottom-[40px] bg-mint/5 border-x border-mint/20 rounded" />}
                {/* pointer arrows */}
                <div className="absolute -top-0 h-[24px] flex flex-col items-center gap-0.5">
                  {ptrs.filter((p) => p.idx === k).map((p, pi) => (
                    <span key={pi} className="eyebrow leading-none text-mint whitespace-nowrap">{p.name}▾</span>
                  ))}
                </div>
                <div className="flex-1" />
                <div className={`w-full rounded-[3px] border transition-all duration-500 ${barColor(k)}`}
                  style={{ height: Math.max(4, h), transform: hasNeg && v < 0 ? `translateY(${H / 2}px)` : undefined }} />
                <div className={`mt-1.5 tick text-[11px] ${hl.has(k) ? 'text-mint' : dim.has(k) ? 'text-faint/50' : 'text-muted'}`}>
                  {labels[k]}
                </div>
              </div>
            )
          })}
        </div>

        {/* side panels */}
        {frame.stack !== undefined && <SideStack values={frame.stack} title="stack" accent="teal" />}
        {frame.heap !== undefined && <SideStack values={frame.heap} title="min-heap" accent="liq" />}
      </div>
    </div>
  )
}
