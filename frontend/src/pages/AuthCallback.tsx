import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Landing page for the Google OIDC redirect.
 * The backend redirects here with ?token=<JWT> after a successful login.
 * We store the token via AuthContext, clean the URL, then send the user home.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (token) {
      login(token)
      navigate('/dashboard', { replace: true })
      return
    }

    // Map backend error codes to human-readable messages
    const messages: Record<string, string> = {
      oauth_failed: 'The Google sign-in flow failed. Please try again.',
      no_email: 'Google did not provide an email address.',
      domain_not_allowed: 'Your Google account is not authorised for this application.',
      account_disabled: 'Your account has been disabled. Contact your administrator.',
    }

    const msg = (error && messages[error]) ?? 'Authentication failed.'
    navigate(`/login?error=${encodeURIComponent(msg)}`, { replace: true })
  }, [navigate, login])

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing gradient dot */}
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, #FF4713, #AD1164)' }}
        />
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            color: '#737373',
            letterSpacing: '0.1em',
          }}
        >
          Authenticating…
        </p>
      </div>
    </div>
  )
}
