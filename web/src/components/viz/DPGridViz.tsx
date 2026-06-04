import type { Frame } from '../../types'
import { Metrics } from './parts'

/**
 * Frame contract:
 *  grid: (string|number|null)[][]
 *  rowLabels?: (string|number)[]   colLabels?: (string|number)[]
 *  cells?: { r:number, c:number, state:string }[]   state: cur|path|active|done|bad
 *  metric?
 */
const CELL: Record<string, string> = {
  cur: 'bg-mint/80 text-base border-mint shadow-glow',
  path: 'bg-teal/40 text-ink border-teal/60',
  active: 'bg-teal/20 text-ink border-teal/40',
  done: 'bg-long/50 text-base border-long',
  bad: 'bg-short/40 text-ink border-short/60',
}

export function DPGridViz({ frame }: { frame: Frame }) {
  const grid = (frame.grid ?? []) as (string | number | null)[][]
  const rowL = frame.rowLabels as (string | number)[] | undefined
  const colL = frame.colLabels as (string | number)[] | undefined
  const cells = (frame.cells ?? []) as { r: number; c: number; state: string }[]
  const stateAt = (r: number, c: number) => cells.find((x) => x.r === r && x.c === c)?.state

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      {frame.metric && <div className="self-end px-2"><Metrics frame={frame} /></div>}
      <div className="overflow-auto max-w-full">
        <table className="border-collapse">
          {colL && (
            <thead>
              <tr>
                <th className="p-1" />
                {colL.map((c, k) => (
                  <th key={k} className="eyebrow text-faint px-1 pb-1 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {rowL && <td className="eyebrow text-faint pr-2 text-right">{rowL[r]}</td>}
                {row.map((v, c) => {
                  const st = stateAt(r, c)
                  return (
                    <td key={c} className="p-0.5">
                      <div className={`tick text-[12px] h-8 w-9 flex items-center justify-center rounded border transition-all duration-300
                        ${st ? CELL[st] : 'bg-panel-2 border-line text-muted'}`}>
                        {v ?? '·'}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
