import client, { setAccessToken } from './client'
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  TokenRefreshResponse,
} from '../types/auth'

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/api/auth/login', credentials)
  setAccessToken(data.accessToken)
  return data
}

export async function signup(credentials: SignupRequest): Promise<SignupResponse> {
  const { data } = await client.post<SignupResponse>('/api/auth/signup', credentials)
  // 토큰 안 세팅 — signup은 PENDING 상태를 반환, 로그인 불가
  return data
}

/** silent refresh. 유효한 refresh 쿠키가 있으면 새 access token 반환, 없으면 null. */
export async function refresh(): Promise<string | null> {
  try {
    const { data } = await client.post<TokenRefreshResponse>('/api/auth/refresh')
    setAccessToken(data.accessToken)
    return data.accessToken
  } catch {
    setAccessToken(null)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await client.post('/api/auth/logout')
  } finally {
    setAccessToken(null)
  }
}
