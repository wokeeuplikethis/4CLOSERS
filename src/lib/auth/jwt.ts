import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  userId: string
  email: string
  role: 'USER' | 'ADMIN'
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production-32-chars-min'
)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  })
  return payload as unknown as JWTPayload
}
