import AdminPageShell from '../../components/admin/AdminPageShell'

interface EnvVar {
  key: string
  description: string
  example?: string
  sensitive?: boolean
}

interface Group {
  title: string
  icon: React.ReactNode
  vars: EnvVar[]
}

const ENV_GROUPS: Group[] = [
  {
    title: 'Application',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    vars: [
      { key: 'APP_BASE_URL', description: 'Public URL of the frontend', example: 'https://tickets.example.com' },
      { key: 'APP_SECRET_KEY', description: 'JWT signing secret (HS256) — change in production', sensitive: true },
      { key: 'ATTACHMENT_MAX_SIZE_MB', description: 'Max upload size per attachment', example: '10' },
    ],
  },
  {
    title: 'Slack Integration',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" fill="currentColor"/>
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" fill="currentColor"/>
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" fill="currentColor"/>
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" fill="currentColor"/>
        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" fill="currentColor"/>
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" fill="currentColor"/>
        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" fill="currentColor"/>
      </svg>
    ),
    vars: [
      { key: 'SLACK_BOT_TOKEN', description: 'Bot User OAuth Token (xoxb-…)', sensitive: true },
      { key: 'SLACK_APP_TOKEN', description: 'App-Level Token for Socket Mode (xapp-…)', sensitive: true },
      { key: 'SLACK_SIGNING_SECRET', description: 'Used to verify request signatures from Slack', sensitive: true },
      { key: 'SLACK_TRIGGER_EMOJI', description: 'Emoji reaction that creates a ticket (without colons)', example: 'ticket' },
      { key: 'SLACK_MONITORED_CHANNELS', description: 'Comma-separated channel IDs to watch. Leave empty to monitor all channels.', example: 'C01234567,C09876543' },
    ],
  },
  {
    title: 'Database',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    vars: [
      { key: 'DATABASE_URL', description: 'PostgreSQL connection string', example: 'postgresql+asyncpg://user:pass@db:5432/simplytickets', sensitive: true },
    ],
  },
]

export default function Settings() {
  return (
    <AdminPageShell title="Settings">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#737373', marginTop: 3 }}>
          SimplyTickets is configured via environment variables.
        </p>
      </div>

      {/* Notice banner */}
      <div style={{
        background: '#F0F9FF', border: '1px solid #BAE6FD',
        borderLeft: '4px solid #0EA5E9', borderRadius: '0 10px 10px 0',
        padding: '14px 18px', marginBottom: 28,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" stroke="#0EA5E9" strokeWidth="1.8"/>
          <path d="M12 16v-4M12 8h.01" stroke="#0EA5E9" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0369A1', margin: '0 0 4px' }}>
            Configuration via Environment Variables
          </p>
          <p style={{ fontSize: 12, color: '#0284C7', margin: 0, lineHeight: 1.6 }}>
            All settings are read at startup from environment variables or the <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#E0F2FE', padding: '1px 5px', borderRadius: 3 }}>.env</code> file.
            Changes require restarting the API container. Sensitive values are never exposed through the API.
          </p>
        </div>
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ENV_GROUPS.map(group => (
          <div key={group.title} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
            {/* Group header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F2F2', background: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#737373' }}>{group.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#262626', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {group.title}
              </span>
            </div>

            {/* Vars */}
            <div>
              {group.vars.map((v, i) => (
                <div
                  key={v.key}
                  style={{
                    padding: '12px 20px',
                    borderBottom: i < group.vars.length - 1 ? '1px solid #F9F9F9' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr auto',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  {/* Key */}
                  <div>
                    <code style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0A0A0A',
                      background: '#F2F2F2',
                      padding: '3px 7px',
                      borderRadius: 4,
                      display: 'inline-block',
                    }}>
                      {v.key}
                    </code>
                  </div>

                  {/* Description + example */}
                  <div>
                    <p style={{ fontSize: 12, color: '#262626', margin: 0, lineHeight: 1.5 }}>{v.description}</p>
                    {v.example && (
                      <p style={{ fontSize: 11, color: '#A3A3A3', margin: '3px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
                        e.g. {v.example}
                      </p>
                    )}
                  </div>

                  {/* Sensitive badge */}
                  {v.sensitive && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#92400E',
                      background: '#FEF3C7', border: '1px solid #FDE68A',
                      borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Secret
                    </span>
                  )}
                  {!v.sensitive && <span />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#C0C0C0', marginTop: 20, textAlign: 'center' }}>
        See <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>.env.example</code> in the repository root for a complete template.
      </p>
    </AdminPageShell>
  )
}
