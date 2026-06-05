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
}

function IconDevice() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="7" width="20" height="15" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 2l-5 5-5-5" />
    </svg>
  )
}
function IconAudio() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
    </svg>
  )
}
function IconPay() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
    </svg>
  )
}
function IconActivate() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M12 8v4l2 2" />
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

const EVENTS: EventDef[] = [
  { key: 'tvlg',        label: 'TV LG',         icon: <IconDevice /> },
  { key: 'audio',       label: 'Audio falhou',  icon: <IconAudio /> },
  { key: 'paguei',      label: 'Ja paguei',     icon: <IconPay /> },
  { key: 'ativar',      label: 'Ativar',        icon: <IconActivate /> },
  { key: 'xcloud',      label: 'Recriar XCloud',icon: <IconRefresh /> },
  { key: 'falha_xcloud',label: 'Falha XCloud',  icon: <IconAlert /> },
]

const LOG_COLOR: Record<LogEntry['type'], string> = {
  info:    'text-foreground/50',
  warn:    'text-[#f59e0b]/70',
  error:   'text-[#ef4444]/80',
  success: 'text-[#22c55e]/70',
}

export function BottomBar({ ctx, onEvent }: Props) {
  const { retryVisible, logs } = ctx
  const lastLog = logs[logs.length - 1]

  return (
    <div className="shrink-0 border-t border-border/40 bg-card/30 backdrop-blur-sm">
      {/* Steps (XCloud) */}
      {ctx.steps && ctx.steps.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border/30 px-4 py-2 scrollbar-none">
          {ctx.steps.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] text-foreground/50">
                {i + 1}. {step}
              </span>
              {i < ctx.steps!.length - 1 && (
                <span className="text-border">›</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-0">
        {/* Simular */}
        <div className="flex flex-1 items-center gap-0 overflow-hidden">
          <div className="flex items-center gap-1.5 border-r border-border/40 px-3 py-3">
            <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
              SIMULAR
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none">
            {EVENTS.map(ev => (
              <button
                key={ev.key}
                onClick={() => onEvent(ev.key)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 font-mono text-[11px] text-foreground/70 transition-all hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/10 hover:text-foreground active:scale-95"
              >
                <span className="text-muted-foreground/60">{ev.icon}</span>
                {ev.label}
              </button>
            ))}

            {retryVisible && (
              <button
                onClick={() => onEvent('retry')}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-1.5 font-mono text-[11px] font-bold text-[#ef4444] shadow-[0_0_12px_rgb(239_68_68/0.15)] transition-all hover:bg-[#ef4444]/20 active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Console inline */}
        <div className="flex w-52 shrink-0 items-center gap-2 border-l border-border/40 px-3 py-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <svg className="h-3.5 w-3.5 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
              CONSOLE
            </span>
          </div>
          {lastLog ? (
            <p
              key={lastLog.id}
              className={`animate-fade-up truncate font-mono text-[10px] ${LOG_COLOR[lastLog.type]}`}
            >
              {lastLog.text}
            </p>
          ) : (
            <p className="font-mono text-[10px] text-muted-foreground/30">Aguardando...</p>
          )}
        </div>
      </div>
    </div>
  )
}
