import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { refresh as refreshToken, logout as logoutApi, login as loginApi } from '../api/auth'
import type { LoginRequest, AuthState } from '../types/auth'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const EMPTY: AuthState = { isAuthenticated: false, isLoading: false, userId: null, role: null }

function decodeJwt(token: string): { sub: string; role: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function stateFromToken(token: string): AuthState {
  const claims = decodeJwt(token)
  return {
    isAuthenticated: true,
    isLoading: false,
    userId: claims ? Number(claims.sub) : null,
    role: (claims?.role as 'ADMIN' | 'MEMBER') ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...EMPTY, isLoading: true })

  // 마운트 시 silent refresh — 유효한 refresh 쿠키가 있으면 자동 로그인
  useEffect(() => {
    refreshToken().then((token) => {
      setState(token ? stateFromToken(token) : EMPTY)
    })
  }, [])

  // axios 인터셉터가 발생시키는 강제 로그아웃 이벤트 감지
  useEffect(() => {
    const handleLogout = () => setState(EMPTY)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const { accessToken } = await loginApi(credentials)
    setState(stateFromToken(accessToken))
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setState(EMPTY)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다')
  return context
}
