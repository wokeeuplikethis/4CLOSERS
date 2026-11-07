'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'section' | 'article' | 'li'
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as any}
      className={cn(
        'will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-800 ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        shown ? 'opacity-100 blur-0' : 'opacity-0 blur-[8px]',
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transform: shown ? 'translateY(0) scale(1)' : `translateY(${y}px) scale(0.985)`,
        filter: shown ? 'blur(0)' : 'blur(8px)',
      }}
    >
      {children}
    </Tag>
  )
}