'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'PENDING', label: 'ожидает' },
  { value: 'CONFIRMED', label: 'подтверждена' },
  { value: 'CANCELLED', label: 'отменена' },
  { value: 'COMPLETED', label: 'завершена' },
]

interface RoomOption {
  id: string
  name: string
}

interface ItemSnapshot {
  id: string
  name: string
  price: number
  requiresSchedule: boolean
}

export interface InitialBooking {
  status: Status
  name: string
  phone: string
  telegram: string
  date: string
  time: string
  hours: number
  comment: string
  roomId: string | null
  items: ItemSnapshot[]
}

interface Props {
  id: string
  studioSlug: 'moscow' | 'spb'
  rooms: RoomOption[]
  initialBooking: InitialBooking
}

export function BookingForm({ id, studioSlug, rooms, initialBooking }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<InitialBooking>(initialBooking)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hours =
    Number.isInteger(values.hours) && values.hours >= 1 && values.hours <= 24
      ? values.hours
      : 1

  const needsSchedule = values.items.some((item) => item.requiresSchedule)

  // Живой пересчёт: услуги без расписания — фиксированно, почасовые — за каждый час.
  const computedTotal = useMemo(
    () =>
      values.items.reduce(
        (sum, item) => sum + item.price * (item.requiresSchedule ? hours : 1),
        0
      ),
    [values.items, hours]
  )

  const phoneDigits = values.phone.replace(/\D/g, '')
  const phoneInvalid = touched && (phoneDigits.length < 10 || phoneDigits.length > 15)
  const nameInvalid = touched && values.name.trim() === ''

  function update<K extends keyof InitialBooking>(key: K, value: InitialBooking[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function validate(): string | null {
    setTouched(true)
    if (!values.name.trim()) return 'Укажите имя.'
    if (values.name.trim().length > 120) return 'Имя не должно превышать 120 символов.'
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return 'Укажите телефон (10–15 цифр).'
    }
    if (!Number.isInteger(values.hours) || values.hours < 1 || values.hours > 24) {
      return 'Часы — целое число от 1 до 24.'
    }
    if (needsSchedule && !values.date) return 'Услуга с расписанием — укажите дату.'
    if (needsSchedule && !values.time.trim()) return 'Укажите время сессии.'
    return null
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: values.status,
          name: values.name.trim(),
          phone: values.phone.trim(),
          telegram: values.telegram.trim() || null,
          date: values.date || null,
          time: values.time.trim() || null,
          hours,
          comment: values.comment.trim() || null,
          roomId: values.roomId || null,
        }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/bookings')
        return
      }
      if (res.status === 403) {
        setError('Нет прав.')
        return
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? 'Не удалось сохранить.')
        return
      }

      setSaved(true)
      router.refresh()
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!confirm('Удалить заявку? Действие необратимо.')) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })

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
        setError(json.error ?? 'Не удалось удалить.')
        return
      }

      router.push('/admin/bookings')
      router.refresh()
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">редактирование</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/80">
          {studioSlug === 'moscow' ? 'москва' : 'санкт-петербург'}
        </span>
        <span className="rule" />
      </div>

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Field label="статус">
              <select
                className="field"
                value={values.status}
                onChange={(event) => update('status', event.target.value as Status)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="field-hint">
              ожидает → подтверждена → завершена; отменена — если клиент отказался.
            </p>
          </div>

          <Field label="помещение">
            <select
              className="field"
              value={values.roomId ?? ''}
              onChange={(event) => update('roomId', event.target.value || null)}
            >
              <option value="">Без помещения</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Field label="имя">
              <input
                className={cn('field', nameInvalid && 'field-invalid')}
                value={values.name}
                onChange={(event) => update('name', event.target.value)}
                required
              />
            </Field>
            {nameInvalid && <p className="field-error">Укажите имя.</p>}
          </div>

          <div>
            <Field label="телефон">
              <input
                className={cn('field font-mono', phoneInvalid && 'field-invalid')}
                value={values.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="+7 999 000-00-00"
                required
              />
            </Field>
            {phoneInvalid && <p className="field-error">Телефон: 10–15 цифр.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="telegram">
            <input
              className="field font-mono"
              value={values.telegram}
              onChange={(event) => update('telegram', event.target.value)}
              placeholder="@username"
            />
          </Field>

          <Field label="дата">
            <input
              type="date"
              className="field font-mono"
              value={values.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="время">
            <input
              type="text"
              className="field font-mono"
              value={values.time}
              onChange={(event) => update('time', event.target.value)}
              placeholder="18:00"
            />
          </Field>

          <Field label="часы">
            <input
              type="number"
              min={1}
              max={24}
              step={1}
              className="field font-mono"
              value={values.hours}
              onChange={(event) =>
                update('hours', event.target.value === '' ? 0 : Number(event.target.value))
              }
            />
          </Field>
        </div>

        {needsSchedule && (
          <p className="field-hint">
            В заявке есть услуги с расписанием — дата и время обязательны. Часы умножают
            только почасовые услуги.
          </p>
        )}

        <Field label="комментарий">
          <textarea
            className="field resize-none"
            rows={3}
            value={values.comment}
            onChange={(event) => update('comment', event.target.value)}
          />
        </Field>

        <div className="panel p-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="field-label mb-0">итого</span>
            <span className="font-mono text-base text-bone">
              {computedTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          {values.items.length > 0 ? (
            <div className="mt-3 border-t border-ash pt-1">
              {values.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between gap-4 pt-2 text-[13px]"
                >
                  <span className="text-bone/70">
                    {item.name}
                    {item.requiresSchedule && (
                      <span className="text-bone/40"> · почасово</span>
                    )}
                  </span>
                  <span className="font-mono text-[12px] text-bone/60 whitespace-nowrap">
                    {item.price.toLocaleString('ru-RU')} ₽
                    {item.requiresSchedule && ` × ${hours}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-bone/40 mt-2">В заявке нет услуг.</p>
          )}

          <p className="field-hint">
            Сумма пересчитается при сохранении: услуги без расписания + часы × почасовые.
          </p>
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-solid h-11 disabled:opacity-50"
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>

          {saved && (
            <span className="inline-flex items-center gap-2 text-sm text-signal">
              <Check className="h-4 w-4" aria-hidden="true" />
              Сохранено
            </span>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={cn(
              'ml-auto inline-flex items-center gap-2 text-sm',
              'text-bone/50 hover:text-signal transition-colors disabled:opacity-50'
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {deleting ? 'Удаляем…' : 'Удалить'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}
