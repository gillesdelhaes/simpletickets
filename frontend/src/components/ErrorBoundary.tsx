import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAFAFA', fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 24px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: '#FEE2E2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#EF4444" strokeWidth="1.8"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="0.5" stroke="#EF4444" strokeWidth="1.8" fill="#EF4444"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#0A0A0A', margin: '0 0 8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: '#737373', margin: '0 0 24px', lineHeight: 1.5 }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#FF4713', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
          {(import.meta as any).env?.DEV && (
            <pre style={{
              marginTop: 24, textAlign: 'left', fontSize: 11, color: '#A3A3A3',
              background: '#F2F2F2', borderRadius: 8, padding: 12, overflow: 'auto',
            }}>
              {this.state.error.stack}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
