import { MathUtils } from 'three'
import {
  STYLE_TOKENS,
  TECHNICAL_BUDGETS,
  type TransitionBeatId,
  type HeroBeatId,
} from './heroTransitionBeats'

export type DeviceTierKey = 'low' | 'mid' | 'high'
export type TextureSet = '1k' | '2k'

export type PostFxProfile = {
  enabled: boolean
  bloomIntensity: number
  bloomThreshold: number
  bloomSmoothing: number
  noiseOpacity: number
  vignetteDarkness: number
  vignetteOffset: number
  brightness: number
  contrast: number
}

export type HeroVisualProfile = {
  dustBase: number
  dustPeak: number
  dustSizeBase: number
  dustSizePeak: number
  lightBeamMaxOpacity: number
  hazeOpacity: number
  cameraTravel: number
  overlayOpacityBand: [number, number]
  beatOpacityScale: Record<HeroBeatId, number>
}

export type TransitionVisualProfile = {
  riseStart: number
  riseEnd: number
  peakHoldEnd: number
  settleEnd: number
  settleTarget: number
  calmFloor: number
  beatScale: Record<TransitionBeatId, number>
}

export type VisualProfile = {
  tier: DeviceTierKey
  textureSet: TextureSet
  particleCap: number
  particleMultiplier: number
  allowPostFx: boolean
  postFx: PostFxProfile
  hero: HeroVisualProfile
  transition: TransitionVisualProfile
}

const BASE_PROFILES: Record<DeviceTierKey, VisualProfile> = {
  high: {
    tier: 'high',
    textureSet: '2k',
    particleCap: TECHNICAL_BUDGETS.high.particleCap,
    particleMultiplier: 1,
    allowPostFx: true,
    postFx: {
      enabled: true,
      bloomIntensity: 0.62,
      bloomThreshold: 0.44,
      bloomSmoothing: 0.68,
      noiseOpacity: 0.18,
      vignetteDarkness: 0.86,
      vignetteOffset: 0.16,
      brightness: 0.03,
      contrast: 0.12,
    },
    hero: {
      dustBase: 0.08,
      dustPeak: 0.5,
      dustSizeBase: 0.026,
      dustSizePeak: 0.058,
      lightBeamMaxOpacity: 0.36,
      hazeOpacity: 0.22,
      cameraTravel: 9.2,
      overlayOpacityBand: [
        STYLE_TOKENS.hero.overlayOpacityMin,
        STYLE_TOKENS.hero.overlayOpacityMax,
      ],
      beatOpacityScale: {
        H1: 0.64,
        H2: 0.8,
        H3: 0.95,
        H4: 1,
        H5: 0.9,
      },
    },
    transition: {
      riseStart: 0.02,
      riseEnd: 0.58,
      peakHoldEnd: 0.74,
      settleEnd: 1,
      settleTarget: STYLE_TOKENS.transition.settleIntensity,
      calmFloor: 0.2,
      beatScale: {
        T1: 0.58,
        T2: 0.86,
        T3: 1,
        T4: 0.48,
      },
    },
  },
  mid: {
    tier: 'mid',
    textureSet: '1k',
    particleCap: TECHNICAL_BUDGETS.mid.particleCap,
    particleMultiplier: 0.68,
    allowPostFx: false,
    postFx: {
      enabled: false,
      bloomIntensity: 0,
      bloomThreshold: 1,
      bloomSmoothing: 1,
      noiseOpacity: 0,
      vignetteDarkness: 0.74,
      vignetteOffset: 0.22,
      brightness: 0.02,
      contrast: 0.05,
    },
    hero: {
      dustBase: 0.08,
      dustPeak: 0.4,
      dustSizeBase: 0.024,
      dustSizePeak: 0.05,
      lightBeamMaxOpacity: 0.29,
      hazeOpacity: 0.16,
      cameraTravel: 8,
      overlayOpacityBand: [0.3, 0.74],
      beatOpacityScale: {
        H1: 0.66,
        H2: 0.78,
        H3: 0.9,
        H4: 0.95,
        H5: 0.84,
      },
    },
    transition: {
      riseStart: 0.03,
      riseEnd: 0.62,
      peakHoldEnd: 0.74,
      settleEnd: 1,
      settleTarget: 0.38,
      calmFloor: 0.18,
      beatScale: {
        T1: 0.52,
        T2: 0.8,
        T3: 0.92,
        T4: 0.48,
      },
    },
  },
  low: {
    tier: 'low',
    textureSet: '1k',
    particleCap: TECHNICAL_BUDGETS.low.particleCap,
    particleMultiplier: 0.35,
    allowPostFx: false,
    postFx: {
      enabled: false,
      bloomIntensity: 0,
      bloomThreshold: 1,
      bloomSmoothing: 1,
      noiseOpacity: 0,
      vignetteDarkness: 0.68,
      vignetteOffset: 0.24,
      brightness: 0.01,
      contrast: 0.03,
    },
    hero: {
      dustBase: 0.06,
      dustPeak: 0.3,
      dustSizeBase: 0.021,
      dustSizePeak: 0.043,
      lightBeamMaxOpacity: 0.2,
      hazeOpacity: 0.1,
      cameraTravel: 6.9,
      overlayOpacityBand: [0.27, 0.64],
      beatOpacityScale: {
        H1: 0.62,
        H2: 0.72,
        H3: 0.82,
        H4: 0.87,
        H5: 0.8,
      },
    },
    transition: {
      riseStart: 0.04,
      riseEnd: 0.66,
      peakHoldEnd: 0.76,
      settleEnd: 1,
      settleTarget: 0.42,
      calmFloor: 0.17,
      beatScale: {
        T1: 0.5,
        T2: 0.74,
        T3: 0.84,
        T4: 0.46,
      },
    },
  },
}

type ResolveVisualProfileOptions = {
  tier: DeviceTierKey
  reducedMotion: boolean
  isMobile: boolean
  polishV2Enabled: boolean
}

export function resolveVisualProfile(
  options: ResolveVisualProfileOptions,
): VisualProfile {
  const base = BASE_PROFILES[options.tier]

  const profile: VisualProfile = {
    ...base,
    postFx: { ...base.postFx },
    hero: {
      ...base.hero,
      overlayOpacityBand: [...base.hero.overlayOpacityBand] as [number, number],
      beatOpacityScale: { ...base.hero.beatOpacityScale },
    },
    transition: {
      ...base.transition,
      beatScale: { ...base.transition.beatScale },
    },
  }

  if (!options.polishV2Enabled) {
    profile.allowPostFx = false
    profile.postFx.enabled = false
    profile.hero.hazeOpacity = Math.min(profile.hero.hazeOpacity, 0.06)
    profile.transition.settleTarget = Math.max(profile.transition.settleTarget, 0.42)
    return profile
  }

  if (options.isMobile) {
    profile.textureSet = '1k'
    profile.particleCap = Math.min(profile.particleCap, TECHNICAL_BUDGETS.low.particleCap)
    profile.allowPostFx = false
    profile.postFx.enabled = false
  }

  if (options.reducedMotion) {
    profile.allowPostFx = false
    profile.postFx.enabled = false
    profile.particleCap = Math.min(profile.particleCap, 120)
    profile.particleMultiplier = Math.min(profile.particleMultiplier, 0.22)
    profile.hero.cameraTravel = 0
    profile.hero.dustPeak = Math.min(profile.hero.dustPeak, 0.12)
    profile.transition.settleTarget = Math.max(profile.transition.settleTarget, 0.48)
  }

  profile.postFx.bloomIntensity = MathUtils.clamp(profile.postFx.bloomIntensity, 0, 1.2)
  profile.postFx.noiseOpacity = MathUtils.clamp(profile.postFx.noiseOpacity, 0, 1)
  profile.postFx.vignetteDarkness = MathUtils.clamp(profile.postFx.vignetteDarkness, 0, 1.2)

  return profile
}
