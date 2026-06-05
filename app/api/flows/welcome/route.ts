import { NextResponse } from 'next/server'
import { parseJson, validateSchema, welcomeFlowSchema, jsonResult, jsonError } from '@/lib/api-helpers'
import { dispatchWelcomeFlow } from '@/lib/services/messages/welcome-flow'

export async function POST(request: Request) {
  const body = await parseJson(request)
  
  if (!body || typeof body !== 'object') {
    return jsonError('INVALID_JSON', 'Envie JSON valido.')
  }

  const validation = validateSchema(welcomeFlowSchema, body)
  if (!validation.ok) {
    return NextResponse.json(validation.error, { status: 400 })
  }

  const { phone, client, dryRun } = validation.data
  const result = await dispatchWelcomeFlow({ phone, client: client || {}, dryRun })
  
  return jsonResult(result)
}
