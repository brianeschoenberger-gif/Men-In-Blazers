import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Points, type PointsMaterial, type Texture } from 'three'

type ConfettiParticlesProps = {
  intensity: number
  particleMultiplier: number
  particleCap: number
  reducedMotion: boolean
  mapTexture?: Texture | null
}

export function ConfettiParticles({
  intensity,
  particleMultiplier,
  particleCap,
  reducedMotion,
  mapTexture,
}: ConfettiParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)

  const count = Math.max(50, Math.min(particleCap, Math.floor(420 * particleMultiplier)))

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const stride = i * 3
      data[stride] = (Math.random() - 0.5) * 20
      data[stride + 1] = (Math.random() - 0.5) * 10
      data[stride + 2] = -Math.random() * 46 - 2
    }
    return data
  }, [count])

  useFrame((_state, delta) => {
    if (!pointsRef.current || !materialRef.current) {
      return
    }

    const swirlRate = reducedMotion ? 0.02 : 0.06 + intensity * 0.18
    pointsRef.current.rotation.y += delta * swirlRate
    pointsRef.current.rotation.x = MathUtils.damp(
      pointsRef.current.rotation.x,
      reducedMotion ? 0.05 : 0.12 + intensity * 0.22,
      2.6,
      delta,
    )

    materialRef.current.opacity = reducedMotion
      ? 0.11
      : MathUtils.lerp(0.12, 0.44, intensity)
    materialRef.current.size = reducedMotion
      ? 0.026
      : MathUtils.lerp(0.026, 0.05, intensity)
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
        color="#a5ddff"
        transparent
        opacity={0.2}
        size={0.03}
        sizeAttenuation
        map={mapTexture ?? undefined}
        alphaMap={mapTexture ?? undefined}
        alphaTest={mapTexture ? 0.03 : 0}
        depthWrite={false}
      />
    </points>
  )
}

