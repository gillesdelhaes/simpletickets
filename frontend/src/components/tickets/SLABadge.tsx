import { parseSLABar, type TicketRead } from '../../types/ticket'

interface Props {
  ticket: TicketRead
  /** 'bar' = inline progress bar (for tables), 'pill' = text pill (for detail views) */
  variant?: 'bar' | 'pill'
}

export default function SLABadge({ ticket, variant = 'bar' }: Props) {
  const sla = parseSLABar(ticket)

  if (!sla) {
    return (
      <span style={{ fontSize: '11px', color: '#A3A3A3', fontStyle: 'italic' }}>No SLA</span>
    )
  }

  if (variant === 'pill') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 600,
          color: sla.color,
          background: `${sla.color}18`,
          border: `1px solid ${sla.color}30`,
          animation: sla.breached ? 'sla-pulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        {sla.breached && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sla.color, flexShrink: 0 }} />
        )}
        {sla.label}
      </span>
    )
  }

  // Bar variant — slim progress bar with time label
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 90 }}>
      {/* Progress track */}
      <div
        style={{
          width: '100%',
          height: 4,
          borderRadius: 2,
          background: '#E5E5E5',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.max(sla.breached ? 100 : sla.pct * 100, 2)}%`,
            borderRadius: 2,
            background: sla.color,
            transition: 'width 0.3s ease',
            animation: sla.breached ? 'sla-pulse-opacity 1.5s ease-in-out infinite' : 'none',
          }}
        />
      </div>
      {/* Time label */}
      <span
        style={{
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          color: sla.breached ? sla.color : '#737373',
          fontWeight: sla.breached ? 700 : 400,
          letterSpacing: '0.01em',
          lineHeight: 1,
        }}
      >
        {sla.label}
      </span>

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes sla-pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes sla-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.97); }
        }
      `}</style>
    </div>
  )
}
