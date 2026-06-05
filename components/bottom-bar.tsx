'use client'

import type { JarvisCtx, LogEntry } from '@/app/page'

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

function IconDevice() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <rect x="2" y="7" width="20" height="15" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l-5 5-5-5" />
    </svg>
  )
}
function IconAudio() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
    </svg>
  )
}
function IconPay() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
    </svg>
  )
}
function IconActivate() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 8v4l2 2" />
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

const EVENTS: EventDef[] = [
  { key: 'tvlg',         label: 'TV LG',          icon: <IconDevice />,  hoverColor: '#3b82f6' },
  { key: 'audio',        label: 'Audio falhou',   icon: <IconAudio />,   hoverColor: '#f59e0b' },
  { key: 'paguei',       label: 'Ja paguei',      icon: <IconPay />,     hoverColor: '#22c55e' },
  { key: 'ativar',       label: 'Ativar',          icon: <IconActivate />,hoverColor: '#22d3ee' },
  { key: 'xcloud',       label: 'Recriar XCloud', icon: <IconRefresh />, hoverColor: '#a78bfa' },
  { key: 'falha_xcloud', label: 'Falha XCloud',   icon: <IconAlert />,   hoverColor: '#ef4444' },
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
              <span className="font-mono text-[10px]" style={{ color: 'rgba(107,127,168,0.65)' }}>
                {i + 1}. {step}
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
          className="flex items-center gap-1.5 px-3 py-3 shrink-0"
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

        {/* Buttons */}
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none">
          {EVENTS.map(ev => (
            <EventButton key={ev.key} ev={ev} onEvent={onEvent} />
          ))}

          {retryVisible && (
            <button
              onClick={() => onEvent('retry')}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold transition-all active:scale-95"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444',
                boxShadow: '0 0 16px rgba(239,68,68,0.15)',
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
          className="flex w-56 shrink-0 items-center gap-2 px-3 py-3"
          style={{ borderLeft: '1px solid rgba(30,45,71,0.6)' }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} style={{ color: 'rgba(107,127,168,0.5)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(107,127,168,0.5)' }}>
              CONSOLE
            </span>
          </div>
          {lastLog ? (
            <p
              key={lastLog.id}
              className="animate-fade-up truncate font-mono text-[10px]"
              style={{ color: LOG_COLOR[lastLog.type] }}
            >
              {lastLog.text}
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
      className="group flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-all duration-150 active:scale-95"
      style={{
        background: 'rgba(13,18,32,0.8)',
        border: '1px solid rgba(30,45,71,0.8)',
        color: 'rgba(107,127,168,0.85)',
      }}
      onMouseEnter={e => {
        const btn = e.currentTarget
        btn.style.background = `${ev.hoverColor}18`
        btn.style.borderColor = `${ev.hoverColor}45`
        btn.style.color = ev.hoverColor
        btn.style.boxShadow = `0 0 14px ${ev.hoverColor}20`
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget
        btn.style.background = 'rgba(13,18,32,0.8)'
        btn.style.borderColor = 'rgba(30,45,71,0.8)'
        btn.style.color = 'rgba(107,127,168,0.85)'
        btn.style.boxShadow = ''
      }}
    >
      <span style={{ color: 'inherit' }}>{ev.icon}</span>
      {ev.label}
    </button>
  )
}
