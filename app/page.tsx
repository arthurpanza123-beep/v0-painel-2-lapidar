'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { JarvisCore, type JarvisState } from '@/components/jarvis-core'
import { ContextCard, type ContextData } from '@/components/context-card'
import { EventButtons, type EventPayload, EVENTS } from '@/components/event-buttons'
import { ConsoleLog } from '@/components/console-log'
import { cn } from '@/lib/utils'

// ─── Steps overlay para XCloud / Boas-vindas ───────────────────────────────

function StepsOverlay({ steps, active }: { steps: string[]; active: boolean }) {
  if (!active || steps.length === 0) return null
  return (
    <div className="animate-fade-up w-full rounded-xl border border-border bg-card px-4 py-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Etapas
      </p>
      <ol className="flex flex-wrap gap-x-3 gap-y-1.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground/50">{i + 1}.</span>
            <span className="text-xs text-foreground/70">{step}</span>
            {i < steps.length - 1 && (
              <span className="text-muted-foreground/30">›</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── Retry button ──────────────────────────────────────────────────────────

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      onClick={onRetry}
      className="mt-1 w-full rounded-xl border border-destructive/40 bg-destructive/10 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-destructive transition-all hover:bg-destructive/20 active:scale-[0.98]"
    >
      Retry
    </button>
  )
}

// ─── Inner page (needs search params) ─────────────────────────────────────

function PainelContent() {
  const searchParams = useSearchParams()

  // URL params
  const urlSource = searchParams.get('source')
  const urlClientId = searchParams.get('client_id')
  const urlTestId = searchParams.get('test_id')
  const hasUrlContext = !!(urlSource || urlClientId || urlTestId)

  // Jarvis state
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle')
  const [currentAction, setCurrentAction] = useState<string>('Aguardando evento do Painel 1')
  const [lastEvent, setLastEvent] = useState<string>('Nenhum evento recebido')
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [showRetry, setShowRetry] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [contextData, setContextData] = useState<ContextData>({
    source: urlSource,
    clientId: urlClientId,
    testId: urlTestId,
    flow: urlTestId ? 'Envio de teste' : undefined,
    client: urlClientId ? 'Carregando...' : undefined,
    status: hasUrlContext ? 'Missão recebida' : undefined,
  })

  // Se vier params da URL, iniciar em "receiving"
  useEffect(() => {
    if (hasUrlContext) {
      setJarvisState('receiving')
      setCurrentAction('Lendo contexto do Painel 1')
      setLastEvent(`Missão recebida via URL — source=${urlSource ?? '?'}`)
      setConsoleLogs(['CONTEXT_RECEIVED', 'PARSING_URL_PARAMS', 'FLOW_SUGGESTED_TEST'])

      // Simula transição para interpreting
      const t = setTimeout(() => {
        setJarvisState('interpreting')
        setCurrentAction('Interpretando missão do Painel 1')
        setConsoleLogs((prev) => [...prev, 'INTENT_ANALYSIS_STARTED'])
      }, 1800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEvent = useCallback((ev: EventPayload) => {
    setActiveEventId(ev.id)
    setJarvisState(ev.state)
    setCurrentAction(ev.action)
    setLastEvent(ev.event)
    setConsoleLogs(ev.logs)
    setShowRetry(ev.showRetry ?? false)
    setSteps(ev.steps ?? [])
    setContextData((prev) => ({
      ...prev,
      ...ev.context,
    }))
  }, [])

  const handleRetry = useCallback(() => {
    setJarvisState('executing')
    setCurrentAction('Executando retry do áudio 4')
    setLastEvent('Retry iniciado pelo operador')
    setConsoleLogs((prev) => [...prev, 'RETRY_INITIATED', 'AUDIO_4_RESEND_STARTED'])
    setShowRetry(false)
  }, [])

  const hasContext =
    hasUrlContext ||
    !!(contextData.flow || contextData.device || contextData.app)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <span className="font-mono text-[11px] font-bold text-primary">J2</span>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Central Play Plus
            </p>
            <p className="text-xs font-semibold leading-none text-foreground">
              Painel 2 · Operação em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {urlSource === 'painel1' && (
            <span className="hidden rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-accent sm:inline-flex">
              Origem: Painel 1
            </span>
          )}
          <a
            href="https://painel.centralplayplus.com.br"
            className="rounded-lg border border-border bg-muted/20 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            ← Gestão
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-6">
        {/* Jarvis protagonista */}
        <JarvisCore
          state={jarvisState}
          currentAction={currentAction}
          lastEvent={lastEvent}
        />

        {/* Contexto atual (só aparece quando há dados) */}
        <ContextCard data={contextData} visible={hasContext} />

        {/* Etapas (XCloud / Boas-vindas) */}
        <StepsOverlay steps={steps} active={steps.length > 0} />

        {/* Retry */}
        {showRetry && <RetryButton onRetry={handleRetry} />}

        {/* Console mínimo */}
        <ConsoleLog lines={consoleLogs} />

        {/* Eventos rápidos */}
        <EventButtons activeId={activeEventId} onEvent={handleEvent} />
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-border px-5 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
        Jarvis · Executor de Fluxos · v2
      </footer>
    </div>
  )
}

// ─── Page wrapper com Suspense (necessário para useSearchParams) ──────────

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <span className="font-mono text-xs text-muted-foreground">
            Inicializando Jarvis<span className="animate-blink">_</span>
          </span>
        </div>
      }
    >
      <PainelContent />
    </Suspense>
  )
}
