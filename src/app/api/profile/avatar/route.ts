import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'
import { storage } from '@/lib/storage'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

async function getUserId(): Promise<string | null> {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return payload?.userId ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('avatar')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: 'Допустимы только JPG, PNG, WebP или GIF' },
      { status: 400 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файл больше 5 МБ' }, { status: 400 })
  }

  // Удаляем старый файл, если он наш
  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  })
  if (prev?.avatar) {
    await storage.delete(prev.avatar).catch(() => {})
  }

  const { url } = await storage.upload(file, { kind: 'avatar', ownerId: userId })

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
  })

  return NextResponse.json({ url })
}

export async function DELETE() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  })
  if (prev?.avatar) {
    await storage.delete(prev.avatar).catch(() => {})
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  })

  return NextResponse.json({ success: true })
}