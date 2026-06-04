import type { Frame } from '../../types'

const TONE: Record<string, string> = {
  mint: 'text-mint', long: 'text-long', short: 'text-short', liq: 'text-liq',
}

const STACK_STYLE: Record<string, string> = {
  teal: 'bg-teal/10 border-teal/40 text-teal',
  mint: 'bg-mint/10 border-mint/40 text-mint',
  liq: 'bg-liq/10 border-liq/40 text-liq',
  short: 'bg-short/10 border-short/40 text-short',
}

/** Top-right metric readout shared by several renderers. */
export function Metrics({ frame }: { frame: Frame }) {
  if (!frame.metric?.length) return null
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 justify-end">
      {frame.metric.map((m, k) => (
        <div key={k} className="text-right">
          <div className="eyebrow text-faint">{m.label}</div>
          <div className={`tick text-lg font-bold ${TONE[m.tone ?? 'mint']}`}>{m.value}</div>
        </div>
      ))}
    </div>
  )
}

/** A small labelled vertical stack of values (monotonic stack / heap list). */
export function SideStack({ values, title, accent = 'teal' }: { values: number[]; title: string; accent?: string }) {
  const style = STACK_STYLE[accent] ?? STACK_STYLE.teal
  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      <div className="eyebrow text-faint mb-1">{title}</div>
      <div className="flex flex-col-reverse gap-1 w-full">
        {values.length === 0 && <div className="text-faint text-xs font-mono text-center py-2">∅</div>}
        {values.map((v, k) => (
          <div key={k} className={`tick text-sm text-center py-1 rounded border ${style}`}>{v}</div>
        ))}
      </div>
    </div>
  )
}
