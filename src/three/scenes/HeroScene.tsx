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
  type HemisphereLight,
  type MeshBasicMaterial,
  type Mesh,
  type PerspectiveCamera,
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

function getTunnelRunCurve(progress: number) {
  const clamped = MathUtils.clamp(progress, 0, 1)

  if (clamped <= 0.2) {
    return MathUtils.lerp(0, 0.34, MathUtils.smoothstep(clamped, 0, 0.2))
  }

  if (clamped <= 0.7) {
    return MathUtils.lerp(0.34, 0.9, MathUtils.smoothstep(clamped, 0.2, 0.7))
  }

  return MathUtils.lerp(0.9, 1, MathUtils.smoothstep(clamped, 0.7, 1))
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
  const perspectiveCamera = camera as PerspectiveCamera
  const portalMaterialRef = useRef<MeshStandardMaterial>(null)
  const portalHaloMaterialRef = useRef<MeshStandardMaterial>(null)
  const portalRingRef = useRef<Mesh>(null)
  const crowdPlateMeshRef = useRef<Mesh>(null)
  const crowdParallaxMeshRef = useRef<Mesh>(null)
  const crowdPlateMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdParallaxMaterialRef = useRef<MeshBasicMaterial>(null)
  const portalPhotoMaterialRef = useRef<MeshBasicMaterial>(null)
  const pitchFloorMaterialRef = useRef<MeshBasicMaterial>(null)
  const stadiumApertureMaterialRef = useRef<MeshBasicMaterial>(null)
  const stadiumHorizonMaterialRef = useRef<MeshBasicMaterial>(null)
  const stadiumFrameMaterialRef = useRef<MeshBasicMaterial>(null)
  const ambientLightRef = useRef<AmbientLight>(null)
  const hemisphereLightRef = useRef<HemisphereLight>(null)
  const tunnelEntryLightRef = useRef<PointLight>(null)
  const tunnelFillLightRef = useRef<PointLight>(null)
  const tunnelNearLightLeftRef = useRef<PointLight>(null)
  const tunnelNearLightRightRef = useRef<PointLight>(null)
  const tunnelMidLightRef = useRef<PointLight>(null)
  const portalGlowLightRef = useRef<PointLight>(null)
  const stadiumRimLightLeftRef = useRef<PointLight>(null)
  const stadiumRimLightRightRef = useRef<PointLight>(null)
  const ceilingLightMaterials = useRef<MeshBasicMaterial[]>([])
  const sidePracticalMaterials = useRef<MeshBasicMaterial[]>([])
  const floorGuideMaterials = useRef<MeshBasicMaterial[]>([])
  const cableMaterials = useRef<MeshStandardMaterial[]>([])
  const hazeTubeMaterials = useRef<MeshBasicMaterial[]>([])
  const stadiumShaftMaterials = useRef<MeshBasicMaterial[]>([])
  const baseFovRef = useRef<number | null>(null)

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
  const stadiumTunnelPortal = useOptionalTexture(
    getTextureVariantPath('stadium_tunnel_portal', visualProfile.textureSet),
    { srgb: true },
  )
  const ceilingStrip = useOptionalTexture(getAssetPath('ceiling_emissive_strip'), {
    srgb: true,
  })
  const hazePlateA = useOptionalTexture(getAssetPath('haze_plate_a'), { srgb: true })
  const hazePlateB = useOptionalTexture(getAssetPath('haze_plate_b'), { srgb: true })
  const grimeAtlas = useOptionalTexture(getAssetPath('grime_decal_atlas'), { srgb: true })
  const noiseTile = useOptionalTexture(getAssetPath('noise_tile'))
  const radialBurstMask = useOptionalTexture(getAssetPath('radial_burst_mask'))
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
    : visualProfile.hero.hazeOpacity * (0.3 + easedProgress * 0.56) * beatOpacityScale

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
    scene.fog = new Fog('#352417', 5.8, 118)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useEffect(() => {
    if (baseFovRef.current === null) {
      baseFovRef.current = perspectiveCamera.fov
    }

    return () => {
      if (baseFovRef.current !== null) {
        perspectiveCamera.fov = baseFovRef.current
        perspectiveCamera.updateProjectionMatrix()
      }
    }
  }, [perspectiveCamera])

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const normalized = reducedMotion ? 0.2 : MathUtils.clamp(progress, 0, 1)
    const eased = easeInOutCubic(normalized)
    const runCurve = reducedMotion ? 0.12 : getTunnelRunCurve(normalized)
    const runMotionStrength = reducedMotion
      ? 0
      : MathUtils.smoothstep(normalized, 0.16, 0.9)
    const allowDrift = allowPointerDrift && !reducedMotion

    const driftX = allowDrift ? pointer.x * 0.18 : 0
    const driftY = allowDrift ? pointer.y * 0.08 : 0
    const idleSwayX = reducedMotion ? 0 : Math.sin(elapsed * 0.22 + 1.2) * 0.05
    const idleBreathY = reducedMotion ? 0 : Math.sin(elapsed * 0.3) * 0.04
    const strideFrequency = 3.4 + runMotionStrength * 3.2
    const strideBobY = reducedMotion
      ? 0
      : Math.sin(elapsed * strideFrequency) * 0.048 * runMotionStrength
    const strideSwayX = reducedMotion
      ? 0
      : Math.sin(elapsed * (strideFrequency * 0.5) + 0.9) * 0.034 * runMotionStrength

    camera.position.x = MathUtils.damp(
      camera.position.x,
      driftX + idleSwayX + strideSwayX,
      3.9,
      delta,
    )
    camera.position.y = MathUtils.damp(
      camera.position.y,
      0.9 + driftY + idleBreathY + strideBobY,
      4.2,
      delta,
    )
    const targetCameraZ = reducedMotion
      ? 10.9
      : 12.2 - runCurve * visualProfile.hero.cameraTravel
    camera.position.z = MathUtils.damp(camera.position.z, targetCameraZ, 5.4, delta)

    const targetFovBase = baseFovRef.current ?? perspectiveCamera.fov
    const fovOpen = MathUtils.smoothstep(normalized, 0.42, 0.9)
    const fovSettle = MathUtils.smoothstep(normalized, 0.93, 1)
    const targetFov = reducedMotion
      ? targetFovBase
      : targetFovBase + fovOpen * 3.4 - fovSettle * 1.6
    const nextFov = MathUtils.damp(perspectiveCamera.fov, targetFov, 3.4, delta)
    if (Math.abs(nextFov - perspectiveCamera.fov) > 0.005) {
      perspectiveCamera.fov = nextFov
      perspectiveCamera.updateProjectionMatrix()
    }

    const lookAheadZ = reducedMotion
      ? -28
      : Math.min(targetCameraZ - 17, MathUtils.lerp(-34, -104, runCurve))
    const lookAheadY =
      0.02 +
      (reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.03) -
      runMotionStrength * 0.035
    camera.lookAt(0, lookAheadY, lookAheadZ)

    const flicker = reducedMotion
      ? 0
      : (Math.sin(elapsed * 8.5) + Math.sin(elapsed * 11.3 + 1.5)) * 0.03
    const idlePulse = reducedMotion
      ? 0
      : Math.sin(elapsed * 1.4) * 0.1 + Math.sin(elapsed * 2.1 + 0.7) * 0.05
    const practicalProgress = MathUtils.smoothstep(runCurve, 0.2, 0.95)
    const nearReadLift = reducedMotion
      ? 0.6
      : 1 - MathUtils.smoothstep(normalized, 0.12, 0.66)
    const midTunnelLift = reducedMotion
      ? 0.4
      : MathUtils.smoothstep(normalized, 0.2, 0.84)

    if (scene.fog instanceof Fog) {
      scene.fog.near = MathUtils.lerp(5.8, 7.4, eased)
      scene.fog.far = MathUtils.lerp(118, 104, eased)
      const fogColorLerp = MathUtils.smoothstep(eased, 0.35, 0.9)
      scene.fog.color.setRGB(
        MathUtils.lerp(0.23, 0.16, fogColorLerp),
        MathUtils.lerp(0.16, 0.11, fogColorLerp),
        MathUtils.lerp(0.1, 0.07, fogColorLerp),
      )
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity =
        MathUtils.lerp(0.2, 0.34, eased) + nearReadLift * 0.08
    }

    if (hemisphereLightRef.current) {
      hemisphereLightRef.current.intensity =
        MathUtils.lerp(0.22, 0.36, eased) + nearReadLift * 0.08
    }

    if (tunnelEntryLightRef.current) {
      tunnelEntryLightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(0.62, 1.24, eased) + nearReadLift * 0.46 + flicker,
        0.34,
        1.88,
      )
    }

    if (tunnelFillLightRef.current) {
      tunnelFillLightRef.current.intensity = MathUtils.lerp(0.4, 0.72, eased)
    }

    if (tunnelNearLightLeftRef.current) {
      tunnelNearLightLeftRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(0.7, 0.22, MathUtils.smoothstep(normalized, 0.1, 0.8)) +
          flicker * 0.4,
        0.16,
        0.9,
      )
    }

    if (tunnelNearLightRightRef.current) {
      tunnelNearLightRightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(0.7, 0.22, MathUtils.smoothstep(normalized, 0.1, 0.8)) +
          flicker * 0.4,
        0.16,
        0.9,
      )
    }

    if (tunnelMidLightRef.current) {
      tunnelMidLightRef.current.intensity = MathUtils.lerp(0.12, 0.58, midTunnelLift)
    }

    const portalReveal = MathUtils.smoothstep(eased, 0.48, 0.96)
    const stadiumPayoff = MathUtils.smoothstep(eased, 0.62, 1)
    const crowdDepthReveal = MathUtils.smoothstep(eased, 0.66, 1)
    const thresholdFlash = reducedMotion ? 0 : MathUtils.smoothstep(normalized, 0.9, 1)

    if (portalGlowLightRef.current) {
      const beatPulse = Math.sin(elapsed * 3 + beatProgress * Math.PI) * 0.08
      portalGlowLightRef.current.intensity = MathUtils.clamp(
        MathUtils.lerp(
          1.08,
          3.2 + beatPulse,
          MathUtils.smoothstep(eased, 0.58, 1),
        ) +
          idlePulse +
          thresholdFlash * 3.4,
        0.9,
        6.8,
      )
    }

    if (portalMaterialRef.current) {
      portalMaterialRef.current.emissiveIntensity = MathUtils.clamp(
        MathUtils.lerp(1.7, 4.9, eased) + idlePulse * 0.55 + thresholdFlash * 7.6,
        1.4,
        11.6,
      )
    }
    if (portalHaloMaterialRef.current) {
      const ringPulse = reducedMotion ? 0 : Math.sin(elapsed * 4.4 + 0.2) * 0.1
      portalHaloMaterialRef.current.emissiveIntensity = MathUtils.clamp(
        MathUtils.lerp(0.7, 2.1, portalReveal) +
          ringPulse +
          idlePulse * 0.35 +
          thresholdFlash * 2.4,
        0.5,
        4.2,
      )
      portalHaloMaterialRef.current.opacity = MathUtils.clamp(
        MathUtils.lerp(0.2, 0.7, portalReveal) * beatOpacityScale +
          thresholdFlash * 0.16,
        0.16,
        0.92,
      )
    }

    if (stadiumApertureMaterialRef.current) {
      const apertureOpacity = reducedMotion
        ? 0.1
        : (MathUtils.lerp(0.04, 0.28, stadiumPayoff) + thresholdFlash * 0.42) *
          beatOpacityScale
      stadiumApertureMaterialRef.current.opacity = MathUtils.clamp(
        apertureOpacity,
        0.06,
        0.86,
      )
    }

    if (stadiumHorizonMaterialRef.current) {
      const horizonOpacity = reducedMotion
        ? 0.08
        : MathUtils.lerp(0.05, 0.34, stadiumPayoff) + thresholdFlash * 0.36
      stadiumHorizonMaterialRef.current.opacity = MathUtils.clamp(
        horizonOpacity,
        0.06,
        0.88,
      )
    }

    if (stadiumFrameMaterialRef.current) {
      const frameOpacity = reducedMotion
        ? 0.16
        : (MathUtils.lerp(0.08, 0.42, stadiumPayoff) + thresholdFlash * 0.24) *
          beatOpacityScale
      stadiumFrameMaterialRef.current.opacity = MathUtils.clamp(
        frameOpacity,
        0.08,
        0.74,
      )
    }

    if (portalRingRef.current && !reducedMotion) {
      portalRingRef.current.rotation.z += delta * 0.08
      portalRingRef.current.rotation.x = Math.sin(elapsed * 0.24) * 0.04
    }

    if (crowdPlateMeshRef.current && !reducedMotion) {
      crowdPlateMeshRef.current.position.y = -0.2 + runCurve * 0.08
      crowdPlateMeshRef.current.position.z = -83.62 - runCurve * 0.12
    }

    if (crowdParallaxMeshRef.current && !reducedMotion) {
      crowdParallaxMeshRef.current.position.y = 0.22 + runCurve * 0.12
      crowdParallaxMeshRef.current.position.z = -84.95 - runCurve * 0.28
    }

    if (crowdPlateMaterialRef.current) {
      const crowdPlateOpacity = reducedMotion
        ? 0.42
        : MathUtils.lerp(0.2, 0.66, portalReveal) * beatOpacityScale
      crowdPlateMaterialRef.current.opacity =
        crowdPlateOpacity * MathUtils.lerp(1, 0.42, thresholdFlash)
    }
    if (crowdParallaxMaterialRef.current) {
      const crowdParallaxOpacity = reducedMotion
        ? 0.18
        : MathUtils.lerp(0.04, 0.34, crowdDepthReveal) * beatOpacityScale
      crowdParallaxMaterialRef.current.opacity =
        crowdParallaxOpacity * MathUtils.lerp(1, 0.25, thresholdFlash)
    }
    if (portalPhotoMaterialRef.current) {
      const photoOpacity = reducedMotion
        ? 0.26
        : MathUtils.lerp(0.04, 0.44, stadiumPayoff) * beatOpacityScale
      portalPhotoMaterialRef.current.opacity =
        photoOpacity * MathUtils.lerp(1, 0.22, thresholdFlash)
    }
    if (pitchFloorMaterialRef.current) {
      const pitchFloorOpacity = reducedMotion
        ? 0.28
        : MathUtils.lerp(0.14, 0.48, portalReveal)
      pitchFloorMaterialRef.current.opacity =
        pitchFloorOpacity * MathUtils.lerp(1, 0.46, thresholdFlash)
    }

    if (stadiumRimLightLeftRef.current) {
      stadiumRimLightLeftRef.current.intensity = reducedMotion
        ? 0.18
        : MathUtils.lerp(0.06, 0.82, stadiumPayoff) + idlePulse * 0.08
    }

    if (stadiumRimLightRightRef.current) {
      stadiumRimLightRightRef.current.intensity = reducedMotion
        ? 0.18
        : MathUtils.lerp(0.06, 0.82, stadiumPayoff) + idlePulse * 0.08
    }

    for (let index = 0; index < stadiumShaftMaterials.current.length; index += 1) {
      const material = stadiumShaftMaterials.current[index]
      if (!material) {
        continue
      }

      const shaftPulse = reducedMotion
        ? 0
        : Math.sin(elapsed * (1.6 + index * 0.25) + index * 0.8) * 0.05
      material.opacity = MathUtils.clamp(
        (MathUtils.lerp(0.03, 0.24, stadiumPayoff) + shaftPulse) * beatOpacityScale,
        0.02,
        0.28,
      )
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
        MathUtils.lerp(0.14, 0.48, eased) + depthBoost + shimmer + flicker * 0.8,
        0.1,
        0.68,
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
        (MathUtils.lerp(0.06, 0.24, practicalProgress) + edgeLift + stripFlicker) *
          beatOpacityScale,
        0.05,
        0.36,
      )
    }

    for (let index = 0; index < floorGuideMaterials.current.length; index += 1) {
      const material = floorGuideMaterials.current[index]
      if (!material) {
        continue
      }

      const depthRatio = index / Math.max(segmentDepths.length - 1, 1)
      const seamShimmer = reducedMotion
        ? 0
        : Math.sin(elapsed * 2.8 + index * 0.6) * 0.01
      material.opacity = MathUtils.clamp(
        (MathUtils.lerp(0.02, 0.18, practicalProgress) + seamShimmer) *
          (1 - depthRatio * 0.42) *
          beatOpacityScale,
        0.02,
        0.24,
      )
    }

    for (let index = 0; index < cableMaterials.current.length; index += 1) {
      const material = cableMaterials.current[index]
      if (!material) {
        continue
      }

      const depthRatio = index / Math.max(cableMaterials.current.length - 1, 1)
      material.emissiveIntensity = MathUtils.clamp(
        MathUtils.lerp(0.04, 0.16, practicalProgress) * (1 - depthRatio * 0.38),
        0.03,
        0.2,
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
      <ambientLight ref={ambientLightRef} intensity={0.22} />
      <hemisphereLight
        ref={hemisphereLightRef}
        args={['#f2bf8d', '#26160f', 0.22]}
      />
      <pointLight
        ref={tunnelEntryLightRef}
        position={[0, 2.6, 8.4]}
        intensity={0.78}
        color={STYLE_TOKENS.hero.practicalColor}
      />
      <pointLight
        ref={tunnelFillLightRef}
        position={[0, 0.95, -24]}
        intensity={0.36}
        color={STYLE_TOKENS.hero.fillColor}
      />
      <pointLight
        ref={tunnelNearLightLeftRef}
        position={[-4.9, 1.45, 8.6]}
        intensity={0.62}
        color="#ffd2a2"
        distance={18}
      />
      <pointLight
        ref={tunnelNearLightRightRef}
        position={[4.9, 1.45, 8.6]}
        intensity={0.62}
        color="#ffd2a2"
        distance={18}
      />
      <pointLight
        ref={tunnelMidLightRef}
        position={[0, -0.8, -34]}
        intensity={0.2}
        color="#c99767"
        distance={36}
      />
      <pointLight
        ref={portalGlowLightRef}
        position={[0, 0.15, -78]}
        intensity={1.3}
        color={STYLE_TOKENS.hero.portalColor}
      />
      <pointLight
        ref={stadiumRimLightLeftRef}
        position={[-3.1, 1.75, -83.6]}
        intensity={0.16}
        color="#ffd8b0"
      />
      <pointLight
        ref={stadiumRimLightRightRef}
        position={[3.1, 1.75, -83.6]}
        intensity={0.16}
        color="#ffd8b0"
      />
      <pointLight position={[-4.7, 0.9, -56]} intensity={0.72} color="#ffd19a" />
      <pointLight position={[4.7, 0.9, -56]} intensity={0.72} color="#ffd19a" />

      <group position={[0, 0, 8.8]}>
        <mesh position={[0, 2.58, 0]}>
          <boxGeometry args={[12.4, 0.4, 0.42]} />
          <meshStandardMaterial color="#2c1a10" roughness={0.76} metalness={0.22} />
        </mesh>
        <mesh position={[-6.12, 0.08, 0]}>
          <boxGeometry args={[0.44, 5.4, 0.42]} />
          <meshStandardMaterial color="#2b170f" roughness={0.84} metalness={0.18} />
        </mesh>
        <mesh position={[6.12, 0.08, 0]}>
          <boxGeometry args={[0.44, 5.4, 0.42]} />
          <meshStandardMaterial color="#2b170f" roughness={0.84} metalness={0.18} />
        </mesh>
        <mesh position={[-6.04, 0.08, -0.22]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5.2, 5.2]} />
          <meshBasicMaterial
            color="#140d08"
            map={grimeAtlas ?? undefined}
            transparent
            opacity={0.46}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[6.04, 0.08, -0.22]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5.2, 5.2]} />
          <meshBasicMaterial
            color="#140d08"
            map={grimeAtlas ?? undefined}
            transparent
            opacity={0.46}
            depthWrite={false}
          />
        </mesh>
      </group>

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
              color="#2d1f15"
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
              color="#2d1f15"
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

          <mesh position={[0, -2.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, segmentLength * 0.78]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  floorGuideMaterials.current[index] = material
                }
              }}
              color="#f4d4aa"
              transparent
              opacity={0.06}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {index % 2 === 0 ? (
            <>
              <mesh position={[-5.56, 1.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, segmentLength * 0.92, 10]} />
                <meshStandardMaterial
                  ref={(material) => {
                    if (material) {
                      cableMaterials.current[index] = material
                    }
                  }}
                  color="#4a3427"
                  emissive="#20140d"
                  emissiveIntensity={0.05}
                  roughness={0.9}
                  metalness={0.18}
                />
              </mesh>
              <mesh position={[5.56, 1.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, segmentLength * 0.92, 10]} />
                <meshStandardMaterial
                  ref={(material) => {
                    if (material) {
                      cableMaterials.current[index + segmentDepths.length] = material
                    }
                  }}
                  color="#4a3427"
                  emissive="#20140d"
                  emissiveIntensity={0.05}
                  roughness={0.9}
                  metalness={0.18}
                />
              </mesh>
            </>
          ) : null}

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
              <mesh position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8.8, 1.4]} />
                <meshBasicMaterial
                  color="#6e4b30"
                  map={grimeAtlas}
                  transparent
                  opacity={0.05}
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

      <mesh position={[0, 0.14, -83.72]}>
        <planeGeometry args={[8.6, 4.1]} />
        <meshBasicMaterial
          ref={stadiumApertureMaterialRef}
          color="#ffd4a2"
          map={portalGradient ?? radialBurstMask ?? undefined}
          alphaMap={radialBurstMask ?? portalGradient ?? undefined}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
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

      {deviceTier !== 'low' ? (
        <>
          <mesh position={[-2.35, 0.72, -82.98]} rotation={[0.06, 0.28, 0]}>
            <planeGeometry args={[3.1, 5.5]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  stadiumShaftMaterials.current[0] = material
                }
              }}
              color="#ffd6a5"
              map={portalGradient ?? glowTexture ?? undefined}
              alphaMap={portalGradient ?? glowTexture ?? undefined}
              transparent
              opacity={0.08}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[2.35, 0.72, -82.98]} rotation={[0.06, -0.28, 0]}>
            <planeGeometry args={[3.1, 5.5]} />
            <meshBasicMaterial
              ref={(material) => {
                if (material) {
                  stadiumShaftMaterials.current[1] = material
                }
              }}
              color="#ffd6a5"
              map={portalGradient ?? glowTexture ?? undefined}
              alphaMap={portalGradient ?? glowTexture ?? undefined}
              transparent
              opacity={0.08}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      ) : null}

      <mesh position={[0, 0.36, -84.64]}>
        <planeGeometry args={[11.2, 1.5]} />
        <meshBasicMaterial
          ref={stadiumHorizonMaterialRef}
          color="#ffd8aa"
          map={portalGradient ?? undefined}
          alphaMap={portalGradient ?? undefined}
          transparent
          opacity={0.08}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.05, -83.68]}>
        <ringGeometry args={[4.35, 5.42, 48]} />
        <meshBasicMaterial
          ref={stadiumFrameMaterialRef}
          color="#f1be8a"
          map={radialBurstMask ?? portalGradient ?? undefined}
          alphaMap={radialBurstMask ?? portalGradient ?? undefined}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.04, -84.36]}>
        <planeGeometry args={[10.6, 5.6]} />
        <meshBasicMaterial
          ref={portalPhotoMaterialRef}
          map={stadiumTunnelPortal ?? undefined}
          color="#ffdcb8"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={crowdPlateMeshRef} position={[0, -0.2, -83.62]}>
        <planeGeometry args={[10.2, 2.4]} />
        <meshBasicMaterial
          ref={crowdPlateMaterialRef}
          map={stadiumCrowdPlate ?? undefined}
          color="#f8d5ad"
          transparent
          opacity={0.36}
        />
      </mesh>

      <mesh ref={crowdParallaxMeshRef} position={[0, 0.22, -84.95]}>
        <planeGeometry args={[12, 3.1]} />
        <meshBasicMaterial
          ref={crowdParallaxMaterialRef}
          map={stadiumCrowdPlate ?? undefined}
          color="#f8d5ad"
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
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
