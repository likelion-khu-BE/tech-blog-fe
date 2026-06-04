import type { UserRole } from '../types/auth'

interface AccessTokenClaims {
  sub: string
  role: UserRole
  type: string
  iat: number
  exp: number
}

export function parseAccessToken(token: string): { userId: number; role: UserRole } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(decoded) as AccessTokenClaims
    if (claims.type !== 'access') return null
    return { userId: Number(claims.sub), role: claims.role }
  } catch {
    return null
  }
}
