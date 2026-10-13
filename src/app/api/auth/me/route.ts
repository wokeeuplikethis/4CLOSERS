import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const tokenMatch = cookie.match(/auth_token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = await verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
