import { MathUtils } from 'three'

export type HeroBeatId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5'
export type TransitionBeatId = 'T1' | 'T2' | 'T3' | 'T4'

export type ProgressBeat<TId extends string> = {
  id: TId
  label: string
  start: number
  end: number
  description: string
}

export const HERO_BEATS: ProgressBeat<HeroBeatId>[] = [
  {
    id: 'H1',
    label: 'Wake in Darkness',
    start: 0,
    end: 0.1,
    description: 'Dark tunnel, faint practicals, distant portal glow.',
  },
  {
    id: 'H2',
    label: 'Title Locks',
    start: 0.1,
    end: 0.3,
    description: 'Overlay settles and forward motion becomes readable.',
  },
  {
    id: 'H3',
    label: 'The Ritual Walk',
    start: 0.3,
    end: 0.6,
    description: 'Steady push with growing haze and dust definition.',
  },
  {
    id: 'H4',
    label: 'Pitch Pull',
    start: 0.6,
    end: 0.85,
    description: 'Portal dominance rises while tunnel readability remains.',
  },
  {
    id: 'H5',
    label: 'Threshold',
    start: 0.85,
    end: 1,
    description: 'Final approach to portal and transition handoff hint.',
  },
]

export const TRANSITION_BEATS: ProgressBeat<TransitionBeatId>[] = [
  {
    id: 'T1',
    label: 'Energy Ignition',
    start: 0,
    end: 0.25,
    description: 'Tunnel dissolves into energized abstract stadium cues.',
  },
  {
    id: 'T2',
    label: 'Crowd Surge',
    start: 0.25,
    end: 0.6,
    description: 'Streak density and particle intensity ramp upward.',
  },
  {
    id: 'T3',
    label: 'Peak and Resolve',
    start: 0.6,
    end: 0.85,
    description: 'Controlled high-energy peak then directional alignment.',
  },
  {
    id: 'T4',
    label: 'Settle to Ambient',
    start: 0.85,
    end: 1,
    description: 'Energy fades into a calm state for section handoff.',
  },
]

export const STYLE_TOKENS = {
  hero: {
    portalColor: '#ffd7a1',
    practicalColor: '#ffc891',
    fillColor: '#d69458',
    tunnelBase: '#3a2819',
    tunnelShadow: '#1f140c',
    overlayOpacityMin: 0.36,
    overlayOpacityMax: 0.84,
  },
  transition: {
    streakColor: '#90d2ff',
    surgeColor: '#5fb7ff',
    settleColor: '#87c6ff',
    peakIntensity: 1,
    settleIntensity: 0.34,
  },
} as const

export const TECHNICAL_BUDGETS = {
  high: {
    particleCap: 1200,
    textureBudgetMB: 128,
    drawCallBudget: 220,
    postFxPassBudget: 4,
  },
  mid: {
    particleCap: 650,
    textureBudgetMB: 72,
    drawCallBudget: 160,
    postFxPassBudget: 2,
  },
  low: {
    particleCap: 320,
    textureBudgetMB: 36,
    drawCallBudget: 110,
    postFxPassBudget: 0,
  },
} as const

export function clampProgress(progress: number) {
  return MathUtils.clamp(progress, 0, 1)
}

export function getBeatProgress(
  progress: number,
  start: number,
  end: number,
): number {
  if (end <= start) {
    return 0
  }
  return MathUtils.clamp((progress - start) / (end - start), 0, 1)
}

export function getCurrentBeat<TId extends string>(
  beats: ProgressBeat<TId>[],
  progress: number,
): ProgressBeat<TId> {
  const clamped = clampProgress(progress)
  return (
    beats.find((beat) => clamped >= beat.start && clamped <= beat.end) ??
    beats[beats.length - 1]
  )
}
