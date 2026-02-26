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
    return MathUtils.lerp(0.86, 1.18, MathUtils.smoothstep(clamped, 0.45, 0.94))
  }

  if (section === 'transition') {
    if (clamped <= 0.66) {
      return MathUtils.lerp(0.88, 1.24, MathUtils.smoothstep(clamped, 0.1, 0.66))
    }
    return MathUtils.lerp(1.24, 0.92, MathUtils.smoothstep(clamped, 0.66, 1))
  }

  return 1
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

  return (
    <EffectComposer enabled multisampling={0} enableNormalPass={false}>
      <BrightnessContrast
        brightness={profile.postFx.brightness}
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
