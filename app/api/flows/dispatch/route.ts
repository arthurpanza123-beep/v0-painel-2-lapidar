import { NextResponse } from 'next/server'
import { parseJson, validateSchema, dispatchFlowSchema, jsonResult, jsonError } from '@/lib/api-helpers'
import { dispatchFlow, ALLOWED_FLOWS } from '@/lib/services/messages/dispatch-flow'

export async function POST(request: Request) {
  const body = await parseJson(request)
  
  if (!body || typeof body !== 'object') {
    return jsonError('INVALID_JSON', 'Envie JSON valido.')
  }

  const validation = validateSchema(dispatchFlowSchema, body)
  if (!validation.ok) {
    return NextResponse.json({ ...validation.error, allowed: ALLOWED_FLOWS }, { status: 400 })
  }

  const { flow, phone, context, dryRun } = validation.data
  const result = await dispatchFlow({ flow, phone, context: context || {}, dryRun })
  
  return jsonResult(result)
}
