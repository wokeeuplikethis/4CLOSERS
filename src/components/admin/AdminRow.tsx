'use client'

import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Кликабельная строка таблицы в админке: клик по любому месту строки
 * открывает редактирование. Справа — иконка карандаша (в последней колонке).
 */
export function AdminRow({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const go = () => router.push(href)

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          go()
        }
      }}
      className={cn(
        'group cursor-pointer transition-colors',
        'hover:bg-bone/[0.04]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal/60',
        className
      )}
    >
      {children}
    </tr>
  )
}

/** Последняя колонка таблицы с карандашом-подсказкой «редактировать». */
export function EditCell() {
  return (
    <td className="w-10 text-right align-middle">
      <Pencil
        className="ml-auto h-4 w-4 text-bone/25 transition-colors group-hover:text-signal"
        aria-hidden="true"
      />
    </td>
  )
}
