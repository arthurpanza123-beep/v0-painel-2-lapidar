'use client'

interface Props {
  active: 'central' | 'falhas' | 'console' | 'historico'
  onNav: (tab: 'central' | 'falhas' | 'console' | 'historico') => void
  source: string | null
  clientId: string | null
  testId: string | null
}

type NavId = 'central' | 'falhas' | 'console' | 'historico'

const NAV: { id: NavId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'central',
    label: 'Central',
    icon: (
      <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'falhas',
    label: 'Falhas',
    icon: (
      <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    id: 'console',
    label: 'Console',
    icon: (
      <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'historico',
    label: 'Historico',
    icon: (
      <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export function Sidebar({ active, onNav, source, clientId, testId }: Props) {
  return (
    <aside
      className="flex h-full w-[148px] shrink-0 flex-col"
      style={{
        background: 'linear-gradient(180deg, #0d1220 0%, #090e1c 100%)',
        borderRight: '1px solid rgba(30,45,71,0.7)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-11 shrink-0 items-center px-4"
        style={{ borderBottom: '1px solid rgba(30,45,71,0.6)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[26px] w-[26px] items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #0e7490 100%)',
              boxShadow: '0 0 14px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span
            className="font-mono text-[12px] font-semibold"
            style={{
              background: 'linear-gradient(90deg, #e2e8f4 0%, #94a3c8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Jarvis
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {NAV.map((item, i) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left transition-all duration-150"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.06) 100%)',
                      color: '#60a5fa',
                      borderRight: '2px solid #3b82f6',
                    }
                  : { color: 'rgba(107,127,168,0.85)' }
              }
            >
              <span
                style={
                  isActive
                    ? { color: '#60a5fa', filter: 'drop-shadow(0 0 4px #3b82f6)' }
                    : { color: 'rgba(107,127,168,0.7)' }
                }
              >
                {item.icon}
              </span>
              <span className="font-sans text-[12px] font-medium leading-none">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,45,71,0.9), transparent)' }} />

      {/* Origin badge */}
      {source === 'painel1' ? (
        <div
          className="m-2.5 rounded-xl p-2.5"
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.07) 0%, rgba(59,130,246,0.05) 100%)',
            border: '1px solid rgba(34,211,238,0.18)',
            boxShadow: '0 0 20px rgba(34,211,238,0.05)',
          }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: 'rgba(34,211,238,0.55)' }}>
            Origem
          </p>
          <p className="mt-0.5 font-mono text-[11px] font-bold" style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34,211,238,0.4)' }}>
            Painel 1
          </p>
          {testId && (
            <p className="mt-1.5 font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.7)' }}>
              Teste #{testId}
            </p>
          )}
          {clientId && (
            <p className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.7)' }}>
              ID {clientId}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-2 px-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: 'rgba(107,127,168,0.3)' }}>
            Standalone
          </p>
        </div>
      )}
    </aside>
  )
}
