import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protected routes
  const protectedPaths = ['/profile', '/bookings', '/admin']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (isProtected) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    try {
      const payload = await verifyToken(token)

      // Admin-only routes
      if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Add user info to headers for server components
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({ request: { headers: requestHeaders } })
    } catch {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/bookings/:path*', '/admin/:path*'],
}
