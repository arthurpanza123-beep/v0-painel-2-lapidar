'use client'

import { Suspense, useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { JarvisOrb } from '@/components/jarvis-orb'
import { Sidebar } from '@/components/sidebar'
import { BottomBar } from '@/components/bottom-bar'
import { StatusBar } from '@/components/status-bar'

export type JarvisState =
  | 'aguardando'
  | 'recebendo'
  | 'interpretando'
  | 'preparando'
  | 'executando'
  | 'falha'
  | 'reenvio'
  | 'concluido'

export interface LogEntry {
  id: number
  text: string
  type: 'info' | 'warn' | 'error' | 'success'
}

export interface JarvisCtx {
  state: JarvisState
  label: string
  sub: string
  acao: string
  ultimoEvento: string
  logs: LogEntry[]
  retryVisible: boolean
  steps: string[] | null
  processados: number
  fila: number
}

const INITIAL: JarvisCtx = {
  state: 'aguardando',
  label: 'AGUARDANDO',
  sub: 'Aguardando evento',
  acao: 'Nenhuma acao',
  ultimoEvento: 'Aguardando...',
  logs: [{ id: 0, text: 'aguardando evento...', type: 'info' }],
  retryVisible: false,
  steps: null,
  processados: 0,
  fila: 0,
}

let _lid = 1
function mkLog(text: string, type: LogEntry['type'] = 'info'): LogEntry {
  return { id: _lid++, text, type }
}

function pushLogs(prev: JarvisCtx, ...entries: LogEntry[]): JarvisCtx {
  return { ...prev, logs: [...prev.logs, ...entries].slice(-5) }
}

function PainelInner() {
  const params = useSearchParams()
  const clientId = params.get('client_id')
  const testId = params.get('test_id')
  const source = params.get('source')

  const [ctx, setCtx] = useState<JarvisCtx>(() => {
    if (source === 'painel1') {
      return {
        ...INITIAL,
        state: 'recebendo',
        label: 'RECEBENDO',
        sub: 'Recebendo contexto do Painel 1',
        acao: 'Aguardando missao do Painel 1',
        ultimoEvento: `Contexto recebido${testId ? ` · Teste #${testId}` : ''}`,
        logs: [
          mkLog('CONTEXT_RECEIVED', 'success'),
          mkLog(`SOURCE=painel1${testId ? `  TEST_ID=${testId}` : ''}`, 'info'),
          mkLog('AWAITING_FLOW_SELECTION', 'info'),
        ],
      }
    }
    return INITIAL
  })

  const [activeTab, setActiveTab] = useState<'central' | 'falhas' | 'console' | 'historico'>('central')

  const dispatch = useCallback((next: Partial<JarvisCtx> & { newLogs?: LogEntry[] }) => {
    setCtx(prev => {
      const { newLogs, ...rest } = next
      const merged = { ...prev, ...rest }
      return newLogs?.length ? pushLogs(merged, ...newLogs) : merged
    })
  }, [])

  const handleEvent = useCallback((eventKey: string) => {
    switch (eventKey) {
      case 'tvlg':
        dispatch({
          state: 'executando', label: 'EXECUTANDO', sub: 'Preparando instalacao LG',
          acao: 'Preparando instalacao LG', ultimoEvento: 'Cliente respondeu: TV LG',
          retryVisible: false, steps: null, processados: ctx.processados + 1,
          newLogs: [mkLog('DEVICE_DETECTED_LG', 'success'), mkLog('INSTALLATION_FLOW_SELECTED', 'info'), mkLog('INSTALLATION_READY', 'info')],
        }); break
      case 'audio':
        dispatch({
          state: 'falha', label: 'FALHA', sub: 'Audio 4 falhou',
          acao: 'Reenviar audio 4', ultimoEvento: 'Audio falhou',
          retryVisible: true, steps: null, fila: ctx.fila + 1,
          newLogs: [mkLog('WELCOME_AUDIO_4_FAILED', 'error'), mkLog('RETRY_READY', 'warn')],
        }); break
      case 'paguei':
        dispatch({
          state: 'interpretando', label: 'INTERPRETANDO', sub: 'Confirmando pagamento',
          acao: 'Verificando confirmacao', ultimoEvento: 'Ja paguei',
          retryVisible: false, steps: null,
          newLogs: [mkLog('PAYMENT_CLAIM_RECEIVED', 'info'), mkLog('AWAITING_CONFIRMATION', 'warn')],
        }); break
      case 'ativar':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Preparando ativacao',
          acao: 'Verificando elegibilidade', ultimoEvento: 'Ativar',
          retryVisible: false, steps: null,
          newLogs: [mkLog('INTENT_DETECTED=ATIVAR', 'info'), mkLog('ELIGIBILITY_CHECK', 'warn')],
        }); break
      case 'xcloud':
        dispatch({
          state: 'executando', label: 'EXECUTANDO', sub: 'Orquestrando recriacao',
          acao: 'Recriar device XCloud', ultimoEvento: 'Recriar XCloud',
          retryVisible: false, fila: ctx.fila + 1,
          steps: ['Localizar', 'Desativar', 'Excluir', 'Recriar', 'Vincular Xtream', 'Confirmar RELOAD'],
          newLogs: [mkLog('XCLOUD_RECREATE_INIT', 'warn'), mkLog('DEVICE_LOCATE_START', 'info')],
        }); break
      case 'falha_xcloud':
        dispatch({
          state: 'falha', label: 'FALHA', sub: 'Falha no XCloud',
          acao: 'Verificar logs XCloud', ultimoEvento: 'Falha XCloud',
          retryVisible: true, steps: null, fila: ctx.fila + 1,
          newLogs: [mkLog('XCLOUD_ERROR_DETECTED', 'error'), mkLog('RETRY_AVAILABLE', 'warn')],
        }); break
      case 'retry':
        dispatch({
          state: 'reenvio', label: 'REENVIO', sub: 'Reenvio preparado',
          acao: 'Executando retry...', ultimoEvento: 'Retry acionado',
          retryVisible: false, processados: ctx.processados + 1, fila: Math.max(0, ctx.fila - 1),
          newLogs: [mkLog('RETRY_TRIGGERED', 'warn'), mkLog('FLOW_RESTARTED', 'info')],
        })
        setTimeout(() => setCtx(prev => ({
          ...prev, state: 'concluido', label: 'CONCLUIDO', sub: 'Fluxo concluido',
          acao: 'Aguardando proximo evento',
          logs: [...prev.logs, mkLog('FLOW_COMPLETED', 'success')].slice(-5),
        })), 2200)
        break
    }
  }, [ctx, dispatch])

  const handleReset = useCallback(() => {
    _lid = 1
    setCtx({ ...INITIAL, logs: [mkLog('sistema reiniciado', 'info')] })
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar active={activeTab} onNav={setActiveTab} source={source} clientId={clientId} testId={testId} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative z-10 flex h-11 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-5 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#22c55e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
              ATIVO
            </span>
            <span className="font-mono text-[13px] font-semibold text-foreground">Central Play</span>
            <span className="rounded-md bg-[#3b82f6]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-[#3b82f6]">Plus</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
              Tempo real
            </span>
            <a
              href="https://painel.centralplayplus.com.br"
              title="Voltar para Gestao"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6]/20 font-mono text-[10px] font-bold text-[#3b82f6] ring-1 ring-[#3b82f6]/30 transition-all hover:bg-[#3b82f6]/30"
            >
              JS
            </a>
          </div>
        </header>

        {/* Canvas central */}
        <main className="relative flex flex-1 items-center justify-center overflow-hidden">
          {/* Partículas */}
          <Particles />

          {/* Painel flutuante esquerdo */}
          <div className="absolute left-5 top-1/2 z-10 w-44 -translate-y-1/2">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              <IconBolt />
              Ultimo Evento
            </p>
            <div className="rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 shadow-[0_4px_24px_rgb(0_0_0/0.3)] backdrop-blur-sm">
              <p key={ctx.ultimoEvento} className="animate-fade-up font-mono text-[11px] leading-relaxed text-foreground/80">
                {ctx.ultimoEvento}
              </p>
            </div>
          </div>

          {/* Painel flutuante direito */}
          <div className="absolute right-5 top-1/2 z-10 w-44 -translate-y-1/2 text-right">
            <p className="mb-2 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Acao Atual
              <IconPlay />
            </p>
            <div className="rounded-xl border border-border/50 bg-card/70 px-3 py-2.5 shadow-[0_4px_24px_rgb(0_0_0/0.3)] backdrop-blur-sm">
              <p key={ctx.acao} className="animate-fade-up font-mono text-[11px] leading-relaxed text-foreground/80">
                {ctx.acao}
              </p>
            </div>
          </div>

          {/* Orb */}
          <JarvisOrb ctx={ctx} />
        </main>

        {/* Barra inferior */}
        <BottomBar ctx={ctx} onEvent={handleEvent} />

        {/* Barra de status */}
        <StatusBar ctx={ctx} onReset={handleReset} />
      </div>
    </div>
  )
}

function Particles() {
  const dots = [
    { x: 12, y: 18, s: 2 }, { x: 80, y: 10, s: 1.5 }, { x: 47, y: 6, s: 2.5 },
    { x: 91, y: 33, s: 1 }, { x: 6, y: 58, s: 1.5 }, { x: 77, y: 72, s: 1 },
    { x: 33, y: 87, s: 2 }, { x: 60, y: 48, s: 1 }, { x: 88, y: 82, s: 1.5 },
    { x: 20, y: 43, s: 1 }, { x: 52, y: 93, s: 1 }, { x: 68, y: 23, s: 1.5 },
    { x: 40, y: 30, s: 1 }, { x: 25, y: 70, s: 1.5 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#3b82f6]/25"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s }}
        />
      ))}
    </div>
  )
}

function IconBolt() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground">
          Inicializando<span className="animate-blink">_</span>
        </span>
      </div>
    }>
      <PainelInner />
    </Suspense>
  )
}
