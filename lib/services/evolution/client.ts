/**
 * Cliente Evolution API.
 * Responsavel por executar requisicoes com retry, timeout e dry-run.
 */

import { createLog, type LogEntry } from '@/lib/types'
import { buildPhoneCandidates, normalizePhone } from './normalize-phone'
import { maskPhone, sanitizeForLog } from './mask'
import { getEvolutionConfig } from './config'
import { isEvolutionConfigured, shouldDryRun, type EvolutionConfig, type EvolutionSendResult } from './types'

// ============================================
// Constantes
// ============================================

const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 750
const RETRYABLE_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504]
const RETRYABLE_ERROR_TERMS = ['timeout', 'aborted', 'connection closed', 'socket hang up', 'econnreset', 'etimedout', 'fetch failed', 'terminated']

// ============================================
// Tipos internos
// ============================================

interface RequestOptions {
  endpoint: string
  body: Record<string, unknown>
  phone?: string
  action: string
  config?: EvolutionConfig
  /** Forca dry-run independente da config */
  forceDryRun?: boolean
}

// ============================================
// Helpers
// ============================================

function isRetryable(err: unknown): boolean {
  const status = Number((err as { status?: number } | null)?.status)
  const message = String((err as Error | null)?.message || err || '').toLowerCase()
  
  if (RETRYABLE_STATUS_CODES.includes(status)) return true
  return RETRYABLE_ERROR_TERMS.some((term) => message.includes(term))
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      const timeoutErr = new Error(`Evolution timeout after ${timeoutMs}ms`) as Error & { status?: number; code?: string }
      timeoutErr.status = 408
      timeoutErr.code = 'ETIMEDOUT'
      throw timeoutErr
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  
  try {
    return JSON.parse(text)
  } catch {
    // Retorna texto truncado se nao for JSON
    return text.slice(0, 500)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================
// Funcao principal
// ============================================

export async function sendEvolutionRequest(options: RequestOptions): Promise<EvolutionSendResult> {
  const startTime = Date.now()
  const config = options.config || getEvolutionConfig()
  const logs: LogEntry[] = []
  let totalAttempts = 0
  
  // Normaliza telefone
  const normalized = options.phone ? normalizePhone(options.phone) : ''
  if (options.phone && !normalized) {
    logs.push(createLog('warn', 'INVALID_PHONE', 'Telefone rejeitado na validacao.', { phone: options.phone }))
    return {
      ok: false,
      dryRun: true,
      code: 'INVALID_PHONE',
      message: 'Telefone invalido.',
      logs,
      durationMs: Date.now() - startTime,
      attempts: 0,
    }
  }

  const requestBody = normalized ? { ...options.body, number: normalized } : options.body
  logs.push(createLog('info', 'REQUEST_PREPARED', `${options.action} preparado.`, {
    endpoint: options.endpoint,
    phone: normalized ? maskPhone(normalized) : undefined,
  }))

  // Verifica dry-run
  const isDryRun = options.forceDryRun || shouldDryRun(config)
  if (isDryRun) {
    logs.push(createLog('info', 'DRY_RUN', 'Envio real bloqueado por feature flag.', {
      enabled: config.enabled,
      dryRun: config.dryRun,
      forceDryRun: options.forceDryRun,
    }))
    return {
      ok: true,
      dryRun: true,
      code: 'DRY_RUN',
      message: 'Dry-run: nenhuma mensagem real foi enviada.',
      phone: normalized ? maskPhone(normalized) : undefined,
      request: { endpoint: options.endpoint, body: sanitizeForLog(requestBody) as Record<string, unknown> },
      logs,
      durationMs: Date.now() - startTime,
      attempts: 0,
    }
  }

  // Verifica configuracao
  if (!isEvolutionConfigured(config)) {
    logs.push(createLog('error', 'CONFIG_MISSING', 'Configuracao Evolution incompleta.', {
      apiUrlConfigured: Boolean(config.apiUrl),
      apiKeyConfigured: Boolean(config.apiKey),
      instanceConfigured: Boolean(config.instance),
    }))
    return {
      ok: false,
      dryRun: false,
      code: 'CONFIG_MISSING',
      message: 'Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.',
      logs,
      durationMs: Date.now() - startTime,
      attempts: 0,
    }
  }

  // Executa requisicao com retry
  const url = `${config.apiUrl}${options.endpoint}`
  const candidates = normalized ? buildPhoneCandidates(normalized) : ['']
  let lastError: unknown = null

  for (const candidate of candidates) {
    const candidateBody = candidate ? { ...options.body, number: candidate } : options.body
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      totalAttempts++
      
      try {
        logs.push(createLog('info', 'ATTEMPT_STARTED', `Tentativa ${attempt} iniciada.`, {
          phone: candidate ? maskPhone(candidate) : undefined,
          attempt,
        }))

        const response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: {
            apikey: config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(candidateBody),
        }, config.timeoutMs)

        const responseBody = await parseResponse(response)

        if (response.ok) {
          logs.push(createLog('info', 'SENT', 'Evolution retornou sucesso.', {
            status: response.status,
            phone: candidate ? maskPhone(candidate) : undefined,
          }))
          
          return {
            ok: true,
            dryRun: false,
            status: response.status,
            code: 'EVOLUTION_SENT',
            message: 'Mensagem enviada pela Evolution.',
            phone: maskPhone(candidate),
            response: sanitizeForLog(responseBody),
            logs,
            durationMs: Date.now() - startTime,
            attempts: totalAttempts,
          }
        }

        // Erro HTTP
        const err = new Error(`Evolution HTTP ${response.status}`) as Error & { status?: number; response?: unknown }
        err.status = response.status
        err.response = responseBody
        throw err

      } catch (err) {
        lastError = err
        const errorMessage = (err as Error).message || 'Erro desconhecido'
        const errorStatus = (err as { status?: number }).status
        
        logs.push(createLog('warn', 'ATTEMPT_FAILED', `Tentativa ${attempt} falhou.`, {
          phone: candidate ? maskPhone(candidate) : undefined,
          attempt,
          error: errorMessage,
          status: errorStatus,
        }))

        // Verifica se deve retry
        if (!isRetryable(err) || attempt === MAX_ATTEMPTS) {
          break
        }

        // Delay exponencial
        await delay(RETRY_BASE_DELAY_MS * attempt)
      }
    }
  }

  // Falha final
  const errorMessage = (lastError as Error | null)?.message || 'Falha ao enviar pela Evolution.'
  logs.push(createLog('error', 'RETRY_EXHAUSTED', 'Evolution falhou apos todas as tentativas.', {
    totalAttempts,
    lastError: errorMessage,
  }))

  return {
    ok: false,
    dryRun: false,
    code: 'EVOLUTION_RETRY_EXHAUSTED',
    message: errorMessage,
    logs,
    durationMs: Date.now() - startTime,
    attempts: totalAttempts,
  }
}
