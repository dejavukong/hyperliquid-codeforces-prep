import { useEffect, useMemo, useRef, useState } from 'react'
import type { Frame, Lang, VizKind } from '../types'
import { VizStage } from './viz/VizStage'

interface Props {
  frames: Frame[]
  kind: VizKind
  meta?: Record<string, unknown>
  lang: Lang
  caption?: { en: string; cn: string }
}

const SPEEDS = [0.5, 1, 1.5, 2.5]

export function AnimationPlayer({ frames, kind, meta, lang, caption }: Props) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const timer = useRef<number | null>(null)

  const clamped = Math.min(i, frames.length - 1)
  const frame = frames[clamped]
  const atEnd = clamped >= frames.length - 1

  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    timer.current = window.setTimeout(() => setI((p) => Math.min(p + 1, frames.length - 1)), 1400 / speed)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [playing, clamped, speed, atEnd, frames.length])

  // reset when the problem (frames identity) changes
  useEffect(() => {
    setI(0)
    setPlaying(false)
  }, [frames])

  const narr = useMemo(() => frame?.narr?.[lang] ?? '', [frame, lang])

  return (
    <div className="panel overflow-hidden">
      {/* terminal header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-panel-2/50">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-short/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-liq/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-long/80" />
          <span className="eyebrow text-faint ml-2">{kind}.viz</span>
        </div>
        <span className="eyebrow text-faint">
          {String(clamped + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
        </span>
      </div>

      {/* stage */}
      <div className="relative px-4 py-6 min-h-[260px] flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(45,212,191,.08) 1px,transparent 1px)', backgroundSize: '100% 26px' }} />
        <VizStage kind={kind} frame={frame} meta={meta} lang={lang} />
      </div>

      {/* narration */}
      <div className="px-4 pb-3">
        <div key={clamped} className="animate-fade-up min-h-[3.4rem] text-[13.5px] leading-relaxed text-ink/90 border-l-2 border-mint/50 pl-3">
          <span className="text-mint font-mono mr-2 text-xs">▸</span>
          {narr}
        </div>
        {caption && (
          <div className="mt-1 text-[11px] text-faint font-mono">{caption[lang]}</div>
        )}
      </div>

      {/* progress */}
      <div className="h-1 bg-line/60">
        <div className="h-full bg-gradient-to-r from-teal to-mint transition-[width] duration-300"
          style={{ width: `${((clamped + 1) / frames.length) * 100}%` }} />
      </div>

      {/* controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-panel-2/30">
        <div className="flex items-center gap-2">
          <Ctrl label="⤓" title="reset" onClick={() => { setI(0); setPlaying(false) }} />
          <Ctrl label="◂" title="prev" onClick={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)) }} disabled={clamped === 0} />
          <button
            onClick={() => (atEnd ? (setI(0), setPlaying(true)) : setPlaying((p) => !p))}
            className="btn border-mint/50 bg-mint/10 text-mint px-4 py-1.5 hover:bg-mint/20 hover:shadow-glow min-w-[88px]"
          >
            {playing ? '❚❚ Pause' : atEnd ? '↺ Replay' : '▶ Play'}
          </button>
          <Ctrl label="▸" title="next" onClick={() => { setPlaying(false); setI((p) => Math.min(frames.length - 1, p + 1)) }} disabled={atEnd} />
        </div>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`btn px-2 py-1 text-xs ${speed === s ? 'border-mint/50 text-mint bg-mint/10' : 'border-line text-faint hover:text-muted'}`}>
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Ctrl({ label, title, onClick, disabled }: { label: string; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled}
      className="btn border-line text-muted h-9 w-9 hover:text-mint hover:border-mint/40 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-line">
      {label}
    </button>
  )
}
