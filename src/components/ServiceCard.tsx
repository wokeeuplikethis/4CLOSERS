'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const durationLabel =
    service.duration >= 60
      ? `${Math.floor(service.duration / 60)} ч${service.duration % 60 ? ` ${service.duration % 60} мин` : ''}`
      : `${service.duration} мин`

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-5 rounded-lg p-6 lg:p-7',
        'bg-slate border border-ash hover:border-signal',
        'transition-colors duration-300'
      )}
    >
      {/* Номер услуги сверху слева */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40">
          {durationLabel}
        </span>
      </div>

      <div>
        <h3 className="font-display text-lg text-bone group-hover:text-signal transition-colors">
          {service.name}
        </h3>
        <p className="mt-2 text-[13px] leading-snug text-bone/55 max-w-[44ch]">
          {service.description}
        </p>
      </div>

      {/* Фичи */}
      {service.features.length > 0 && (
        <ul className="space-y-1.5">
          {service.features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="text-[13px] text-bone/60 leading-snug flex items-baseline gap-2"
            >
              <span className="text-signal/60 select-none">—</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Цена и кнопка */}
      <div className="mt-auto pt-4 border-t border-ash flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-2xl text-signal tracking-[-0.02em]">
            {service.price.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <Link
          href="/bookings"
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-4
                     border border-ash hover:border-signal
                     text-xs text-bone/70 hover:text-bone
                     transition-colors duration-200
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          aria-label={`Записаться на ${service.name}`}
        >
          Записаться
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}