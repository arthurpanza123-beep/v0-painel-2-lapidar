/**
 * Templates de mensagem para os flows.
 * Cada flow tem seu builder de mensagem.
 */

import { FLOW_KEYS, type FlowKey, type MessageContext } from '@/lib/types/flow'
import { buildInstallMessage as buildInstallTemplate } from './install-templates'

// Re-exports para compatibilidade
export { FLOW_KEYS, FLOW_KEYS as ALLOWED_FLOWS }
export type { FlowKey, MessageContext }

// ============================================
// Helpers
// ============================================

function pick(...values: Array<unknown>): string {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) return text
  }
  return ''
}

function optional(label: string, value: unknown): string | null {
  const text = pick(value)
  return text ? `${label}: ${text}` : null
}

// ============================================
// Builders de mensagem
// ============================================

export function buildTestCreatedMessage(ctx: MessageContext = {}): string {
  const app = pick(ctx.app, 'Aplicativo')
  const isXcloud = /x\s*cloud|xcloud/i.test(app)
  return [
    'Teste ativado com sucesso!',
    '',
    optional('Cliente', pick(ctx.cliente, ctx.clientName)),
    optional('App', app),
    optional('Codigo', pick(ctx.codigo, ctx.code)),
    optional('Usuario', pick(ctx.usuario, ctx.username)),
    optional('Senha', pick(ctx.senha, ctx.password)),
    optional('Host/DNS', pick(ctx.host, ctx.dns)),
    '',
    isXcloud
      ? 'Abra o aplicativo e clique em RELOAD ou RECARREGAR para carregar a lista.'
      : 'Abra o aplicativo e entre com os dados acima.',
  ].filter(Boolean).join('\n')
}

export function buildTestExpiredOperatorMessage(ctx: MessageContext = {}): string {
  return [
    `Teste encerrado: ${pick(ctx.cliente, ctx.clientName, 'Cliente')}`,
    optional('App', ctx.app),
    optional('Painel', pick(ctx.painel, ctx.panel)),
    optional('Abrir cliente', ctx.link),
  ].filter(Boolean).join('\n')
}

export function buildRenewalMessage(ctx: MessageContext = {}): string {
  return [
    `Ola, ${pick(ctx.cliente, ctx.clientName, 'cliente')}.`,
    '',
    'Sua renovacao da Central Play Plus esta disponivel.',
    optional('Plano', pick(ctx.plan, ctx.app)),
    optional('Valor', ctx.valor),
    optional('Vencimento', ctx.vencimento),
  ].filter(Boolean).join('\n')
}

export function buildAccessActivatedMessage(ctx: MessageContext = {}): string {
  const cliente = pick(ctx.cliente, ctx.clientName, 'cliente')
  const app = pick(ctx.app, 'Aplicativo')
  const plano = pick(ctx.plan, 'Mensal')
  const validade = pick(ctx.vencimento)
  const isXcloud = /x\s*cloud|xcloud/i.test(app)
  const isSmart = /smart\s*(stb|up)/i.test(app)

  // Smart STB / Smart UP: orientar DNS do catalogo + foto da rede se precisar
  if (isSmart) {
    return [
      'Acesso ativado com sucesso! \u2705',
      '',
      `Cliente: ${cliente}`,
      `App: ${app}`,
      `Plano: ${plano}`,
      validade ? `Validade: ${validade}` : null,
      '',
      'No seu aparelho, va em configuracoes de rede e ajuste o DNS:',
      optional('DNS', pick(ctx.dns, ctx.host)) || 'DNS: confira no painel do app',
      '',
      'Se precisar, me envia uma foto da tela de rede da sua TV que eu te ajudo a configurar.',
      '',
      'Qualquer duvida, me chama aqui que eu te ajudo. \ud83c\udf7f',
    ].filter(Boolean).join('\n')
  }

  // XCloud: nao tem usuario/senha, so RELOAD
  if (isXcloud) {
    return [
      'Acesso ativado com sucesso! \u2705',
      '',
      `Cliente: ${cliente}`,
      `Plano: ${plano}`,
      validade ? `Validade: ${validade}` : null,
      '',
      'Seu acesso ja esta liberado.',
      '',
      'Abra o XCloud e clique em *RELOAD* ou *RECARREGAR* para atualizar a lista.',
      '',
      'Qualquer duvida, me chama aqui que eu te ajudo. \ud83c\udf7f',
    ].filter(Boolean).join('\n')
  }

  // App comum: tem dados de acesso (usuario/senha/provider/codigo)
  const usuario = pick(ctx.usuario, ctx.username)
  const senha = pick(ctx.senha, ctx.password)
  const providerOuCodigo = pick(ctx.codigo, ctx.code, ctx.host, ctx.dns)
  return [
    'Acesso ativado com sucesso! \u2705',
    '',
    `Cliente: ${cliente}`,
    `App: ${app}`,
    `Plano: ${plano}`,
    validade ? `Validade: ${validade}` : null,
    '',
    'Dados de acesso:',
    '',
    providerOuCodigo || null,
    usuario ? `Usuario: ${usuario}` : null,
    senha ? `Senha: ${senha}` : null,
    '',
    'Abra o aplicativo, preencha os dados acima e aproveite.',
    '',
    'Qualquer duvida, me chama aqui que eu te ajudo. \ud83c\udf7f',
  ].filter(Boolean).join('\n')
}

export function buildInstallMessage(ctx: MessageContext = {}): string {
  return buildInstallTemplate(
    pick(ctx.app, 'XCloud'),
    pick(ctx.device, ctx.aparelho, 'Android TV / Google TV / TCL')
  )
}

export function buildAppSwapMessage(ctx: MessageContext = {}): string {
  return [
    `Troca de aplicativo: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('App antigo', ctx.appAntigo),
    optional('Novo app', pick(ctx.appNovo, ctx.app)),
    '',
    'Prepare o novo aplicativo e confirme com o cliente antes de orientar a troca.',
  ].filter(Boolean).join('\n')
}

export function buildSecondScreenMessage(ctx: MessageContext = {}): string {
  return [
    `Segunda tela solicitada: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('App', ctx.app),
    optional('Aparelho', pick(ctx.device, ctx.aparelho)),
    '',
    'Confirme disponibilidade de tela e dados antes de enviar qualquer orientacao ao cliente.',
  ].filter(Boolean).join('\n')
}

export function buildProblemMessage(ctx: MessageContext = {}): string {
  return [
    `Problema registrado: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('App', ctx.app),
    optional('Ocorrencia', ctx.problem),
    optional('Observacao', ctx.observacao),
    '',
    'Prompt operacional pronto para triagem no Painel 2.',
  ].filter(Boolean).join('\n')
}

export function buildXcloudRemoveDeviceMessage(ctx: MessageContext = {}): string {
  return [
    `Remocao de dispositivo XCloud: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('MAC', ctx.mac),
    optional('Motivo', ctx.motivo),
    '',
    'Execute a remocao no painel XCloud.',
  ].filter(Boolean).join('\n')
}

export function buildXcloudRecreateDeviceMessage(ctx: MessageContext = {}): string {
  return [
    `Recriar dispositivo XCloud: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('MAC', ctx.mac),
    '',
    'Recrie o dispositivo no painel XCloud e envie os novos dados ao cliente.',
  ].filter(Boolean).join('\n')
}

export function buildChargeCustomerMessage(ctx: MessageContext = {}): string {
  return [
    `Cobranca: ${pick(ctx.cliente, ctx.clientName, 'cliente')}`,
    optional('Valor', ctx.valor),
    optional('Vencimento', ctx.vencimento),
    '',
    'Lembrete de cobranca enviado pelo sistema.',
  ].filter(Boolean).join('\n')
}

export function buildWelcomeFlowMessage(_ctx: MessageContext = {}): string {
  // Welcome flow usa sequencia de midias, nao texto unico
  return 'Fluxo de boas-vindas iniciado.'
}

// ============================================
// Builder principal
// ============================================

export function buildFlowMessage(flow: FlowKey, ctx: MessageContext = {}): string {
  switch (flow) {
    case 'test_created':
      return buildTestCreatedMessage(ctx)
    case 'test_expired':
      return buildTestExpiredOperatorMessage(ctx)
    case 'access_activated':
      return buildAccessActivatedMessage(ctx)
    case 'renewal_created':
      return buildRenewalMessage(ctx)
    case 'install_requested':
      return buildInstallMessage(ctx)
    case 'app_swap':
      return buildAppSwapMessage(ctx)
    case 'second_screen':
      return buildSecondScreenMessage(ctx)
    case 'problem_created':
      return buildProblemMessage(ctx)
    case 'xcloud_remove_device':
      return buildXcloudRemoveDeviceMessage(ctx)
    case 'xcloud_recreate_device':
      return buildXcloudRecreateDeviceMessage(ctx)
    case 'charge_customer':
      return buildChargeCustomerMessage(ctx)
    case 'welcome':
      return buildWelcomeFlowMessage(ctx)
    default:
      return `Flow desconhecido: ${flow}`
  }
}

// ============================================
// Midias dos flows
// ============================================

export const FLOW_MEDIA = {
  testValuesImageUrl: process.env.TEST_VALUES_IMAGE_URL || '',
  paymentConfirmedImageUrl: process.env.PAYMENT_CONFIRMED_IMAGE_URL || '',
  welcomeAudioUrl: process.env.WELCOME_AUDIO_URL || 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/boasvindas.ogg',
  explanationAudioUrl: process.env.EXPLANATION_AUDIO_URL || 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/explica%C3%A7%C3%A3o.ogg',
  socialProofImageUrl: process.env.SOCIAL_PROOF_IMAGE_URL || 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/artefeedbacks.png',
  deviceQuestionAudioUrl: process.env.DEVICE_QUESTION_AUDIO_URL || 'https://raw.githubusercontent.com/arthurpanza123-beep/public/main/qualasuatv.ogg',
}

// ============================================
// Templates legados (para compatibilidade)
// ============================================

export const INSTALL_TEMPLATES: Record<string, string> = {
  lg: [
    'Perfeito. Para instalar XCloud TV na TV LG:',
    '',
    'Abra a loja de aplicativos da TV e pesquise por XCloud TV.',
    'Pode aparecer tambem como IPTV XCloud Pro.',
    'Instale o aplicativo e abra.',
  ].join('\n'),
  samsung: [
    'Perfeito. Para instalar XCloud TV na TV Samsung:',
    '',
    'Abra a loja de aplicativos da TV e pesquise por XCloud TV.',
    'Instale o aplicativo e abra.',
  ].join('\n'),
  roku: [
    'Perfeito. Para instalar XCloud TV no Roku:',
    '',
    'Abra a loja de canais/apps do Roku e pesquise por XCloud TV.',
    'Instale o aplicativo e abra.',
  ].join('\n'),
  android_tv: [
    'Perfeito. Para instalar XCloud TV no Android TV / Google TV / TCL:',
    '',
    'Abra o aplicativo Downloader no aparelho.',
    'Digite o codigo 4866905.',
    'Clique em ir e instale o aplicativo.',
  ].join('\n'),
  tv_box: [
    'Perfeito. Para instalar XCloud TV na TV Box:',
    '',
    'Abra o aplicativo Downloader no aparelho.',
    'Digite o codigo 4866905.',
    'Clique em ir e instale o aplicativo.',
  ].join('\n'),
  fire_stick: [
    'Perfeito. Para instalar XCloud TV no Fire Stick / Mi Stick:',
    '',
    'Abra o aplicativo Downloader no aparelho.',
    'Digite o codigo 4866905.',
    'Clique em ir e instale o aplicativo.',
  ].join('\n'),
  celular_android: [
    'Perfeito. Para instalar XCloud TV no celular Android:',
    '',
    'Use este link para instalar:',
    'https://apk.centralplayplus.com.br/app/xcloudcelular.apk',
    '',
    'Depois de instalar, abra o aplicativo.',
  ].join('\n'),
  iphone: [
    'Perfeito. Para instalar XCloud TV no iPhone:',
    '',
    'Use este link para instalar pela App Store:',
    'https://apps.apple.com/pt/iphone/search?term=xcloud',
    '',
    'Depois de instalar, abra o aplicativo.',
  ].join('\n'),
  pc: [
    'Perfeito. Para entrar pelo PC:',
    '',
    'Use um player IPTV compativel com Xtream/M3U.',
    'Depois entre com os dados do teste enviados.',
  ].join('\n'),
}
