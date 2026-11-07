'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileUploader } from '@/components/FileUploader'

const SLUG_RE = /^[a-z0-9-]+$/

interface StudioOption {
  slug: string
  city: string
}

interface Initial {
  id?: string
  studioSlug: 'moscow' | 'spb'
  name: string
  slug: string
  description: string
  image: string
  sortOrder: number
  isActive: boolean
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
  studios: StudioOption[]
}

export function RoomForm({ mode, initial, studios }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Initial>(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameInvalid = values.name.trim() === ''
  const slugInvalid = !SLUG_RE.test(values.slug.trim())

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAttempted(true)
    setError(null)

    if (nameInvalid || slugInvalid) {
      setError('Заполните название и корректный slug.')
      return
    }

    setSaving(true)

    const url = mode === 'create'
      ? '/api/admin/rooms'
      : `/api/admin/rooms/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioSlug: values.studioSlug,
          name: values.name.trim(),
          slug: values.slug.trim().toLowerCase(),
          description: values.description,
          image: values.image,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/rooms')
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

      if (mode === 'create' && json.room?.id) {
        router.push(`/admin/rooms/${json.room.id}`)
        return
      }
      router.refresh()
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!initial.id) return
    if (!confirm('Удалить помещение? Услуги и брони останутся без привязки к помещению.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/rooms/${initial.id}`, { method: 'DELETE' })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/rooms')
        return
      }
      if (!res.ok) {
        setError('Не удалось удалить.')
        return
      }

      router.push(`/admin/studios/${values.studioSlug}`)
      router.refresh()
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 max-w-2xl">
      <div>
        <label className="block">
          <span className="field-label">студия</span>
          <select
            className={cn('field', mode === 'edit' && 'opacity-60')}
            value={values.studioSlug}
            onChange={(e) => update('studioSlug', e.target.value as 'moscow' | 'spb')}
            disabled={mode === 'edit'}
          >
            {studios.map((studio) => (
              <option key={studio.slug} value={studio.slug}>
                {studio.city}
              </option>
            ))}
          </select>
        </label>
        <p className="field-hint">
          {mode === 'edit'
            ? 'Помещение остаётся в своей студии — перенос недоступен.'
            : 'В какой студии находится помещение.'}
        </p>
      </div>

      <div>
        <label className="block">
          <span className="field-label">название</span>
          <input
            className={cn('field', attempted && nameInvalid && 'field-invalid')}
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Например: PRO ROOM"
            required
          />
        </label>
        <p className="field-hint">
          Так помещение называется на сайте и в админке.
        </p>
      </div>

      <div>
        <label className="block">
          <span className="field-label">slug (латиница, цифры, дефис)</span>
          <input
            className={cn('field font-mono', attempted && slugInvalid && 'field-invalid')}
            value={values.slug}
            onChange={(e) =>
              update('slug', e.target.value.replace(/\s+/g, '-').toLowerCase())
            }
            placeholder="pro-room"
            required
          />
        </label>
        <p className="field-hint">
          Короткий идентификатор для URL. Примеры:{' '}
          <span className="font-mono text-bone/60">pro-room</span>,{' '}
          <span className="font-mono text-bone/60">light-room</span>.
        </p>
      </div>

      <div>
        <label className="block">
          <span className="field-label">описание</span>
          <textarea
            className="field resize-none"
            rows={3}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Что это за помещение и для чего оно подходит."
          />
        </label>
      </div>

      <FileUploader
        kind="image"
        value={values.image}
        onChange={(url) => update('image', url)}
        label="фото помещения"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block">
            <span className="field-label">порядок (число, меньше — выше)</span>
            <input
              type="number"
              className="field font-mono"
              value={values.sortOrder}
              onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
            />
          </label>
        </div>
        <label className="flex items-end gap-3 pb-2">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
            className="h-4 w-4 accent-signal"
          />
          <span className="text-sm text-bone/80">Показывать на сайте</span>
        </label>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-solid h-11 disabled:opacity-50"
        >
          {saving ? 'Сохраняем…' : mode === 'create' ? 'Создать' : 'Сохранить'}
        </button>

        {saved && (
          <span className="inline-flex items-center gap-2 text-sm text-signal">
            <Check className="h-4 w-4" aria-hidden="true" />
            Сохранено
          </span>
        )}

        {mode === 'edit' && (
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
        )}
      </div>
    </form>
  )
}
