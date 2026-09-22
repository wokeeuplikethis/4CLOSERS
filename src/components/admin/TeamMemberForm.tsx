'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { FileUploader } from '@/components/FileUploader'
import { cn } from '@/lib/utils'

interface Initial {
  id?: string
  name: string
  nickname: string
  position: string
  timeInTeam: string
  experience: string
  bio: string
  photo: string | null
  telegramUrl: string
  vkUrl: string
  instagramUrl: string
  sortOrder: number
  isActive: boolean
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function TeamMemberForm({ mode, initial }: Props) {
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
      ? '/api/admin/team'
      : `/api/admin/team/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/team')
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

      if (mode === 'create' && json.member?.id) {
        router.push(`/admin/team/${json.member.id}`)
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
    if (!confirm('Удалить участника команды?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/team/${initial.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/team')
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
      <FileUploader
        kind="image"
        value={values.photo}
        onChange={(url) => update('photo', url || null)}
        label="фото"
        aspect="aspect-[4/5]"
      />

      <label className="block">
        <span className="field-label">имя</span>
        <input
          className="field"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="field-label">ник (необязательно)</span>
        <input
          className="field font-mono"
          value={values.nickname}
          onChange={(e) => update('nickname', e.target.value)}
          placeholder="например: kizaru"
        />
      </label>

      <label className="block">
        <span className="field-label">должность</span>
        <input
          className="field"
          value={values.position}
          onChange={(e) => update('position', e.target.value)}
          placeholder="Звукорежиссёр, Саунд-продюсер, CEO, Менеджер…"
          required
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="field-label">в команде (необязательно)</span>
          <input
            className="field"
            value={values.timeInTeam}
            onChange={(e) => update('timeInTeam', e.target.value)}
            placeholder="например: 5 лет"
          />
        </label>
        <label className="block">
          <span className="field-label">стаж (необязательно)</span>
          <input
            className="field"
            value={values.experience}
            onChange={(e) => update('experience', e.target.value)}
            placeholder="например: 12 лет в звукозаписи"
          />
        </label>
      </div>

      <label className="block">
        <span className="field-label">описание (необязательно)</span>
        <textarea
          className="field resize-none"
          rows={4}
          value={values.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Работал с …, отвечает за …"
        />
      </label>

      {/* Соцсети */}
      <div className="space-y-4 pt-4 border-t border-ash">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
          соцсети
        </p>

        <label className="block">
          <span className="field-label">Telegram</span>
          <input
            type="url"
            className="field font-mono text-[13px]"
            value={values.telegramUrl}
            onChange={(e) => update('telegramUrl', e.target.value)}
            placeholder="https://t.me/username"
          />
        </label>

        <label className="block">
          <span className="field-label">ВКонтакте</span>
          <input
            type="url"
            className="field font-mono text-[13px]"
            value={values.vkUrl}
            onChange={(e) => update('vkUrl', e.target.value)}
            placeholder="https://vk.com/username"
          />
        </label>

        <label className="block">
          <span className="field-label">Instagram</span>
          <input
            type="url"
            className="field font-mono text-[13px]"
            value={values.instagramUrl}
            onChange={(e) => update('instagramUrl', e.target.value)}
            placeholder="https://instagram.com/username"
          />
        </label>

        <p className="field-hint">
          Заполняй только то, что есть. Пустые ссылки не показываются.
        </p>
      </div>

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