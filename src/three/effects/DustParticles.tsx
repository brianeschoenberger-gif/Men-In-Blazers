import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Points } from 'three'

type DustParticlesProps = {
  count: number
  reducedMotion: boolean
  opacity: number
  size: number
}

export function DustParticles({
  count,
  reducedMotion,
  opacity,
  size,
}: DustParticlesProps) {
  const pointsRef = useRef<Points>(null)

  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const stride = i * 3
      data[stride] = (Math.random() - 0.5) * 8
      data[stride + 1] = (Math.random() - 0.5) * 5
      data[stride + 2] = -Math.random() * 80
    }
    return data
  }, [count])

  useFrame((_state, delta) => {
    if (!pointsRef.current || reducedMotion) {
      return
    }
    pointsRef.current.rotation.y += delta * 0.02
    pointsRef.current.rotation.x += delta * 0.005
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
        color="#d9e2ff"
        opacity={opacity}
        transparent
        size={size}
        sizeAttenuation
      />
    </points>
  )
}
