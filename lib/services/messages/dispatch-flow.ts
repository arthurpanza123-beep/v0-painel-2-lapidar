/**
 * Dispatch de flows.
 * Valida payload, monta mensagem e envia via Evolution.
 */

import { createLog, type LogEntry, type ResultCode } from '@/lib/types'
import { isValidFlow, validateFlowContext, type FlowKey, type MessageContext } from '@/lib/types/flow'
import { getEvolutionConfig } from '../evolution/config'
import { maskPhone } from '../evolution/mask'
import { sendText } from '../evolution/send-text'
import { shouldDryRun } from '../evolution/types'
import { buildFlowMessage, FLOW_KEYS, ALLOWED_FLOWS } from './templates'

// Re-export
export { ALLOWED_FLOWS }

// ============================================
// Tipos
// ============================================

export interface DispatchFlowInput {
  flow: FlowKey
  phone?: string
  context?: MessageContext
  dryRun?: boolean
}

export interface DispatchFlowResult {
  ok: boolean
  dryRun: boolean
  code: ResultCode | string
  message: string
  flow: FlowKey
  phone?: string
  preview: string
  logs: LogEntry[]
  allowed?: readonly string[]
  missingFields?: string[]
}

// ============================================
// Dispatch principal
// ============================================

export async function dispatchFlow(input: DispatchFlowInput): Promise<DispatchFlowResult> {
  const logs: LogEntry[] = []
  const config = getEvolutionConfig()

  // Valida flow
  if (!isValidFlow(input.flow)) {
    logs.push(createLog('error', 'INVALID_FLOW', 'Flow invalido.', { flow: input.flow }))
    return {
      ok: false,
      dryRun: true,
      code: 'INVALID_FLOW',
      message: 'Fluxo invalido.',
      flow: input.flow,
      preview: '',
      allowed: ALLOWED_FLOWS,
      logs,
    }
  }

  const context = input.context || {}
  
  // Valida campos obrigatorios do flow
  const validation = validateFlowContext(input.flow, context)
  if (!validation.valid) {
    logs.push(createLog('warn', 'VALIDATION_FAILED', 'Campos obrigatorios faltando.', {
      flow: input.flow,
      missing: validation.missing,
    }))
    // Nao bloqueia - apenas avisa
  }

  // Resolve telefone
  const phone = input.phone || context.phone || (input.flow === 'test_expired' ? config.operatorWhatsapp : '')
  const maskedPhone = phone ? maskPhone(phone) : undefined

  // Monta mensagem
  const preview = buildFlowMessage(input.flow, context)

  logs.push(createLog('info', 'DISPATCH_PREPARED', `Flow ${input.flow} preparado.`, {
    flow: input.flow,
    phone: maskedPhone,
    hasPreview: Boolean(preview),
  }))

  // Sem telefone: retorna apenas preview
  if (!phone) {
    logs.push(createLog('info', 'NO_PHONE', 'Nenhum telefone informado para envio.'))
    return {
      ok: true,
      dryRun: true,
      code: 'MESSAGE_PREPARED',
      message: 'Mensagem preparada. Nenhum telefone informado para envio.',
      flow: input.flow,
      preview,
      logs,
    }
  }

  // Dry-run
  const dryRun = input.dryRun || shouldDryRun(config)
  if (dryRun) {
    logs.push(createLog('info', 'DRY_RUN', 'Dry-run: mensagem nao enviada.', {
      enabled: config.enabled,
      dryRun: config.dryRun,
    }))
    return {
      ok: true,
      dryRun: true,
      code: 'DRY_RUN',
      message: 'Dry-run: mensagem preparada, sem envio real.',
      flow: input.flow,
      phone: maskedPhone,
      preview,
      logs,
    }
  }

  // Envia
  logs.push(createLog('info', 'SENDING', 'Enviando mensagem.'))
  const result = await sendText({
    phone,
    message: preview,
    context: { flow: input.flow, ...context },
    dryRun: false,
  })

  logs.push(...(result.logs || []))

  if (result.ok) {
    logs.push(createLog('info', 'DISPATCH_SENT', `Flow ${input.flow} enviado.`))
  } else {
    logs.push(createLog('error', 'DISPATCH_FAILED', `Falha ao enviar flow ${input.flow}.`))
  }

  return {
    ok: result.ok,
    dryRun: result.dryRun,
    code: result.code,
    message: result.message,
    flow: input.flow,
    phone: maskedPhone,
    preview,
    logs,
  }
}
