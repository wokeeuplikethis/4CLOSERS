'use client'

import { cn } from '@/lib/utils'

/* ─── Общий компонент иконок-ссылок ─── */

interface LinkItem {
  href: string | null | undefined
  label: string
  /** Simple Icons slug: 'telegram', 'vk', 'instagram', 'spotify', 'yandex' */
  icon: string
  /** HEX без # — цвет иконки. По умолчанию 'FFFFFF' (белый). */
  color?: string
}

interface SocialLinksProps {
  links: LinkItem[]
  size?: 'sm' | 'md'
  className?: string
}

export function SocialLinks({ links, size = 'md', className }: SocialLinksProps) {
  const filtered = links.filter((l) => l.href)

  if (filtered.length === 0) return null

  const btn = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {filtered.map((l) => (
        <a
          key={l.label}
          href={l.href!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={cn(
            'inline-flex items-center justify-center rounded-md',
            btn,
            'border border-ash bg-void/40',
            'hover:border-signal transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.simpleicons.org/${l.icon}/${l.color ?? 'FFFFFF'}`}
            alt=""
            className={cn(icon, 'object-contain')}
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              const parent = el.parentElement
              if (parent && !parent.querySelector('span')) {
                const span = document.createElement('span')
                span.className = 'font-mono text-[10px] uppercase text-bone/60'
                span.textContent = l.label.charAt(0).toUpperCase()
                parent.appendChild(span)
              }
            }}
          />
        </a>
      ))}
    </div>
  )
}

/* ─── Обёртка для стримингов трека ─── */

interface StreamingLinksProps {
  yandex?: string | null
  vk?: string | null
  spotify?: string | null
  className?: string
}

export function StreamingLinks({ yandex, vk, spotify, className }: StreamingLinksProps) {
  return (
    <SocialLinks
      className={className}
      size="md"
      links={[
        { href: yandex, label: 'Яндекс.Музыка', icon: 'yandex', color: 'FFFFFF' },
        { href: vk, label: 'ВК Музыка', icon: 'vk', color: 'FFFFFF' },
        { href: spotify, label: 'Spotify', icon: 'spotify', color: 'FFFFFF' },
      ]}
    />
  )
}