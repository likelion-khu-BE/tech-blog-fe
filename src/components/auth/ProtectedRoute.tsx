import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types/auth'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

const ROLE_PRIORITY: Record<UserRole, number> = { MEMBER: 0, ADMIN: 1, PRESIDENT: 2 }

function hasRequiredRole(userRole: UserRole | null, required: UserRole | UserRole[]): boolean {
  if (!userRole) return false
  const roles = Array.isArray(required) ? required : [required]
  return roles.some((r) => ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[r])
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, isLoading, role } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && !hasRequiredRole(role, requiredRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
