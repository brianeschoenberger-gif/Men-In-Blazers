import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Section } from '../components/layout/Section'

gsap.registerPlugin(ScrollTrigger)

type TransitionSectionProps = {
  reducedMotion: boolean
  onProgress: (value: number) => void
}

export function TransitionSection({
  reducedMotion,
  onProgress,
}: TransitionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const clamped = Math.min(Math.max(progress, 0), 1)

  const energyMeter = useMemo(() => {
    if (reducedMotion) {
      return 0.22
    }
    if (clamped <= 0.64) {
      return clamped / 0.64
    }
    const settle = (clamped - 0.64) / 0.36
    return 1 - settle * 0.55
  }, [clamped, reducedMotion])

  const meterStyle = useMemo(
    () => ({ '--energy-level': energyMeter.toFixed(3) }) as CSSProperties,
    [energyMeter],
  )

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: reducedMotion ? '+=40%' : '+=120%',
      pin: !reducedMotion,
      scrub: reducedMotion ? false : 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        onProgress(self.progress)
        setProgress(self.progress)
      },
      onLeaveBack: () => {
        onProgress(0)
        setProgress(0)
      },
      onLeave: () => {
        onProgress(1)
        setProgress(1)
      },
    })

    return () => {
      trigger.kill()
      onProgress(0)
      setProgress(0)
    }
  }, [onProgress, reducedMotion])

  return (
    <Section id="transition" className="section--transition" ref={sectionRef}>
      <div className="transition-overlay" style={meterStyle}>
        <p className="eyebrow">Transition</p>
        <h2 className="transition-title">Crowd Energy Surge</h2>
        <p className="transition-subtitle">
          Intensity rises, then settles into a calm ambient handoff.
        </p>
        <div className="transition-meter" aria-hidden>
          <span className="transition-meter__bar" />
          <span className="transition-meter__bar" />
          <span className="transition-meter__bar" />
          <span className="transition-meter__bar" />
          <span className="transition-meter__bar" />
        </div>
      </div>
    </Section>
  )
}
