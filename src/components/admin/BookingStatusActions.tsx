'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

interface Action {
  label: string
  next: Status
  tone: 'solid' | 'line' | 'quiet'
}

const ACTIONS: Record<Status, Action[]> = {
  PENDING: [
    { label: 'Подтвердить', next: 'CONFIRMED', tone: 'solid' },
    { label: 'Отменить', next: 'CANCELLED', tone: 'line' },
  ],
  CONFIRMED: [{ label: 'Завершить', next: 'COMPLETED', tone: 'line' }],
  CANCELLED: [{ label: 'Вернуть в ожидание', next: 'PENDING', tone: 'quiet' }],
  COMPLETED: [{ label: 'Вернуть в ожидание', next: 'PENDING', tone: 'quiet' }],
}

interface Props {
  id: string
  status: Status
}

/**
 * Быстрая смена статуса заявки прямо в таблице.
 * Клик не должен всплывать к AdminRow — иначе откроется карточка.
 */
export function BookingStatusActions({ id, status }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(next: Status) {
    if (saving) return
    setSaving(next)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/bookings')
        return
      }
      if (res.status === 403) {
        setError('Нет прав.')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Не удалось изменить статус.')
        return
      }

      router.refresh()
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div
      className="flex flex-col items-start gap-1"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIONS[status].map((action) => (
          <button
            key={action.next}
            type="button"
            disabled={saving !== null}
            onClick={() => setStatus(action.next)}
            className={cn(
              'inline-flex h-7 items-center rounded-md border px-2.5',
              'font-mono text-[10px] uppercase tracking-[0.08em] whitespace-nowrap',
              'transition-colors disabled:opacity-50',
              action.tone === 'solid' &&
                'border-signal bg-signal text-void hover:border-bone hover:bg-bone',
              action.tone === 'line' &&
                'border-ash text-bone/70 hover:border-bone hover:text-bone',
              action.tone === 'quiet' &&
                'border-transparent text-bone/40 hover:bg-bone/[0.04] hover:text-bone'
            )}
          >
            {saving === action.next ? '…' : action.label}
          </button>
        ))}
      </div>

      {error && <span className="font-mono text-[10px] text-alert">{error}</span>}
    </div>
  )
}
