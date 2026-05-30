import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Already authenticated — go home
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ access_token: string }>('/auth/login', { email, password })
      login(res.data.access_token)
      // AuthContext will update user; the useEffect above handles redirect
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong — please try again'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#F9F9F9]">
      {/* ── Left brand panel ────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[58%] xl:w-[55%] relative flex-col justify-between overflow-hidden"
        style={{ background: '#0A0A0A' }}
      >
        {/* Top gradient rule */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] z-10"
          style={{ background: 'linear-gradient(90deg, #FF4713 0%, #AD1164 100%)' }}
        />

        {/* Dot-grid texture (same as Splash) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient glow — primary */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-180px',
            left: '-180px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FF4713 0%, transparent 70%)',
            opacity: 0.07,
            filter: 'blur(50px)',
          }}
        />

        {/* Ambient glow — secondary */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-120px',
            right: '-120px',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #AD1164 0%, transparent 70%)',
            opacity: 0.08,
            filter: 'blur(50px)',
          }}
        />

        {/* Large decorative geometric ticket shape */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '80px',
            right: '-60px',
            width: '480px',
            height: '320px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,71,19,0.08) 0%, rgba(173,17,100,0.06) 100%)',
            border: '1px solid rgba(255,71,19,0.12)',
            transform: 'rotate(-12deg)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '140px',
            right: '20px',
            width: '320px',
            height: '220px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(255,71,19,0.05) 0%, rgba(173,17,100,0.04) 100%)',
            border: '1px solid rgba(173,17,100,0.10)',
            transform: 'rotate(-6deg)',
          }}
        />
        {/* Notch circles (ticket perforation detail) */}
        {[0.15, 0.3, 0.45, 0.6, 0.75].map((_pos, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              bottom: `${200 + i * 22}px`,
              right: '278px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'rgba(255,71,19,0.18)',
              transform: 'rotate(-12deg)',
            }}
          />
        ))}

        {/* Main content */}
        <div
          className="relative z-10 flex flex-col justify-center flex-1 px-16 py-20"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Wordmark */}
          <div className="mb-16">
            <h1
              className="leading-none select-none"
              style={{ fontSize: 'clamp(48px, 5.5vw, 80px)', letterSpacing: '-0.04em' }}
            >
              <span style={{ fontWeight: 200, color: 'rgba(255,255,255,0.90)' }}>
                Simply
              </span>
              <span
                style={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF4713 0%, #C41070 60%, #AD1164 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tickets
              </span>
            </h1>
            <p
              className="mt-5"
              style={{
                color: 'rgba(115,115,115,0.75)',
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              A simple ticketing system for admins with no time to waste
            </p>
          </div>

          {/* Feature callouts */}
          <div className="flex flex-col gap-5">
            {[
              { icon: '⚡', label: 'Slack-first ticket creation' },
              { icon: '🔧', label: 'IT team portal — VPN access only' },
              { icon: '📊', label: 'SLA tracking & reporting' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                  style={{
                    background: 'rgba(255,71,19,0.08)',
                    border: '1px solid rgba(255,71,19,0.15)',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{icon}</span>
                </div>
                <span
                  style={{
                    color: 'rgba(242,242,242,0.55)',
                    fontSize: '14px',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom version label */}
        <div className="relative z-10 px-16 pb-8">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              color: 'rgba(115,115,115,0.4)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            v0.1.0 · Phase 1
          </span>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(16px)',
          transition:
            'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}
      >
        {/* Mobile wordmark — only shown on small screens */}
        <div className="lg:hidden mb-10 text-center">
          <h1
            className="leading-none select-none"
            style={{ fontSize: '40px', letterSpacing: '-0.04em' }}
          >
            <span style={{ fontWeight: 200, color: '#0A0A0A' }}>Simply</span>
            <span
              style={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Tickets
            </span>
          </h1>
        </div>

        <div className="w-full max-w-[400px] mx-auto">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-[#0A0A0A] mb-1.5"
              style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.025em' }}
            >
              Sign in
            </h2>
            <p style={{ fontSize: '14px', color: '#737373', fontWeight: 400 }}>
              Welcome back to your ticketing workspace
            </p>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                style={{ fontSize: '13px', fontWeight: 500, color: '#262626', letterSpacing: '0.01em' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 transition-all duration-150"
                style={{
                  height: '46px',
                  fontSize: '14px',
                  color: '#0A0A0A',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF4713'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,71,19,0.10)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E5E5'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div>
                <label
                  htmlFor="password"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#262626', letterSpacing: '0.01em' }}
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 transition-all duration-150"
                style={{
                  height: '46px',
                  fontSize: '14px',
                  color: '#0A0A0A',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF4713'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,71,19,0.10)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E5E5'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: '13px',
                  color: '#DC2626',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl text-white font-semibold transition-all duration-150 active:scale-[0.99]"
              style={{
                height: '48px',
                fontSize: '14px',
                letterSpacing: '0.01em',
                background: loading
                  ? 'linear-gradient(135deg, rgba(255,71,19,0.6) 0%, rgba(173,17,100,0.6) 100%)'
                  : 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,71,19,0.25)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path
                      d="M8 2a6 6 0 0 1 6 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
