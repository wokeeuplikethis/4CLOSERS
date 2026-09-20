'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface StudioFormProps {
  slug: string
  initial: {
    name: string
    city: string
    address: string
    phone: string
    email: string
    telegram: string
    vk: string
    hours: string
    description: string
  }
}

export function StudioForm({ slug, initial }: StudioFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const res = await fetch(`/api/studios/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/studios')
        return
      }
      if (res.status === 403) {
        setError('Нет прав для редактирования.')
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

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <Field label="название">
        <input
          className="field"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="город">
          <input
            className="field"
            value={values.city}
            onChange={(e) => update('city', e.target.value)}
            required
          />
        </Field>
        <Field label="часы">
          <input
            className="field"
            value={values.hours}
            onChange={(e) => update('hours', e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="адрес">
        <input
          className="field"
          value={values.address}
          onChange={(e) => update('address', e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="телефон">
          <input
            className="field"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
        </Field>
        <Field label="почта">
          <input
            className="field"
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="telegram">
          <input
            className="field"
            value={values.telegram}
            onChange={(e) => update('telegram', e.target.value)}
          />
        </Field>
        <Field label="vk">
          <input
            className="field"
            value={values.vk}
            onChange={(e) => update('vk', e.target.value)}
          />
        </Field>
      </div>

      <Field label="описание">
        <textarea
          className="field resize-none"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </Field>

      {error && <p className="field-error">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
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