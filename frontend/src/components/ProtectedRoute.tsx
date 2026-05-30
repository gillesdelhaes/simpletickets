import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, UserRole } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  // Role check — this portal is for IT staff only
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(255,71,19,0.08)', border: '1px solid rgba(255,71,19,0.15)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF4713" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#0A0A0A] mb-2" style={{ letterSpacing: '-0.02em' }}>
            IT Staff Only
          </h1>
          <p className="text-sm text-[#737373] leading-relaxed">
            This portal is restricted to IT technicians and administrators.
            Submit requests via Slack instead.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
