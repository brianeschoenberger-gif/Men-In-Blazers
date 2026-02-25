import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Section } from '../components/layout/Section'
import { CTAButton } from '../components/ui/CTAButton'

gsap.registerPlugin(ScrollTrigger)

type HeroSectionProps = {
  reducedMotion: boolean
  onProgress: (value: number) => void
}

export function HeroSection({ reducedMotion, onProgress }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

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
      onUpdate: (self) => onProgress(self.progress),
      onLeaveBack: () => onProgress(0),
      onLeave: () => onProgress(1),
    })

    return () => {
      trigger.kill()
      onProgress(0)
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
      <div className="hero-overlay" ref={overlayRef}>
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
          <span>Scroll to enter</span>
        </div>
        <div className="cta-row">
          <CTAButton variant="primary">Watch</CTAButton>
          <CTAButton variant="secondary">Listen</CTAButton>
        </div>
      </div>
    </Section>
  )
}
