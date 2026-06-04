import type { Problem } from '../types'
import { problemsA } from './problems_A'
import { problemsB } from './problems_B'
import { problemsC } from './problems_C'
import { problemsD } from './problems_D'
import { problemsE } from './problems_E'
import { problemsF } from './problems_F'

export const PROBLEMS: Problem[] = [
  ...problemsA, ...problemsB, ...problemsC, ...problemsD, ...problemsE, ...problemsF,
]
