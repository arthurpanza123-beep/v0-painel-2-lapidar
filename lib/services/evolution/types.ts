/**
 * Tipos especificos do Evolution API.
 * Complementa os tipos centrais em lib/types/.
 */

import type { LogEntry, ResultCode } from '@/lib/types'

// ============================================
// Configuracao
// ============================================

export interface EvolutionConfig {
  enabled: boolean
  dryRun: boolean
  apiUrl: string
  apiKey: string
  instance: string
  timeoutMs: number
  operatorWhatsapp: string
}

// ============================================
// Status codes especificos do Evolution
// ============================================

export type EvolutionStatusCode =
  | 'SENT'
  | 'DRY_RUN'
  | 'INVALID_PHONE'
  | 'CONFIG_MISSING'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'RETRY_EXHAUSTED'
  | 'OPERATOR_BLOCKED'

// ============================================
// Resultado de envio
// ============================================

export interface EvolutionSendResult {
  ok: boolean
  dryRun: boolean
  status?: number
  code: ResultCode | EvolutionStatusCode
  message: string
  phone?: string
  request?: {
    endpoint: string
    body: Record<string, unknown>
  }
  response?: unknown
  logs: LogEntry[]
  /** Tempo total de execucao em ms */
  durationMs?: number
  /** Numero de tentativas realizadas */
  attempts?: number
}

// ============================================
// Tipos de midia
// ============================================

export type EvolutionMediaType = 'image' | 'video' | 'document'

// ============================================
// Inputs de envio
// ============================================

export interface SendTextInput {
  phone: string
  message: string
  context?: Record<string, unknown>
  /** Se true, forca dry-run mesmo se config permitir envio real */
  dryRun?: boolean
}

export interface SendMediaInput {
  phone: string
  caption?: string
  mediaUrl?: string
  mediaPath?: string
  type?: EvolutionMediaType
  mimetype?: string
  fileName?: string
  context?: Record<string, unknown>
  dryRun?: boolean
}

export interface SendAudioInput {
  phone: string
  audioUrl?: string
  audioPath?: string
  context?: Record<string, unknown>
  dryRun?: boolean
}

// ============================================
// Validacao de telefone
// ============================================

export interface PhoneValidation {
  valid: boolean
  normalized: string
  original: string
  reason?: string
}

export function validatePhoneInput(value: unknown): PhoneValidation {
  const original = String(value || '').trim()
  const digits = original.replace(/\D/g, '')
  
  if (!digits) {
    return { valid: false, normalized: '', original, reason: 'Telefone vazio.' }
  }
  
  if (digits.length < 10) {
    return { valid: false, normalized: '', original, reason: 'Telefone muito curto (minimo 10 digitos).' }
  }
  
  if (digits.length > 15) {
    return { valid: false, normalized: '', original, reason: 'Telefone muito longo (maximo 15 digitos).' }
  }
  
  // Normaliza para formato brasileiro com 55
  const normalized = digits.startsWith('55') ? digits : `55${digits}`
  
  return { valid: true, normalized, original }
}

// ============================================
// Helpers de configuracao
// ============================================

export function isEvolutionReady(config: EvolutionConfig): boolean {
  return config.enabled && !config.dryRun && isEvolutionConfigured(config)
}

export function isEvolutionConfigured(config: EvolutionConfig): boolean {
  return Boolean(config.apiUrl && config.apiKey && config.instance)
}

export function shouldDryRun(config: EvolutionConfig, inputDryRun?: boolean): boolean {
  return Boolean(inputDryRun || config.dryRun || !config.enabled)
}
