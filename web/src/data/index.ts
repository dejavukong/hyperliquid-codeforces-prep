import type { Approach, Problem } from '../types'
import { problemsA } from './problems_A'
import { problemsB } from './problems_B'
import { problemsC } from './problems_C'
import { problemsD } from './problems_D'
import { problemsE } from './problems_E'
import { problemsF } from './problems_F'
import { approachesA } from './approaches_A'
import { approachesB } from './approaches_B'
import { approachesC } from './approaches_C'
import { approachesD } from './approaches_D'
import { approachesE } from './approaches_E'
import { approachesF } from './approaches_F'

const APPROACHES: Record<string, Approach[]> = {
  ...approachesA, ...approachesB, ...approachesC, ...approachesD, ...approachesE, ...approachesF,
}

export const PROBLEMS: Problem[] = [
  ...problemsA, ...problemsB, ...problemsC, ...problemsD, ...problemsE, ...problemsF,
].map((p) => ({ ...p, approaches: APPROACHES[p.id] ?? p.approaches }))
