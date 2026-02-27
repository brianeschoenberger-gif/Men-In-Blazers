import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_BEATS, getCurrentBeat } from '../config/heroTransitionBeats'
import { Section } from '../components/layout/Section'
import { CTAButton } from '../components/ui/CTAButton'

gsap.registerPlugin(ScrollTrigger)

type HeroSectionProps = {
  reducedMotion: boolean
  onProgress: (value: number) => void
}

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

export function HeroSection({ reducedMotion, onProgress }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const [localProgress, setLocalProgress] = useState(0)

  const beat = useMemo(
    () => getCurrentBeat(HERO_BEATS, localProgress),
    [localProgress],
  )

  const overlayStyle = useMemo(
    () => {
      const openingReveal = reducedMotion
        ? 1
        : smoothstep(Math.min(Math.max(localProgress, 0), 1), 0.06, 0.32)

      return {
        '--hero-overlay-opacity': reducedMotion
          ? '0.74'
          : (0.44 + Math.min(Math.max(localProgress, 0), 1) * 0.24).toFixed(3),
        '--hero-copy-opacity': (0.58 + openingReveal * 0.42).toFixed(3),
        '--hero-kicker-opacity': (0.52 + openingReveal * 0.48).toFixed(3),
        '--hero-cta-opacity': (0.46 + openingReveal * 0.54).toFixed(3),
      } as CSSProperties
    },
    [localProgress, reducedMotion],
  )

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: reducedMotion ? '+=80%' : '+=220%',
      pin: !reducedMotion,
      scrub: reducedMotion ? false : 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        onProgress(self.progress)
        setLocalProgress(self.progress)
      },
      onLeaveBack: () => {
        onProgress(0)
        setLocalProgress(0)
      },
      onLeave: () => {
        onProgress(1)
        setLocalProgress(1)
      },
    })

    return () => {
      trigger.kill()
      onProgress(0)
      setLocalProgress(0)
    }
  }, [onProgress, reducedMotion])

  useLayoutEffect(() => {
    if (reducedMotion || !overlayRef.current) {
      return
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
      timeline
        .fromTo(
          overlayRef.current,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
        )
        .fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 24, letterSpacing: '0.08em' },
          { autoAlpha: 1, y: 0, letterSpacing: '0.02em', duration: 0.76 },
          '-=0.45',
        )
        .fromTo(
          subtitleRef.current,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          '-=0.38',
        )
        .fromTo(
          '.cta-button',
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.08 },
          '-=0.3',
        )
    }, overlayRef)

    return () => context.revert()
  }, [reducedMotion])

  return (
    <Section id="hero" className="section--hero" ref={sectionRef}>
      <div
        className="hero-overlay"
        ref={overlayRef}
        style={overlayStyle}
        data-hero-beat={beat.id}
      >
        <p className="eyebrow">Men in Blazers</p>
        <p className="hero-kicker">Matchweek Opening Sequence</p>
        <h1 className="hero-title" ref={titleRef}>
          Tunnel to Pitch
        </h1>
        <p className="hero-subtitle" ref={subtitleRef}>
          Football is ritual, identity, and shared memory. Walk into the light.
        </p>
        <div className="hero-meta" aria-label="intro metadata">
          <span>Episode 01</span>
          <span aria-hidden>&bull;</span>
          <span>{beat.label}</span>
        </div>
        <div className="cta-row">
          <CTAButton variant="primary">Watch</CTAButton>
          <CTAButton variant="secondary">Listen</CTAButton>
        </div>
      </div>
    </Section>
  )
}
