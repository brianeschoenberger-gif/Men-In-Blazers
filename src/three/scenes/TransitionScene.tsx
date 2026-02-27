import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { AdditiveBlending, Fog, MathUtils } from 'three'
import {
  TRANSITION_BEATS,
  STYLE_TOKENS,
  getCurrentBeat,
} from '../../config/heroTransitionBeats'
import type { VisualProfile } from '../../config/visualProfiles'
import { getAssetPath } from '../assets/assetManifest'
import { ConfettiParticles } from '../effects/ConfettiParticles'
import { EnergyParticles } from '../effects/EnergyParticles'
import { LightStreaks } from '../effects/LightStreaks'
import { WaveformLines } from '../effects/WaveformLines'
import { useOptionalTexture } from '../hooks/useOptionalTexture'

type TransitionSceneProps = {
  progress: number
  reducedMotion: boolean
  visualProfile: VisualProfile
}

function getControlledIntensity(
  progress: number,
  reducedMotion: boolean,
  profile: VisualProfile,
) {
  const clamped = MathUtils.clamp(progress, 0, 1)

  if (reducedMotion) {
    return MathUtils.lerp(
      profile.transition.calmFloor,
      profile.transition.settleTarget,
      MathUtils.smoothstep(clamped, 0.12, 0.88),
    )
  }

  if (clamped <= profile.transition.riseEnd) {
    return MathUtils.smoothstep(
      clamped,
      profile.transition.riseStart,
      profile.transition.riseEnd,
    )
  }

  if (clamped <= profile.transition.peakHoldEnd) {
    return MathUtils.lerp(
      0.92,
      1,
      MathUtils.smoothstep(clamped, profile.transition.riseEnd, profile.transition.peakHoldEnd),
    )
  }

  return MathUtils.lerp(
    1,
    profile.transition.settleTarget,
    MathUtils.smoothstep(clamped, profile.transition.peakHoldEnd, profile.transition.settleEnd),
  )
}

export function TransitionScene({
  progress,
  reducedMotion,
  visualProfile,
}: TransitionSceneProps) {
  const { camera, scene } = useThree()

  const lightStreakTexture = useOptionalTexture(getAssetPath('light_streak'))
  const confettiTexture = useOptionalTexture(getAssetPath('confetti_atlas'))
  const waveformMask = useOptionalTexture(getAssetPath('waveform_mask'))
  const radialBurstMask = useOptionalTexture(getAssetPath('radial_burst_mask'))
  const noiseTile = useOptionalTexture(getAssetPath('noise_tile'))

  const clampedProgress = MathUtils.clamp(progress, 0, 1)
  const beat = getCurrentBeat(TRANSITION_BEATS, clampedProgress)
  const baseIntensity = getControlledIntensity(progress, reducedMotion, visualProfile)
  const intensity = reducedMotion
    ? baseIntensity
    : MathUtils.clamp(baseIntensity * visualProfile.transition.beatScale[beat.id], 0, 1)
  const calmResolve = reducedMotion
    ? MathUtils.smoothstep(progress, 0.72, 1)
    : MathUtils.smoothstep(progress, 0.8, 1)
  const entranceWhiteout = reducedMotion
    ? 0.1
    : 1 - MathUtils.smoothstep(clampedProgress, 0.02, 0.28)

  const ambientFloorOpacity = reducedMotion
    ? 0.08
    : MathUtils.lerp(0.1, 0.2, calmResolve)

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#050a14', 5.6, 64)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useFrame((_state, delta) => {
    camera.position.x = MathUtils.damp(camera.position.x, 0, 3, delta)
    camera.position.y = MathUtils.damp(
      camera.position.y,
      reducedMotion ? 1 : 1 - intensity * 0.14,
      3,
      delta,
    )
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 5.8 : 6.35 - intensity * 0.8,
      2.4,
      delta,
    )
    camera.lookAt(0, 0, -14)
  })

  return (
    <group>
      <ambientLight intensity={0.28 + intensity * 0.22 + entranceWhiteout * 0.52} />
      <pointLight
        position={[0, 1.6, 4]}
        intensity={0.74 + intensity * 1.5 + entranceWhiteout * 2.8}
        color={STYLE_TOKENS.hero.portalColor}
      />
      <pointLight
        position={[-3.5, -1.2, -10]}
        intensity={0.4 + intensity * 1.16 + entranceWhiteout * 0.42}
        color={STYLE_TOKENS.transition.streakColor}
      />
      <pointLight
        position={[2.8, 0.5, -16]}
        intensity={0.16 + calmResolve * 0.52}
        color={STYLE_TOKENS.transition.settleColor}
      />

      <mesh position={[0, 0.1, -7.4]}>
        <planeGeometry args={[18, 10.8]} />
        <meshBasicMaterial
          color="#fff7e8"
          transparent
          opacity={reducedMotion ? 0.06 : entranceWhiteout * 0.74}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <EnergyParticles
        intensity={intensity}
        particleMultiplier={visualProfile.particleMultiplier}
        particleCap={Math.floor(visualProfile.particleCap * 0.74)}
        reducedMotion={reducedMotion}
        mapTexture={confettiTexture}
        color="#8fd0ff"
      />
      <ConfettiParticles
        intensity={intensity}
        particleMultiplier={visualProfile.particleMultiplier}
        particleCap={Math.floor(visualProfile.particleCap * 0.55)}
        reducedMotion={reducedMotion}
        mapTexture={confettiTexture}
      />
      <LightStreaks
        intensity={intensity}
        reducedMotion={reducedMotion}
        mapTexture={lightStreakTexture}
      />
      <WaveformLines
        intensity={intensity}
        reducedMotion={reducedMotion}
        maskTexture={waveformMask}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, -12]}>
        <ringGeometry args={[2.5, 4 + intensity * 1.7, 56]} />
        <meshBasicMaterial
          color={STYLE_TOKENS.transition.surgeColor}
          map={radialBurstMask ?? undefined}
          alphaMap={radialBurstMask ?? undefined}
          transparent
          opacity={reducedMotion ? 0.1 : 0.12 + intensity * 0.24}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -0.35, -18]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial
          color={STYLE_TOKENS.transition.settleColor}
          map={noiseTile ?? undefined}
          transparent
          opacity={reducedMotion ? 0.06 : calmResolve * 0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -1.6, -14]}>
        <planeGeometry args={[16, 5.6]} />
        <meshBasicMaterial
          color="#4a7eb5"
          transparent
          opacity={ambientFloorOpacity}
        />
      </mesh>
    </group>
  )
}
