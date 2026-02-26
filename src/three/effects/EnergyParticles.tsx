import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  Color,
  MathUtils,
  type Points,
  type PointsMaterial,
  type Texture,
} from 'three'

type EnergyParticlesProps = {
  intensity: number
  particleMultiplier: number
  reducedMotion: boolean
  particleCap?: number
  mapTexture?: Texture | null
  color?: string
}

export function EnergyParticles({
  intensity,
  particleMultiplier,
  reducedMotion,
  particleCap = 620,
  mapTexture,
  color = '#8fd0ff',
}: EnergyParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)
  const count = Math.max(80, Math.min(particleCap, Math.floor(620 * particleMultiplier)))

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const stride = i * 3
      data[stride] = (Math.random() - 0.5) * 16
      data[stride + 1] = (Math.random() - 0.5) * 8
      data[stride + 2] = -Math.random() * 40
    }
    return data
  }, [count])

  useFrame((_state, delta) => {
    if (!pointsRef.current) {
      return
    }

    const targetRotation = reducedMotion ? 0.012 : 0.05 + intensity * 0.3
    pointsRef.current.rotation.z = MathUtils.damp(
      pointsRef.current.rotation.z,
      targetRotation,
      3,
      delta,
    )
    pointsRef.current.rotation.y += delta * (reducedMotion ? 0.02 : 0.07 + intensity * 0.18)
    pointsRef.current.rotation.x = MathUtils.damp(
      pointsRef.current.rotation.x,
      reducedMotion ? 0 : intensity * 0.14,
      2.8,
      delta,
    )

    if (materialRef.current) {
      materialRef.current.opacity = reducedMotion
        ? 0.16
        : MathUtils.lerp(0.22, 0.68, intensity)
      materialRef.current.size = reducedMotion ? 0.03 : MathUtils.lerp(0.03, 0.06, intensity)
      materialRef.current.color = new Color(color)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={color}
        opacity={reducedMotion ? 0.2 : 0.55}
        transparent
        size={reducedMotion ? 0.03 : 0.05}
        sizeAttenuation
        map={mapTexture ?? undefined}
        alphaMap={mapTexture ?? undefined}
        alphaTest={mapTexture ? 0.03 : 0}
        depthWrite={false}
      />
    </points>
  )
}
