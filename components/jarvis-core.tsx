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

const STATE_CONFIG: Record<
  JarvisState,
  { label: string; sub: string; colorClass: string; pulseClass: string }
> = {
  idle: {
    label: 'Aguardando evento',
    sub: 'Pronto para receber missão',
    colorClass: 'text-primary border-primary/40',
    pulseClass: 'animate-jarvis-pulse',
  },
  receiving: {
    label: 'Recebendo contexto',
    sub: 'Lendo parâmetros do Painel 1',
    colorClass: 'text-accent border-accent/50',
    pulseClass: 'animate-jarvis-pulse',
  },
  interpreting: {
    label: 'Interpretando intenção',
    sub: 'Analisando evento recebido',
    colorClass: 'text-accent border-accent/60',
    pulseClass: 'animate-jarvis-pulse',
  },
  preparing: {
    label: 'Preparando fluxo',
    sub: 'Selecionando ação adequada',
    colorClass: 'text-primary border-primary/50',
    pulseClass: 'animate-jarvis-pulse',
  },
  executing: {
    label: 'Executando ação',
    sub: 'Fluxo em andamento',
    colorClass: 'text-accent border-accent/70',
    pulseClass: 'animate-jarvis-pulse',
  },
  failed: {
    label: 'Falha detectada',
    sub: 'Aguardando retry ou confirmação',
    colorClass: 'text-destructive border-destructive/50',
    pulseClass: 'animate-jarvis-alert',
  },
  retry: {
    label: 'Reenvio preparado',
    sub: 'Retry disponível para execução',
    colorClass: 'text-destructive border-destructive/40',
    pulseClass: 'animate-jarvis-alert',
  },
  done: {
    label: 'Concluído',
    sub: 'Fluxo finalizado com sucesso',
    colorClass: 'text-success border-success/50',
    pulseClass: 'animate-jarvis-success',
  },
}

interface JarvisCoreProps {
  state: JarvisState
  currentAction: string
  lastEvent: string
}

export function JarvisCore({ state, currentAction, lastEvent }: JarvisCoreProps) {
  const config = STATE_CONFIG[state]

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Orb central */}
      <div className="relative flex items-center justify-center">
        {/* Anel externo */}
        <div
          className={cn(
            'absolute size-40 rounded-full border opacity-20',
            config.colorClass,
            config.pulseClass,
          )}
        />
        {/* Anel médio */}
        <div
          className={cn(
            'absolute size-28 rounded-full border opacity-30',
            config.colorClass,
          )}
        />
        {/* Núcleo */}
        <div
          className={cn(
            'relative flex size-20 items-center justify-center rounded-full border-2 bg-card',
            config.colorClass,
            config.pulseClass,
          )}
        >
          {/* Scan line interna */}
          <div
            className={cn(
              'absolute inset-0 overflow-hidden rounded-full',
            )}
          >
            <div className="animate-scan absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-current to-transparent opacity-10" />
          </div>

          {/* Logo J */}
          <span
            className={cn(
              'select-none font-mono text-3xl font-bold tracking-tighter',
              config.colorClass,
            )}
          >
            J
          </span>
        </div>
      </div>

      {/* Nome + estado */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Central Play Plus · Painel 2
        </p>
        <h1 className="text-balance text-lg font-semibold text-foreground">
          {config.label}
        </h1>
        <p className="text-pretty text-xs text-muted-foreground">{config.sub}</p>
      </div>

      {/* Ação atual + último evento */}
      <div className="w-full max-w-sm space-y-2">
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Ação atual
          </p>
          <p className="animate-fade-up text-sm font-medium text-foreground">
            {currentAction}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Último evento
          </p>
          <p className="animate-fade-up text-sm text-foreground/80">{lastEvent}</p>
        </div>
      </div>
    </div>
  )
}
