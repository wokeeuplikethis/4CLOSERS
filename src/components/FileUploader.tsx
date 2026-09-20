'use client'

import { useRef, useState } from 'react'
import { Upload, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  kind: 'image' | 'audio'
  value?: string | null
  onChange: (url: string) => void
  label?: string
  ownerId?: string
  className?: string
  /** Превью-пропорции для картинок. */
  aspect?: string
}

export function FileUploader({
  kind,
  value,
  onChange,
  label,
  ownerId,
  className,
  aspect = 'aspect-[4/3]',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSelect(file: File) {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('kind', kind)
      if (ownerId) form.append('ownerId', ownerId)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const json = await res.json().catch(() => ({}))

      if (res.status === 401) {
        setError('Сессия истекла, войдите заново')
        return
      }
      if (res.status === 403) {
        setError('Нет прав')
        return
      }
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Не удалось загрузить')
        return
      }

      onChange(json.url)
    } catch {
      setError('Сеть недоступна')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const accept = kind === 'image'
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : 'audio/mpeg,audio/wav,audio/mp4,audio/ogg'

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
          {label}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onSelect(f)
        }}
      />

      {kind === 'image' && (
        <>
          {value ? (
            <div className="space-y-3">
              <div className={cn('overflow-hidden rounded-lg border border-ash bg-slate', aspect)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs text-bone/60 hover:text-signal transition-colors disabled:opacity-50"
                >
                  заменить
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-xs text-bone/40 hover:text-signal transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  удалить
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'w-full rounded-lg border border-dashed border-ash bg-slate/40',
                'flex flex-col items-center justify-center gap-2',
                'text-sm text-bone/50',
                'hover:border-signal hover:text-signal transition-colors',
                'disabled:opacity-50 disabled:cursor-wait',
                aspect
              )}
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              {uploading ? 'загрузка…' : 'выбрать файл'}
            </button>
          )}
        </>
      )}

      {kind === 'audio' && (
        <>
          {value ? (
            <div className="space-y-3">
              <audio src={value} controls className="w-full" preload="metadata" />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs text-bone/60 hover:text-signal transition-colors disabled:opacity-50"
                >
                  заменить
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-xs text-bone/40 hover:text-signal transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  удалить
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'w-full rounded-lg border border-dashed border-ash bg-slate/40',
                'flex flex-col items-center justify-center gap-2 py-6',
                'text-sm text-bone/50',
                'hover:border-signal hover:text-signal transition-colors',
                'disabled:opacity-50 disabled:cursor-wait'
              )}
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              {uploading ? 'загрузка…' : 'загрузить аудио'}
            </button>
          )}
        </>
      )}

      {uploading && kind === 'image' && value && (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
          загрузка…
        </p>
      )}

      {error && (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
          {error}
        </p>
      )}
    </div>
  )
}