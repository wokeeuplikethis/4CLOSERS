import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { storage } from '@/lib/storage'
import type { StorageKind } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const MAX_IMAGE = 5 * 1024 * 1024     // 5 MB
const MAX_AUDIO = 30 * 1024 * 1024    // 30 MB

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const AUDIO_TYPES = new Set(['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/x-m4a'])

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Некорректная форма' }, { status: 400 })
  }

  const file = form.get('file')
  const kind = form.get('kind')
  const ownerIdRaw = form.get('ownerId')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
  }

  if (kind !== 'image' && kind !== 'audio') {
    return NextResponse.json(
      { error: 'kind должен быть image или audio' },
      { status: 400 }
    )
  }

  const allowed = kind === 'image' ? IMAGE_TYPES : AUDIO_TYPES
  const max = kind === 'image' ? MAX_IMAGE : MAX_AUDIO

  if (!allowed.has(file.type)) {
    return NextResponse.json(
      {
        error:
          kind === 'image'
            ? 'Допустимы JPG, PNG, WebP, GIF'
            : 'Допустимы MP3, WAV, M4A, OGG',
      },
      { status: 400 }
    )
  }

  if (file.size > max) {
    return NextResponse.json(
      { error: `Файл больше ${Math.round(max / 1024 / 1024)} МБ` },
      { status: 400 }
    )
  }

  const ownerId = typeof ownerIdRaw === 'string' && ownerIdRaw ? ownerIdRaw : undefined

  try {
    const { url } = await storage.upload(file, {
      kind: kind as StorageKind,
      ownerId,
    })
    return NextResponse.json({ url })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 })
  }
}