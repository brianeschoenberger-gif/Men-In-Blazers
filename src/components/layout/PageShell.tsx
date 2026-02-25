import { Suspense, lazy, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { HeroSection } from '../../sections/HeroSection'
import { TransitionSection } from '../../sections/TransitionSection'
import { PlaceholderNextSection } from '../../sections/PlaceholderNextSection'
import { useReducedMotion } from '../../three/hooks/useReducedMotion'
import { useDeviceTier } from '../../three/hooks/useDeviceTier'

const HeroScene = lazy(async () => {
  const module = await import('../../three/scenes/HeroScene')
  return { default: module.HeroScene }
})

const TransitionScene = lazy(async () => {
  const module = await import('../../three/scenes/TransitionScene')
  return { default: module.TransitionScene }
})

export function PageShell() {
  const reducedMotion = useReducedMotion()
  const deviceTier = useDeviceTier()
  const [heroProgress, setHeroProgress] = useState(0)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const pageProgress =
    transitionProgress > 0.001
      ? 0.64 + transitionProgress * 0.36
      : heroProgress * 0.64

  const activeScene = useMemo(() => {
    if (transitionProgress > 0.001) {
      return (
        <TransitionScene
          progress={transitionProgress}
          reducedMotion={reducedMotion}
          particleMultiplier={deviceTier.particleMultiplier}
        />
      )
    }

    return (
      <HeroScene
        progress={heroProgress}
        reducedMotion={reducedMotion}
        deviceTier={deviceTier.tier}
        allowPointerDrift={!deviceTier.isMobile}
        particleMultiplier={deviceTier.particleMultiplier}
      />
    )
  }, [
    deviceTier.isMobile,
    deviceTier.particleMultiplier,
    deviceTier.tier,
    heroProgress,
    reducedMotion,
    transitionProgress,
  ])

  return (
    <div
      className="page-shell"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      data-device-tier={deviceTier.tier}
      data-mobile={deviceTier.isMobile ? 'true' : 'false'}
      data-particle-multiplier={deviceTier.particleMultiplier.toFixed(2)}
    >
      <div className="progress-rail" aria-hidden>
        <span
          className="progress-rail__fill"
          style={{ transform: `scaleX(${pageProgress})` }}
        />
      </div>
      <div className="canvas-shell" aria-hidden>
        <Canvas
          dpr={[1, deviceTier.dprCap]}
          camera={{ fov: 48, position: [0, 1.1, 11.5], near: 0.1, far: 180 }}
          gl={{
            antialias: deviceTier.tier !== 'low',
            powerPreference: 'high-performance',
          }}
        >
          <color attach="background" args={['#05070d']} />
          <Suspense fallback={null}>{activeScene}</Suspense>
        </Canvas>
      </div>

      <main className="sections-shell">
        <HeroSection reducedMotion={reducedMotion} onProgress={setHeroProgress} />
        <TransitionSection
          reducedMotion={reducedMotion}
          onProgress={setTransitionProgress}
        />
        <PlaceholderNextSection />
      </main>
    </div>
  )
}
