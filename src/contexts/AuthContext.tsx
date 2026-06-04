import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { refresh as refreshToken, logout as logoutApi, login as loginApi } from '../api/auth'
import { parseAccessToken } from '../utils/jwt'
import type { LoginRequest, AuthState, UserRole } from '../types/auth'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isPresident: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const EMPTY: AuthState = { isAuthenticated: false, isLoading: false, userId: null, role: null }

function stateFromToken(token: string | null): AuthState {
  if (!token) return EMPTY
  const info = parseAccessToken(token)
  if (!info) return EMPTY
  return { isAuthenticated: true, isLoading: false, userId: info.userId, role: info.role }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...EMPTY, isLoading: true })

  useEffect(() => {
    refreshToken().then((token) => {
      setState(stateFromToken(token))
    }).catch(() => setState(EMPTY))
  }, [])

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

  const isAdmin = state.role === 'ADMIN' || state.role === 'PRESIDENT'
  const isPresident = state.role === 'PRESIDENT'

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin, isPresident }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다')
  return context
}

export function useRole(): UserRole | null {
  return useAuth().role
}
