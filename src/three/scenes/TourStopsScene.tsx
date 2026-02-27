import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  CatmullRomCurve3,
  Fog,
  MathUtils,
  Vector3,
  type Line,
  type LineBasicMaterial,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'
import type { TourStop } from '../../data/tourStops'
import { projectStopToMapSpace } from '../../data/tourMapProjection'
import { getTextureVariantPath } from '../assets/assetManifest'
import { useOptionalTexture } from '../hooks/useOptionalTexture'

type TourStopsSceneProps = {
  progress: number
  reducedMotion: boolean
  stops: TourStop[]
  activeStopId: string
}

const MAP_WIDTH = 10
const MAP_HEIGHT = 6

export function TourStopsScene({
  progress,
  reducedMotion,
  stops,
  activeStopId,
}: TourStopsSceneProps) {
  const { camera, scene } = useThree()
  const pinRefs = useRef<Mesh[]>([])
  const glowRefs = useRef<MeshBasicMaterial[]>([])
  const routeLineRef = useRef<Line>(null)
  const routeHeadRef = useRef<Mesh>(null)
  const crowdBackdropMaterialRef = useRef<MeshBasicMaterial>(null)
  const crowdBackdropTexture = useOptionalTexture(
    getTextureVariantPath('stadium_crowd_plate', '1k'),
    { srgb: true },
  )

  const projectedStops = useMemo(
    () => stops.map((stop) => projectStopToMapSpace(stop, MAP_WIDTH, MAP_HEIGHT)),
    [stops],
  )

  const routePoints = useMemo(() => {
    if (projectedStops.length < 2) {
      return [] as Vector3[]
    }

    const vectors = projectedStops.map(
      ([x, z]) => new Vector3(x, -1.34, z - 1.1),
    )
    const curve = new CatmullRomCurve3(vectors, false, 'centripetal', 0.5)
    return curve.getPoints(Math.max(80, stops.length * 26))
  }, [projectedStops, stops.length])

  const routePositions = useMemo(() => {
    const data = new Float32Array(routePoints.length * 3)
    for (let index = 0; index < routePoints.length; index += 1) {
      const point = routePoints[index]
      const stride = index * 3
      data[stride] = point?.x ?? 0
      data[stride + 1] = point?.y ?? 0
      data[stride + 2] = point?.z ?? 0
    }
    return data
  }, [routePoints])

  useEffect(() => {
    const previousFog = scene.fog
    scene.fog = new Fog('#070d19', 6, 44)
    return () => {
      scene.fog = previousFog
    }
  }, [scene])

  useEffect(() => {
    const routeLine = routeLineRef.current
    if (!routeLine) {
      return
    }
    routeLine.geometry.setDrawRange(0, Math.min(3, routePositions.length / 3))
  }, [routePositions])

  useFrame((state, delta) => {
    const clamped = MathUtils.clamp(progress, 0, 1)
    const focusDepth = reducedMotion
      ? 0.24
      : MathUtils.smoothstep(clamped, 0.08, 0.82)

    camera.position.x = MathUtils.damp(camera.position.x, 0, 3, delta)
    camera.position.y = MathUtils.damp(
      camera.position.y,
      reducedMotion ? 3.85 : 4.2 - focusDepth * 0.32,
      3,
      delta,
    )
    camera.position.z = MathUtils.damp(
      camera.position.z,
      reducedMotion ? 8 : 8.5 - focusDepth * 0.8,
      2.6,
      delta,
    )
    camera.lookAt(0, -1.2, -1.4)

    const elapsed = state.clock.elapsedTime
    const pulse = reducedMotion ? 0.4 : 0.5 + Math.sin(elapsed * 2.6) * 0.5
    const crowdBackdropOpacity = reducedMotion
      ? 0.22
      : MathUtils.lerp(0.14, 0.34, focusDepth) + pulse * 0.06

    if (crowdBackdropMaterialRef.current) {
      crowdBackdropMaterialRef.current.opacity = MathUtils.clamp(
        crowdBackdropOpacity,
        0.12,
        0.38,
      )
    }

    const activeStopIndex = Math.max(
      0,
      stops.findIndex((stop) => stop.id === activeStopId),
    )
    const activeStopProgress =
      stops.length > 1 ? activeStopIndex / (stops.length - 1) : 0
    const scrollRouteProgress = reducedMotion
      ? activeStopProgress
      : MathUtils.smoothstep(clamped, 0.04, 0.92)
    const routeProgress = Math.max(activeStopProgress, scrollRouteProgress)

    const totalRouteVertices = routePositions.length / 3
    const drawCount = reducedMotion
      ? totalRouteVertices
      : totalRouteVertices > 1
        ? Math.max(
            2,
            Math.floor(MathUtils.lerp(2, totalRouteVertices, routeProgress)),
          )
        : 0

    const routeLine = routeLineRef.current
    if (routeLine) {
      routeLine.geometry.setDrawRange(0, drawCount)
      const lineMaterial = routeLine.material as LineBasicMaterial
      lineMaterial.opacity = reducedMotion
        ? MathUtils.lerp(0.26, 0.46, activeStopProgress)
        : MathUtils.lerp(0.22, 0.82, routeProgress)
    }

    if (!reducedMotion && routeHeadRef.current && drawCount > 1) {
      const routeIndex = Math.min(drawCount - 1, totalRouteVertices - 1)
      const stride = routeIndex * 3
      routeHeadRef.current.visible = true
      routeHeadRef.current.position.set(
        routePositions[stride] ?? 0,
        routePositions[stride + 1] ?? 0,
        routePositions[stride + 2] ?? 0,
      )
      routeHeadRef.current.scale.setScalar(reducedMotion ? 0.85 : 0.9 + pulse * 0.16)
    } else if (routeHeadRef.current) {
      routeHeadRef.current.visible = false
    }

    for (let index = 0; index < stops.length; index += 1) {
      const pin = pinRefs.current[index]
      const glow = glowRefs.current[index]
      const stop = stops[index]

      if (!pin || !stop) {
        continue
      }

      const isActive = stop.id === activeStopId
      const targetScale = isActive ? 1.25 : 1
      pin.scale.y = MathUtils.damp(pin.scale.y, targetScale, 4.2, delta)

      if (glow) {
        const baseOpacity = isActive ? 0.36 : 0.14
        const pulseBoost = isActive ? pulse * 0.34 : pulse * 0.1
        glow.opacity = reducedMotion ? baseOpacity : baseOpacity + pulseBoost
        glow.color.set(isActive ? '#7fd1ff' : '#6ca6d8')
      }
    }
  })

  return (
    <group>
      <ambientLight intensity={0.33} />
      <pointLight position={[0, 3.4, 2.2]} intensity={1.2} color="#8ec8ff" />
      <pointLight position={[-4.6, 1.8, -3]} intensity={0.6} color="#6eaee4" />

      <mesh position={[0, -0.56, -4.9]}>
        <planeGeometry args={[13.6, 6.2]} />
        <meshBasicMaterial
          ref={crowdBackdropMaterialRef}
          map={crowdBackdropTexture ?? undefined}
          color="#7db7e6"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -1.1]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshStandardMaterial
          color="#122338"
          roughness={0.88}
          metalness={0.06}
          emissive="#0d1d32"
          emissiveIntensity={0.25}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.59, -1.1]}>
        <ringGeometry args={[3.1, 4.68, 96]} />
        <meshBasicMaterial color="#4f8bc0" transparent opacity={0.2} />
      </mesh>

      {routePositions.length > 0 ? (
        <>
          <line
            ref={(node) => {
              routeLineRef.current = node as unknown as Line | null
            }}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[routePositions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#75c0f3" transparent opacity={0.5} />
          </line>
          <mesh ref={routeHeadRef} visible={false}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial
              color="#dbf4ff"
              emissive="#84cbff"
              emissiveIntensity={0.9}
            />
          </mesh>
        </>
      ) : null}

      {projectedStops.map(([x, z], index) => {
        const stop = stops[index]
        if (!stop) {
          return null
        }

        return (
          <group key={stop.id} position={[x, -1.48, z - 1.1]}>
            <mesh
              ref={(node) => {
                if (node) {
                  pinRefs.current[index] = node
                }
              }}
            >
              <cylinderGeometry args={[0.05, 0.05, 0.42, 18]} />
              <meshStandardMaterial
                color="#a7dbff"
                emissive="#5faedf"
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, 0.29, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color="#dff2ff"
                emissive="#83ccff"
                emissiveIntensity={0.65}
              />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.11, 0.24, 24]} />
              <meshBasicMaterial
                ref={(material) => {
                  if (material) {
                    glowRefs.current[index] = material
                  }
                }}
                color="#72b8ea"
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
