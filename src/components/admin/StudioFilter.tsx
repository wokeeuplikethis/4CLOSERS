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
      className="inline-grid grid-cols-3 items-center gap-1 bg-bone/[0.04] border border-ash rounded-full p-1"
    >
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
              'inline-flex h-8 items-center justify-center rounded-full px-4',
              'font-mono uppercase text-[10px] tracking-[0.14em] whitespace-nowrap',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
              isActive ? 'bg-bone text-void' : 'text-bone/50 hover:text-bone/80'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
