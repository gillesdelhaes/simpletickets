import { useEffect, useState } from 'react'

const BOOT_SEQUENCE = [
  { label: 'Database connection', ms: 400 },
  { label: 'Authentication service', ms: 800 },
  { label: 'Ticket engine', ms: 1150 },
  { label: 'SLA monitor', ms: 1450 },
  { label: 'Slack integration', ms: 1700 },
]

export default function Splash() {
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [booted, setBooted] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Staggered mount animation
    const t0 = setTimeout(() => setMounted(true), 50)

    // Boot sequence
    const timers = BOOT_SEQUENCE.map((item, i) =>
      setTimeout(() => {
        setBooted((prev) => new Set(prev).add(i))
      }, item.ms),
    )

    // Final "ready" glow
    const tReady = setTimeout(() => setReady(true), 2100)

    return () => {
      clearTimeout(t0)
      clearTimeout(tReady)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #FF4713 0%, #AD1164 100%)' }}
      />

      {/* Ambient glow — top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-200px',
          left: '-200px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FF4713 0%, transparent 70%)',
          opacity: 0.06,
          filter: 'blur(40px)',
        }}
      />

      {/* Ambient glow — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-200px',
          right: '-200px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #AD1164 0%, transparent 70%)',
          opacity: 0.07,
          filter: 'blur(40px)',
        }}
      />

      {/* Dot-grid background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center gap-12 px-8"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Wordmark */}
        <div className="text-center">
          <h1
            className="leading-none tracking-[-0.04em] select-none"
            style={{ fontSize: 'clamp(56px, 10vw, 104px)' }}
          >
            <span
              style={{
                fontWeight: 200,
                color: 'rgba(255,255,255,0.90)',
                letterSpacing: '-0.03em',
              }}
            >
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
            className="mt-4 tracking-[0.2em] uppercase"
            style={{
              color: 'rgba(115,115,115,0.8)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
            }}
          >
            A simple ticketing system for admins with no time to waste
          </p>
        </div>

        {/* Boot sequence */}
        <div className="flex flex-col gap-[10px]" style={{ minWidth: '220px' }}>
          {BOOT_SEQUENCE.map((item, i) => {
            const isBooted = booted.has(i)
            return (
              <div
                key={item.label}
                className="flex items-center gap-3"
                style={{
                  opacity: isBooted ? 1 : 0.25,
                  transition: 'opacity 0.4s ease',
                }}
              >
                {/* Indicator dot */}
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isBooted
                      ? 'linear-gradient(135deg, #FF4713, #AD1164)'
                      : '#262626',
                    boxShadow: isBooted ? '0 0 10px rgba(255, 71, 19, 0.5)' : 'none',
                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: isBooted ? 'rgba(242,242,242,0.85)' : 'rgba(115,115,115,0.5)',
                    transition: 'color 0.3s ease',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Ready state */}
        <div
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div
            className="px-6 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.02em',
              cursor: 'default',
              boxShadow: '0 0 32px rgba(255, 71, 19, 0.25)',
            }}
          >
            System ready
          </div>
        </div>
      </div>

      {/* Bottom build label */}
      <div
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        style={{
          opacity: mounted ? 0.3 : 0,
          transition: 'opacity 1.2s ease 0.5s',
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: '#737373',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          v0.1.0 · Phase 1
        </span>
      </div>
    </div>
  )
}
