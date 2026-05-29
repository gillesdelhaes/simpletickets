import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, UserRole } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // Wait for auth bootstrap to complete before making decisions
  if (loading) return null

  // Not authenticated → login
  if (!user) return <Navigate to="/login" replace />

  // Role check — unauthorised users are sent to their home
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'end_user' ? '/portal' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
