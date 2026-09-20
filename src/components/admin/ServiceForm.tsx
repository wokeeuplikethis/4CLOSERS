'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Initial {
  id?: string
  studioSlug?: 'moscow' | 'spb'
  name: string
  slug: string
  description: string
  price: number
  duration: number
  features: string[]
  isActive: boolean
  sortOrder: number
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function ServiceForm({ mode, initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Initial>(initial)
  const [featureInput, setFeatureInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  function addFeature() {
    const v = featureInput.trim()
    if (!v) return
    update('features', [...values.features, v])
    setFeatureInput('')
  }

  function removeFeature(i: number) {
    update('features', values.features.filter((_, idx) => idx !== i))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const url = mode === 'create'
      ? '/api/admin/services'
      : `/api/admin/services/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/services')
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

      if (mode === 'create' && json.service?.id) {
        router.push(`/admin/services/${json.service.id}`)
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
    if (!confirm('Удалить услугу? Все брони на неё тоже удалятся.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${initial.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/services')
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
        <Field label="студия">
          <select
            className="field"
            value={values.studioSlug ?? 'moscow'}
            onChange={(e) => update('studioSlug', e.target.value as 'moscow' | 'spb')}
          >
            <option value="moscow">Москва</option>
            <option value="spb">Санкт-Петербург</option>
          </select>
        </Field>
      )}

      <Field label="название">
        <input
          className="field"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </Field>


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
            <span className="font-mono text-bone/60">vocal-recording</span>,{' '}
            <span className="font-mono text-bone/60">mixing</span>,{' '}
            <span className="font-mono text-bone/60">mastering</span>.
        </p>
    </div>

      <Field label="описание">
        <textarea
          className="field resize-none"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="цена, ₽">
          <input
            type="number"
            min={0}
            className="field font-mono"
            value={values.price}
            onChange={(e) => update('price', Number(e.target.value) || 0)}
            required
          />
        </Field>
        <Field label="длительность, мин">
          <input
            type="number"
            min={0}
            className="field font-mono"
            value={values.duration}
            onChange={(e) => update('duration', Number(e.target.value) || 0)}
            required
          />
        </Field>
      </div>

      <div>
        <span className="field-label">что входит</span>
        <div className="space-y-2 mb-2">
          {values.features.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border border-ash px-3 py-2"
            >
              <span className="text-sm text-bone/80">{f}</span>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="text-bone/40 hover:text-signal transition-colors"
                aria-label="Удалить пункт"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="field"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFeature()
              }
            }}
            placeholder="Например: сведение вокала"
          />
          <button
            type="button"
            onClick={addFeature}
            className="btn btn-line h-11 shrink-0"
          >
            Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="порядок (число, меньше — выше)">
          <input
            type="number"
            className="field font-mono"
            value={values.sortOrder}
            onChange={(e) => update('sortOrder', Number(e.target.value) || 0)}
          />
        </Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}