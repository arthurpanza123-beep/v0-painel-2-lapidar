/**
 * Templates de instalacao por app e dispositivo.
 * 
 * Apps suportados:
 * - XCloud (padrao)
 * - Blessed Player
 * - PlaySim
 * - FunPlay
 * - Smart STB
 * - Manual
 * 
 * Dispositivos suportados:
 * - Samsung, LG, Roku
 * - Android TV / Google TV / TCL
 * - TV Box
 * - Fire Stick / Mi Stick
 * - Celular Android
 * - iPhone / iOS
 * - PC
 * 
 * Codigos Downloader:
 * - XCloud: 4866905
 * - FunPlay: 257286
 * - PlaySim: 7275096
 * - Blessed Player: 6552503
 */

import { INSTALL_DEVICES as INSTALL_DEVICES_LIST, type InstallDevice } from '@/lib/types/flow'

// ============================================
// Tipos
// ============================================

export type { InstallDevice }

export interface InstallApp {
  id: string
  name: string
  downloader?: string
  providerCode?: string
  devices: readonly InstallDevice[]
}

export interface InstallResult {
  app: InstallApp
  device: InstallDevice
  message: string
  compatible: boolean
}

// ============================================
// Constantes
// ============================================

export const INSTALL_DEVICES: InstallDevice[] = [...INSTALL_DEVICES_LIST]

export const INSTALL_APPS: InstallApp[] = [
  {
    id: 'xcloud',
    name: 'XCloud',
    downloader: '4866905',
    devices: INSTALL_DEVICES,
  },
  {
    id: 'blessed',
    name: 'Blessed Player',
    downloader: '6552503',
    providerCode: '1105',
    devices: ['LG', 'Samsung', 'Roku', 'Android TV / Google TV / TCL', 'TV Box', 'Fire Stick / Mi Stick', 'Celular Android'],
  },
  {
    id: 'playsim',
    name: 'PlaySim',
    downloader: '7275096',
    providerCode: 'brtv',
    devices: ['LG', 'Samsung', 'Roku', 'Android TV / Google TV / TCL', 'TV Box', 'Fire Stick / Mi Stick', 'Celular Android'],
  },
  {
    id: 'funplay',
    name: 'FunPlay',
    downloader: '257286',
    providerCode: '00112',
    devices: ['LG', 'Samsung', 'Roku', 'Android TV / Google TV / TCL', 'TV Box', 'Fire Stick / Mi Stick', 'Celular Android'],
  },
  {
    id: 'smart-stb',
    name: 'Smart STB',
    devices: ['Samsung', 'LG', 'Android TV / Google TV / TCL', 'TV Box', 'Fire Stick / Mi Stick'],
  },
  {
    id: 'manual',
    name: 'Manual',
    devices: INSTALL_DEVICES,
  },
]

// URLs
const DOWNLOADER_VIDEO_URL = 'https://www.youtube.com/watch?v=ZCKnfzt1qaU'
const XCLOUD_ANDROID_URL = 'https://apk.centralplayplus.com.br/app/xcloudcelular.apk'
const XCLOUD_IOS_SEARCH_URL = 'https://apps.apple.com/pt/iphone/search?term=xcloud'
const PC_URL = 'http://webx.daxy.top/login'

// ============================================
// Normalizacao
// ============================================

function normalizeText(value: unknown): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normaliza input do usuario para um dispositivo conhecido.
 * Aceita variantes como "sansung", "tv lg", "caixinha", etc.
 */
export function normalizeInstallDevice(value: unknown): InstallDevice {
  const normalized = normalizeText(value)
  
  // Samsung (inclui erros de digitacao comuns)
  if (normalized.includes('samsung') || normalized.includes('sansung') || normalized.includes('samsumg')) {
    return 'Samsung'
  }
  
  // LG
  if (normalized === 'lg' || normalized.includes('tv lg') || normalized.includes('smart lg')) {
    return 'LG'
  }
  
  // Roku
  if (normalized.includes('roku')) {
    return 'Roku'
  }
  
  // TV Box (inclui variantes)
  if (normalized.includes('box') || normalized.includes('caixinha') || normalized.includes('tv box')) {
    return 'TV Box'
  }
  
  // Fire Stick / Mi Stick
  if (normalized.includes('fire') || normalized.includes('stick') || normalized.includes('stik') || normalized.includes('mi stick')) {
    return 'Fire Stick / Mi Stick'
  }
  
  // iPhone / iOS
  if (normalized.includes('iphone') || normalized.includes('ios') || normalized.includes('apple') || normalized.includes('ipad')) {
    return 'iPhone / iOS'
  }
  
  // Celular Android
  if (normalized.includes('celular') || normalized.includes('telefone') || normalized.includes('smartphone')) {
    return 'Celular Android'
  }
  
  // PC
  if (normalized.includes('pc') || normalized.includes('computador') || normalized.includes('notebook') || normalized.includes('windows') || normalized.includes('mac')) {
    return 'PC'
  }
  
  // Default
  return 'Android TV / Google TV / TCL'
}

/**
 * Resolve input do usuario para um app conhecido.
 * Retorna XCloud como fallback.
 */
export function resolveInstallApp(value: unknown): InstallApp {
  const normalized = normalizeText(value)
  
  const found = INSTALL_APPS.find((app) => {
    const id = normalizeText(app.id)
    const name = normalizeText(app.name)
    return normalized === id || normalized === name || normalized.includes(id) || normalized.includes(name)
  })
  
  // Fallback para XCloud
  return found || INSTALL_APPS[0]
}

/**
 * Verifica se app e XCloud.
 */
function isXcloud(app: InstallApp): boolean {
  return /xcloud|x\s*cloud/i.test(app.name)
}

// ============================================
// Builders de mensagem
// ============================================

function downloaderMessage(app: InstallApp, device: string, article: 'no' | 'na'): string {
  return [
    `Perfeito. Para instalar ${app.name} ${article} ${device}:`,
    '',
    'Siga o passo a passo desse video:',
    DOWNLOADER_VIDEO_URL,
    '',
    'Abra o aplicativo Downloader no aparelho.',
    `Digite o codigo ${app.downloader || '4866905'}.`,
    'Clique em ir e instale o aplicativo.',
  ].join('\n')
}

function storeMessage(app: InstallApp, device: InstallDevice, article: 'no' | 'na TV', storeLine: string, extraLine = ''): string {
  return [
    `Perfeito. Para instalar ${app.name} ${article} ${device}:`,
    '',
    storeLine,
    extraLine || null,
    'Instale o aplicativo e abra.',
  ].filter(Boolean).join('\n')
}

function buildIncompatibleMessage(app: InstallApp, device: InstallDevice): string {
  return [
    `${app.name} nao esta marcado como compativel com ${device}.`,
    '',
    'Sugestao: escolha XCloud ou FunPlay para esse aparelho, ou use a opcao Manual se o operador tiver outro guia.',
  ].join('\n')
}

// ============================================
// Builder principal
// ============================================

/**
 * Constroi mensagem de instalacao para app e dispositivo.
 * Retorna mensagem de incompatibilidade se combinacao nao suportada.
 */
export function buildInstallMessage(appValue: unknown = 'XCloud', deviceValue: unknown = 'LG'): string {
  const app = resolveInstallApp(appValue)
  const device = normalizeInstallDevice(deviceValue)

  // Verifica compatibilidade
  if (!app.devices.includes(device)) {
    return buildIncompatibleMessage(app, device)
  }

  // Celular Android
  if (device === 'Celular Android') {
    if (isXcloud(app)) {
      return [
        `Perfeito. Para instalar ${app.name} no celular Android:`,
        '',
        'Use este link para instalar:',
        XCLOUD_ANDROID_URL,
        '',
        'Depois de instalar, abra o aplicativo.',
      ].join('\n')
    }
    return [
      `Perfeito. Para instalar ${app.name} no celular Android:`,
      '',
      `Abra a Play Store do celular e pesquise por ${app.name}.`,
      'Instale o aplicativo e abra.',
    ].join('\n')
  }

  // iPhone / iOS
  if (device === 'iPhone / iOS') {
    if (isXcloud(app)) {
      return [
        `Perfeito. Para instalar ${app.name} no iPhone:`,
        '',
        'Use este link para instalar pela App Store:',
        XCLOUD_IOS_SEARCH_URL,
        '',
        'Depois de instalar, abra o aplicativo.',
      ].join('\n')
    }
    return [
      `Perfeito. Para instalar ${app.name} no iPhone:`,
      '',
      `Abra a App Store e pesquise por ${app.name}.`,
      'Instale o aplicativo e abra.',
    ].join('\n')
  }

  // PC
  if (device === 'PC') {
    return [
      'Perfeito. Para entrar, use este link no navegador:',
      '',
      PC_URL,
      'Entre com os dados do teste enviados.',
    ].join('\n')
  }

  // Downloader devices
  if (device === 'Android TV / Google TV / TCL') {
    return downloaderMessage(app, 'Android TV / Google TV', 'no')
  }
  if (device === 'TV Box') {
    return downloaderMessage(app, device, 'na')
  }
  if (device === 'Fire Stick / Mi Stick') {
    return downloaderMessage(app, device, 'no')
  }

  // Smart TVs (Samsung, LG, Roku)
  if (device === 'Samsung' || device === 'LG' || device === 'Roku') {
    const article = device === 'Roku' ? 'no' : 'na TV'
    const storeLine = device === 'Roku'
      ? `Abra a loja de canais/apps do Roku e pesquise por ${app.name}.`
      : `Abra a loja de aplicativos da TV e pesquise por ${app.name}.`
    const extraLine = device === 'LG' && isXcloud(app) ? 'Pode aparecer tambem como IPTV XCloud Pro.' : ''
    return storeMessage(app, device, article, storeLine, extraLine)
  }

  // Fallback generico
  return [
    `Perfeito. Para instalar ${app.name}:`,
    '',
    'Abra a loja de aplicativos.',
    `Pesquise por ${app.name}, instale e abra.`,
  ].join('\n')
}

/**
 * Constroi mensagem de instalacao com resultado detalhado.
 */
export function buildInstallResult(appValue: unknown = 'XCloud', deviceValue: unknown = 'LG'): InstallResult {
  const app = resolveInstallApp(appValue)
  const device = normalizeInstallDevice(deviceValue)
  const compatible = app.devices.includes(device)
  const message = buildInstallMessage(appValue, deviceValue)
  
  return { app, device, message, compatible }
}
