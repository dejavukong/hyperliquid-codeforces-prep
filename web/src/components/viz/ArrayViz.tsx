import type { Frame } from '../../types'
import { Metrics, SideStack } from './parts'

/**
 * Frame contract:
 *  arr: number[]              bar values (supports negatives — zero line centered)
 *  labels?: (string|number)[] under-bar labels (default = value)
 *  highlight?: number[]       current focus  (mint)
 *  active?: number[]          in-consideration (teal)
 *  done?: number[]            finalized (green/long)
 *  dim?: number[]             removed/ignored (faint)
 *  bad?: number[]             rejected (short/red)
 *  pointers?: {name,idx,color}[]
 *  window?: [l,r]             shaded inclusive band
 *  levelLine?: number         horizontal reference line at this DATA value (binary-search-on-answer)
 *  stack?: number[]           side stack (monotonic)
 *  heap?: number[]            side heap list (regret greedy)
 *  metric?: {...}[]
 */
const H = 150
const BASE = 44 // px reserved under the bar area for labels

export function ArrayViz({ frame }: { frame: Frame }) {
  const arr = frame.arr ?? []
  const labels = frame.labels ?? arr
  const set = (xs?: number[]) => new Set(xs ?? [])
  const hl = set(frame.highlight), act = set(frame.active), done = set(frame.done),
    dim = set(frame.dim), bad = set(frame.bad as number[] | undefined)
  const win = frame.window
  const ptrs = (frame.pointers ?? []) as { name: string; idx: number; color?: string }[]
  const levelLine = frame.levelLine as number | undefined

  const maxV = Math.max(1, ...arr.map((v) => Math.abs(v)))
  const hasNeg = arr.some((v) => v < 0)
  const zeroFromBottom = hasNeg ? H / 2 : 0     // y of the zero line, measured from bar-area bottom
  const unit = (hasNeg ? H / 2 : H) / maxV       // px per data unit

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
        <div className="relative flex justify-center gap-1.5">
          {/* zero / baseline line */}
          <div className="absolute left-[-8px] right-[-8px] border-t border-dashed border-faint/40"
            style={{ bottom: BASE + zeroFromBottom }} />
          {/* binary-search level line */}
          {levelLine !== undefined && (
            <div className="absolute left-[-10px] right-[-10px] z-10 flex items-center"
              style={{ bottom: BASE + zeroFromBottom + levelLine * unit }}>
              <div className="flex-1 border-t-2 border-mint/70" />
              <span className="eyebrow text-mint bg-base/80 px-1 ml-1">LEVEL {levelLine.toFixed(2)}</span>
            </div>
          )}
          {arr.map((v, k) => {
            const inWin = win && k >= win[0] && k <= win[1]
            const h = Math.max(3, Math.abs(v) * unit)
            const neg = v < 0
            return (
              <div key={k} className="relative" style={{ width: 30, height: H + BASE }}>
                {inWin && <div className="absolute inset-x-[-3px] bg-mint/[0.07] border-x border-mint/25 rounded"
                  style={{ top: 0, bottom: BASE - 6 }} />}
                {/* pointer arrows */}
                <div className="absolute left-0 right-0 -top-1 flex flex-col items-center gap-0.5">
                  {ptrs.filter((p) => p.idx === k).map((p, pi) => (
                    <span key={pi} className="eyebrow leading-none text-mint whitespace-nowrap">{p.name}▾</span>
                  ))}
                </div>
                {/* bar, anchored to the zero line, growing up (pos) or down (neg) */}
                <div
                  className={`absolute left-0 right-0 rounded-[3px] border transition-all duration-500 ease-out ${barColor(k)}`}
                  style={neg
                    ? { top: H - zeroFromBottom, height: h }      // grow downward from zero line
                    : { bottom: BASE + zeroFromBottom, height: h }} // grow upward from zero line
                />
                {/* label */}
                <div className={`absolute left-0 right-0 bottom-0 flex items-start justify-center pt-2 tick text-[11px] ${hl.has(k) ? 'text-mint' : dim.has(k) ? 'text-faint/50' : 'text-muted'}`}
                  style={{ height: BASE }}>
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
