import { useState, useMemo } from 'react'
import PortalLayout from './portal/PortalLayout'
import NewTicketForm from './portal/NewTicketForm'
import TicketCard from './portal/TicketCard'
import { useTickets } from '../hooks/useTickets'
import { useAuth } from '../contexts/AuthContext'
import type { TicketRead, TicketStatus } from '../types/ticket'

type Tab = 'all' | 'open' | 'in_progress' | 'resolved'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
]

const TAB_STATUSES: Record<Tab, TicketStatus[] | undefined> = {
  all: undefined,
  open: ['open'],
  in_progress: ['in_progress', 'pending_user'],
  resolved: ['resolved', 'closed'],
}

// ── Success banner ─────────────────────────────────────────────────────────────

function SuccessBanner({ ticket, onDismiss }: { ticket: TicketRead; onDismiss: () => void }) {
  return (
    <div
      style={{
        background: '#F0FDF4',
        border: '1px solid #86EFAC',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        animation: 'fadeSlideIn 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#065F46', margin: 0 }}>
            Request submitted!
          </p>
          <p style={{ fontSize: 12, color: '#059669', margin: '2px 0 0' }}>
            Your ticket{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {ticket.display_id}
            </span>{' '}
            has been created. We'll be in touch soon.
          </p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6EE7B7',
          fontSize: 18,
          lineHeight: 1,
          padding: '2px 4px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ activeTab }: { activeTab: Tab }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(255,71,19,0.08), rgba(173,17,100,0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            stroke="#FF4713"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="#FF4713" strokeWidth="1.5"/>
          <path d="M9 12h6M9 16h4" stroke="#FF4713" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#262626', margin: 0 }}>
        {activeTab === 'all' ? 'No tickets yet' : `No ${activeTab.replace('_', ' ')} tickets`}
      </p>
      <p style={{ fontSize: 13, color: '#A3A3A3', margin: 0, maxWidth: 260, lineHeight: 1.6 }}>
        {activeTab === 'all'
          ? 'When you submit a support request, it will appear here.'
          : 'Nothing in this category right now.'}
      </p>
    </div>
  )
}

// ── Portal page ────────────────────────────────────────────────────────────────

export default function Portal() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [successTicket, setSuccessTicket] = useState<TicketRead | null>(null)

  const statusFilter = TAB_STATUSES[activeTab]

  const { data, isLoading } = useTickets({
    submitter_id: user?.id,
    status: statusFilter,
    limit: 50,
  })

  // Sort: open first, then in_progress, then others; newest within each group
  const sortedTickets = useMemo(() => {
    if (!data?.items) return []
    const ORDER: Record<string, number> = {
      open: 0,
      in_progress: 1,
      pending_user: 2,
      resolved: 3,
      closed: 4,
    }
    return [...data.items].sort((a, b) => {
      const sd = (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9)
      if (sd !== 0) return sd
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [data])

  return (
    <PortalLayout>
      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#0A0A0A',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Support Portal
        </h1>
        <p style={{ fontSize: 14, color: '#737373', marginTop: 6 }}>
          Track your requests and get help from our team.
        </p>
      </div>

      {/* Success banner */}
      {successTicket && (
        <SuccessBanner
          ticket={successTicket}
          onDismiss={() => setSuccessTicket(null)}
        />
      )}

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* ── Left: My Tickets ── */}
        <div>
          {/* Section header + tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>
              My Tickets
              {data && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#A3A3A3',
                    background: '#F2F2F2',
                    borderRadius: 4,
                    padding: '2px 7px',
                  }}
                >
                  {data.total}
                </span>
              )}
            </h2>
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginBottom: 16,
              background: '#F2F2F2',
              borderRadius: 8,
              padding: 4,
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  color: activeTab === tab.id ? '#0A0A0A' : '#737373',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E5E5',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {[60, '80%', '40%'].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        height: j === 1 ? 16 : 12,
                        borderRadius: 4,
                        background: '#F2F2F2',
                        width: w,
                        animation: 'shimmer 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              ))
            ) : sortedTickets.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 10,
                }}
              >
                <EmptyState activeTab={activeTab} />
              </div>
            ) : (
              sortedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </div>

        {/* ── Right: New Ticket Form ── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <NewTicketForm onSuccess={ticket => {
            setSuccessTicket(ticket)
            setActiveTab('all')
            // Auto-dismiss after 6 seconds
            setTimeout(() => setSuccessTicket(prev => prev?.id === ticket.id ? null : prev), 6000)
          }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .portal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PortalLayout>
  )
}
