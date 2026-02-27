import { Suspense, lazy, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { resolveVisualProfile } from '../../config/visualProfiles'
import { ScenePostFx } from '../../three/postfx/ScenePostFx'
import { HeroSection } from '../../sections/HeroSection'
import { TransitionSection } from '../../sections/TransitionSection'
import { TourStopsSection } from '../../sections/TourStopsSection'
import { FeaturedStoriesSection } from '../../sections/FeaturedStoriesSection'
import { PlaceholderNextSection } from '../../sections/PlaceholderNextSection'
import { useReducedMotion } from '../../three/hooks/useReducedMotion'
import { useDeviceTier } from '../../three/hooks/useDeviceTier'
import { tourStops } from '../../data/tourStops'
import { featuredStories } from '../../data/featuredStories'

const HeroScene = lazy(async () => {
  const module = await import('../../three/scenes/HeroScene')
  return { default: module.HeroScene }
})

const TransitionScene = lazy(async () => {
  const module = await import('../../three/scenes/TransitionScene')
  return { default: module.TransitionScene }
})

const TourStopsScene = lazy(async () => {
  const module = await import('../../three/scenes/TourStopsScene')
  return { default: module.TourStopsScene }
})

const FeaturedStoriesScene = lazy(async () => {
  const module = await import('../../three/scenes/FeaturedStoriesScene')
  return { default: module.FeaturedStoriesScene }
})

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function smoothstep(value: number, edge0: number, edge1: number) {
  if (edge1 <= edge0) {
    return value >= edge1 ? 1 : 0
  }

  const normalized = clamp01((value - edge0) / (edge1 - edge0))
  return normalized * normalized * (3 - 2 * normalized)
}

export function PageShell() {
  const reducedMotion = useReducedMotion()
  const deviceTier = useDeviceTier()
  const polishV2Enabled =
    import.meta.env.VITE_HERO_TRANSITION_POLISH_V2 !== 'false'
  const [heroProgress, setHeroProgress] = useState(0)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [tourStopsProgress, setTourStopsProgress] = useState(0)
  const [featuredStoriesProgress, setFeaturedStoriesProgress] = useState(0)
  const [activeTourStopId, setActiveTourStopId] = useState<string>(
    tourStops[0]?.id ?? '',
  )
  const [activeFeaturedStoryId, setActiveFeaturedStoryId] = useState<string>(
    featuredStories[0]?.id ?? '',
  )

  const pageProgress =
    featuredStoriesProgress > 0.001
      ? 0.78 + featuredStoriesProgress * 0.22
      : tourStopsProgress > 0.001
        ? 0.54 + tourStopsProgress * 0.24
        : transitionProgress > 0.001
          ? 0.32 + transitionProgress * 0.22
          : heroProgress * 0.32

  const highlightedFeaturedIndex = Math.max(
    0,
    featuredStories.findIndex((story) => story.id === activeFeaturedStoryId),
  )

  const visualProfile = useMemo(
    () =>
      resolveVisualProfile({
        tier: deviceTier.tier,
        reducedMotion,
        isMobile: deviceTier.isMobile,
        polishV2Enabled,
      }),
    [deviceTier.isMobile, deviceTier.tier, polishV2Enabled, reducedMotion],
  )

  const activePhase =
    featuredStoriesProgress > 0.001
      ? 'featured'
      : tourStopsProgress > 0.001
        ? 'tour'
        : transitionProgress > 0.001
          ? 'transition'
          : 'hero'

  const postFxSection =
    activePhase === 'hero' || activePhase === 'transition'
      ? activePhase
      : 'none'

  const postFxProgress =
    activePhase === 'hero'
      ? heroProgress
      : activePhase === 'transition'
        ? transitionProgress
        : 0

  const postFxEnabled =
    polishV2Enabled &&
    !reducedMotion &&
    deviceTier.allowPostFx &&
    visualProfile.allowPostFx &&
    postFxSection !== 'none'

  const phaseFlashOpacity = useMemo(() => {
    if (reducedMotion) {
      return 0
    }

    if (activePhase === 'hero') {
      const heroFlash = smoothstep(heroProgress, 0.91, 1)
      return clamp01(heroFlash * 0.94)
    }

    if (activePhase === 'transition') {
      const transitionFlash = 1 - smoothstep(transitionProgress, 0.01, 0.24)
      return clamp01(transitionFlash * 0.9)
    }

    return 0
  }, [activePhase, heroProgress, reducedMotion, transitionProgress])

  const activeScene = useMemo(() => {
    if (featuredStoriesProgress > 0.001) {
      return (
        <FeaturedStoriesScene
          progress={featuredStoriesProgress}
          reducedMotion={reducedMotion}
          storyCount={featuredStories.length}
          highlightedIndex={highlightedFeaturedIndex}
          deviceTier={deviceTier.tier}
        />
      )
    }

    if (tourStopsProgress > 0.001) {
      return (
        <TourStopsScene
          progress={tourStopsProgress}
          reducedMotion={reducedMotion}
          stops={tourStops}
          activeStopId={activeTourStopId}
        />
      )
    }

    if (transitionProgress > 0.001) {
      return (
        <TransitionScene
          progress={transitionProgress}
          reducedMotion={reducedMotion}
          visualProfile={visualProfile}
        />
      )
    }

    return (
      <HeroScene
        progress={heroProgress}
        reducedMotion={reducedMotion}
        deviceTier={deviceTier.tier}
        allowPointerDrift={!deviceTier.isMobile}
        visualProfile={visualProfile}
      />
    )
  }, [
    deviceTier.isMobile,
    deviceTier.tier,
    activeTourStopId,
    featuredStoriesProgress,
    highlightedFeaturedIndex,
    heroProgress,
    reducedMotion,
    tourStopsProgress,
    transitionProgress,
    visualProfile,
  ])

  return (
    <div
      className="page-shell"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      data-device-tier={deviceTier.tier}
      data-mobile={deviceTier.isMobile ? 'true' : 'false'}
      data-particle-multiplier={deviceTier.particleMultiplier.toFixed(2)}
      data-polish-v2={polishV2Enabled ? 'true' : 'false'}
      data-postfx={postFxEnabled ? 'true' : 'false'}
      data-active-phase={activePhase}
    >
      <div className="progress-rail" aria-hidden>
        <span
          className="progress-rail__fill"
          style={{ transform: `scaleX(${pageProgress})` }}
        />
      </div>
      <div
        className="phase-flash"
        aria-hidden
        style={{ opacity: phaseFlashOpacity }}
      />
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
          <Suspense fallback={null}>
            {activeScene}
            <ScenePostFx
              enabled={postFxEnabled}
              section={postFxSection}
              progress={postFxProgress}
              profile={visualProfile}
            />
          </Suspense>
        </Canvas>
      </div>

      <main className="sections-shell">
        <HeroSection reducedMotion={reducedMotion} onProgress={setHeroProgress} />
        <TransitionSection
          reducedMotion={reducedMotion}
          onProgress={setTransitionProgress}
        />
        <TourStopsSection
          reducedMotion={reducedMotion}
          onProgress={setTourStopsProgress}
          stops={tourStops}
          activeStopId={activeTourStopId}
          onSelectStop={setActiveTourStopId}
        />
        <FeaturedStoriesSection
          reducedMotion={reducedMotion}
          onProgress={setFeaturedStoriesProgress}
          stories={featuredStories}
          activeStoryId={activeFeaturedStoryId}
          onHighlightStory={setActiveFeaturedStoryId}
        />
        <PlaceholderNextSection />
      </main>
    </div>
  )
}
