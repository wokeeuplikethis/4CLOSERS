'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'
import { cn } from '@/lib/utils'

interface Initial {
  id?: string
  studioSlug?: 'moscow' | 'spb'
  name: string
  slug: string
  avatar: string | null
  genre: string
  bio: string
  isFeatured: boolean
  sortOrder: number
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function ArtistForm({ mode, initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Initial>(initial)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const url = mode === 'create'
      ? '/api/admin/artists'
      : `/api/admin/artists/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/artists')
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

      if (mode === 'create' && json.artist?.id) {
        router.push(`/admin/artists/${json.artist.id}`)
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
    if (!confirm('Удалить артиста? Все его треки тоже удалятся.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/artists/${initial.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/artists')
        router.refresh()
      } else {
        setError('Не удалось удалить.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {mode === 'create' && (
        <label className="block">
          <span className="field-label">студия</span>
          <select
            className="field"
            value={values.studioSlug ?? 'moscow'}
            onChange={(e) => update('studioSlug', e.target.value as 'moscow' | 'spb')}
          >
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
          </select>
        </label>
      )}

      <label className="block">
        <span className="field-label">имя</span>
        <input
          className="field"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </label>

      <div>
        <label className="block">
          <span className="field-label">slug (латиница, без пробелов)</span>
          <input
            className="field font-mono"
            value={values.slug}
            onChange={(e) => update('slug', e.target.value.replace(/\s+/g, '-').toLowerCase())}
            required
          />
        </label>
        <p className="field-hint">
          Короткий идентификатор для URL. Примеры:{' '}
          <span className="font-mono text-bone/60">kizaru</span>,{' '}
          <span className="font-mono text-bone/60">big-baby-tape</span>.
        </p>
      </div>

      <label className="block">
        <span className="field-label">жанр (необязательно)</span>
        <input
          className="field"
          value={values.genre}
          onChange={(e) => update('genre', e.target.value)}
          placeholder="Например: хип-хоп"
        />
      </label>

      <label className="block">
        <span className="field-label">био (необязательно)</span>
        <textarea
          className="field resize-none"
          rows={3}
          value={values.bio}
          onChange={(e) => update('bio', e.target.value)}
        />
      </label>

      <FileUploader
        kind="image"
        value={values.avatar}
        onChange={(url) => update('avatar', url || null)}
        label="аватар"
        aspect="aspect-[4/5]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">порядок (число, меньше — выше)</span>
          <input
            type="number"
            className="field font-mono"
            value={values.sortOrder}
            onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
          />
        </label>
        <label className="flex items-end gap-3 pb-2">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => update('isFeatured', e.target.checked)}
            className="h-4 w-4 accent-signal"
          />
          <span className="text-sm text-bone/80">Показывать в избранном</span>
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