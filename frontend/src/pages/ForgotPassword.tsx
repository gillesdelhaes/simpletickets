import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
    } catch {
      // Swallow — always show success to prevent enumeration
    } finally {
      setLoading(false)
      setSubmitted(true)
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
          {submitted ? (
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
                Check your inbox
              </h2>
              <p
                className="mb-6"
                style={{ fontSize: '14px', color: '#737373', lineHeight: 1.6 }}
              >
                If that email has an account, a reset link has been sent.
                <br />
                The link expires in <strong>1 hour</strong>.
              </p>
              <Link
                to="/login"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#FF4713',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
              >
                ← Back to sign in
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
                  Reset your password
                </h2>
                <p style={{ fontSize: '14px', color: '#737373', lineHeight: 1.5 }}>
                  Enter your email and we'll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4"
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  style={{
                    fontSize: '13px',
                    color: '#737373',
                    textDecoration: 'none',
                    fontWeight: 400,
                  }}
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
