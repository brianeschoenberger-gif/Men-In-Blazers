import { Section } from '../components/layout/Section'

export function PlaceholderNextSection() {
  return (
    <Section id="next" className="section--next">
      <div className="placeholder-card">
        <p className="eyebrow">Next Milestone</p>
        <h2>Tour Stops Map Placeholder</h2>
        <p>
          This is the handoff target from Transition. Milestone 3 will introduce
          pinned US map pins, route animation, and local guides.
        </p>
      </div>
    </Section>
  )
}

