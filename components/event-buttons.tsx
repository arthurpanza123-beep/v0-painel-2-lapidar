'use client'

import { cn } from '@/lib/utils'
import type { JarvisState } from './jarvis-core'
import type { ContextData } from './context-card'

export interface EventPayload {
  id: string
  label: string
  event: string
  action: string
  state: JarvisState
  logs: string[]
  context?: Partial<ContextData>
  showRetry?: boolean
  steps?: string[]
}

export const EVENTS: EventPayload[] = [
  {
    id: 'test-generated',
    label: 'Teste gerado',
    event: 'Teste gerado no Painel 1',
    action: 'Preparando envio do teste',
    state: 'preparing',
    logs: [
      'EVENT_RECEIVED',
      'TEST_FLOW_RECEIVED',
      'TEST_MESSAGE_PREPARED',
      'WAITING_OPERATOR_CONFIRMATION',
    ],
    context: {
      flow: 'Envio de teste',
      status: 'Aguardando operador',
    },
  },
  {
    id: 'client-tv-lg',
    label: 'Cliente: TV LG',
    event: 'Cliente respondeu: TV LG',
    action: 'Preparando instalação LG',
    state: 'executing',
    logs: [
      'EVENT_RECEIVED',
      'DEVICE_DETECTED_LG',
      'INSTALLATION_FLOW_SELECTED',
      'INSTALLATION_READY',
    ],
    context: {
      device: 'TV LG',
      flow: 'Instalação',
      status: 'Fluxo iniciado',
    },
  },
  {
    id: 'audio4-failed',
    label: 'Áudio 4 falhou',
    event: 'Áudio 4 falhou no envio',
    action: 'Reenviar áudio 4',
    state: 'retry',
    logs: [
      'EVENT_RECEIVED',
      'WELCOME_AUDIO_4_FAILED',
      'RETRY_READY',
    ],
    context: {
      flow: 'Boas-vindas',
      status: 'Falha — aguardando retry',
    },
    showRetry: true,
  },
  {
    id: 'wants-activate',
    label: 'Quero ativar',
    event: 'Cliente sinalizou: quero ativar',
    action: 'Encaminhando para fluxo de ativação',
    state: 'interpreting',
    logs: [
      'EVENT_RECEIVED',
      'INTENT_DETECTED_ACTIVATION',
      'FLOW_SELECTED',
      'WAITING_OPERATOR',
    ],
    context: {
      flow: 'Ativação',
      status: 'Aguardando confirmação',
    },
  },
  {
    id: 'already-paid',
    label: 'Já paguei',
    event: 'Cliente informou: já paguei',
    action: 'Verificando pagamento com Painel 1',
    state: 'interpreting',
    logs: [
      'EVENT_RECEIVED',
      'PAYMENT_CLAIM_DETECTED',
      'FORWARDING_TO_PANEL1',
      'WAITING_OPERATOR',
    ],
    context: {
      flow: 'Verificação de pagamento',
      status: 'Aguardando retorno',
    },
  },
  {
    id: 'list-not-loading',
    label: 'Lista não carrega',
    event: 'Cliente reportou: lista não carrega',
    action: 'Diagnosticando problema de lista',
    state: 'executing',
    logs: [
      'EVENT_RECEIVED',
      'ISSUE_DETECTED_LIST',
      'DIAGNOSTIC_FLOW_STARTED',
      'ACTION_READY',
    ],
    context: {
      flow: 'Suporte técnico',
      status: 'Diagnóstico em andamento',
    },
  },
  {
    id: 'recreate-xcloud',
    label: 'Recriar XCloud',
    event: 'Recriar device XCloud solicitado',
    action: 'Orquestrando recriação da device',
    state: 'executing',
    logs: [
      'EVENT_RECEIVED',
      'XCLOUD_RECREATION_STARTED',
      'DEVICE_LOCATED',
      'DEACTIVATE_INITIATED',
    ],
    context: {
      device: 'XCloud',
      flow: 'Recriação de device',
      status: 'Executando',
    },
    steps: ['Localizar', 'Desativar', 'Excluir', 'Recriar', 'Vincular Xtream', 'RELOAD'],
  },
]

interface EventButtonsProps {
  activeId: string | null
  onEvent: (ev: EventPayload) => void
}

export function EventButtons({ activeId, onEvent }: EventButtonsProps) {
  return (
    <div className="w-full">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Eventos rápidos
      </p>
      <div className="flex flex-wrap gap-2">
        {EVENTS.map((ev) => (
          <button
            key={ev.id}
            onClick={() => onEvent(ev)}
            className={cn(
              'rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200',
              activeId === ev.id
                ? 'border-accent/60 bg-accent/10 text-accent'
                : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {ev.label}
          </button>
        ))}
      </div>
    </div>
  )
}
