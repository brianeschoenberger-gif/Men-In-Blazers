import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type CTAButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
  }
>

export function CTAButton({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...rest
}: CTAButtonProps) {
  const classes = ['cta-button', `cta-button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}

