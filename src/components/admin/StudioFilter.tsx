'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Value = 'all' | 'moscow' | 'spb'

const OPTIONS: { value: Value; label: string }[] = [
  { value: 'all', label: 'все' },
  { value: 'moscow', label: 'мск' },
  { value: 'spb', label: 'спб' },
]

export function StudioFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get('studio') ?? 'all') as Value

  function setValue(value: Value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('studio')
    } else {
      params.set('studio', value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      role="tablist"
      aria-label="Фильтр по студии"
      className="relative inline-grid grid-cols-3 items-center bg-bone/[0.04] border border-ash rounded-full p-1 h-10"
      style={{ minWidth: '220px' }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-full bg-bone transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]"
        style={{
          width: 'calc(33.333% - 0.25rem)',
          transform: `translateX(calc(${OPTIONS.findIndex((o) => o.value === current)} * 100%))`,
        }}
      />

      {OPTIONS.map((o) => {
        const isActive = o.value === current
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setValue(o.value)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center rounded-full h-full px-3',
              'font-mono uppercase text-[10px] tracking-[0.14em]',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
              isActive ? 'text-void' : 'text-bone/50 hover:text-bone/80'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}