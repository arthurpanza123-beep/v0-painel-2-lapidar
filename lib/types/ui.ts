/**
 * Tipos para o UI do Painel 2.
 * Estes tipos sao usados pelos componentes UI (sidebar, bottom-bar, jarvis-orb, flow-panel, status-bar).
 */

// Estados do Jarvis
export type JarvisState =
  | 'aguardando'
  | 'recebendo'
  | 'interpretando'
  | 'preparando'
  | 'executando'
  | 'falha'
  | 'reenvio'
  | 'concluido'

// Tipos de log
export type LogType = 'info' | 'warn' | 'error' | 'success'

// Entry de log
export interface LogEntry {
  id: string
  type: LogType
  text: string
  ts: number
}

// Acao sugerida no FlowPanel
export interface AcaoSugerida {
  label: string
  variant: 'primary' | 'warn' | 'danger' | 'muted'
}

// Keys de flow
export type FlowKey =
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

// Tabs de navegacao
export type NavTab =
  | 'central'
  | 'falhas'
  | 'console'
  | 'historico'
  | 'configuracoes'

// Contexto do Jarvis usado pelos componentes
export interface JarvisCtx {
  state: JarvisState
  label: string
  sub: string
  acao: string
  ultimoEvento: string
  logs: LogEntry[]
  retryVisible: boolean
  steps?: string[]
  processados: number
  fila: number
  // Flow context
  flow: FlowKey | null
  acoes: AcaoSugerida[]
  // Dados de contexto do flow
  appAtual?: string
  appNovo?: string
  painel?: string
  dispositivo?: string
  clienteNome?: string
  observacao?: string
}
