import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Section } from '../components/layout/Section'
import type { TourStop } from '../data/tourStops'
import { projectStopToPercent } from '../data/tourMapProjection'

gsap.registerPlugin(ScrollTrigger)

type TourStopsSectionProps = {
  reducedMotion: boolean
  onProgress: (value: number) => void
  stops: TourStop[]
  activeStopId: string
  onSelectStop: (stopId: string) => void
}

export function TourStopsSection({
  reducedMotion,
  onProgress,
  stops,
  activeStopId,
  onSelectStop,
}: TourStopsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const activeStopRef = useRef(activeStopId)

  useEffect(() => {
    activeStopRef.current = activeStopId
  }, [activeStopId])

  const activeStop = useMemo(
    () => stops.find((stop) => stop.id === activeStopId) ?? stops[0],
    [activeStopId, stops],
  )

  const mappedStops = useMemo(
    () =>
      stops.map((stop) => ({
        stop,
        ...projectStopToPercent(stop),
      })),
    [stops],
  )

  const selectStop = (stopId: string) => {
    activeStopRef.current = stopId
    onSelectStop(stopId)

    if (reducedMotion || stops.length < 2) {
      return
    }

    const trigger = triggerRef.current
    if (!trigger) {
      return
    }

    const stopIndex = stops.findIndex((stop) => stop.id === stopId)
    if (stopIndex < 0) {
      return
    }

    const stopProgress = stopIndex / Math.max(stops.length - 1, 1)
    const targetScroll =
      trigger.start + (trigger.end - trigger.start) * stopProgress
    trigger.scroll(targetScroll)
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: reducedMotion ? '+=70%' : '+=160%',
      pin: !reducedMotion,
      scrub: reducedMotion ? false : 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        onProgress(self.progress)
        if (stops.length === 0) {
          return
        }

        if (reducedMotion) {
          return
        }

        const stopIndex = Math.round(self.progress * (stops.length - 1))
        const stopId = stops[stopIndex]?.id
        if (!stopId || stopId === activeStopRef.current) {
          return
        }
        activeStopRef.current = stopId
        onSelectStop(stopId)
      },
      onLeaveBack: () => {
        onProgress(0)
        if (reducedMotion) {
          return
        }
        const firstStop = stops[0]
        if (firstStop && firstStop.id !== activeStopRef.current) {
          activeStopRef.current = firstStop.id
          onSelectStop(firstStop.id)
        }
      },
      onLeave: () => {
        onProgress(1)
        if (reducedMotion) {
          return
        }
        const lastStop = stops[stops.length - 1]
        if (lastStop && lastStop.id !== activeStopRef.current) {
          activeStopRef.current = lastStop.id
          onSelectStop(lastStop.id)
        }
      },
    })
    triggerRef.current = trigger

    return () => {
      trigger.kill()
      triggerRef.current = null
      onProgress(0)
    }
  }, [onProgress, onSelectStop, reducedMotion, stops])

  return (
    <Section id="tour-stops" className="section--tour-stops" ref={sectionRef}>
      <div className="tour-overlay">
        <p className="eyebrow">Milestone 3</p>
        <h2 className="tour-title">Tour Stops</h2>
        <p className="tour-subtitle">
          Pinned US map scaffold with anchor points and local guide routing.
        </p>

        <div className="tour-map-shell" aria-label="tour stop map">
          <div className="tour-map-grid" aria-hidden />
          {mappedStops.map(({ stop, xPercent, yPercent }, index) => (
            <button
              key={stop.id}
              type="button"
              className={[
                'tour-map-pin',
                stop.id === activeStop?.id ? 'tour-map-pin--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${xPercent.toFixed(2)}%`,
                top: `${yPercent.toFixed(2)}%`,
              }}
              onClick={() => selectStop(stop.id)}
              aria-label={`${stop.city} ${stop.dateLabel}`}
            >
              <span aria-hidden>{index + 1}</span>
            </button>
          ))}
        </div>

        <div className="tour-chip-row" role="list" aria-label="tour stop chips">
          {stops.map((stop) => (
            <button
              key={stop.id}
              type="button"
              className={[
                'tour-chip',
                stop.id === activeStop?.id ? 'tour-chip--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => selectStop(stop.id)}
            >
              <span>{stop.city}</span>
              <span>{stop.dateLabel}</span>
            </button>
          ))}
        </div>

        {activeStop ? (
          <article className="tour-panel" aria-live="polite">
            <p className="tour-panel__eyebrow">{activeStop.dateLabel}</p>
            <h3>{activeStop.city}</h3>
            <p>{activeStop.venue}</p>
            <p className="tour-panel__teaser">{activeStop.teaser}</p>
            <p className="tour-panel__note">Guide route is a placeholder path.</p>
            <a
              className="cta-button cta-button--primary tour-panel__cta"
              href={`/guides/${activeStop.slug}`}
            >
              See Local Guide
            </a>
          </article>
        ) : null}
      </div>
    </Section>
  )
}
