// 백엔드 응답 타입 (Java DTO 미러링)

export type UserRole = 'PRESIDENT' | 'ADMIN' | 'MEMBER'
export type UserStatus = 'PENDING' | 'ACTIVE' | 'ALUMNI'

export interface LoginResponse {
  accessToken: string
  tokenType: string
}

export interface SignupResponse {
  userId: number
  email: string
  status: UserStatus
}

export interface TokenRefreshResponse {
  accessToken: string
  tokenType: string
}

// 요청 타입

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  sessionType: string
}

// 프론트엔드 인증 상태

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userId: number | null
  role: UserRole | null
}
