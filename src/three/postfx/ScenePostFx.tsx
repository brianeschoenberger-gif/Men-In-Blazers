import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { MathUtils } from 'three'
import { BlendFunction } from 'postprocessing'
import type { VisualProfile } from '../../config/visualProfiles'

type ScenePostFxProps = {
  enabled: boolean
  section: 'hero' | 'transition' | 'none'
  progress: number
  profile: VisualProfile
}

function getBloomBoost(section: ScenePostFxProps['section'], progress: number) {
  const clamped = MathUtils.clamp(progress, 0, 1)
  if (section === 'hero') {
    const base = MathUtils.lerp(0.9, 1.36, MathUtils.smoothstep(clamped, 0.45, 0.9))
    const thresholdFlash = MathUtils.smoothstep(clamped, 0.9, 1)
    return MathUtils.lerp(base, 2.85, thresholdFlash)
  }

  if (section === 'transition') {
    const entranceFlash = 1 - MathUtils.smoothstep(clamped, 0.02, 0.3)
    if (clamped <= 0.66) {
      const surge = MathUtils.lerp(0.96, 1.3, MathUtils.smoothstep(clamped, 0.1, 0.66))
      return surge + entranceFlash * 1.05
    }
    const settle = MathUtils.lerp(1.3, 0.92, MathUtils.smoothstep(clamped, 0.66, 1))
    return settle + entranceFlash * 1.05
  }

  return 1
}

function getBrightnessBoost(section: ScenePostFxProps['section'], progress: number) {
  const clamped = MathUtils.clamp(progress, 0, 1)
  if (section === 'hero') {
    return MathUtils.lerp(0, 0.18, MathUtils.smoothstep(clamped, 0.9, 1))
  }

  if (section === 'transition') {
    return MathUtils.lerp(0.22, 0, MathUtils.smoothstep(clamped, 0.02, 0.34))
  }

  return 0
}

export function ScenePostFx({
  enabled,
  section,
  progress,
  profile,
}: ScenePostFxProps) {
  if (!enabled || !profile.postFx.enabled) {
    return null
  }

  const bloomBoost = getBloomBoost(section, progress)
  const brightnessBoost = getBrightnessBoost(section, progress)

  return (
    <EffectComposer enabled multisampling={0} enableNormalPass={false}>
      <BrightnessContrast
        brightness={profile.postFx.brightness + brightnessBoost}
        contrast={profile.postFx.contrast}
      />
      <Bloom
        blendFunction={BlendFunction.SCREEN}
        mipmapBlur
        intensity={profile.postFx.bloomIntensity * bloomBoost}
        luminanceThreshold={profile.postFx.bloomThreshold}
        luminanceSmoothing={profile.postFx.bloomSmoothing}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={profile.postFx.noiseOpacity}
      />
      <Vignette
        eskil={false}
        offset={profile.postFx.vignetteOffset}
        darkness={profile.postFx.vignetteDarkness}
      />
    </EffectComposer>
  )
}
