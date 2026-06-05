import { NextResponse } from 'next/server'
import { parseJson, validateSchema, installFlowSchema, jsonResult, jsonError } from '@/lib/api-helpers'
import { getEvolutionConfig } from '@/lib/services/evolution/config'
import { maskPhone } from '@/lib/services/evolution/mask'
import { normalizePhone } from '@/lib/services/evolution/normalize-phone'
import { sendText } from '@/lib/services/evolution/send-text'
import { buildInstallResult, INSTALL_DEVICES, INSTALL_APPS } from '@/lib/services/messages/install-templates'

export async function POST(request: Request) {
  const body = await parseJson(request)
  
  if (!body || typeof body !== 'object') {
    return jsonError('INVALID_JSON', 'Envie JSON valido.')
  }

  const validation = validateSchema(installFlowSchema, body)
  if (!validation.ok) {
    return NextResponse.json({
      ...validation.error,
      supportedDevices: INSTALL_DEVICES,
      supportedApps: INSTALL_APPS.map((a) => a.name),
    }, { status: 400 })
  }

  const { phone, app, device, client, dryRun } = validation.data
  const config = getEvolutionConfig()
  const isDryRun = Boolean(dryRun || config.dryRun || !config.enabled)
  const installResult = buildInstallResult(app, device)

  // Guard: operador
  if (!isDryRun) {
    const target = normalizePhone(phone)
    const operator = normalizePhone(config.operatorWhatsapp)
    if (!target || !operator || target !== operator) {
      return NextResponse.json({
        ok: false,
        dryRun: isDryRun,
        code: 'OPERATOR_ONLY',
        message: 'Envio real bloqueado: nesta fase apenas OPERATOR_WHATSAPP e permitido.',
        phone: maskPhone(phone),
        preview: installResult.message,
        compatible: installResult.compatible,
      }, { status: 400 })
    }
  }

  // Dry-run
  if (isDryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      code: 'INSTALL_DRY_RUN',
      message: 'Dry-run: guia de instalacao preparado, sem envio real.',
      phone: maskPhone(phone),
      preview: installResult.message,
      compatible: installResult.compatible,
      app: installResult.app.name,
      device: installResult.device,
    })
  }

  // Envia
  const result = await sendText({
    phone,
    message: installResult.message,
    dryRun: false,
    context: { flow: 'install', client: client || {}, app, device },
  })

  return jsonResult({
    ...result,
    preview: installResult.message,
    compatible: installResult.compatible,
  })
}
