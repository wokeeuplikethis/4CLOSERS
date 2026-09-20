'use client'

import { cn } from '@/lib/utils'
import type { EquipmentItem } from '@/types'

export function EquipmentCard({ item }: { item: EquipmentItem }) {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg',
        'bg-slate border border-ash hover:border-signal',
        'transition-colors duration-300'
      )}
    >
      {/* Картинка */}
      <div className="aspect-[4/3] border-b border-ash overflow-hidden relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-void">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/25">
              нет фото
            </span>
          </div>
        )}
      </div>

      {/* Текст */}
      <div className="flex flex-col gap-2 p-5 flex-1">
        <h4 className="font-display text-base text-bone group-hover:text-signal transition-colors">
          {item.name}
        </h4>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40">
          {item.model}
        </span>
        {item.description && (
          <p className="text-[13px] leading-snug text-bone/60 mt-1">
            {item.description}
          </p>
        )}
      </div>
    </article>
  )
}