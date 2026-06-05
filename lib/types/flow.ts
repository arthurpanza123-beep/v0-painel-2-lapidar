/**
 * Tipos para flows do sistema.
 * Define os flows permitidos, contextos e payloads.
 */

export const FLOW_KEYS = [
  'test_created',
  'test_expired',
  'access_activated',
  'renewal_created',
  'install_requested',
  'app_swap',
  'second_screen',
  'problem_created',
  'xcloud_remove_device',
  'xcloud_recreate_device',
  'charge_customer',
  'welcome',
] as const

export type FlowKey = (typeof FLOW_KEYS)[number]

export function isValidFlow(value: unknown): value is FlowKey {
  return typeof value === 'string' && FLOW_KEYS.includes(value as FlowKey)
}

/**
 * Contexto completo de mensagem.
 * Suporta multiplas variacoes de nomes de campos para compatibilidade.
 */
export interface MessageContext {
  // Identificacao
  phone?: string
  cliente?: string
  clientName?: string
  
  // App e acesso
  app?: string
  appNovo?: string
  appAntigo?: string
  codigo?: string
  code?: string
  usuario?: string
  username?: string
  senha?: string
  password?: string
  host?: string
  dns?: string
  
  // Painel
  painel?: string
  panel?: string
  link?: string
  
  // Financeiro
  valor?: string
  vencimento?: string
  plan?: string
  
  // Dispositivo
  device?: string
  aparelho?: string
  
  // Problema
  problem?: string
  observacao?: string
  
  // XCloud
  mac?: string
  motivo?: string
}

/**
 * Campos obrigatorios por flow para validacao.
 */
export const FLOW_REQUIRED_FIELDS: Record<FlowKey, (keyof MessageContext)[]> = {
  test_created: [],
  test_expired: [],
  access_activated: [],
  renewal_created: [],
  install_requested: ['device'],
  app_swap: ['appNovo'],
  second_screen: ['device'],
  problem_created: [],
  xcloud_remove_device: ['mac'],
  xcloud_recreate_device: [],
  charge_customer: [],
  welcome: [],
}

/**
 * Valida se o contexto tem os campos obrigatorios para o flow.
 */
export function validateFlowContext(
  flow: FlowKey,
  context: MessageContext
): { valid: true } | { valid: false; missing: string[] } {
  const required = FLOW_REQUIRED_FIELDS[flow]
  const missing = required.filter((field) => {
    const value = context[field]
    return value === undefined || value === null || String(value).trim() === ''
  })
  
  if (missing.length > 0) {
    return { valid: false, missing }
  }
  return { valid: true }
}

/**
 * Etapas do fluxo de boas-vindas.
 */
export const WELCOME_STEP_IDS = ['audio_1', 'audio_2', 'social_image', 'audio_4'] as const
export type WelcomeStepId = (typeof WELCOME_STEP_IDS)[number]

export function isValidWelcomeStep(value: unknown): value is WelcomeStepId {
  return typeof value === 'string' && WELCOME_STEP_IDS.includes(value as WelcomeStepId)
}

export interface WelcomeStep {
  id: WelcomeStepId
  type: 'audio' | 'image'
  label: string
  url: string
  caption?: string
  fallbackText: string
}

/**
 * Dispositivos suportados para instalacao.
 */
export const INSTALL_DEVICES = [
  'Samsung',
  'LG',
  'Roku',
  'Android TV / Google TV / TCL',
  'TV Box',
  'Fire Stick / Mi Stick',
  'Celular Android',
  'iPhone / iOS',
  'PC',
] as const

export type InstallDevice = (typeof INSTALL_DEVICES)[number]

/**
 * Apps suportados para instalacao.
 */
export interface InstallApp {
  id: string
  name: string
  downloader?: string
  providerCode?: string
  devices: readonly InstallDevice[]
}
