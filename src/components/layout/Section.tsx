import { forwardRef, type PropsWithChildren } from 'react'

type SectionProps = PropsWithChildren<{
  id: string
  className?: string
}>

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { id, className, children },
  ref,
) {
  const classes = ['section', className].filter(Boolean).join(' ')
  return (
    <section id={id} className={classes} ref={ref}>
      {children}
    </section>
  )
})
