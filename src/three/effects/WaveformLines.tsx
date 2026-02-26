import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  MathUtils,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from 'three'

type WaveformLinesProps = {
  intensity: number
  reducedMotion: boolean
  maskTexture?: Texture | null
}

type WaveLine = {
  y: number
  z: number
  width: number
  phase: number
}

export function WaveformLines({
  intensity,
  reducedMotion,
  maskTexture,
}: WaveformLinesProps) {
  const lineRefs = useRef<Mesh[]>([])
  const lines = useMemo<WaveLine[]>(
    () =>
      Array.from({ length: 7 }, (_, index) => ({
        y: -0.85 + index * 0.28,
        z: -12.5 - index * 0.46,
        width: 8.5 - index * 0.6,
        phase: index * 0.74,
      })),
    [],
  )

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const swayAmplitude = reducedMotion ? 0.01 : 0.018 + intensity * 0.085
    const opacityBase = reducedMotion
      ? 0.04
      : MathUtils.lerp(0.06, 0.22, MathUtils.clamp(intensity, 0, 1))

    for (let index = 0; index < lineRefs.current.length; index += 1) {
      const mesh = lineRefs.current[index]
      const config = lines[index]
      if (!mesh || !config) {
        continue
      }

      const sway = Math.sin(elapsed * (1.25 + index * 0.22) + config.phase)
      mesh.position.y = MathUtils.damp(
        mesh.position.y,
        config.y + sway * swayAmplitude,
        4,
        delta,
      )
      mesh.scale.x = MathUtils.damp(
        mesh.scale.x,
        0.9 + intensity * (0.36 - index * 0.025),
        4,
        delta,
      )

      const material = mesh.material as MeshBasicMaterial
      material.opacity = opacityBase * (1 - index * 0.09)
    }
  })

  return (
    <group>
      {lines.map((line, index) => (
        <mesh
          key={index}
          position={[0, line.y, line.z]}
          ref={(mesh) => {
            if (mesh) {
              lineRefs.current[index] = mesh
            }
          }}
        >
          <planeGeometry args={[line.width, 0.03]} />
          <meshBasicMaterial
            color="#8fcbff"
            transparent
            opacity={0.08}
            map={maskTexture ?? undefined}
            alphaMap={maskTexture ?? undefined}
            alphaTest={maskTexture ? 0.02 : 0}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
