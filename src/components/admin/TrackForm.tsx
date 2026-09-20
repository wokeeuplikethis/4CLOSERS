'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'
import { cn } from '@/lib/utils'

interface Initial {
  id?: string
  artistId: string
  title: string
  coverImage: string | null
  audioUrl: string | null
  genre: string
  year: number | null
  isFeatured: boolean
  sortOrder: number
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function TrackForm({ mode, initial }: Props) {
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
      ? `/api/admin/artists/${initial.artistId}/tracks`
      : `/api/admin/artists/${initial.artistId}/tracks/${initial.id}`

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

      if (mode === 'create') {
        router.push(`/admin/artists/${initial.artistId}`)
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
    if (!confirm('Удалить трек?')) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/artists/${initial.artistId}/tracks/${initial.id}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        router.push(`/admin/artists/${initial.artistId}`)
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
      <label className="block">
        <span className="field-label">название</span>
        <input
          className="field"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
      </label>

      <FileUploader
        kind="audio"
        value={values.audioUrl}
        onChange={(url) => update('audioUrl', url || null)}
        label="аудио"
        ownerId={initial.artistId}
      />

      <FileUploader
        kind="image"
        value={values.coverImage}
        onChange={(url) => update('coverImage', url || null)}
        label="обложка"
        aspect="aspect-square"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">жанр (необязательно)</span>
          <input
            className="field"
            value={values.genre}
            onChange={(e) => update('genre', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="field-label">год (необязательно)</span>
          <input
            type="number"
            className="field font-mono"
            value={values.year ?? ''}
            onChange={(e) => {
              const v = e.target.value
              update('year', v === '' ? null : Number(v) || null)
            }}
            min={1900}
            max={2100}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">порядок</span>
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
          <span className="text-sm text-bone/80">Избранное</span>
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