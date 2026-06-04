import { useMemo, useState } from 'react'
import type { Lang, Problem } from '../types'
import { MODULE_COLOR, ratingTone } from '../data/modules'
import { AnimationPlayer } from './AnimationPlayer'

/** Brute-force → optimal solution ladder (falls back to the single `idea`). */
function ApproachLadder({ problem, lang }: { problem: Problem; lang: Lang }) {
  const steps = problem.approaches
  if (!steps?.length) {
    return (
      <div className="panel p-5 border-l-2 border-l-long/60">
        <div className="eyebrow text-long mb-2">✓ {lang === 'cn' ? '解法' : 'approach'}</div>
        <p className="text-[14.5px] leading-[1.75] text-ink/90 whitespace-pre-line">{problem.idea[lang]}</p>
        <div className="mt-3 inline-flex items-center gap-2 chip bg-line/40 text-muted">
          <span className="text-faint">complexity</span><span className="text-mint">{problem.complexity}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="panel p-5">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="eyebrow text-long">✓ {lang === 'cn' ? '解法阶梯' : 'solution ladder'}</span>
        <span className="eyebrow text-faint">{lang === 'cn' ? '从最朴素到最高效' : 'simplest → most efficient'}</span>
      </div>
      <ol className="space-y-2.5">
        {steps.map((a, i) => {
          const isOpt = a.optimal || i === steps.length - 1
          const tier = isOpt ? { cn: '最优', en: 'optimal' } : i === 0 ? { cn: '朴素', en: 'naive' } : { cn: '优化', en: 'better' }
          return (
            <li key={i} className="relative pl-9">
              {/* number badge */}
              <span className={`absolute left-0 top-1 h-6 w-6 grid place-items-center rounded-full text-[11px] font-mono font-bold border
                ${isOpt ? 'bg-long/20 text-long border-long/50' : 'bg-panel-2 text-muted border-line'}`}>{i + 1}</span>
              {/* connector */}
              {i < steps.length - 1 && <span className="absolute left-3 top-8 -bottom-2.5 w-px bg-line" />}
              <div className={`rounded-lg border p-3 ${isOpt ? 'border-long/50 bg-long/[0.06] shadow-glow' : 'border-line bg-panel-2/40'}`}>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`chip border ${isOpt ? 'bg-long/15 text-long border-long/40' : 'bg-line/40 text-faint border-transparent'}`}>{tier[lang]}</span>
                  <span className={`text-sm font-medium ${isOpt ? 'text-long' : 'text-ink'}`}>{a.name[lang]}</span>
                  <span className="chip bg-base text-mint border border-mint/30 ml-auto tick">{a.complexity}</span>
                </div>
                <p className="text-[13.5px] leading-[1.7] text-ink/80 whitespace-pre-line">{a.detail[lang]}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function ProblemDetail({ problem, lang, setLang, onBack }: {
  problem: Problem; lang: Lang; setLang: (l: Lang) => void; onBack: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  // rebuild frames only when problem changes
  const frames = useMemo(() => problem.viz.build(), [problem])

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-8">
      {/* top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn border-line text-muted px-3 py-1.5 text-xs hover:text-mint hover:border-mint/40">← catalog</button>
        <span className="flex-1" />
        <a href={problem.url} target="_blank" rel="noreferrer"
          className="btn border-line text-muted px-3 py-1.5 text-xs hover:text-mint hover:border-mint/40">open on CF ↗</a>
        {/* per-problem language toggle */}
        <div className="flex rounded-lg border border-line overflow-hidden">
          {(['cn', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-mono transition ${lang === l ? 'bg-mint/15 text-mint' : 'text-faint hover:text-muted'}`}>
              {l === 'cn' ? '中文' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      {/* header */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className={`tick text-lg font-bold ${MODULE_COLOR[problem.module].split(' ')[0]}`}>{problem.id}</span>
        <span className={`chip border ${MODULE_COLOR[problem.module]}`}>module {problem.module}</span>
        <span className={`tick text-lg font-bold ${ratingTone(problem.rating)}`}>★ {problem.rating}</span>
        {problem.star && <span className="chip bg-mint/10 text-mint border border-mint/30">{'★'.repeat(problem.star)} signature</span>}
      </div>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink leading-tight">{problem.title[lang]}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {problem.tags.map((t) => <span key={t} className="chip bg-line/40 text-faint">{t}</span>)}
      </div>

      {/* HL mapping callout */}
      <div className="panel mt-5 p-4 border-l-2 border-l-mint/60">
        <div className="eyebrow text-mint mb-1">↳ {lang === 'cn' ? '对应 Hyperliquid 引擎' : 'maps to Hyperliquid engine'}</div>
        <p className="text-[14px] text-ink/90 leading-relaxed">{problem.hl[lang]}</p>
      </div>

      {/* statement */}
      <section className="mt-6">
        <div className="eyebrow text-faint mb-2">{lang === 'cn' ? '题目' : 'statement'}</div>
        <div className="panel p-5 text-[15px] leading-[1.75] text-ink/90">{problem.statement[lang]}</div>
      </section>

      {/* animation */}
      <section className="mt-7">
        <div className="flex items-center gap-2 mb-2">
          <div className="eyebrow text-faint">{lang === 'cn' ? '交互动画讲解' : 'interactive walkthrough'}</div>
          <span className="flex-1 border-b border-line/50" />
          <span className="eyebrow text-faint">{problem.complexity}</span>
        </div>
        <AnimationPlayer frames={frames} kind={problem.viz.kind} meta={problem.viz.meta} lang={lang} caption={problem.viz.caption} />
      </section>

      {/* reveal answer */}
      <section className="mt-7 mb-6">
        {!revealed ? (
          <button onClick={() => setRevealed(true)}
            className="btn w-full border-mint/40 bg-mint/[0.07] text-mint py-4 hover:bg-mint/15 hover:shadow-glow group">
            <span className="text-lg">▣</span>
            {lang === 'cn' ? '点击显示答案与解释' : 'reveal answer & explanation'}
            <span className="text-faint group-hover:translate-x-1 transition">→</span>
          </button>
        ) : (
          <div className="animate-fade-up space-y-4">
            <ApproachLadder problem={problem} lang={lang} />
            <div className="panel p-5 border-l-2 border-l-liq/60">
              <div className="eyebrow text-liq mb-2">? {lang === 'cn' ? '面试会怎么追问' : 'interview follow-up'}</div>
              <p className="text-[14px] leading-[1.7] text-ink/80">{problem.interview[lang]}</p>
            </div>
            <button onClick={() => setRevealed(false)} className="btn border-line text-faint px-3 py-1.5 text-xs hover:text-muted">↺ hide</button>
          </div>
        )}
      </section>
    </div>
  )
}
