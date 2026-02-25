import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  Fog,
  MathUtils,
  type AmbientLight,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type PointLight,
} from 'three'
import type { DeviceTier } from '../hooks/useDeviceTier'
import { DustParticles } from '../effects/DustParticles'

type HeroSceneProps = {
  progress: number
  reducedMotion: boolean
  deviceTier: DeviceTier
  allowPointerDrift: boolean
  particleMultiplier: number
}

function easeInOutCubic(value: number) {
  if (value < 0.5) {
    return 4 * value * value * value
  }
  return 1 - Math.pow(-2 * value + 2, 3) / 2
}

export function HeroScene({
  progress,
  reducedMotion,
  deviceTier,
  allowPointerDrift,
  particleMultiplier,
}: HeroSceneProps) {
  const { camera, pointer, scene } = useThree()
  const portalMaterialRef = useRef<MeshStandardMaterial>(null)
  const ambientLightRef = useRef<AmbientLight>(null)
  const tunnelEntryLightRef = useRef<PointLight>(null)
  const tunnelFillLightRef = useRef<PointLight>(null)
  const portalGlowLightRef = useRef<PointLight>(null)
  const ceilingLightMaterials = useRef<MeshBasicMaterial[]>([])
  const lightBeamMaterials = useRef<MeshBasicMaterial[]>([])

  const segmentDepths = useMemo(
    () => Array.from({ length: 14 }, (_, index) => -index * 6),
    [],
  )

  const clampedProgress = MathUtils.clamp(progress, 0, 1)
  const easedProgress = reducedMotion ? 0.14 : easeInOutCubic(clampedProgress)
  const dustVisibility = reducedMotion
    ? 0
    : MathUtils.lerp(
        0.08,
        0.44,
        MathUtils.smoothstep(easedProgress, 0.1, 0.78),
      )
  const dustSize = reducedMotion
    ? 0.03
    : MathUtils.lerp(
        0.03,
        0.052,
        MathUtils.smoothstep(easedProgress, 0.16, 0.82),
      )

  const dustCount = reducedMotion
    ? 0
    : Math.max(100, Math.floor(600 * particleMultiplier))

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#05070d', 5, 82)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useFrame((state, delta) => {
    const normalized = reducedMotion ? 0.2 : MathUtils.clamp(progress, 0, 1)
    const eased = easeInOutCubic(normalized)
    const allowDrift = allowPointerDrift && !reducedMotion

    const driftX = allowDrift ? pointer.x * 0.18 : 0
    const driftY = allowDrift ? pointer.y * 0.08 : 0

    camera.position.x = MathUtils.damp(camera.position.x, driftX, 3, delta)
    camera.position.y = MathUtils.damp(camera.position.y, 1.05 + driftY, 3.2, delta)
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 10.9 : 11.5 - eased * 8.2,
      3,
      delta,
    )
    camera.lookAt(0, 0.1, -18)

    const elapsed = state.clock.elapsedTime
    const flicker = reducedMotion
      ? 0
      : (Math.sin(elapsed * 8.5) + Math.sin(elapsed * 11.3 + 1.5)) * 0.03
    const beamProgress = MathUtils.smoothstep(eased, 0.28, 0.9)

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = MathUtils.lerp(0.12, 0.28, eased)
    }

    if (tunnelEntryLightRef.current) {
      tunnelEntryLightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(0.35, 0.92, eased) + flicker,
        0.25,
        1.1,
      )
    }

    if (tunnelFillLightRef.current) {
      tunnelFillLightRef.current.intensity = MathUtils.lerp(0.16, 0.46, eased)
    }

    if (portalGlowLightRef.current) {
      portalGlowLightRef.current.intensity = MathUtils.lerp(1.1, 2.45, eased)
    }

    if (portalMaterialRef.current) {
      portalMaterialRef.current.emissiveIntensity = MathUtils.lerp(1.8, 5.9, eased)
    }

    for (let index = 0; index < ceilingLightMaterials.current.length; index += 1) {
      const material = ceilingLightMaterials.current[index]
      if (!material) {
        continue
      }
      const depthRatio = index / Math.max(ceilingLightMaterials.current.length - 1, 1)
      const depthBoost = MathUtils.lerp(0.24, 0.06, depthRatio)
      const shimmer = reducedMotion
        ? 0
        : Math.sin(elapsed * 7.2 + index * 0.9) * 0.075
      material.opacity = MathUtils.clamp(
        MathUtils.lerp(0.08, 0.4, eased) + depthBoost + shimmer + flicker * 0.9,
        0.08,
        0.8,
      )
    }

    for (let index = 0; index < lightBeamMaterials.current.length; index += 1) {
      const material = lightBeamMaterials.current[index]
      if (!material) {
        continue
      }
      const depthRatio = index / Math.max(lightBeamMaterials.current.length - 1, 1)
      const beamBase = beamProgress * MathUtils.lerp(0.22, 0.08, depthRatio)
      const beamFlicker = reducedMotion
        ? 0
        : Math.sin(elapsed * 6.1 + index * 1.17) * 0.02
      material.opacity = MathUtils.clamp(beamBase + beamFlicker, 0, 0.33)
    }
  })

  return (
    <group>
      <ambientLight ref={ambientLightRef} intensity={0.18} />
      <pointLight
        ref={tunnelEntryLightRef}
        position={[0, 2.8, 9]}
        intensity={0.5}
        color="#d7e5ff"
      />
      <pointLight
        ref={tunnelFillLightRef}
        position={[0, 1.1, -22]}
        intensity={0.22}
        color="#87b8f4"
      />
      <pointLight
        ref={portalGlowLightRef}
        position={[0, 0, -70]}
        intensity={1.3}
        color="#7ec9ff"
      />

      {segmentDepths.map((depth, index) => (
        <group key={depth} position={[0, 0, depth]}>
          <mesh position={[0, -2.4, 0]}>
            <boxGeometry args={[8.2, 0.28, 6]} />
            <meshStandardMaterial color="#171b28" roughness={0.93} metalness={0.08} />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[8.2, 0.22, 6]} />
            <meshStandardMaterial color="#131826" roughness={0.88} metalness={0.12} />
          </mesh>
          <mesh position={[-4.1, 0, 0]}>
            <boxGeometry args={[0.26, 5.2, 6]} />
            <meshStandardMaterial color="#1b2130" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[4.1, 0, 0]}>
            <boxGeometry args={[0.26, 5.2, 6]} />
            <meshStandardMaterial color="#1b2130" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  ceilingLightMaterials.current[index] = material
                }
              }}
              color="#7faef6"
              transparent
              opacity={0.2}
            />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <planeGeometry args={[1.45, 2.15]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  lightBeamMaterials.current[index] = material
                }
              }}
              color="#74b6ff"
              transparent
              opacity={0.03}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0, -84]}>
        <planeGeometry args={[7.4, 5.4]} />
        <meshStandardMaterial
          ref={portalMaterialRef}
          color="#8ad6ff"
          emissive="#8ad6ff"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0}
        />
      </mesh>

      {dustCount > 0 ? (
        <DustParticles
          count={dustCount}
          reducedMotion={reducedMotion}
          opacity={dustVisibility}
          size={dustSize}
        />
      ) : null}

      {deviceTier === 'high' ? (
        <mesh position={[0, 0, -30]}>
          <planeGeometry args={[14, 10]} />
          <meshBasicMaterial color="#0a1625" transparent opacity={0.08} />
        </mesh>
      ) : null}
    </group>
  )
}
