import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  children: React.ReactNode
}

export default function PortalLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F9F9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top nav */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #E5E5E5',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Wordmark */}
          <Link
            to="/portal"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 1 }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 300,
                color: '#262626',
                letterSpacing: '-0.01em',
              }}
            >
              Simply
            </span>
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF4713, #AD1164)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              Tickets
            </span>
          </Link>

          {/* Right: user info + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {user && (
              <span style={{ fontSize: 13, color: '#737373' }}>
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#737373',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF4713')}
              onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '36px 24px 60px',
        }}
      >
        {children}
      </main>
    </div>
  )
}
