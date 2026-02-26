import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Section } from '../components/layout/Section'
import type { FeaturedStory } from '../data/featuredStories'

gsap.registerPlugin(ScrollTrigger)

type FeaturedStoriesSectionProps = {
  reducedMotion: boolean
  onProgress: (value: number) => void
  stories: FeaturedStory[]
  activeStoryId: string
  onHighlightStory: (storyId: string) => void
}

export function FeaturedStoriesSection({
  reducedMotion,
  onProgress,
  stories,
  activeStoryId,
  onHighlightStory,
}: FeaturedStoriesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeStoryId) ?? stories[0],
    [activeStoryId, stories],
  )

  const activeIndex = useMemo(() => {
    if (!activeStory) {
      return 0
    }
    return stories.findIndex((story) => story.id === activeStory.id)
  }, [activeStory, stories])

  const overlayStyle = useMemo(
    () =>
      ({
        '--featured-active-index': `${Math.max(activeIndex, 0)}`,
      }) as CSSProperties,
    [activeIndex],
  )

  const handleCardHover = (event: MouseEvent<HTMLElement>) => {
    const storyId = event.currentTarget.getAttribute('data-story-id')
    if (storyId) {
      onHighlightStory(storyId)
    }
  }

  const handleCardFocus = (event: FocusEvent<HTMLElement>) => {
    const storyId = event.currentTarget.getAttribute('data-story-id')
    if (storyId) {
      onHighlightStory(storyId)
    }
  }

  const handleCardPointerDown = (event: PointerEvent<HTMLElement>) => {
    const storyId = event.currentTarget.getAttribute('data-story-id')
    if (storyId) {
      onHighlightStory(storyId)
    }
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: reducedMotion ? false : 0.6,
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
    const section = sectionRef.current
    if (!section) {
      return
    }

    const cards = cardRefs.current.filter(
      (card): card is HTMLElement => card !== null,
    )

    section.dataset.entryMotion = reducedMotion ? 'static' : 'stagger'
    if (cards.length === 0) {
      return
    }

    if (reducedMotion) {
      section.dataset.entryReveal = 'complete'
      gsap.set(cards, { clearProps: 'opacity,visibility,transform' })
      return
    }

    section.dataset.entryReveal = 'pending'
    const context = gsap.context(() => {
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          onComplete: () => {
            section.dataset.entryReveal = 'complete'
          },
          scrollTrigger: {
            trigger: section,
            start: 'top 74%',
            once: true,
          },
        },
      )
    }, section)

    return () => {
      context.revert()
    }
  }, [reducedMotion, stories.length])

  return (
    <Section id="featured-stories" className="section--featured" ref={sectionRef}>
      <div className="featured-overlay" style={overlayStyle}>
        <p className="eyebrow">Milestone 4</p>
        <h2 className="featured-title">Featured Stories</h2>
        <p className="featured-subtitle">
          Discover stories, shows, and supporter culture moments orbiting every
          matchweek.
        </p>

        <div className="featured-grid" role="list" aria-label="featured stories">
          {stories.map((story, index) => (
            <article
              key={story.id}
              role="listitem"
              className={[
                'featured-card',
                story.id === activeStory?.id ? 'featured-card--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-story-id={story.id}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              onMouseEnter={handleCardHover}
              onFocus={handleCardFocus}
              onPointerDown={handleCardPointerDown}
              tabIndex={-1}
            >
              <p className="featured-card__category">{story.category}</p>
              <h3>{story.title}</h3>
              <p>{story.dek}</p>
              <a
                className="featured-card__cta"
                href={`/stories/${story.slug}`}
                onFocus={() => onHighlightStory(story.id)}
              >
                Read Story
              </a>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
