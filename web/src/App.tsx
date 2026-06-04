import { useState } from 'react'
import type { Lang } from './types'
import { PROBLEMS } from './data'
import { Catalog } from './components/Catalog'
import { ProblemDetail } from './components/ProblemDetail'

export default function App() {
  const [lang, setLang] = useState<Lang>('cn')
  const [sel, setSel] = useState<string | null>(null)
  const problem = PROBLEMS.find((p) => p.id === sel) ?? null

  return (
    <div className="min-h-screen">
      {problem ? (
        <ProblemDetail problem={problem} lang={lang} setLang={setLang} onBack={() => setSel(null)} />
      ) : (
        <Catalog lang={lang} onOpen={setSel} />
      )}
      <footer className="border-t border-line mt-16 py-8 text-center">
        <p className="eyebrow text-faint">
          Hyperliquid · Codeforces Matching-Engine Trainer — {PROBLEMS.length} problems · data verified via Codeforces API
        </p>
      </footer>
    </div>
  )
}
