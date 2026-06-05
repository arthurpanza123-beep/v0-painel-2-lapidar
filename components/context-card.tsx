'use client'

import { cn } from '@/lib/utils'

export interface ContextData {
  source?: string | null
  clientId?: string | null
  testId?: string | null
  client?: string
  app?: string
  device?: string
  flow?: string
  status?: string
}

interface ContextCardProps {
  data: ContextData
  visible: boolean
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-right text-xs font-medium',
          highlight ? 'text-accent' : 'text-foreground/80',
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ContextCard({ data, visible }: ContextCardProps) {
  if (!visible) return null

  return (
    <div className="animate-fade-up w-full rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Contexto atual
        </p>
        {data.source === 'painel1' && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
            Origem: Painel 1
          </span>
        )}
      </div>

      <div className="divide-y divide-border/60">
        {data.source && (
          <Row label="Origem" value={data.source === 'painel1' ? 'Painel 1' : data.source} highlight />
        )}
        {data.testId && (
          <Row label="Teste" value={`#${data.testId}`} />
        )}
        {data.clientId && (
          <Row label="Cliente" value={data.client ?? `ID ${data.clientId}`} />
        )}
        {data.app && (
          <Row label="App" value={data.app} />
        )}
        {data.device && (
          <Row label="Aparelho" value={data.device} />
        )}
        {data.flow && (
          <Row label="Fluxo atual" value={data.flow} highlight />
        )}
        {data.status && (
          <Row label="Status" value={data.status} />
        )}
      </div>
    </div>
  )
}
