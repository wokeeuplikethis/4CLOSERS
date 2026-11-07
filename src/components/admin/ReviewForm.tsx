'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StudioSlug = 'moscow' | 'spb'

interface Initial {
  id?: string
  rating: number
  content: string
  studioSlug: StudioSlug
}

interface Props {
  initial: Initial
}

export function ReviewForm({ initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Initial>(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contentInvalid = showErrors && !values.content.trim()

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!values.content.trim()) {
      setShowErrors(true)
      setError('Текст отзыва не может быть пустым.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/reviews/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: Number(values.rating),
          content: values.content,
          studioSlug: values.studioSlug,
        }),
      })

      if (res.status === 401) {
        router.push(`/login?redirect=/admin/reviews/${initial.id}`)
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
    if (!initial.id) return
    if (!confirm('Удалить отзыв? Действие необратимо.')) return
    setError(null)
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/reviews/${initial.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/reviews')
        router.refresh()
      } else {
        setError('Не удалось удалить.')
      }
    } catch {
      setError('Сеть недоступна.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <label className="block">
        <span className="field-label">оценка</span>
        <select
          className="field font-mono"
          value={values.rating}
          onChange={(e) => update('rating', Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="field-label">отзыв</span>
        <textarea
          className={cn('field resize-none', contentInvalid && 'field-invalid')}
          rows={6}
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder="Текст отзыва клиента…"
          aria-invalid={contentInvalid}
          required
        />
        <p className="field-hint">Максимум 4000 символов.</p>
      </label>

      <label className="block">
        <span className="field-label">студия</span>
        <select
          className="field"
          value={values.studioSlug}
          onChange={(e) => update('studioSlug', e.target.value as StudioSlug)}
        >
          <option value="moscow">Москва</option>
          <option value="spb">Санкт-Петербург</option>
        </select>
      </label>

      {error && <p className="field-error">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || deleting}
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
          disabled={deleting || saving}
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
  )
}
