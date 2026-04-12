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

/**
 * 인증 상태 관리 Provider.
 *
 * 마운트 시 silent refresh를 시도한다 — 유효한 refresh 쿠키가 있으면
 * 자동으로 로그인 상태가 되어 로그인 페이지를 보지 않는다.
 *
 * axios 인터셉터가 강제 로그아웃(refresh 실패)을 감지하면
 * CustomEvent('auth:logout')를 발생시키고, 이 Provider가 감지하여 상태를 초기화한다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true, // 초기 silent refresh 완료 전까지 true
  })

  // 마운트 시 silent refresh 시도
  useEffect(() => {
    refreshToken()
      .then((token) => setState({ isAuthenticated: !!token, isLoading: false }))
      .catch(() => setState({ isAuthenticated: false, isLoading: false }))
  }, [])

  // 인터셉터에서 발생시킨 강제 로그아웃 이벤트 감지
  useEffect(() => {
    const handleLogout = () => {
      setState({ isAuthenticated: false, isLoading: false })
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    await loginApi(credentials)
    setState({ isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setState({ isAuthenticated: false, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다')
  }
  return context
}
