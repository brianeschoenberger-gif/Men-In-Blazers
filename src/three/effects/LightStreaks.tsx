import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  Color,
  MathUtils,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from 'three'

type LightStreaksProps = {
  intensity: number
  reducedMotion: boolean
  mapTexture?: Texture | null
}

type Streak = {
  baseX: number
  baseY: number
  x: number
  y: number
  z: number
  resetDepth: number
  speed: number
  length: number
  width: number
  hueOffset: number
  phase: number
}

export function LightStreaks({
  intensity,
  reducedMotion,
  mapTexture,
}: LightStreaksProps) {
  const streakRefs = useRef<Mesh[]>([])
  const streaks = useMemo<Streak[]>(
    () =>
      Array.from({ length: 24 }, () => ({
        baseX: (Math.random() - 0.5) * 14,
        baseY: (Math.random() - 0.5) * 7,
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 7,
        z: -Math.random() * 22 - 7,
        resetDepth: -Math.random() * 22 - 16,
        speed: 0.75 + Math.random() * 1.4,
        length: 1 + Math.random() * 4.5,
        width: 0.03 + Math.random() * 0.08,
        hueOffset: Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  )

  const visibility = reducedMotion
    ? 0.12
    : MathUtils.clamp(intensity * 1.25, 0.05, 1)

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const velocity = reducedMotion ? 0.4 : 2.6 + intensity * 10
    const sway = reducedMotion ? 0.04 : 0.12 + intensity * 0.34

    for (let index = 0; index < streakRefs.current.length; index += 1) {
      const mesh = streakRefs.current[index]
      const streak = streaks[index]
      if (!mesh || !streak) {
        continue
      }

      mesh.position.z += delta * velocity * streak.speed
      if (mesh.position.z > 5) {
        mesh.position.z = streak.resetDepth
      }

      mesh.position.x = streak.baseX + Math.sin(elapsed * 1.8 + streak.phase) * sway
      mesh.position.y =
        streak.baseY + Math.cos(elapsed * 1.2 + streak.phase * 0.85) * sway * 0.35
      mesh.scale.y = 0.86 + intensity * 1.7

      const material = mesh.material as MeshBasicMaterial
      material.opacity = MathUtils.clamp(
        visibility * (0.22 + Math.abs(Math.sin(elapsed + streak.phase))),
        0.04,
        0.82,
      )
    }
  })

  return (
    <group>
      {streaks.map((streak, index) => (
        <mesh
          key={index}
          position={[streak.x, streak.y, streak.z]}
          rotation={[0, 0, 0.28]}
          ref={(mesh) => {
            if (mesh) {
              streakRefs.current[index] = mesh
            }
          }}
        >
          <planeGeometry args={[streak.width, streak.length]} />
          <meshBasicMaterial
            color={new Color().setHSL(0.55 + streak.hueOffset, 0.9, 0.72)}
            transparent
            opacity={visibility * 0.65}
            map={mapTexture ?? undefined}
            alphaMap={mapTexture ?? undefined}
            alphaTest={mapTexture ? 0.04 : 0}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
