/**
 * Fluxo de boas-vindas.
 * Envia sequencia de midias e textos para novo cliente.
 * 
 * Etapas:
 * 1. Audio de boas-vindas
 * 2. Audio de explicacao
 * 3. Imagem de prova social
 * 4. Audio perguntando aparelho
 * 
 * Regras de seguranca:
 * - Dry-run bloqueia envio real
 * - Em modo real, so permite envio para OPERATOR_WHATSAPP
 */

import { createLog, type LogEntry, type ResultCode } from '@/lib/types'
import { isValidWelcomeStep, WELCOME_STEP_IDS, type WelcomeStepId } from '@/lib/types/flow'
import { getEvolutionConfig } from '../evolution/config'
import { maskPhone } from '../evolution/mask'
import { normalizePhone } from '../evolution/normalize-phone'
import { sendAudio } from '../evolution/send-audio'
import { sendMedia } from '../evolution/send-media'
import { sendText } from '../evolution/send-text'
import { shouldDryRun, type EvolutionSendResult } from '../evolution/types'

// ============================================
// Tipos
// ============================================

// Re-export para compatibilidade
export { WelcomeStepId, isValidWelcomeStep, WELCOME_STEP_IDS }

export interface WelcomeStep {
  step: WelcomeStepId
  type: 'audio' | 'image'
  label: string
  url: string
  caption?: string
  fallbackText: string
}

export interface WelcomeFlowInput {
  phone: string
  client?: { name?: string }
  dryRun?: boolean
}

export interface WelcomeStepResult {
  step: WelcomeStepId
  label: string
  ok: boolean
  dryRun: boolean
  fallbackUsed?: boolean
  code: ResultCode | string
  message: string
  result?: EvolutionSendResult
}

export interface WelcomeFlowResult {
  ok: boolean
  dryRun: boolean
  code: ResultCode | string
  message: string
  phone: string
  status?: 'aguardando_aparelho' | 'parcial' | 'completo' | 'falha'
  failedStep?: WelcomeStepId
  steps: WelcomeStep[]
  results?: WelcomeStepResult[]
  logs?: LogEntry[]
}

// ============================================
// Constantes
// ============================================

const SOCIAL_CAPTION = '👆🏼 Esses são alguns dos nossos 800 clientes que fizeram o teste do nosso servidor e se tornaram clientes fiéis, pela qualidade, suporte e diferença absurda de qualquer outro servidor do mercado!'

const FALLBACK_TEXTS = {
  welcome: 'Olá! Obrigado pelo contato. Vou te explicar rapidinho como funciona nosso teste e nosso atendimento.',
  explanation: 'A Central Play Plus trabalha com acesso estável, suporte rápido e aplicativos compatíveis com vários aparelhos. A qualidade depende bastante da internet e do aplicativo instalado, mas eu te ajudo na configuração.',
  device: 'Informe o aparelho do cliente para enviar o guia correto.',
}

// URLs padrao (podem ser sobrescritas por env vars)
const DEFAULT_URLS = {
  audio_1: 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/boasvindas.ogg',
  audio_2: 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/explica%C3%A7%C3%A3o.ogg',
  social_image: 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/artefeedbacks.png',
  audio_4: 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/qualasuatv.ogg',
}

// ============================================
// Builder
// ============================================

export function buildWelcomeFlow(): WelcomeStep[] {
  return [
    {
      step: 'audio_1',
      type: 'audio',
      label: 'Audio de boas-vindas',
      url: process.env.WELCOME_AUDIO_URL || DEFAULT_URLS.audio_1,
      fallbackText: FALLBACK_TEXTS.welcome,
    },
    {
      step: 'audio_2',
      type: 'audio',
      label: 'Audio de explicacao',
      url: process.env.EXPLANATION_AUDIO_URL || DEFAULT_URLS.audio_2,
      fallbackText: FALLBACK_TEXTS.explanation,
    },
    {
      step: 'social_image',
      type: 'image',
      label: 'Imagem de prova social',
      url: process.env.SOCIAL_PROOF_IMAGE_URL || DEFAULT_URLS.social_image,
      caption: SOCIAL_CAPTION,
      fallbackText: SOCIAL_CAPTION,
    },
    {
      step: 'audio_4',
      type: 'audio',
      label: 'Audio perguntando aparelho',
      url: process.env.DEVICE_QUESTION_AUDIO_URL || DEFAULT_URLS.audio_4,
      fallbackText: FALLBACK_TEXTS.device,
    },
  ]
}

export function getWelcomeStep(stepId: string): WelcomeStep | null {
  return buildWelcomeFlow().find((item) => item.step === stepId) || null
}

// ============================================
// Guards
// ============================================

function resolveDryRun(inputDryRun?: boolean): boolean {
  const config = getEvolutionConfig()
  return Boolean(inputDryRun || shouldDryRun(config))
}

function assertOperatorOnly(phone: string, dryRun: boolean): { ok: true } | { ok: false; message: string } {
  if (dryRun) return { ok: true }
  
  const config = getEvolutionConfig()
  const target = normalizePhone(phone)
  const operator = normalizePhone(config.operatorWhatsapp)
  
  if (!target || !operator || target !== operator) {
    return {
      ok: false,
      message: 'Envio real bloqueado: nesta fase apenas OPERATOR_WHATSAPP e permitido.',
    }
  }
  
  return { ok: true }
}

// ============================================
// Executor de etapa
// ============================================

async function executeStep(
  phone: string,
  step: WelcomeStep,
  dryRun: boolean,
  context: Record<string, unknown>
): Promise<WelcomeStepResult> {
  // Tenta enviar midia
  const result = step.type === 'audio'
    ? await sendAudio({ phone, audioUrl: step.url, dryRun, context })
    : await sendMedia({
        phone,
        mediaUrl: step.url,
        caption: step.caption || '',
        type: 'image',
        mimetype: 'image/png',
        fileName: 'prova-social.png',
        dryRun,
        context,
      })

  if (result.ok) {
    return {
      step: step.step,
      label: step.label,
      ok: true,
      dryRun: result.dryRun,
      code: result.code,
      message: result.message,
      result,
    }
  }

  // Fallback: envia texto se midia falhar
  const fallback = await sendText({
    phone,
    message: step.fallbackText,
    dryRun,
    context: { ...context, fallback_for: step.step },
  })

  return {
    step: step.step,
    label: step.label,
    ok: fallback.ok,
    dryRun: fallback.dryRun,
    fallbackUsed: true,
    code: fallback.ok ? 'FALLBACK_USED' : result.code,
    message: fallback.ok
      ? 'Midia falhou; fallback de texto executado.'
      : result.message,
    result: fallback.ok ? fallback : result,
  }
}

// ============================================
// Dispatch principal
// ============================================

export async function dispatchWelcomeFlow(input: WelcomeFlowInput): Promise<WelcomeFlowResult> {
  const logs: LogEntry[] = []
  const dryRun = resolveDryRun(input.dryRun)
  const steps = buildWelcomeFlow()
  const maskedPhone = maskPhone(input.phone)

  logs.push(createLog('info', 'WELCOME_STARTED', 'Fluxo de boas-vindas iniciado.', {
    phone: maskedPhone,
    dryRun,
    totalSteps: steps.length,
  }))

  // Guard: operador
  const guard = assertOperatorOnly(input.phone, dryRun)
  if (!guard.ok) {
    logs.push(createLog('warn', 'OPERATOR_ONLY', guard.message, { phone: maskedPhone }))
    return {
      ok: false,
      dryRun,
      code: 'OPERATOR_ONLY',
      message: guard.message,
      phone: maskedPhone,
      status: 'falha',
      steps,
      logs,
    }
  }

  // Dry-run: retorna preview
  if (dryRun) {
    logs.push(createLog('info', 'DRY_RUN', 'Dry-run: nenhuma etapa real foi enviada.'))
    return {
      ok: true,
      dryRun: true,
      code: 'DRY_RUN',
      message: 'Dry-run: nenhuma etapa real foi enviada.',
      phone: maskedPhone,
      status: 'aguardando_aparelho',
      steps,
      logs,
    }
  }

  // Executa etapas em sequencia
  const results: WelcomeStepResult[] = []
  for (const step of steps) {
    logs.push(createLog('info', 'STEP_STARTED', `Executando etapa: ${step.step}`, { step: step.step }))
    
    const result = await executeStep(input.phone, step, false, {
      flow: 'welcome',
      step: step.step,
      client: input.client || {},
    })
    results.push(result)

    if (result.fallbackUsed) {
      logs.push(createLog('warn', 'FALLBACK_USED', `Fallback usado na etapa ${step.step}.`, { step: step.step }))
    }

    if (!result.ok) {
      logs.push(createLog('error', 'STEP_FAILED', `Falha na etapa ${step.step}.`, { step: step.step }))
      return {
        ok: false,
        dryRun: false,
        code: 'FLOW_PARTIAL',
        message: `Falha na etapa ${step.step}.`,
        phone: maskedPhone,
        status: 'parcial',
        failedStep: step.step,
        steps,
        results,
        logs,
      }
    }

    logs.push(createLog('info', 'STEP_SENT', `Etapa ${step.step} concluida.`, { step: step.step }))
  }

  logs.push(createLog('info', 'WELCOME_COMPLETED', 'Fluxo de boas-vindas completo.'))
  return {
    ok: true,
    dryRun: false,
    code: 'FLOW_COMPLETED',
    message: 'Fluxo de boas-vindas enviado.',
    phone: maskedPhone,
    status: 'aguardando_aparelho',
    steps,
    results,
    logs,
  }
}

// ============================================
// Retry de etapa individual
// ============================================

export async function retryWelcomeStep(
  input: WelcomeFlowInput & { step: WelcomeStepId }
): Promise<WelcomeStepResult & { phone: string; logs?: LogEntry[] }> {
  const logs: LogEntry[] = []
  const step = getWelcomeStep(input.step)
  const maskedPhone = maskPhone(input.phone)

  if (!step) {
    logs.push(createLog('error', 'INVALID_STEP', 'Etapa invalida.', { step: input.step }))
    return {
      step: input.step,
      label: 'Desconhecida',
      ok: false,
      dryRun: true,
      code: 'INVALID_STEP',
      message: 'Etapa invalida.',
      phone: maskedPhone,
      logs,
    }
  }

  const dryRun = resolveDryRun(input.dryRun)

  logs.push(createLog('info', 'RETRY_STARTED', `Retry da etapa ${step.step} iniciado.`, {
    phone: maskedPhone,
    step: step.step,
    dryRun,
  }))

  // Guard: operador
  const guard = assertOperatorOnly(input.phone, dryRun)
  if (!guard.ok) {
    logs.push(createLog('warn', 'OPERATOR_ONLY', guard.message))
    return {
      step: step.step,
      label: step.label,
      ok: false,
      dryRun,
      code: 'OPERATOR_ONLY',
      message: guard.message,
      phone: maskedPhone,
      logs,
    }
  }

  // Dry-run
  if (dryRun) {
    logs.push(createLog('info', 'DRY_RUN', 'Dry-run: retry preparado, sem envio real.'))
    return {
      step: step.step,
      label: step.label,
      ok: true,
      dryRun: true,
      code: 'DRY_RUN',
      message: 'Dry-run: retry preparado, sem envio real.',
      phone: maskedPhone,
      logs,
    }
  }

  // Executa retry
  const result = await executeStep(input.phone, step, false, {
    flow: 'welcome_retry',
    step: step.step,
    client: input.client || {},
  })

  logs.push(createLog(
    result.ok ? 'info' : 'error',
    result.ok ? 'STEP_RETRY_SUCCESS' : 'STEP_RETRY_FAILED',
    result.ok ? `Retry da etapa ${step.step} concluido.` : `Retry da etapa ${step.step} falhou.`,
    { step: step.step }
  ))

  return { ...result, phone: maskedPhone, logs }
}
