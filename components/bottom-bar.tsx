'use client'

import type { JarvisCtx, LogEntry } from '@/lib/types/ui'

interface Props {
  ctx: JarvisCtx
  onEvent: (key: string) => void
}

type EventDef = {
  key: string
  label: string
  icon: React.ReactNode
  hoverColor: string
}

// ── Icons ──────────────────────────────────────────────────────────
function Ico({ d }: { d: string | string[] }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      {paths.map((p, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />)}
    </svg>
  )
}

const EVENTS: EventDef[] = [
  {
    key: 'test_created',
    label: 'Teste criado',
    hoverColor: '#22c55e',
    icon: <Ico d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
  },
  {
    key: 'test_expired',
    label: 'Teste expirado',
    hoverColor: '#f59e0b',
    icon: <Ico d={['M12 8v4l3 3', 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z']} />,
  },
  {
    key: 'renewal',
    label: 'Renovacao',
    hoverColor: '#60a5fa',
    icon: <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  },
  {
    key: 'tvlg',
    label: 'TV LG',
    hoverColor: '#3b82f6',
    icon: <Ico d={['M9 17H5a2 2 0 00-2 2h14a2 2 0 00-2-2h-4m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v12m-4 0h4', 'M3 7h18']} />,
  },
  {
    key: 'app_swap',
    label: 'Trocar app',
    hoverColor: '#a78bfa',
    icon: <Ico d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
  },
  {
    key: 'second_screen',
    label: 'Segunda tela',
    hoverColor: '#22d3ee',
    icon: <Ico d={['M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']} />,
  },
  {
    key: 'audio',
    label: 'Audio falhou',
    hoverColor: '#f59e0b',
    icon: <Ico d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />,
  },
  {
    key: 'paguei',
    label: 'Ja paguei',
    hoverColor: '#22c55e',
    icon: <Ico d={['M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z']} />,
  },
  {
    key: 'ativar',
    label: 'Ativar',
    hoverColor: '#22d3ee',
    icon: <Ico d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 8v4l2 2" />,
  },
  {
    key: 'xcloud',
    label: 'Recriar XCloud',
    hoverColor: '#a78bfa',
    icon: <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  },
  {
    key: 'xcloud_remove',
    label: 'Remover XCloud',
    hoverColor: '#f87171',
    icon: <Ico d={['M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16']} />,
  },
  {
    key: 'problem',
    label: 'Problema',
    hoverColor: '#fb923c',
    icon: <Ico d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />,
  },
  {
    key: 'falha_xcloud',
    label: 'Falha XCloud',
    hoverColor: '#ef4444',
    icon: <Ico d={['M12 9v2m0 4h.01', 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z']} />,
  },
]

const LOG_COLOR: Record<LogEntry['type'], string> = {
  info:    'rgba(107,127,168,0.7)',
  warn:    'rgba(245,158,11,0.8)',
  error:   'rgba(239,68,68,0.9)',
  success: 'rgba(34,197,94,0.85)',
}

export function BottomBar({ ctx, onEvent }: Props) {
  const { retryVisible, logs } = ctx
  const lastLog = logs[logs.length - 1]

  return (
    <div
      className="shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(9,14,28,0.97) 0%, rgba(8,12,24,0.99) 100%)',
        borderTop: '1px solid rgba(30,45,71,0.7)',
        boxShadow: '0 -1px 0 rgba(59,130,246,0.04)',
      }}
    >
      {/* Steps (XCloud) */}
      {ctx.steps && ctx.steps.length > 0 && (
        <div
          className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
          style={{ borderBottom: '1px solid rgba(30,45,71,0.5)' }}
        >
          {ctx.steps.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5 shrink-0">
              <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'rgba(107,127,168,0.65)' }}>
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
                >
                  {i + 1}
                </span>
                {step}
              </span>
              {i < ctx.steps!.length - 1 && (
                <span style={{ color: 'rgba(30,45,71,0.8)' }}>›</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-stretch">
        {/* Label SIMULAR */}
        <div
          className="flex items-center gap-1.5 px-3 py-2.5 shrink-0"
          style={{ borderRight: '1px solid rgba(30,45,71,0.6)' }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} style={{ color: 'rgba(107,127,168,0.5)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(107,127,168,0.5)' }}>
            SIMULAR
          </span>
        </div>

        {/* Buttons scroll area */}
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none">
          {EVENTS.map(ev => (
            <EventButton key={ev.key} ev={ev} onEvent={onEvent} />
          ))}

          {retryVisible && (
            <button
              onClick={() => onEvent('retry')}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold transition-all active:scale-95 animate-fade-up"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.45)',
                color: '#ef4444',
                boxShadow: '0 0 18px rgba(239,68,68,0.18)',
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
        </div>

        {/* Console inline */}
        <div
          className="flex w-56 shrink-0 items-center gap-2 px-3 py-2.5"
          style={{ borderLeft: '1px solid rgba(30,45,71,0.6)' }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} style={{ color: 'rgba(107,127,168,0.5)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(107,127,168,0.5)' }}>
              LOG
            </span>
          </div>
          {lastLog ? (
            <p
              key={lastLog.id}
              className="animate-fade-up truncate font-mono text-[10px]"
              style={{ color: LOG_COLOR[lastLog.type] }}
            >
              {'> '}{lastLog.text}
            </p>
          ) : (
            <p className="font-mono text-[10px]" style={{ color: 'rgba(107,127,168,0.3)' }}>
              Aguardando...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function EventButton({ ev, onEvent }: { ev: EventDef; onEvent: (k: string) => void }) {
  return (
    <button
      onClick={() => onEvent(ev.key)}
      className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] transition-all duration-150 active:scale-95"
      style={{
        background: 'rgba(13,18,32,0.8)',
        border: '1px solid rgba(30,45,71,0.8)',
        color: 'rgba(107,127,168,0.85)',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget
        b.style.background = `${ev.hoverColor}16`
        b.style.borderColor = `${ev.hoverColor}45`
        b.style.color = ev.hoverColor
        b.style.boxShadow = `0 0 12px ${ev.hoverColor}18`
      }}
      onMouseLeave={e => {
        const b = e.currentTarget
        b.style.background = 'rgba(13,18,32,0.8)'
        b.style.borderColor = 'rgba(30,45,71,0.8)'
        b.style.color = 'rgba(107,127,168,0.85)'
        b.style.boxShadow = ''
      }}
    >
      <span style={{ color: 'inherit' }}>{ev.icon}</span>
      {ev.label}
    </button>
  )
}
