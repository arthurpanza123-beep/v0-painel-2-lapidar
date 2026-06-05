import { NextResponse } from 'next/server'
import { parseJson, validateSchema, welcomeRetrySchema, jsonResult, jsonError } from '@/lib/api-helpers'
import { retryWelcomeStep, WELCOME_STEP_IDS } from '@/lib/services/messages/welcome-flow'

export async function POST(request: Request) {
  const body = await parseJson(request)
  
  if (!body || typeof body !== 'object') {
    return jsonError('INVALID_JSON', 'Envie JSON valido.')
  }

  const validation = validateSchema(welcomeRetrySchema, body)
  if (!validation.ok) {
    return NextResponse.json({ ...validation.error, allowed: WELCOME_STEP_IDS }, { status: 400 })
  }

  const { phone, step, client, dryRun } = validation.data
  const result = await retryWelcomeStep({ phone, step, client: client || {}, dryRun })
  
  return jsonResult(result)
}
