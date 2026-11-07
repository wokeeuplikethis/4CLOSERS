'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Room } from '@/types'

export function RoomCard({
  room,
  selected,
  onSelect,
}: {
  room: Room
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Выбрать помещение ${room.name}`}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-all duration-200',
        selected
          ? 'border-signal bg-signal/[0.06] ring-1 ring-signal/40'
          : 'border-ash bg-transparent hover:border-bone/30 hover:bg-ash/10'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-void">
        {room.image ? (
          <img
            src={room.image}
            alt={room.name}
            className={cn(
              'h-full w-full object-cover transition-all duration-300',
              selected ? 'opacity-90' : 'opacity-70 group-hover:opacity-90'
            )}
          />
        ) : (
          // Нет фото — нейтральная заглушка вместо битой картинки.
          <div className="h-full w-full bg-slate" aria-hidden="true" />
        )}

        {/* Тёмный градиент снизу — под заголовок */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="font-display text-xl font-light tracking-[-0.02em] text-bone drop-shadow-[0_1px_8px_rgba(10,10,11,0.8)]">
            {room.name}
          </span>

          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
              selected
                ? 'border-signal bg-signal text-void'
                : 'border-bone/30 bg-void/40 text-transparent group-hover:border-bone/60'
            )}
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>
      </div>

      {room.description && (
        <p className="border-t border-ash/60 px-4 py-3 text-xs leading-relaxed text-bone/55">
          {room.description}
        </p>
      )}
    </button>
  )
}
