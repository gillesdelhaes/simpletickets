import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function validate(): string {
    if (newPassword.length < 8) return 'Password must be at least 8 characters'
    if (newPassword !== confirm) return 'Passwords do not match'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword })
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Reset link is invalid or has expired'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Top gradient rule */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] z-10"
        style={{ background: 'linear-gradient(90deg, #FF4713 0%, #AD1164 100%)' }}
      />

      <div className="w-full max-w-[400px]">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <h1
              className="leading-none select-none"
              style={{ fontSize: '32px', letterSpacing: '-0.04em', display: 'inline' }}
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
          </Link>
        </div>

        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)' }}
        >
          {!token ? (
            /* ── Missing token ── */
            <div className="text-center py-4">
              <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
                This reset link is missing or malformed.
              </p>
              <Link
                to="/forgot-password"
                style={{ fontSize: '14px', fontWeight: 500, color: '#FF4713', textDecoration: 'none' }}
              >
                Request a new link →
              </Link>
            </div>
          ) : success ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.5 11.5L8.5 15.5L17.5 6.5"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2
                className="mb-2"
                style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em' }}
              >
                Password updated
              </h2>
              <p
                className="mb-6"
                style={{ fontSize: '14px', color: '#737373', lineHeight: 1.6 }}
              >
                Your password has been changed. You can now sign in.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-xl text-white font-semibold px-6"
                style={{
                  height: '44px',
                  lineHeight: '44px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(255,71,19,0.2)',
                }}
              >
                Sign in →
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-7">
                <h2
                  className="mb-1.5"
                  style={{ fontSize: '20px', fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.025em' }}
                >
                  Choose a new password
                </h2>
                <p style={{ fontSize: '14px', color: '#737373' }}>
                  Must be at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-password"
                    style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4"
                    style={{ height: '46px', fontSize: '14px', color: '#0A0A0A', outline: 'none' }}
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

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm-password"
                    style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4"
                    style={{ height: '46px', fontSize: '14px', color: '#0A0A0A', outline: 'none' }}
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

                {/* Password strength hint */}
                {newPassword.length > 0 && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const strength =
                        newPassword.length >= 8
                          ? newPassword.length >= 12
                            ? newPassword.length >= 16
                              ? 4
                              : 3
                            : 2
                          : 1
                      const active = level <= strength
                      const colors = ['#EF4444', '#F59E0B', '#FF4713', '#10B981']
                      return (
                        <div
                          key={level}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: active ? colors[strength - 1] : '#E5E5E5',
                          }}
                        />
                      )
                    })}
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl text-white font-semibold transition-all duration-150 active:scale-[0.99]"
                  style={{
                    height: '46px',
                    fontSize: '14px',
                    background: loading
                      ? 'linear-gradient(135deg, rgba(255,71,19,0.6), rgba(173,17,100,0.6))'
                      : 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(255,71,19,0.2)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  style={{ fontSize: '13px', color: '#737373', textDecoration: 'none' }}
                  onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#FF4713')}
                  onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#737373')}
                >
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
