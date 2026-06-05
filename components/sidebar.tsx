'use client'

interface Props {
  active: 'central' | 'falhas' | 'console' | 'historico'
  onNav: (tab: 'central' | 'falhas' | 'console' | 'historico') => void
  source: string | null
  clientId: string | null
  testId: string | null
}

const NAV = [
  {
    id: 'central' as const,
    label: 'Central',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'falhas' as const,
    label: 'Falhas',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    id: 'console' as const,
    label: 'Console',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'historico' as const,
    label: 'Historico',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export function Sidebar({ active, onNav, source, clientId, testId }: Props) {
  return (
    <aside className="flex h-full w-[148px] shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-11 items-center border-b border-border/40 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]/30">
            <svg className="h-3.5 w-3.5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-mono text-[11px] font-semibold text-foreground/80">Jarvis</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
        {NAV.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all ${
                isActive
                  ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground/80'
              }`}
            >
              <span className={isActive ? 'text-[#3b82f6]' : ''}>{item.icon}</span>
              <span className="font-sans text-[12px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Context badge */}
      {source === 'painel1' && (
        <div className="m-2 rounded-lg border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-2.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#22d3ee]/70">
            Origem
          </p>
          <p className="mt-0.5 font-mono text-[10px] font-semibold text-[#22d3ee]">
            Painel 1
          </p>
          {testId && (
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
              Teste #{testId}
            </p>
          )}
          {clientId && (
            <p className="font-mono text-[9px] text-muted-foreground">
              ID {clientId}
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
