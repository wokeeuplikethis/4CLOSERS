'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'USER' | 'ADMIN'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Initial {
  id?: string
  name: string
  email: string
  role: Role
}

interface Props {
  mode: 'create' | 'edit'
  initial: Initial
}

export function UserForm({ mode, initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<Initial>(initial)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameInvalid = values.name.trim() === ''
  const emailInvalid = !EMAIL_RE.test(values.email.trim())
  const passwordInvalid = mode === 'create' && password.length < 6

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setSaved(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAttempted(true)
    setError(null)

    if (nameInvalid || emailInvalid || passwordInvalid) {
      setError(
        mode === 'create'
          ? 'Заполните имя, корректный email и пароль не короче 6 символов.'
          : 'Заполните имя и корректный email.'
      )
      return
    }

    setSaving(true)

    const url = mode === 'create'
      ? '/api/admin/users'
      : `/api/admin/users/${initial.id}`

    const method = mode === 'create' ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          ...(password ? { password } : {}),
        }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/users')
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
      setPassword('')

      if (mode === 'create' && json.user?.id) {
        router.push(`/admin/users/${json.user.id}`)
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
    if (
      !confirm(
        'Удалить пользователя? Его заявки останутся без аккаунта, отзывы будут удалены.'
      )
    ) {
      return
    }

    setError(null)
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${initial.id}`, { method: 'DELETE' })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/users')
        return
      }
      if (res.status === 403) {
        setError('Нет прав.')
        return
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? 'Не удалось удалить.')
        return
      }

      router.push('/admin/users')
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
          <span className="field-label">имя</span>
          <input
            className={cn('field', attempted && nameInvalid && 'field-invalid')}
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Как зовут пользователя"
            required
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="field-label">почта</span>
          <input
            type="email"
            className={cn('field font-mono', attempted && emailInvalid && 'field-invalid')}
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="user@example.com"
            autoComplete="off"
            required
          />
        </label>
        <p className="field-hint">
          {mode === 'create'
            ? 'Используется для входа в аккаунт. Почта должна быть уникальной.'
            : 'Почта для входа — можно поменять, если пользователь её забыл.'}
        </p>
      </div>

      <div>
        <label className="block">
          <span className="field-label">роль</span>
          <select
            className="field"
            value={values.role}
            onChange={(e) => update('role', e.target.value as Role)}
          >
            <option value="USER">Пользователь</option>
            <option value="ADMIN">Администратор</option>
          </select>
        </label>
        <p className="field-hint">
          Админ видит всю админку. Последнего администратора нельзя разжаловать
          или удалить.
        </p>
      </div>

      <div>
        <label className="block">
          <span className="field-label">
            {mode === 'create' ? 'пароль' : 'новый пароль (необязательно)'}
          </span>
          <input
            type="password"
            className={cn(
              'field',
              attempted && passwordInvalid && 'field-invalid'
            )}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setSaved(false)
            }}
            placeholder={
              mode === 'create' ? 'минимум 6 символов' : 'оставить без изменений'
            }
            autoComplete="new-password"
            required={mode === 'create'}
          />
        </label>
        <p className="field-hint">
          {mode === 'create'
            ? 'Минимум 6 символов. Пользователь сможет войти с этой почтой и паролем.'
            : 'Оставьте пустым, чтобы не менять пароль. Минимум 6 символов.'}
        </p>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || deleting}
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
            disabled={deleting || saving}
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
