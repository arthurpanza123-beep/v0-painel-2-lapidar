/**
 * Resultado padronizado para operacoes do sistema.
 * Usado em todos os servicos e endpoints para manter consistencia.
 */

export type ResultCode =
  // Sucesso
  | 'SUCCESS'
  | 'DRY_RUN'
  | 'MESSAGE_PREPARED'
  // Validacao
  | 'INVALID_JSON'
  | 'INVALID_PHONE'
  | 'INVALID_FLOW'
  | 'INVALID_STEP'
  | 'VALIDATION_FAILED'
  | 'PHONE_REQUIRED'
  | 'MESSAGE_REQUIRED'
  | 'MEDIA_REQUIRED'
  | 'AUDIO_REQUIRED'
  | 'APP_REQUIRED'
  | 'DEVICE_REQUIRED'
  // Configuracao
  | 'CONFIG_MISSING'
  | 'EVOLUTION_NOT_CONFIGURED'
  | 'OPERATOR_ONLY'
  // Evolution
  | 'EVOLUTION_SENT'
  | 'EVOLUTION_ERROR'
  | 'EVOLUTION_TIMEOUT'
  | 'EVOLUTION_RETRY_EXHAUSTED'
  // Flow
  | 'FLOW_STARTED'
  | 'FLOW_COMPLETED'
  | 'FLOW_PARTIAL'
  | 'FLOW_FAILED'
  | 'STEP_SENT'
  | 'STEP_FAILED'
  | 'STEP_RETRY'
  // Fallback
  | 'FALLBACK_USED'
  | 'UNKNOWN_ERROR'

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  code: string
  message: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface BaseResult<T = unknown> {
  ok: boolean
  dryRun: boolean
  code: ResultCode
  message: string
  data?: T
  logs: LogEntry[]
}

export interface SendResult extends BaseResult {
  phone?: string
  request?: {
    endpoint: string
    body: Record<string, unknown>
  }
  response?: unknown
}

export interface FlowResult extends BaseResult {
  flowId: string
  steps: StepResult[]
  preview?: string
}

export interface StepResult {
  stepId: string
  label: string
  ok: boolean
  dryRun: boolean
  code: ResultCode
  message: string
  fallbackUsed?: boolean
}

/**
 * Helper para criar log entry com timestamp automatico.
 */
export function createLog(
  level: LogLevel,
  code: string,
  message: string,
  metadata?: Record<string, unknown>
): LogEntry {
  return {
    level,
    code,
    message,
    timestamp: new Date().toISOString(),
    metadata,
  }
}

/**
 * Helper para criar resultado de sucesso.
 */
export function successResult<T>(
  code: ResultCode,
  message: string,
  data?: T,
  logs: LogEntry[] = []
): BaseResult<T> {
  return { ok: true, dryRun: false, code, message, data, logs }
}

/**
 * Helper para criar resultado de dry-run.
 */
export function dryRunResult<T>(
  message: string,
  data?: T,
  logs: LogEntry[] = []
): BaseResult<T> {
  return { ok: true, dryRun: true, code: 'DRY_RUN', message, logs, data }
}

/**
 * Helper para criar resultado de erro.
 */
export function errorResult(
  code: ResultCode,
  message: string,
  logs: LogEntry[] = []
): BaseResult {
  return { ok: false, dryRun: false, code, message, logs }
}
