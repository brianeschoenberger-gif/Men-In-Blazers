import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TRANSITION_BEATS, getCurrentBeat } from '../config/heroTransitionBeats'
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
  const beat = useMemo(() => getCurrentBeat(TRANSITION_BEATS, clamped), [clamped])

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
      <div
        className="transition-state"
        data-transition-beat={beat.id}
        data-transition-energy={energyMeter.toFixed(3)}
        aria-hidden
      />
    </Section>
  )
}
