import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../components/tickets/StatusBadge'
import SLABadge from '../../components/tickets/SLABadge'
import { timeAgo, type TicketRead } from '../../types/ticket'

interface Props {
  ticket: TicketRead
}

export default function TicketCard({ ticket }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/tickets/${ticket.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #E5E5E5',
        borderRadius: 10,
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.12s, box-shadow 0.12s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = '#D4D4D4'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = '#E5E5E5'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Top row: ID + status + SLA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#A3A3A3',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {ticket.display_id}
        </span>
        <StatusBadge status={ticket.status} size="sm" />
        {ticket.sla_deadline && (
          <SLABadge ticket={ticket} variant="pill" />
        )}
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#0A0A0A',
          margin: 0,
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {ticket.title}
      </p>

      {/* Bottom row: category + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {ticket.category_name ? (
          <span
            style={{
              fontSize: 11,
              color: '#A3A3A3',
              background: '#F2F2F2',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {ticket.category_name}
          </span>
        ) : (
          <span />
        )}
        <span style={{ fontSize: 11, color: '#C0C0C0', flexShrink: 0 }}>
          {timeAgo(ticket.created_at)}
        </span>
      </div>
    </div>
  )
}
