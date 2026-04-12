import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * 인증 필요 라우트 가드.
 *
 * 사용법: router.tsx에서 보호할 라우트를 감싼다.
 * ```tsx
 * { path: 'some-page', element: <ProtectedRoute><SomePage /></ProtectedRoute> }
 * ```
 *
 * - isLoading 중에는 null 반환 (로그인 페이지 깜빡임 방지)
 * - 미인증이면 /login으로 리다이렉트 (원래 가려던 경로를 state에 보존)
 * - 로그인 성공 후 원래 경로로 돌아갈 수 있다
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
