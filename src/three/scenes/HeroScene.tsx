import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DoubleSide,
  Fog,
  MathUtils,
  RepeatWrapping,
  type AmbientLight,
  type BufferGeometry,
  type MeshBasicMaterial,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
} from 'three'
import {
  HERO_BEATS,
  STYLE_TOKENS,
  getBeatProgress,
  getCurrentBeat,
} from '../../config/heroTransitionBeats'
import type { VisualProfile } from '../../config/visualProfiles'
import { getAssetPath, getTextureVariantPath } from '../assets/assetManifest'
import { DustParticles } from '../effects/DustParticles'
import type { DeviceTier } from '../hooks/useDeviceTier'
import { useOptionalTexture } from '../hooks/useOptionalTexture'

type HeroSceneProps = {
  progress: number
  reducedMotion: boolean
  deviceTier: DeviceTier
  allowPointerDrift: boolean
  visualProfile: VisualProfile
}

function easeInOutCubic(value: number) {
  if (value < 0.5) {
    return 4 * value * value * value
  }
  return 1 - Math.pow(-2 * value + 2, 3) / 2
}

function ensureUv2(geometry: BufferGeometry) {
  const uv = geometry.getAttribute('uv')
  if (uv && !geometry.getAttribute('uv2')) {
    geometry.setAttribute('uv2', uv.clone())
  }
}

export function HeroScene({
  progress,
  reducedMotion,
  deviceTier,
  allowPointerDrift,
  visualProfile,
}: HeroSceneProps) {
  const { camera, pointer, scene } = useThree()
  const portalMaterialRef = useRef<MeshStandardMaterial>(null)
  const portalHaloMaterialRef = useRef<MeshStandardMaterial>(null)
  const portalRingRef = useRef<Mesh>(null)
  const crowdPlateMaterialRef = useRef<MeshBasicMaterial>(null)
  const pitchFloorMaterialRef = useRef<MeshBasicMaterial>(null)
  const ambientLightRef = useRef<AmbientLight>(null)
  const tunnelEntryLightRef = useRef<PointLight>(null)
  const tunnelFillLightRef = useRef<PointLight>(null)
  const portalGlowLightRef = useRef<PointLight>(null)
  const ceilingLightMaterials = useRef<MeshBasicMaterial[]>([])
  const sidePracticalMaterials = useRef<MeshBasicMaterial[]>([])
  const hazeTubeMaterials = useRef<MeshBasicMaterial[]>([])

  const segmentLength = 6
  const segmentDepths = useMemo(
    () => Array.from({ length: 14 }, (_, index) => -index * segmentLength),
    [segmentLength],
  )

  const wallAlbedo = useOptionalTexture(
    getTextureVariantPath('tunnel_wall_albedo', visualProfile.textureSet),
    { srgb: true },
  )
  const wallNormal = useOptionalTexture(
    getTextureVariantPath('tunnel_wall_normal', visualProfile.textureSet),
  )
  const wallRoughness = useOptionalTexture(
    getTextureVariantPath('tunnel_wall_roughness', visualProfile.textureSet),
  )
  const wallAo = useOptionalTexture(
    getTextureVariantPath('tunnel_wall_ao', visualProfile.textureSet),
  )
  const floorAlbedo = useOptionalTexture(
    getTextureVariantPath('tunnel_floor_albedo', visualProfile.textureSet),
    { srgb: true },
  )
  const floorNormal = useOptionalTexture(
    getTextureVariantPath('tunnel_floor_normal', visualProfile.textureSet),
  )
  const floorRoughness = useOptionalTexture(
    getTextureVariantPath('tunnel_floor_roughness', visualProfile.textureSet),
  )
  const floorAo = useOptionalTexture(
    getTextureVariantPath('tunnel_floor_ao', visualProfile.textureSet),
  )
  const portalGradient = useOptionalTexture(getAssetPath('portal_gradient'), {
    srgb: true,
  })
  const stadiumCrowdPlate = useOptionalTexture(
    getTextureVariantPath('stadium_crowd_plate', visualProfile.textureSet),
    { srgb: true },
  )
  const ceilingStrip = useOptionalTexture(getAssetPath('ceiling_emissive_strip'), {
    srgb: true,
  })
  const hazePlateA = useOptionalTexture(getAssetPath('haze_plate_a'), { srgb: true })
  const hazePlateB = useOptionalTexture(getAssetPath('haze_plate_b'), { srgb: true })
  const grimeAtlas = useOptionalTexture(getAssetPath('grime_decal_atlas'), { srgb: true })
  const noiseTile = useOptionalTexture(getAssetPath('noise_tile'))
  const dustSoftTexture = useOptionalTexture(getAssetPath('dust_soft'))
  const dustSharpTexture = useOptionalTexture(getAssetPath('dust_sharp'))
  const glowTexture = useOptionalTexture(getAssetPath('glow_soft'))

  useEffect(() => {
    const texturesToRepeat = [
      wallAlbedo,
      wallNormal,
      wallRoughness,
      wallAo,
      floorAlbedo,
      floorNormal,
      floorRoughness,
      floorAo,
    ]

    for (const texture of texturesToRepeat) {
      if (!texture) {
        continue
      }

      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(1.2, 1)
    }
  }, [
    floorAlbedo,
    floorAo,
    floorNormal,
    floorRoughness,
    wallAlbedo,
    wallAo,
    wallNormal,
    wallRoughness,
  ])

  useEffect(() => {
    const hazeTextures = [hazePlateA, hazePlateB]
    for (const texture of hazeTextures) {
      if (!texture) {
        continue
      }
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(1.35, 1.8)
    }
  }, [hazePlateA, hazePlateB])

  const clampedProgress = MathUtils.clamp(progress, 0, 1)
  const easedProgress = reducedMotion ? 0.12 : easeInOutCubic(clampedProgress)
  const beat = getCurrentBeat(HERO_BEATS, clampedProgress)
  const beatProgress = getBeatProgress(clampedProgress, beat.start, beat.end)
  const beatOpacityScale = visualProfile.hero.beatOpacityScale[beat.id]

  const dustVisibility = reducedMotion
    ? 0
    : MathUtils.lerp(
        visualProfile.hero.dustBase,
        visualProfile.hero.dustPeak,
        MathUtils.smoothstep(easedProgress, 0.1, 0.82),
      ) * beatOpacityScale
  const dustSize = reducedMotion
    ? visualProfile.hero.dustSizeBase
    : MathUtils.lerp(
        visualProfile.hero.dustSizeBase,
        visualProfile.hero.dustSizePeak,
        MathUtils.smoothstep(easedProgress, 0.16, 0.88),
      )
  const hazeOpacityBase = reducedMotion
    ? 0.02
    : visualProfile.hero.hazeOpacity * (0.4 + easedProgress * 0.62) * beatOpacityScale

  const dustCount = reducedMotion
    ? 0
    : Math.max(
        100,
        Math.min(
          visualProfile.particleCap,
          Math.floor(visualProfile.particleCap * visualProfile.particleMultiplier * 0.82),
        ),
      )

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#120d09', 4.5, 94)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const normalized = reducedMotion ? 0.2 : MathUtils.clamp(progress, 0, 1)
    const eased = easeInOutCubic(normalized)
    const allowDrift = allowPointerDrift && !reducedMotion

    const driftX = allowDrift ? pointer.x * 0.18 : 0
    const driftY = allowDrift ? pointer.y * 0.08 : 0
    const idleSwayX = reducedMotion ? 0 : Math.sin(elapsed * 0.22 + 1.2) * 0.05
    const idleBreathY = reducedMotion ? 0 : Math.sin(elapsed * 0.3) * 0.04

    camera.position.x = MathUtils.damp(camera.position.x, driftX + idleSwayX, 3, delta)
    camera.position.y = MathUtils.damp(
      camera.position.y,
      1.05 + driftY + idleBreathY,
      3.2,
      delta,
    )
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 10.9 : 11.5 - eased * visualProfile.hero.cameraTravel,
      3,
      delta,
    )
    camera.lookAt(0, 0.08 + (reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.03), -30)

    const flicker = reducedMotion
      ? 0
      : (Math.sin(elapsed * 8.5) + Math.sin(elapsed * 11.3 + 1.5)) * 0.03
    const idlePulse = reducedMotion
      ? 0
      : Math.sin(elapsed * 1.4) * 0.1 + Math.sin(elapsed * 2.1 + 0.7) * 0.05
    const practicalProgress = MathUtils.smoothstep(eased, 0.24, 0.92)

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = MathUtils.lerp(0.05, 0.18, eased)
    }

    if (tunnelEntryLightRef.current) {
      tunnelEntryLightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(0.24, 0.86, eased) + flicker,
        0.18,
        1.08,
      )
    }

    if (tunnelFillLightRef.current) {
      tunnelFillLightRef.current.intensity = MathUtils.lerp(0.12, 0.4, eased)
    }

    if (portalGlowLightRef.current) {
      const beatPulse = Math.sin(elapsed * 3 + beatProgress * Math.PI) * 0.08
      portalGlowLightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(
          1.08,
          3.2 + beatPulse,
          MathUtils.smoothstep(eased, 0.58, 1),
        ) + idlePulse,
        0.9,
        3.6,
      )
    }

    const portalReveal = MathUtils.smoothstep(eased, 0.48, 0.96)

    if (portalMaterialRef.current) {
      portalMaterialRef.current.emissiveIntensity = MathUtils.clamp(
        MathUtils.lerp(1.7, 4.9, eased) + idlePulse * 0.55,
        1.4,
        5.2,
      )
    }
    if (portalHaloMaterialRef.current) {
      const ringPulse = reducedMotion ? 0 : Math.sin(elapsed * 4.4 + 0.2) * 0.1
      portalHaloMaterialRef.current.emissiveIntensity = MathUtils.clamp(
        MathUtils.lerp(0.7, 2.1, portalReveal) + ringPulse + idlePulse * 0.35,
        0.5,
        2.6,
      )
      portalHaloMaterialRef.current.opacity = MathUtils.clamp(
        MathUtils.lerp(0.2, 0.7, portalReveal) * beatOpacityScale,
        0.16,
        0.75,
      )
    }

    if (portalRingRef.current && !reducedMotion) {
      portalRingRef.current.rotation.z += delta * 0.08
      portalRingRef.current.rotation.x = Math.sin(elapsed * 0.24) * 0.04
    }
    if (crowdPlateMaterialRef.current) {
      crowdPlateMaterialRef.current.opacity = reducedMotion
        ? 0.38
        : MathUtils.lerp(0.14, 0.58, portalReveal) * beatOpacityScale
    }
    if (pitchFloorMaterialRef.current) {
      pitchFloorMaterialRef.current.opacity = reducedMotion
        ? 0.24
        : MathUtils.lerp(0.08, 0.42, portalReveal)
    }

    for (let index = 0; index < ceilingLightMaterials.current.length; index += 1) {
      const material = ceilingLightMaterials.current[index]
      if (!material) {
        continue
      }

      const depthRatio = index / Math.max(ceilingLightMaterials.current.length - 1, 1)
      const depthBoost = MathUtils.lerp(0.18, 0.06, depthRatio)
      const shimmer = reducedMotion
        ? 0
        : Math.sin(elapsed * 7.2 + index * 0.9) * 0.06
      material.opacity = MathUtils.clamp(
        MathUtils.lerp(0.06, 0.34, eased) + depthBoost + shimmer + flicker * 0.8,
        0.05,
        0.58,
      )
    }

    for (let index = 0; index < sidePracticalMaterials.current.length; index += 1) {
      const material = sidePracticalMaterials.current[index]
      if (!material) {
        continue
      }
      const depthRatio = Math.floor(index / 2) / Math.max(segmentDepths.length - 1, 1)
      const edgeLift = MathUtils.lerp(0.08, 0.02, depthRatio)
      const stripFlicker = reducedMotion
        ? 0
        : Math.sin(elapsed * 6.4 + index * 0.92) * 0.018
      material.opacity = MathUtils.clamp(
        (MathUtils.lerp(0.02, 0.16, practicalProgress) + edgeLift + stripFlicker) *
          beatOpacityScale,
        0.02,
        0.28,
      )
    }

    for (let index = 0; index < hazeTubeMaterials.current.length; index += 1) {
      const material = hazeTubeMaterials.current[index]
      if (!material) {
        continue
      }
      const drift = reducedMotion
        ? 0
        : Math.sin(elapsed * (0.45 + index * 0.07) + index) * 0.012
      material.opacity = MathUtils.clamp(
        hazeOpacityBase * (index === 0 ? 1 : 0.72) + drift,
        0.01,
        0.16,
      )
    }

    if (!reducedMotion) {
      if (hazePlateA) {
        hazePlateA.offset.y = -((elapsed * 0.012) % 1)
        hazePlateA.offset.x = Math.sin(elapsed * 0.11) * 0.02
      }
      if (hazePlateB) {
        hazePlateB.offset.y = -((elapsed * 0.016) % 1)
        hazePlateB.offset.x = Math.sin(elapsed * 0.09 + 0.6) * 0.015
      }
    }
  })

  const fallbackDustTexture = glowTexture ?? dustSoftTexture ?? dustSharpTexture

  return (
    <group>
      <ambientLight ref={ambientLightRef} intensity={0.18} />
      <pointLight
        ref={tunnelEntryLightRef}
        position={[0, 2.6, 8.4]}
        intensity={0.5}
        color={STYLE_TOKENS.hero.practicalColor}
      />
      <pointLight
        ref={tunnelFillLightRef}
        position={[0, 0.95, -24]}
        intensity={0.22}
        color={STYLE_TOKENS.hero.fillColor}
      />
      <pointLight
        ref={portalGlowLightRef}
        position={[0, 0.15, -78]}
        intensity={1.3}
        color={STYLE_TOKENS.hero.portalColor}
      />
      <pointLight position={[-4.7, 0.9, -56]} intensity={0.52} color="#ffc67f" />
      <pointLight position={[4.7, 0.9, -56]} intensity={0.52} color="#ffc67f" />

      {segmentDepths.map((depth, index) => (
        <group key={depth} position={[0, 0, depth]}>
          <mesh position={[0, -2.4, 0]}>
            <boxGeometry args={[11.8, 0.32, segmentLength]} onUpdate={ensureUv2} />
            <meshStandardMaterial
              color={STYLE_TOKENS.hero.tunnelBase}
              roughness={0.93}
              metalness={0.08}
              map={floorAlbedo ?? undefined}
              normalMap={floorNormal ?? undefined}
              roughnessMap={floorRoughness ?? undefined}
              aoMap={floorAo ?? undefined}
              aoMapIntensity={0.78}
            />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[11.8, 0.26, segmentLength]} onUpdate={ensureUv2} />
            <meshStandardMaterial
              color={STYLE_TOKENS.hero.tunnelShadow}
              roughness={0.88}
              metalness={0.12}
              map={wallAlbedo ?? undefined}
              normalMap={wallNormal ?? undefined}
              roughnessMap={wallRoughness ?? undefined}
              aoMap={wallAo ?? undefined}
              aoMapIntensity={0.72}
            />
          </mesh>
          <mesh position={[-5.9, 0, 0]}>
            <boxGeometry args={[0.34, 6.1, segmentLength]} onUpdate={ensureUv2} />
            <meshStandardMaterial
              color="#20150f"
              roughness={0.9}
              metalness={0.1}
              map={wallAlbedo ?? undefined}
              normalMap={wallNormal ?? undefined}
              roughnessMap={wallRoughness ?? undefined}
              aoMap={wallAo ?? undefined}
              aoMapIntensity={0.7}
            />
          </mesh>
          <mesh position={[5.9, 0, 0]}>
            <boxGeometry args={[0.34, 6.1, segmentLength]} onUpdate={ensureUv2} />
            <meshStandardMaterial
              color="#20150f"
              roughness={0.9}
              metalness={0.1}
              map={wallAlbedo ?? undefined}
              normalMap={wallNormal ?? undefined}
              roughnessMap={wallRoughness ?? undefined}
              aoMap={wallAo ?? undefined}
              aoMapIntensity={0.7}
            />
          </mesh>

          <mesh position={[0, 2.03, 0]}>
            <boxGeometry args={[11.1, 0.1, 0.2]} />
            <meshStandardMaterial color="#4e321d" roughness={0.6} metalness={0.35} />
          </mesh>
          <mesh position={[-5.45, 0, 0]}>
            <boxGeometry args={[0.12, 4.9, 0.2]} />
            <meshStandardMaterial color="#4e321d" roughness={0.6} metalness={0.35} />
          </mesh>
          <mesh position={[5.45, 0, 0]}>
            <boxGeometry args={[0.12, 4.9, 0.2]} />
            <meshStandardMaterial color="#4e321d" roughness={0.6} metalness={0.35} />
          </mesh>

          <mesh position={[0, 2.2, 0]}>
            <planeGeometry args={[0.82, 0.18]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  ceilingLightMaterials.current[index] = material
                }
              }}
              color="#ffd8a8"
              map={ceilingStrip ?? undefined}
              transparent
              opacity={0.2}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <mesh position={[-5.74, 1.72, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[5.9, 0.2]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  sidePracticalMaterials.current[index * 2] = material
                }
              }}
              color="#f0b273"
              map={ceilingStrip ?? undefined}
              transparent
              opacity={0.08}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[5.74, 1.72, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[5.9, 0.2]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  sidePracticalMaterials.current[index * 2 + 1] = material
                }
              }}
              color="#f0b273"
              map={ceilingStrip ?? undefined}
              transparent
              opacity={0.08}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {grimeAtlas && index % 3 === 0 ? (
            <>
              <mesh position={[-5.73, 0.12, -0.7]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[2.4, 2.8]} />
                <meshBasicMaterial
                  color="#6d4e35"
                  map={grimeAtlas}
                  transparent
                  opacity={0.08}
                  depthWrite={false}
                />
              </mesh>
              <mesh position={[5.73, 0.12, 0.7]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[2.4, 2.8]} />
                <meshBasicMaterial
                  color="#6d4e35"
                  map={grimeAtlas}
                  transparent
                  opacity={0.08}
                  depthWrite={false}
                />
              </mesh>
            </>
          ) : null}
        </group>
      ))}

      <mesh position={[0, 0, -84]}>
        <planeGeometry args={[10.6, 6.2]} />
        <meshStandardMaterial
          ref={portalMaterialRef}
          color={STYLE_TOKENS.hero.portalColor}
          map={portalGradient ?? undefined}
          emissive={STYLE_TOKENS.hero.portalColor}
          emissiveMap={portalGradient ?? undefined}
          emissiveIntensity={1.8}
          roughness={0.16}
          metalness={0}
        />
      </mesh>

      <mesh ref={portalRingRef} position={[0, 0.04, -83.82]}>
        <torusGeometry args={[4.95, 0.22, 18, 64]} />
        <meshStandardMaterial
          ref={portalHaloMaterialRef}
          color="#f0bd83"
          emissive="#f2bf89"
          emissiveIntensity={1}
          roughness={0.34}
          metalness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh position={[0, -0.2, -83.62]}>
        <planeGeometry args={[10.2, 2.4]} />
        <meshBasicMaterial
          ref={crowdPlateMaterialRef}
          map={stadiumCrowdPlate ?? undefined}
          color="#f8d5ad"
          transparent
          opacity={0.36}
        />
      </mesh>

      <mesh position={[0, -2.23, -82.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.8, 11.2]} />
        <meshBasicMaterial
          ref={pitchFloorMaterialRef}
          color="#709552"
          map={noiseTile ?? undefined}
          transparent
          opacity={0.24}
        />
      </mesh>

      <mesh position={[0, 0, -35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6.35, 6.35, 72, 24, 1, true]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              hazeTubeMaterials.current[0] = material
            }
          }}
          color="#d4a06b"
          map={hazePlateA ?? noiseTile ?? undefined}
          transparent
          opacity={hazeOpacityBase}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[7.1, 7.1, 56, 24, 1, true]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              hazeTubeMaterials.current[1] = material
            }
          }}
          color="#bf8650"
          map={hazePlateB ?? noiseTile ?? undefined}
          transparent
          opacity={hazeOpacityBase * 0.7}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {dustCount > 0 ? (
        <>
          <DustParticles
            count={dustCount}
            reducedMotion={reducedMotion}
            opacity={dustVisibility}
            size={dustSize}
            driftSpeed={1}
            mapTexture={dustSoftTexture ?? fallbackDustTexture}
            color="#ffd2a5"
          />
          <DustParticles
            count={Math.floor(dustCount * 0.42)}
            reducedMotion={reducedMotion}
            opacity={dustVisibility * 0.65}
            size={Math.max(0.015, dustSize * 0.7)}
            driftSpeed={1.45}
            mapTexture={dustSharpTexture ?? fallbackDustTexture}
            color="#ffc792"
          />
        </>
      ) : null}

      {deviceTier === 'high' ? (
        <mesh position={[0, -2.28, -32]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10.4, 36]} />
          <meshBasicMaterial color="#2b150a" transparent opacity={0.08} />
        </mesh>
      ) : null}
    </group>
  )
}
