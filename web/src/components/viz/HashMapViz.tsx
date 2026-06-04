import type { Frame } from '../../types'
import { Metrics } from './parts'

/**
 * Hash-map registry renderer (4C Registration System).
 * Frame contract:
 *  query?: string                          incoming request
 *  table: { name:string, count?:number, state? }[]   state: hit|new|idle
 *  result?: { text:string, ok?:boolean }
 *  metric?
 */
export function HashMapViz({ frame }: { frame: Frame }) {
  const query = frame.query as string | undefined
  const table = (frame.table ?? []) as { name: string; count?: number; state?: string }[]
  const result = frame.result as { text: string; ok?: boolean } | undefined

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="eyebrow text-faint">request</div>
        <div className="tick px-4 py-2 rounded-lg border-2 border-teal/60 bg-teal/10 text-teal text-sm min-w-[120px] text-center">
          {query ?? '—'}
        </div>
        <div className="text-mint text-xl">↓ hash()</div>
        {result && (
          <div className={`tick px-4 py-2 rounded-lg border-2 text-sm min-w-[120px] text-center
            ${result.ok ? 'border-long/60 bg-long/10 text-long' : 'border-liq/60 bg-liq/10 text-liq'}`}>
            {result.text}
          </div>
        )}
      </div>

      <div className="w-full md:w-72">
        <div className="eyebrow text-faint mb-2">unordered_map &lt;name → count&gt;</div>
        <div className="flex flex-col gap-1">
          {table.length === 0 && <div className="text-faint text-xs font-mono py-2">empty</div>}
          {table.map((row, k) => (
            <div key={k}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-xs font-mono transition-all duration-300
                ${row.state === 'hit' ? 'bg-liq/12 border-liq/50 text-liq'
                  : row.state === 'new' ? 'bg-long/12 border-long/50 text-long shadow-glow'
                  : 'bg-panel-2 border-line text-muted'}`}>
              <span>{row.name}</span>
              {row.count !== undefined && <span className="tabular-nums text-faint">×{row.count}</span>}
            </div>
          ))}
        </div>
        {frame.metric && <div className="mt-3"><Metrics frame={frame} /></div>}
      </div>
    </div>
  )
}
