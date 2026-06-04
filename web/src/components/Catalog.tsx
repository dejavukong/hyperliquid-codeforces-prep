import { useMemo, useState } from 'react'
import type { Lang, ModuleId } from '../types'
import { PROBLEMS } from '../data'
import { MODULES, MODULE_COLOR, ratingTone } from '../data/modules'

type Diff = 'all' | 'easy' | 'mid' | 'hard'
const DIFF: { key: Diff; label: string; lo: number; hi: number }[] = [
  { key: 'all', label: 'ALL', lo: 0, hi: 9999 },
  { key: 'easy', label: '≤1500', lo: 0, hi: 1500 },
  { key: 'mid', label: '1600–1900', lo: 1600, hi: 1900 },
  { key: 'hard', label: '≥2000', lo: 2000, hi: 9999 },
]

export function Catalog({ lang, onOpen }: { lang: Lang; onOpen: (id: string) => void }) {
  const [mod, setMod] = useState<ModuleId | 'all'>('all')
  const [diff, setDiff] = useState<Diff>('all')
  const [q, setQ] = useState('')

  const dRange = DIFF.find((d) => d.key === diff)!
  const filtered = useMemo(
    () => PROBLEMS.filter((p) =>
      (mod === 'all' || p.module === mod) &&
      p.rating >= dRange.lo && p.rating <= dRange.hi &&
      (q === '' || (p.id + p.title.en + p.title.cn + p.tags.join()).toLowerCase().includes(q.toLowerCase()))
    ),
    [mod, diff, q]
  )

  const groups = MODULES.map((m) => ({ m, items: filtered.filter((p) => p.module === m.id) })).filter((g) => g.items.length)

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8">
      {/* hero */}
      <header className="pt-14 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-md bg-mint/15 border border-mint/50 grid place-items-center shadow-glow">
            <span className="text-mint font-mono font-bold">≋</span>
          </div>
          <span className="eyebrow text-faint">Hyperliquid · interview prep</span>
          <span className="flex-1" />
          <a href="https://codeforces.com/problemset" target="_blank" rel="noreferrer"
            className="btn border-line text-muted px-3 py-1.5 text-xs hover:text-mint hover:border-mint/40">codeforces ↗</a>
        </div>
        <h1 className="font-display font-extrabold leading-[0.95] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.6rem)' }}>
          撮合引擎<span className="text-mint">·</span>算法训练场
        </h1>
        <p className="mt-3 max-w-2xl text-muted text-[15px] leading-relaxed">
          按 Hyperliquid 的撮合 / 共识 / 清算考点拆解的 {PROBLEMS.length} 道 Codeforces 真题。
          每题可中英切换、点开答案、配交互动画讲解。
          <span className="block text-faint text-xs mt-1 font-mono">
            {PROBLEMS.length} CF problems mapped to matching · consensus · liquidation. Bilingual, reveal-answer, animated.
          </span>
        </p>
      </header>

      {/* filters */}
      <div className="panel p-3 sm:p-4 mb-8 sticky top-3 z-20">
        <div className="flex flex-wrap items-center gap-2">
          <Seg active={mod === 'all'} onClick={() => setMod('all')}>ALL</Seg>
          {MODULES.map((m) => (
            <Seg key={m.id} active={mod === m.id} onClick={() => setMod(m.id)}>
              <span className={MODULE_COLOR[m.id].split(' ')[0]}>{m.id}</span>
              <span className="hidden sm:inline ml-1 opacity-70">{m.name[lang].split('·')[0].split('&')[0].trim()}</span>
            </Seg>
          ))}
          <span className="flex-1 min-w-4" />
          <div className="flex items-center gap-1">
            {DIFF.map((d) => (
              <Seg key={d.key} active={diff === d.key} onClick={() => setDiff(d.key)}>
                <span className="tick text-[11px]">{d.label}</span>
              </Seg>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search…"
            className="bg-base border border-line rounded-lg px-3 py-1.5 text-sm font-mono text-ink placeholder:text-faint w-32 focus:border-mint/50 focus:outline-none" />
        </div>
      </div>

      {/* groups */}
      {groups.map(({ m, items }) => (
        <section key={m.id} className="mb-10">
          <div className="flex items-baseline gap-3 mb-4">
            <span className={`font-display font-bold text-2xl ${MODULE_COLOR[m.id].split(' ')[0]}`}>{m.id}</span>
            <h2 className="font-display font-bold text-xl text-ink">{m.name[lang]}</h2>
            <span className="eyebrow text-faint hidden sm:block">{m.blurb[lang]}</span>
            <span className="flex-1 border-b border-line/60 mx-2" />
            <span className="eyebrow text-faint">{items.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <button key={p.id} onClick={() => onOpen(p.id)}
                className="panel glass-hover text-left p-4 group relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-mint/5 blur-xl group-hover:bg-mint/10 transition" />
                <div className="flex items-center justify-between mb-2">
                  <span className={`tick text-sm font-bold ${MODULE_COLOR[p.module].split(' ')[0]}`}>{p.id}</span>
                  <span className={`tick text-sm font-bold ${ratingTone(p.rating)}`}>{p.rating}</span>
                </div>
                <div className="font-medium text-ink leading-snug mb-1 group-hover:text-mint transition">
                  {p.title[lang]}
                </div>
                <div className="text-[12px] text-muted line-clamp-2 leading-relaxed">{p.hl[lang]}</div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {p.star && <span className="chip bg-mint/10 text-mint border border-mint/30">{'★'.repeat(p.star)}</span>}
                  {p.tags.slice(0, 2).map((t) => (
                    <span key={t} className="chip bg-line/40 text-faint">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
      {groups.length === 0 && <p className="text-faint font-mono text-center py-16">no match.</p>}
    </div>
  )
}

function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`btn px-2.5 py-1.5 text-xs ${active ? 'border-mint/50 text-mint bg-mint/10 shadow-glow' : 'border-line text-muted hover:text-ink hover:border-faint/50'}`}>
      {children}
    </button>
  )
}
