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
  const portalHaloMaterialRef = useRef<MeshBasicMaterial>(null)
  const portalRimMaterialRef = useRef<MeshBasicMaterial>(null)
  const portalFloorBounceMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdPlateMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdLightBandMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdPitchMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdFogMaterialRef = useRef<MeshBasicMaterial>(null)
  const ambientLightRef = useRef<AmbientLight>(null)
  const tunnelEntryLightRef = useRef<PointLight>(null)
  const tunnelFillLightRef = useRef<PointLight>(null)
  const portalGlowLightRef = useRef<PointLight>(null)
  const ceilingLightMaterials = useRef<MeshBasicMaterial[]>([])
  const sidePracticalMaterials = useRef<MeshBasicMaterial[]>([])
  const lightBeamMaterials = useRef<MeshBasicMaterial[]>([])
  const hazeMaterials = useRef<MeshBasicMaterial[]>([])

  const segmentDepths = useMemo(
    () => Array.from({ length: 14 }, (_, index) => -index * 6),
    [],
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
    ? 0.04
    : visualProfile.hero.hazeOpacity * (0.42 + easedProgress * 0.66) * beatOpacityScale

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
    const normalized = reducedMotion ? 0.2 : MathUtils.clamp(progress, 0, 1)
    const eased = easeInOutCubic(normalized)
    const allowDrift = allowPointerDrift && !reducedMotion

    const driftX = allowDrift ? pointer.x * 0.18 : 0
    const driftY = allowDrift ? pointer.y * 0.08 : 0

    camera.position.x = MathUtils.damp(camera.position.x, driftX, 3, delta)
    camera.position.y = MathUtils.damp(camera.position.y, 1.05 + driftY, 3.2, delta)
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 10.9 : 11.5 - eased * visualProfile.hero.cameraTravel,
      3,
      delta,
    )
    camera.lookAt(0, 0.1, -24)

    const elapsed = state.clock.elapsedTime
    const flicker = reducedMotion
      ? 0
      : (Math.sin(elapsed * 8.5) + Math.sin(elapsed * 11.3 + 1.5)) * 0.03
    const beamProgress = MathUtils.smoothstep(eased, 0.24, 0.92)

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
      tunnelFillLightRef.current.intensity = MathUtils.lerp(0.12, 0.38, eased)
    }

    if (portalGlowLightRef.current) {
      const beatPulse = Math.sin(elapsed * 3 + beatProgress * Math.PI) * 0.08
      portalGlowLightRef.current.intensity = MathUtils.lerp(
        1.12,
        3.1 + beatPulse,
        MathUtils.smoothstep(eased, 0.58, 1),
      )
    }

    if (portalMaterialRef.current) {
      portalMaterialRef.current.emissiveIntensity = MathUtils.lerp(1.7, 5.4, eased)
    }

    const portalReveal = MathUtils.smoothstep(eased, 0.48, 0.96)
    const thresholdLift = MathUtils.smoothstep(eased, 0.72, 1)
    if (portalHaloMaterialRef.current) {
      const haloPulse = reducedMotion ? 0 : Math.sin(elapsed * 2.6) * 0.04
      portalHaloMaterialRef.current.opacity = MathUtils.clamp(
        MathUtils.lerp(0.08, 0.3, portalReveal) * beatOpacityScale + haloPulse,
        0.05,
        0.4,
      )
    }
    if (portalRimMaterialRef.current) {
      const rimPulse = reducedMotion ? 0 : Math.sin(elapsed * 4 + 0.6) * 0.03
      portalRimMaterialRef.current.opacity = MathUtils.clamp(
        MathUtils.lerp(0.04, 0.24, thresholdLift) + rimPulse,
        0.03,
        0.3,
      )
    }
    if (portalFloorBounceMaterialRef.current) {
      portalFloorBounceMaterialRef.current.opacity = MathUtils.clamp(
        MathUtils.lerp(0.04, 0.2, portalReveal) * beatOpacityScale,
        0.03,
        0.24,
      )
    }
    if (crowdPlateMaterialRef.current) {
      crowdPlateMaterialRef.current.opacity = reducedMotion
        ? 0.42
        : MathUtils.lerp(0.18, 0.76, portalReveal) * beatOpacityScale
    }
    if (crowdLightBandMaterialRef.current) {
      crowdLightBandMaterialRef.current.opacity = reducedMotion
        ? 0.54
        : MathUtils.lerp(0.4, 0.84, portalReveal)
    }
    if (crowdPitchMaterialRef.current) {
      crowdPitchMaterialRef.current.opacity = reducedMotion
        ? 0.46
        : MathUtils.lerp(0.3, 0.66, portalReveal)
    }
    if (crowdFogMaterialRef.current) {
      crowdFogMaterialRef.current.opacity = reducedMotion
        ? 0.14
        : MathUtils.lerp(0.08, 0.32, portalReveal) * beatOpacityScale
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
        MathUtils.lerp(0.08, 0.42, eased) + depthBoost + shimmer + flicker * 0.9,
        0.08,
        0.86,
      )
    }

    for (let index = 0; index < sidePracticalMaterials.current.length; index += 1) {
      const material = sidePracticalMaterials.current[index]
      if (!material) {
        continue
      }
      const depthRatio =
        Math.floor(index / 2) / Math.max(segmentDepths.length - 1, 1)
      const edgeLift = MathUtils.lerp(0.08, 0.02, depthRatio)
      const stripFlicker = reducedMotion
        ? 0
        : Math.sin(elapsed * 6.4 + index * 0.92) * 0.018
      material.opacity = MathUtils.clamp(
        (MathUtils.lerp(0.03, 0.2, beamProgress) + edgeLift + stripFlicker) *
          beatOpacityScale,
        0.02,
        0.34,
      )
    }

    for (let index = 0; index < lightBeamMaterials.current.length; index += 1) {
      const material = lightBeamMaterials.current[index]
      if (!material) {
        continue
      }
      const depthRatio = index / Math.max(lightBeamMaterials.current.length - 1, 1)
      const beamBase =
        beamProgress *
        MathUtils.lerp(visualProfile.hero.lightBeamMaxOpacity, 0.08, depthRatio)
      const beamFlicker = reducedMotion
        ? 0
        : Math.sin(elapsed * 6.1 + index * 1.17) * 0.02
      material.opacity = MathUtils.clamp(
        beamBase * beatOpacityScale + beamFlicker,
        0,
        visualProfile.hero.lightBeamMaxOpacity,
      )
    }

    for (let index = 0; index < hazeMaterials.current.length; index += 1) {
      const material = hazeMaterials.current[index]
      if (!material) {
        continue
      }
      const drift = reducedMotion
        ? 0
        : Math.sin(elapsed * (0.46 + index * 0.08) + index) * 0.015
      material.opacity = MathUtils.clamp(
        hazeOpacityBase * (index === 0 ? 1 : 0.75) + drift,
        0.02,
        0.22,
      )
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
        position={[0, 0.95, -20]}
        intensity={0.22}
        color={STYLE_TOKENS.hero.fillColor}
      />
      <pointLight
        ref={portalGlowLightRef}
        position={[0, 0.1, -74]}
        intensity={1.3}
        color={STYLE_TOKENS.hero.portalColor}
      />
      <pointLight position={[-4.7, 0.9, -56]} intensity={0.52} color="#ffc67f" />
      <pointLight position={[4.7, 0.9, -56]} intensity={0.52} color="#ffc67f" />

      {segmentDepths.map((depth, index) => (
        <group key={depth} position={[0, 0, depth]}>
          <mesh position={[0, -2.4, 0]}>
            <boxGeometry args={[11.8, 0.32, 6]} onUpdate={ensureUv2} />
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
            <boxGeometry args={[11.8, 0.26, 6]} onUpdate={ensureUv2} />
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
            <boxGeometry args={[0.34, 6.1, 6]} onUpdate={ensureUv2} />
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
            <boxGeometry args={[0.34, 6.1, 6]} onUpdate={ensureUv2} />
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
          <mesh position={[0, 1.05, 0]}>
            <planeGeometry args={[2.2, 2.7]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  lightBeamMaterials.current[index] = material
                }
              }}
              color="#f4bf7f"
              transparent
              opacity={0.03}
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
        </group>
      ))}

      <mesh position={[0, 0, -84]}>
        <planeGeometry args={[10.8, 6.4]} />
        <meshStandardMaterial
          ref={portalMaterialRef}
          color={STYLE_TOKENS.hero.portalColor}
          map={portalGradient ?? undefined}
          emissive={STYLE_TOKENS.hero.portalColor}
          emissiveMap={portalGradient ?? undefined}
          emissiveIntensity={2}
          roughness={0.18}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0, -83.86]}>
        <planeGeometry args={[12.8, 8.1]} />
        <meshBasicMaterial
          ref={portalHaloMaterialRef}
          color="#ffdcaf"
          map={portalGradient ?? noiseTile ?? undefined}
          alphaMap={portalGradient ?? undefined}
          transparent
          opacity={0.14}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.02, -83.72]}>
        <planeGeometry args={[11.2, 5.3]} />
        <meshBasicMaterial
          ref={portalRimMaterialRef}
          color="#fff0cf"
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.92, -82.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.2, 6.8]} />
        <meshBasicMaterial
          ref={portalFloorBounceMaterialRef}
          color="#df9c5a"
          map={noiseTile ?? undefined}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -0.1, -83.74]}>
        <planeGeometry args={[10.6, 2.92]} />
        <meshBasicMaterial
          ref={crowdPlateMaterialRef}
          map={stadiumCrowdPlate ?? undefined}
          color="#f8d5ad"
          transparent
          opacity={0.42}
        />
      </mesh>

      <mesh position={[0, 0.72, -83.6]}>
        <planeGeometry args={[10.95, 0.56]} />
        <meshBasicMaterial
          ref={crowdLightBandMaterialRef}
          color="#fff2d4"
          transparent
          opacity={0.72}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.07, -83.54]}>
        <planeGeometry args={[10.55, 1.34]} />
        <meshBasicMaterial
          ref={crowdPitchMaterialRef}
          color="#7ea55a"
          transparent
          opacity={0.58}
        />
      </mesh>
      <mesh position={[0, -0.2, -83.67]}>
        <planeGeometry args={[10.82, 3.44]} />
        <meshBasicMaterial
          ref={crowdFogMaterialRef}
          color="#dfb07a"
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.3, -26]}>
        <planeGeometry args={[16, 9.2]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              hazeMaterials.current[0] = material
            }
          }}
          color="#e7ad6d"
          map={hazePlateA ?? undefined}
          transparent
          opacity={hazeOpacityBase}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.1, -48]}>
        <planeGeometry args={[16.6, 9.8]} />
        <meshBasicMaterial
          ref={(material) => {
            if (material) {
              hazeMaterials.current[1] = material
            }
          }}
          color="#cc8c50"
          map={hazePlateB ?? undefined}
          transparent
          opacity={hazeOpacityBase * 0.8}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {grimeAtlas ? (
        <mesh position={[0, 0, -32]}>
          <planeGeometry args={[10.2, 6.4]} />
          <meshBasicMaterial
            color="#6d4e35"
            map={grimeAtlas}
            transparent
            opacity={0.1}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {dustCount > 0 ? (
        <>
          <DustParticles
            count={dustCount}
            reducedMotion={reducedMotion}
            opacity={dustVisibility}
            size={dustSize}
            mapTexture={dustSoftTexture ?? fallbackDustTexture}
            color="#ffd2a5"
          />
          <DustParticles
            count={Math.floor(dustCount * 0.42)}
            reducedMotion={reducedMotion}
            opacity={dustVisibility * 0.65}
            size={Math.max(0.015, dustSize * 0.7)}
            mapTexture={dustSharpTexture ?? fallbackDustTexture}
            color="#ffc792"
          />
        </>
      ) : null}

      {deviceTier === 'high' ? (
        <mesh position={[0, 0, -30]}>
          <planeGeometry args={[14, 10]} />
          <meshBasicMaterial color="#2b150a" transparent opacity={0.12} />
        </mesh>
      ) : null}
    </group>
  )
}
