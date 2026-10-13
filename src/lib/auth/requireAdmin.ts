import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export type AuthResult =
  | { ok: true; userId: string; role: 'USER' | 'ADMIN' }
  | { ok: false; status: 401 | 403 }

export async function requireAdmin(): Promise<AuthResult> {
  const token = cookies().get('auth_token')?.value
  if (!token) return { ok: false, status: 401 }

  let payload: { userId: string; role?: string } | null = null
  try {
    payload = await verifyToken(token)
  } catch {
    return { ok: false, status: 401 }
  }
  if (!payload?.userId) return { ok: false, status: 401 }

  // Проверяем роль по БД — токен может быть старым
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  })
  if (!user || user.role !== 'ADMIN') return { ok: false, status: 403 }

  return { ok: true, userId: payload.userId, role: 'ADMIN' }
}