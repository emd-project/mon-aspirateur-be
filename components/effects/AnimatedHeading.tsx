// AnimatedHeading — H1 cinétique avec clip-text dégradé
// CSS @keyframes uniquement, pas de Framer Motion above-fold
// prefers-reduced-motion respecté via globals.css

import type { ElementType } from 'react'

type AnimatedHeadingProps = {
  text: string
  as?: ElementType
  className?: string
  variant?: 'home' | 'article' | 'default'
  animationDelay?: string
}

export default function AnimatedHeading({
  text,
  as: Tag = 'h1',
  className = '',
  variant = 'home',
  animationDelay = '0s',
}: AnimatedHeadingProps) {
  const variantClass =
    variant === 'home'
      ? 'typo-h1-home'
      : variant === 'article'
        ? 'typo-h1-article'
        : ''

  return (
    <Tag
      className={`animate-fade-up ${variantClass} ${className}`}
      style={{ animationDelay }}
    >
      {text}
    </Tag>
  )
}
