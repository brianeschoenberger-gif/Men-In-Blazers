import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Fog,
  MathUtils,
  type LineBasicMaterial,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
  type PointsMaterial,
} from 'three'
import type { DeviceTier } from '../hooks/useDeviceTier'

type FeaturedStoriesSceneProps = {
  progress: number
  reducedMotion: boolean
  storyCount: number
  highlightedIndex: number
  deviceTier: DeviceTier
}

export function FeaturedStoriesScene({
  progress,
  reducedMotion,
  storyCount,
  highlightedIndex,
  deviceTier,
}: FeaturedStoriesSceneProps) {
  const { camera, scene } = useThree()
  const pointsRef = useRef<Points>(null)
  const pointsMaterialRef = useRef<PointsMaterial>(null)
  const lineMaterialRef = useRef<LineBasicMaterial>(null)
  const anchorRefs = useRef<Mesh[]>([])
  const anchorGlowRefs = useRef<MeshBasicMaterial[]>([])

  const clampedStoryCount = Math.max(storyCount, 1)

  const constellationPoints = useMemo(() => {
    const data = new Float32Array(clampedStoryCount * 3)
    for (let index = 0; index < clampedStoryCount; index += 1) {
      const spread = clampedStoryCount > 1 ? index / (clampedStoryCount - 1) : 0.5
      const x = MathUtils.lerp(-4.6, 4.6, spread)
      const y = Math.sin(index * 0.8) * 0.9 + (Math.random() - 0.5) * 0.3
      const z = -14 - Math.cos(index * 0.65) * 1.6
      const stride = index * 3
      data[stride] = x
      data[stride + 1] = y
      data[stride + 2] = z
    }
    return data
  }, [clampedStoryCount])

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#060a13', 7, 62)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useFrame((state, delta) => {
    const clamped = MathUtils.clamp(progress, 0, 1)
    const activeIndex = MathUtils.clamp(highlightedIndex, 0, clampedStoryCount - 1)
    const pulse = reducedMotion
      ? 0.25
      : 0.5 + Math.sin(state.clock.elapsedTime * 2.1) * 0.5

    camera.position.x = MathUtils.damp(camera.position.x, 0, 3, delta)
    camera.position.y = MathUtils.damp(
      camera.position.y,
      reducedMotion ? 0.64 : 0.66 - clamped * 0.08,
      3,
      delta,
    )
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 10.6 : 11 - clamped * 0.9,
      2.6,
      delta,
    )
    camera.lookAt(0, 0, -14)

    if (deviceTier !== 'low' && pointsRef.current) {
      pointsRef.current.rotation.z = MathUtils.damp(
        pointsRef.current.rotation.z,
        reducedMotion ? 0.01 : 0.03 + clamped * 0.07,
        3,
        delta,
      )
      pointsRef.current.rotation.y += delta * (reducedMotion ? 0.01 : 0.035)
    }

    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.opacity =
        deviceTier === 'low'
          ? 0.2
          : reducedMotion
            ? 0.28
            : MathUtils.lerp(0.26, 0.5, clamped)
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity =
        deviceTier === 'low'
          ? 0.14
          : reducedMotion
            ? 0.2
            : MathUtils.lerp(0.16, 0.34, clamped)
    }

    for (let index = 0; index < anchorRefs.current.length; index += 1) {
      const anchor = anchorRefs.current[index]
      const glow = anchorGlowRefs.current[index]
      if (!anchor || !glow) {
        continue
      }

      const isHighlighted = index === activeIndex
      const targetScale = isHighlighted ? 1.35 : 1
      anchor.scale.setScalar(MathUtils.damp(anchor.scale.x, targetScale, 4, delta))

      const baseOpacity = isHighlighted ? 0.5 : 0.18
      const pulseBoost = isHighlighted ? pulse * 0.26 : pulse * 0.06
      glow.opacity = reducedMotion ? baseOpacity : baseOpacity + pulseBoost
      glow.color.set(isHighlighted ? '#9fddff' : '#76a8d1')
    }
  })

  const fallbackPlaneOpacity =
    deviceTier === 'low' ? 0.22 : reducedMotion ? 0.15 : 0.1

  return (
    <group>
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 2.8, -7]} intensity={0.9} color="#8ecbff" />
      <pointLight position={[-5, 1.8, -15]} intensity={0.46} color="#7aa8d9" />

      <mesh position={[0, -0.2, -16]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#17324b" transparent opacity={fallbackPlaneOpacity} />
      </mesh>

      {deviceTier === 'low' ? null : (
        <>
          <points ref={pointsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[constellationPoints, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              ref={pointsMaterialRef}
              color="#95cfff"
              transparent
              size={0.08}
              opacity={0.3}
              sizeAttenuation
            />
          </points>

          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[constellationPoints, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              ref={lineMaterialRef}
              color="#71b6e7"
              transparent
              opacity={0.24}
            />
          </line>
        </>
      )}

      {Array.from({ length: clampedStoryCount }, (_, index) => {
        const stride = index * 3
        const x = constellationPoints[stride] ?? 0
        const y = constellationPoints[stride + 1] ?? 0
        const z = constellationPoints[stride + 2] ?? -14

        return (
          <group key={index} position={[x, y, z]}>
            <mesh
              ref={(node) => {
                if (node) {
                  anchorRefs.current[index] = node
                }
              }}
            >
              <sphereGeometry args={[0.09, 14, 14]} />
              <meshStandardMaterial
                color="#d5edff"
                emissive="#82c3ef"
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
              <ringGeometry args={[0.12, 0.23, 20]} />
              <meshBasicMaterial
                ref={(material) => {
                  if (material) {
                    anchorGlowRefs.current[index] = material
                  }
                }}
                color="#7eb8df"
                transparent
                opacity={0.2}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
