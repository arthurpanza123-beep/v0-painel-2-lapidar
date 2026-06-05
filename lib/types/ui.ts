/**
 * Tipos para o UI do Painel 2.
 */

// Estados do Jarvis
export type JarvisState = 
  | 'idle' 
  | 'receiving' 
  | 'interpreting' 
  | 'detecting' 
  | 'preparing' 
  | 'executing' 
  | 'validating' 
  | 'completed' 
  | 'failed' 
  | 'retry'

// Log entry
export type LogEntry = {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error'
  code: string
  detail?: string
}

// Item na fila
export type QueueItem = {
  id: string
  simId: string
  label: string
  addedAt: Date
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

// Falha registrada
export type FailureEntry = {
  id: string
  timestamp: Date
  code: string
  message: string
  resolved: boolean
}

// Resultado do Evolution
export type EvolutionUiResult = {
  ok?: boolean
  code?: string
  message?: string
  dryRun?: boolean
  preview?: string
  flags?: { enabled?: boolean; dryRun?: boolean; configured?: boolean }
  logs?: Array<{ code?: string; message?: string }>
}

// Configuracao de flow
export type FlowConfig = {
  module: string
  preview: string
  states: { state: JarvisState; text: string; duration: number }[]
  logs: { level: LogEntry['level']; code: string; detail?: string }[]
}

// Navegacao
export type NavTab = 
  | 'operations' 
  | 'queue' 
  | 'history' 
  | 'analytics' 
  | 'flows' 
  | 'devices' 
  | 'config' 
  | 'monitor'

// Flow keys (re-export)
export type { FlowKey } from '@/lib/types/flow'

// Contexto do Jarvis
export interface JarvisCtx {
  state: JarvisState
  stateText: string
  logs: LogEntry[]
  queue: QueueItem[]
  failures: FailureEntry[]
  activeFlow: string | null
  preview: string
  evolutionResult: EvolutionUiResult | null
  currentStep?: { step: string; index: number; total: number } | null
}

// Props de step
export interface WelcomeStepInfo {
  step: string
  index: number
  total: number
}
