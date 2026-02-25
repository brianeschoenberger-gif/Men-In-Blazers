import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Fog, MathUtils } from 'three'
import { EnergyParticles } from '../effects/EnergyParticles'
import { LightStreaks } from '../effects/LightStreaks'
import { WaveformLines } from '../effects/WaveformLines'

type TransitionSceneProps = {
  progress: number
  reducedMotion: boolean
  particleMultiplier: number
}

function getSurgeIntensity(progress: number, reducedMotion: boolean) {
  const clamped = MathUtils.clamp(progress, 0, 1)

  if (reducedMotion) {
    return MathUtils.lerp(0.08, 0.24, MathUtils.smoothstep(clamped, 0.1, 0.86))
  }

  if (clamped <= 0.64) {
    return MathUtils.smoothstep(clamped, 0.02, 0.64)
  }

  const settle = MathUtils.smoothstep(clamped, 0.64, 1)
  return MathUtils.lerp(1, 0.36, settle)
}

export function TransitionScene({
  progress,
  reducedMotion,
  particleMultiplier,
}: TransitionSceneProps) {
  const { camera, scene } = useThree()
  const intensity = getSurgeIntensity(progress, reducedMotion)
  const calmResolve = reducedMotion
    ? MathUtils.smoothstep(progress, 0.72, 1)
    : MathUtils.smoothstep(progress, 0.78, 1)

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#050a14', 6, 58)
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
      reducedMotion ? 5.8 : 6.3 - intensity * 0.7,
      2.4,
      delta,
    )
    camera.lookAt(0, 0, -14)
  })

  return (
    <group>
      <ambientLight intensity={0.3 + intensity * 0.24} />
      <pointLight
        position={[0, 1.6, 4]}
        intensity={0.74 + intensity * 1.5}
        color="#8dd3ff"
      />
      <pointLight
        position={[-3.5, -1.2, -10]}
        intensity={0.4 + intensity * 1.1}
        color="#7ab7ff"
      />
      <pointLight
        position={[2.8, 0.5, -16]}
        intensity={0.15 + calmResolve * 0.45}
        color="#8fc2ff"
      />

      <EnergyParticles
        intensity={intensity}
        particleMultiplier={particleMultiplier}
        reducedMotion={reducedMotion}
      />
      <LightStreaks intensity={intensity} reducedMotion={reducedMotion} />
      <WaveformLines intensity={intensity} reducedMotion={reducedMotion} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, -12]}>
        <ringGeometry args={[2.5, 4 + intensity * 1.6, 56]} />
        <meshBasicMaterial
          color="#5fb7ff"
          transparent
          opacity={reducedMotion ? 0.1 : 0.12 + intensity * 0.2}
        />
      </mesh>

      <mesh position={[0, -0.35, -18]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial
          color="#66bbff"
          transparent
          opacity={reducedMotion ? 0.06 : calmResolve * 0.16}
        />
      </mesh>
    </group>
  )
}
