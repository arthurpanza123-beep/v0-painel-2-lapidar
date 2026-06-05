'use client'

import { cn } from '@/lib/utils'

export type JarvisState =
  | 'idle'
  | 'receiving'
  | 'interpreting'
  | 'preparing'
  | 'executing'
  | 'failed'
  | 'retry'
  | 'done'

interface StateConfig {
  label: string
  sub: string
  orbBg: string
  orbBorder: string
  orbText: string
  pulseClass: string
  ringColor: string
  dotColor: string
}

const STATE_CONFIG: Record<JarvisState, StateConfig> = {
  idle: {
    label: 'Aguardando evento',
    sub: 'Pronto para receber missão',
    orbBg: 'bg-[#0d1a35]',
    orbBorder: 'border-blue-500/60',
    orbText: 'text-blue-400',
    pulseClass: 'animate-jarvis-pulse',
    ringColor: 'border-blue-500/25',
    dotColor: 'bg-blue-500',
  },
  receiving: {
    label: 'Recebendo contexto',
    sub: 'Lendo parâmetros do Painel 1',
    orbBg: 'bg-[#0a1e2e]',
    orbBorder: 'border-cyan-400/70',
    orbText: 'text-cyan-400',
    pulseClass: 'animate-jarvis-pulse',
    ringColor: 'border-cyan-400/30',
    dotColor: 'bg-cyan-400',
  },
  interpreting: {
    label: 'Interpretando intenção',
    sub: 'Analisando evento recebido',
    orbBg: 'bg-[#0a1e2e]',
    orbBorder: 'border-cyan-300/70',
    orbText: 'text-cyan-300',
    pulseClass: 'animate-jarvis-pulse',
    ringColor: 'border-cyan-300/30',
    dotColor: 'bg-cyan-300',
  },
  preparing: {
    label: 'Preparando fluxo',
    sub: 'Selecionando ação adequada',
    orbBg: 'bg-[#0d1a35]',
    orbBorder: 'border-blue-400/70',
    orbText: 'text-blue-300',
    pulseClass: 'animate-jarvis-pulse',
    ringColor: 'border-blue-400/30',
    dotColor: 'bg-blue-400',
  },
  executing: {
    label: 'Executando ação',
    sub: 'Fluxo em andamento',
    orbBg: 'bg-[#0a1e2e]',
    orbBorder: 'border-cyan-400/80',
    orbText: 'text-cyan-400',
    pulseClass: 'animate-jarvis-pulse',
    ringColor: 'border-cyan-400/35',
    dotColor: 'bg-cyan-400',
  },
  failed: {
    label: 'Falha detectada',
    sub: 'Aguardando retry ou confirmação',
    orbBg: 'bg-[#1a0a0a]',
    orbBorder: 'border-red-500/70',
    orbText: 'text-red-400',
    pulseClass: 'animate-jarvis-alert',
    ringColor: 'border-red-500/30',
    dotColor: 'bg-red-500',
  },
  retry: {
    label: 'Reenvio preparado',
    sub: 'Retry disponível para execução',
    orbBg: 'bg-[#1a0a0a]',
    orbBorder: 'border-red-400/65',
    orbText: 'text-red-400',
    pulseClass: 'animate-jarvis-alert',
    ringColor: 'border-red-400/25',
    dotColor: 'bg-red-400',
  },
  done: {
    label: 'Concluído',
    sub: 'Fluxo finalizado com sucesso',
    orbBg: 'bg-[#091a0f]',
    orbBorder: 'border-green-500/70',
    orbText: 'text-green-400',
    pulseClass: 'animate-jarvis-success',
    ringColor: 'border-green-500/30',
    dotColor: 'bg-green-500',
  },
}

interface JarvisCoreProps {
  state: JarvisState
  currentAction: string
  lastEvent: string
}

export function JarvisCore({ state, currentAction, lastEvent }: JarvisCoreProps) {
  const c = STATE_CONFIG[state]

  return (
    <div className="flex flex-col items-center gap-7 py-8">

      {/* ── Orb central ───────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">

        {/* Anel externo giratório lento */}
        <div
          className={cn(
            'absolute size-[200px] animate-ring-ccw rounded-full border',
            c.ringColor,
          )}
          style={{ borderStyle: 'dashed' }}
        />

        {/* Anel médio giratório */}
        <div
          className={cn(
            'absolute size-[158px] animate-ring-cw rounded-full border',
            c.ringColor,
          )}
        />

        {/* Anel interno estático */}
        <div
          className={cn(
            'absolute size-[112px] rounded-full border opacity-50',
            'border-[currentColor]',
            c.orbText,
          )}
        />

        {/* Núcleo com glow */}
        <div
          className={cn(
            'relative flex size-[84px] items-center justify-center rounded-full border-2',
            c.orbBg,
            c.orbBorder,
            c.pulseClass,
          )}
        >
          {/* Scan line interna */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className={cn(
                'animate-scan absolute inset-x-0 h-2/5 bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.07]',
              )}
            />
          </div>

          {/* Reflexo superior */}
          <div className="absolute inset-x-4 top-2 h-px rounded-full bg-white/20" />

          {/* Letra J */}
          <span
            className={cn(
              'relative select-none font-mono text-4xl font-bold tracking-tighter drop-shadow-lg',
              c.orbText,
            )}
          >
            J
          </span>
        </div>

        {/* Indicador de atividade — 3 barrinhas */}
        <div className="absolute -bottom-7 flex items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn('w-[3px] rounded-full', c.dotColor)}
              style={{
                height: 10 + i * 5,
                animation: `dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Nome + estado ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Central Play Plus · Painel 2
        </p>
        <h1 className={cn('text-balance text-xl font-bold', c.orbText)}>
          {c.label}
        </h1>
        <p className="text-pretty text-xs text-muted-foreground">{c.sub}</p>
      </div>

      {/* ── Cards compactos ───────────────────────────────────── */}
      <div className="w-full max-w-sm space-y-2">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Acao atual
          </p>
          <p className="animate-fade-up text-sm font-semibold text-foreground">
            {currentAction}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Ultimo evento
          </p>
          <p className="animate-fade-up text-sm text-foreground/75">{lastEvent}</p>
        </div>
      </div>
    </div>
  )
}
