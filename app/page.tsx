'use client'

import { Suspense, useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { JarvisOrb } from '@/components/jarvis-orb'
import { Sidebar } from '@/components/sidebar'
import { BottomBar } from '@/components/bottom-bar'
import { StatusBar } from '@/components/status-bar'
import { FlowPanel } from '@/components/flow-panel'
import { ConfigPanel } from '@/components/config-panel'

export type JarvisState =
  | 'aguardando'
  | 'recebendo'
  | 'interpretando'
  | 'preparando'
  | 'confirmando'
  | 'executando'
  | 'simulando'
  | 'concluido'
  | 'falha'
  | 'reenvio'

export type FlowKey =
  | null
  | 'test_created'
  | 'test_expired'
  | 'renewal_created'
  | 'app_swap'
  | 'second_screen'
  | 'installation'
  | 'boas_vindas'
  | 'xcloud_remove_device'
  | 'xcloud_recreate_device'
  | 'problem_created'
  | 'charge_customer'

export interface LogEntry {
  id: number
  text: string
  type: 'info' | 'warn' | 'error' | 'success'
}

export interface ActionItem {
  label: string
  variant: 'primary' | 'warn' | 'danger' | 'muted'
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
  flow: FlowKey
  // contexto do cliente/flow
  clienteNome: string | null
  appAtual: string | null
  appNovo: string | null
  painel: string | null
  dispositivo: string | null
  acoes: ActionItem[]
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
  flow: null,
  clienteNome: null,
  appAtual: null,
  appNovo: null,
  painel: null,
  dispositivo: null,
  acoes: [],
}

let _lid = 1
function mkLog(text: string, type: LogEntry['type'] = 'info'): LogEntry {
  return { id: _lid++, text, type }
}

function pushLogs(prev: JarvisCtx, ...entries: LogEntry[]): JarvisCtx {
  return { ...prev, logs: [...prev.logs, ...entries].slice(-5) }
}

export type NavTab = 'central' | 'falhas' | 'console' | 'historico' | 'configuracoes'

function PainelInner() {
  const params = useSearchParams()
  const clientId = params.get('client_id')
  const testId   = params.get('test_id')
  const source   = params.get('source')
  const flowParam = params.get('flow') as FlowKey | null

  const [ctx, setCtx] = useState<JarvisCtx>(() => {
    if (source === 'painel1' && flowParam) {
      const flowLabels: Record<string, string> = {
        test_created:          'TEST_CREATED',
        test_expired:          'TEST_EXPIRED',
        renewal_created:       'RENEWAL_CREATED',
        app_swap:              'APP_SWAP',
        second_screen:         'SECOND_SCREEN',
        problem_created:       'PROBLEM_CREATED',
        xcloud_remove_device:  'XCLOUD_REMOVE',
        xcloud_recreate_device:'XCLOUD_RECREATE',
        charge_customer:       'CHARGE_CUSTOMER',
      }
      return {
        ...INITIAL,
        state: 'recebendo',
        label: 'RECEBENDO',
        sub: 'Contexto recebido do Painel 1',
        acao: `Aguardando execucao: ${flowParam}`,
        ultimoEvento: `Flow: ${flowParam}`,
        flow: flowParam,
        logs: [
          mkLog('CONTEXT_RECEIVED', 'success'),
          mkLog(`SOURCE=painel1  FLOW=${flowParam}`, 'info'),
          testId ? mkLog(`TEST_ID=${testId}`, 'info') : mkLog('AWAITING_FLOW_SELECTION', 'info'),
        ],
      }
    }
    if (source === 'painel1') {
      return {
        ...INITIAL,
        state: 'recebendo',
        label: 'RECEBENDO',
        sub: 'Recebendo contexto do Painel 1',
        acao: 'Aguardando selecao de flow',
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

  const [activeTab, setActiveTab] = useState<NavTab>('central')

  const dispatch = useCallback((next: Partial<JarvisCtx> & { newLogs?: LogEntry[] }) => {
    setCtx(prev => {
      const { newLogs, ...rest } = next
      const merged = { ...prev, ...rest }
      return newLogs?.length ? pushLogs(merged, ...newLogs) : merged
    })
  }, [])

  const handleEvent = useCallback((eventKey: string) => {
    switch (eventKey) {

      /* ── INSTALAÇÃO ─────────────────────────────── */
      case 'tvlg':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Guia de instalacao LG pronto',
          acao: 'Preparar mensagem de instalacao LG',
          ultimoEvento: 'Cliente respondeu: TV LG',
          flow: 'installation', dispositivo: 'TV LG',
          retryVisible: false, steps: null, processados: ctx.processados + 1,
          acoes: [
            { label: 'Preparar mensagem', variant: 'primary' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
            { label: 'Enviar simulado', variant: 'muted' },
          ],
          newLogs: [
            mkLog('DEVICE_DETECTED=TV_LG', 'success'),
            mkLog('INSTALLATION_FLOW_SELECTED', 'info'),
            mkLog('MESSAGE_READY', 'info'),
          ],
        })
        break

      /* ── ÁUDIO FALHOU ────────────────────────────── */
      case 'audio':
        dispatch({
          state: 'falha', label: 'FALHA', sub: 'Audio 4 falhou',
          acao: 'Reenviar audio 4',
          ultimoEvento: 'Audio falhou',
          flow: 'boas_vindas',
          retryVisible: true, steps: null, fila: ctx.fila + 1,
          acoes: [
            { label: 'Retry audio 4', variant: 'danger' },
            { label: 'Pular etapa', variant: 'warn' },
          ],
          newLogs: [
            mkLog('WELCOME_AUDIO_4_FAILED', 'error'),
            mkLog('RETRY_READY', 'warn'),
          ],
        })
        break

      /* ── JA PAGUEI ───────────────────────────────── */
      case 'paguei':
        dispatch({
          state: 'interpretando', label: 'INTERPRETANDO', sub: 'Confirmando pagamento',
          acao: 'Verificar confirmacao de pagamento',
          ultimoEvento: 'Ja paguei',
          flow: 'charge_customer',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Verificar no sistema', variant: 'primary' },
            { label: 'Solicitar comprovante', variant: 'warn' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('PAYMENT_CLAIM_RECEIVED', 'info'),
            mkLog('AWAITING_CONFIRMATION', 'warn'),
          ],
        })
        break

      /* ── ATIVAR ──────────────────────────────────── */
      case 'ativar':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Preparando ativacao',
          acao: 'Verificar elegibilidade para ativacao',
          ultimoEvento: 'Quero ativar',
          flow: 'renewal_created',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Preparar mensagem', variant: 'primary' },
            { label: 'Escolher template', variant: 'muted' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('INTENT_DETECTED=ATIVAR', 'info'),
            mkLog('ELIGIBILITY_CHECK', 'warn'),
          ],
        })
        break

      /* ── RECRIAR XCLOUD ──────────────────────────── */
      case 'xcloud':
        dispatch({
          state: 'executando', label: 'EXECUTANDO', sub: 'Orquestrando recriacao XCloud',
          acao: 'Recriar device XCloud',
          ultimoEvento: 'Recriar XCloud',
          flow: 'xcloud_recreate_device',
          retryVisible: false,
          fila: ctx.fila + 1,
          steps: ['Localizar device', 'Desativar', 'Excluir', 'Recriar', 'Vincular Xtream', 'Confirmar RELOAD'],
          acoes: [
            { label: 'Confirmar recriacao', variant: 'primary' },
            { label: 'Aguardar RELOAD', variant: 'warn' },
          ],
          newLogs: [
            mkLog('XCLOUD_RECREATE_INIT', 'warn'),
            mkLog('DEVICE_LOCATE_START', 'info'),
          ],
        })
        break

      /* ── REMOVER XCLOUD ──────────────────────────── */
      case 'xcloud_remove':
        dispatch({
          state: 'executando', label: 'EXECUTANDO', sub: 'Removendo device XCloud',
          acao: 'Remover device XCloud',
          ultimoEvento: 'Remover XCloud',
          flow: 'xcloud_remove_device',
          retryVisible: false,
          fila: ctx.fila + 1,
          steps: ['Localizar device', 'Desativar', 'Excluir device'],
          acoes: [
            { label: 'Confirmar remocao', variant: 'danger' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('XCLOUD_REMOVE_INIT', 'warn'),
            mkLog('DEVICE_LOCATE_START', 'info'),
          ],
        })
        break

      /* ── FALHA XCLOUD ────────────────────────────── */
      case 'falha_xcloud':
        dispatch({
          state: 'falha', label: 'FALHA', sub: 'Falha detectada no XCloud',
          acao: 'Verificar logs XCloud',
          ultimoEvento: 'Falha XCloud',
          flow: 'problem_created',
          retryVisible: true, steps: null, fila: ctx.fila + 1,
          acoes: [
            { label: 'Retry operacao', variant: 'danger' },
            { label: 'Preparar prompt Codex', variant: 'warn' },
          ],
          newLogs: [
            mkLog('XCLOUD_ERROR_DETECTED', 'error'),
            mkLog('RETRY_AVAILABLE', 'warn'),
          ],
        })
        break

      /* ── TESTE CRIADO ────────────────────────────── */
      case 'test_created':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Teste pronto para envio',
          acao: 'Preparar mensagem do teste',
          ultimoEvento: 'Teste criado',
          flow: 'test_created',
          retryVisible: false, steps: null, processados: ctx.processados + 1,
          acoes: [
            { label: 'Preparar mensagem', variant: 'primary' },
            { label: 'Preparar arte do teste', variant: 'muted' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('TEST_CREATED_RECEIVED', 'success'),
            mkLog('CLIENT_CONTEXT_LOADED', 'info'),
            mkLog('TEST_MESSAGE_READY', 'info'),
            mkLog('WAITING_OPERATOR', 'warn'),
          ],
        })
        break

      /* ── TESTE EXPIRADO ──────────────────────────── */
      case 'test_expired':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Teste encerrado — preparando acoes',
          acao: 'Preparar figurinha de teste expirado',
          ultimoEvento: 'Teste expirado',
          flow: 'test_expired',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Enviar figurinha', variant: 'primary' },
            { label: 'Abrir painel provedor', variant: 'muted' },
            { label: 'Copiar usuario cliente', variant: 'muted' },
            { label: 'Remover device XCloud', variant: 'warn' },
          ],
          newLogs: [
            mkLog('TEST_EXPIRED_RECEIVED', 'warn'),
            mkLog('STICKER_FLOW_READY', 'info'),
            mkLog('AWAITING_OPERATOR', 'warn'),
          ],
        })
        break

      /* ── RENOVAÇÃO ───────────────────────────────── */
      case 'renewal':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Mensagem de renovacao pronta',
          acao: 'Preparar template de renovacao',
          ultimoEvento: 'Renovacao criada',
          flow: 'renewal_created',
          retryVisible: false, steps: null, processados: ctx.processados + 1,
          acoes: [
            { label: 'Preparar mensagem', variant: 'primary' },
            { label: 'Escolher template', variant: 'muted' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
            { label: 'Enviar simulado', variant: 'muted' },
          ],
          newLogs: [
            mkLog('RENEWAL_CREATED_RECEIVED', 'success'),
            mkLog('TEMPLATE_SELECTED', 'info'),
            mkLog('MESSAGE_READY', 'info'),
          ],
        })
        break

      /* ── TROCA DE APP ────────────────────────────── */
      case 'app_swap':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Preparando troca de aplicativo',
          acao: 'Preparar instrucoes de migracao',
          ultimoEvento: 'Troca de app',
          flow: 'app_swap',
          appAtual: 'App Atual', appNovo: 'App Novo', painel: 'Painel Demo',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Preparar mensagem', variant: 'primary' },
            { label: 'Preparar instalacao', variant: 'muted' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('APP_SWAP_RECEIVED', 'info'),
            mkLog('MIGRATION_FLOW_READY', 'info'),
            mkLog('AWAITING_OPERATOR', 'warn'),
          ],
        })
        break

      /* ── SEGUNDA TELA ────────────────────────────── */
      case 'second_screen':
        dispatch({
          state: 'preparando', label: 'PREPARANDO', sub: 'Preparando segunda tela',
          acao: 'Preparar instrucao de segunda tela',
          ultimoEvento: 'Segunda tela',
          flow: 'second_screen',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Preparar instrucao', variant: 'primary' },
            { label: 'Verificar tela disponivel', variant: 'muted' },
            { label: 'Aguardar confirmacao', variant: 'muted' },
          ],
          newLogs: [
            mkLog('SECOND_SCREEN_RECEIVED', 'info'),
            mkLog('SCREEN_SLOT_CHECK', 'warn'),
            mkLog('AWAITING_OPERATOR', 'warn'),
          ],
        })
        break

      /* ── PROBLEMA ────────────────────────────────── */
      case 'problem':
        dispatch({
          state: 'interpretando', label: 'INTERPRETANDO', sub: 'Problema identificado',
          acao: 'Preparar resposta ao problema',
          ultimoEvento: 'Problema reportado',
          flow: 'problem_created',
          retryVisible: false, steps: null,
          acoes: [
            { label: 'Preparar resposta', variant: 'primary' },
            { label: 'Preparar troca de app', variant: 'warn' },
            { label: 'Preparar prompt Codex', variant: 'muted' },
            { label: 'Salvar conhecimento', variant: 'muted' },
          ],
          newLogs: [
            mkLog('PROBLEM_CREATED_RECEIVED', 'warn'),
            mkLog('FLOW_ANALYSIS_START', 'info'),
            mkLog('AWAITING_OPERATOR', 'warn'),
          ],
        })
        break

      /* ── RETRY ───────────────────────────────────── */
      case 'retry':
        dispatch({
          state: 'reenvio', label: 'REENVIO', sub: 'Reenvio em andamento...',
          acao: 'Executando retry...',
          ultimoEvento: 'Retry acionado',
          retryVisible: false,
          processados: ctx.processados + 1,
          fila: Math.max(0, ctx.fila - 1),
          newLogs: [
            mkLog('RETRY_TRIGGERED', 'warn'),
            mkLog('FLOW_RESTARTED', 'info'),
          ],
        })
        setTimeout(() => setCtx(prev => ({
          ...prev,
          state: 'concluido', label: 'CONCLUIDO', sub: 'Fluxo concluido',
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
      <Sidebar active={activeTab} onNav={setActiveTab} source={source} clientId={clientId} testId={testId} flow={flowParam} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="relative z-10 flex h-11 shrink-0 items-center justify-between px-5"
          style={{
            background: 'linear-gradient(180deg, rgba(13,18,32,0.98) 0%, rgba(9,14,28,0.95) 100%)',
            borderBottom: '1px solid rgba(30,45,71,0.7)',
            boxShadow: '0 1px 0 rgba(59,130,246,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-[3px] font-mono text-[10px] uppercase tracking-widest"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e',
                boxShadow: '0 0 12px rgba(34,197,94,0.12)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              ATIVO
            </span>
            <span className="font-mono text-[13px] font-semibold text-foreground/90">Central Play</span>
            <span
              className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide"
              style={{
                background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(34,211,238,0.15) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa',
              }}
            >
              Plus
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] sm:inline" style={{ color: 'rgba(107,127,168,0.6)' }}>
              Tempo real
            </span>
            <a
              href="https://painel.centralplayplus.com.br"
              title="Voltar para Gestao"
              className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(34,211,238,0.15) 100%)',
                border: '1px solid rgba(59,130,246,0.35)',
                color: '#60a5fa',
                boxShadow: '0 0 12px rgba(59,130,246,0.2)',
              }}
            >
              JS
            </a>
          </div>
        </header>

        {/* Conteudo principal */}
        {activeTab === 'configuracoes' ? (
          <div className="flex-1 overflow-y-auto">
            <ConfigPanel />
          </div>
        ) : (
          <main className="relative flex flex-1 items-center justify-center overflow-hidden">
            {/* Radial ambient glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 30% 30% at 50% 50%, rgba(34,211,238,0.04) 0%, transparent 60%)' }}
            />

            <Particles />

            {/* Painel flutuante esquerdo — Ultimo Evento */}
            <div className="animate-float absolute left-5 top-1/2 z-10 w-44">
              <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(107,127,168,0.6)' }}>
                <IconBolt />
                Ultimo Evento
              </p>
              <div
                className="rounded-xl px-3.5 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,18,32,0.95) 0%, rgba(9,14,28,0.9) 100%)',
                  border: '1px solid rgba(30,45,71,0.8)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p key={ctx.ultimoEvento} className="animate-fade-up font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(226,232,244,0.8)' }}>
                  {ctx.ultimoEvento}
                </p>
              </div>
            </div>

            {/* Painel flutuante direito — Acao Atual */}
            <div className="animate-float absolute right-5 top-1/2 z-10 w-44 text-right" style={{ animationDelay: '1s' }}>
              <p className="mb-2 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(107,127,168,0.6)' }}>
                Acao Atual
                <IconPlay />
              </p>
              <div
                className="rounded-xl px-3.5 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,18,32,0.95) 0%, rgba(9,14,28,0.9) 100%)',
                  border: '1px solid rgba(30,45,71,0.8)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p key={ctx.acao} className="animate-fade-up font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(226,232,244,0.8)' }}>
                  {ctx.acao}
                </p>
              </div>
            </div>

            {/* Orb */}
            <JarvisOrb ctx={ctx} />

            {/* Flow Panel — aparece quando ha flow ativo */}
            {ctx.flow && activeTab === 'central' && (
              <FlowPanel ctx={ctx} />
            )}
          </main>
        )}

        {/* Barra inferior */}
        <BottomBar ctx={ctx} onEvent={handleEvent} />

        {/* Status Bar */}
        <StatusBar ctx={ctx} onReset={handleReset} />
      </div>
    </div>
  )
}

function Particles() {
  const dots = [
    { x: 8,  y: 15, s: 2,   d: 3.1 }, { x: 82, y: 9,  s: 1.5, d: 4.7 },
    { x: 45, y: 5,  s: 2.5, d: 2.8 }, { x: 93, y: 31, s: 1,   d: 6.2 },
    { x: 5,  y: 60, s: 1.5, d: 3.9 }, { x: 78, y: 74, s: 1,   d: 5.4 },
    { x: 31, y: 88, s: 2,   d: 4.1 }, { x: 62, y: 46, s: 1,   d: 2.5 },
    { x: 89, y: 84, s: 1.5, d: 6.8 }, { x: 18, y: 42, s: 1,   d: 3.3 },
    { x: 54, y: 94, s: 1,   d: 5.1 }, { x: 70, y: 21, s: 1.5, d: 4.4 },
    { x: 38, y: 28, s: 1,   d: 3.7 }, { x: 24, y: 68, s: 1.5, d: 6.0 },
    { x: 67, y: 12, s: 1,   d: 2.9 }, { x: 14, y: 82, s: 2,   d: 5.6 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${d.x}%`,
            top:  `${d.y}%`,
            width:  d.s,
            height: d.s,
            background: i % 3 === 0 ? '#22d3ee' : '#3b82f6',
            animationDuration: `${d.d}s`,
            animationDelay: `${(i * 0.37) % d.d}s`,
          }}
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
