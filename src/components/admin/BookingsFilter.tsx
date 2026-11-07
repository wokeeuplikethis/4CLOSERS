'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'все' },
  { value: 'PENDING', label: 'ожидает' },
  { value: 'CONFIRMED', label: 'подтверждена' },
  { value: 'CANCELLED', label: 'отменена' },
  { value: 'COMPLETED', label: 'завершена' },
]

/**
 * Фильтр заявок по статусу и поиску по имени/телефону.
 * Управляет только ?status и ?q — ?studio остаётся за StudioFilter.
 */
export function BookingsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function navigate(params: URLSearchParams) {
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    navigate(params)
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const q = query.trim()
    if (q) {
      params.set('q', q)
    } else {
      params.delete('q')
    }
    navigate(params)
  }

  function reset() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('q')
    setQuery('')
    navigate(params)
  }

  const hasFilters = Boolean(searchParams.get('status') || searchParams.get('q'))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="field h-10 w-auto min-w-[170px] py-0"
        value={searchParams.get('status') ?? ''}
        onChange={(event) => setStatus(event.target.value)}
        aria-label="Статус заявки"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          className="field h-10 w-44 py-0"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="имя или телефон"
          aria-label="Поиск по имени или телефону"
        />
        <button type="submit" className="btn btn-line h-10 px-3">
          Найти
        </button>
      </form>

      {hasFilters && (
        <button type="button" onClick={reset} className="btn btn-quiet h-10">
          Сброс
        </button>
      )}
    </div>
  )
}
