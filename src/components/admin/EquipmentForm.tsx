'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'
import { EQUIPMENT_CATEGORIES, EQUIPMENT_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface Initial {
  id?: string
  studioSlug?: 'moscow' | 'spb'
  category: string
  name: string
  model: string
  description: string
  image: string | null
  sortOrder: number
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function EquipmentForm({ mode, initial }: Props) {
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
      ? '/api/admin/equipment'
      : `/api/admin/equipment/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/equipment')
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

      if (mode === 'create' && json.equipment?.id) {
        router.push(`/admin/equipment/${json.equipment.id}`)
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
    if (!confirm('Удалить единицу оборудования?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/equipment/${initial.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/equipment')
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
        <span className="field-label">категория</span>
        <select
          className="field"
          value={values.category}
          onChange={(e) => update('category', e.target.value)}
          required
        >
          <option value="" disabled>Выберите категорию</option>
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {EQUIPMENT_LABELS[cat] ?? cat}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="field-label">название</span>
        <input
          className="field"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Например: Neumann U87"
          required
        />
      </label>

      <label className="block">
        <span className="field-label">модель</span>
        <input
          className="field"
          value={values.model}
          onChange={(e) => update('model', e.target.value)}
          placeholder="Например: U87 Ai"
          required
        />
      </label>

      <label className="block">
        <span className="field-label">описание (необязательно)</span>
        <textarea
          className="field resize-none"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>

      <FileUploader
        kind="image"
        value={values.image}
        onChange={(url) => update('image', url || null)}
        label="фото"
      />

      <label className="block">
        <span className="field-label">порядок (число, меньше — выше)</span>
        <input
          type="number"
          className="field font-mono"
          value={values.sortOrder}
          onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
        />
      </label>

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