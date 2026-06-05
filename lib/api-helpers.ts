/**
 * Helpers para routes da API.
 * Validacao de payload e respostas padronizadas.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { FLOW_KEYS, WELCOME_STEP_IDS } from '@/lib/types/flow'

// ============================================
// Schemas Zod
// ============================================

export const phoneSchema = z.string().min(8).max(20)

export const clientSchema = z.object({
  name: z.string().optional(),
}).optional()

export const welcomeFlowSchema = z.object({
  phone: phoneSchema,
  client: clientSchema,
  dryRun: z.boolean().optional(),
})

export const welcomeRetrySchema = z.object({
  phone: phoneSchema,
  step: z.enum(WELCOME_STEP_IDS),
  client: clientSchema,
  dryRun: z.boolean().optional(),
})

export const dispatchFlowSchema = z.object({
  flow: z.enum(FLOW_KEYS),
  phone: phoneSchema.optional(),
  context: z.record(z.unknown()).optional(),
  dryRun: z.boolean().optional(),
})

export const installFlowSchema = z.object({
  phone: phoneSchema,
  app: z.string().min(1),
  device: z.string().min(1),
  client: clientSchema,
  dryRun: z.boolean().optional(),
})

export const sendTextSchema = z.object({
  phone: phoneSchema,
  message: z.string().min(1),
  context: z.record(z.unknown()).optional(),
  dryRun: z.boolean().optional(),
})

export const sendMediaSchema = z.object({
  phone: phoneSchema,
  mediaUrl: z.string().url(),
  caption: z.string().optional(),
  type: z.enum(['image', 'video', 'document']).default('image'),
  mimetype: z.string().optional(),
  fileName: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  dryRun: z.boolean().optional(),
})

export const sendAudioSchema = z.object({
  phone: phoneSchema,
  audioUrl: z.string().url(),
  context: z.record(z.unknown()).optional(),
  dryRun: z.boolean().optional(),
})

// ============================================
// Helpers
// ============================================

export interface ApiError {
  ok: false
  code: string
  message: string
  errors?: z.ZodIssue[]
  allowed?: readonly string[]
}

export function parseJson<T>(request: Request): Promise<T | null> {
  return request.json().catch(() => null)
}

type ValidationSuccess<T> = { ok: true; data: T }
type ValidationError = { ok: false; error: ApiError }

export function validateSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationSuccess<z.infer<T>> | ValidationError {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      ok: false,
      error: {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: 'Payload invalido.',
        errors: result.error.issues,
      },
    }
  }
  
  return { ok: true, data: result.data as z.infer<T> }
}

export function jsonError(code: string, message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { ok: false, code, message, ...extra },
    { status }
  )
}

export function jsonSuccess<T extends Record<string, unknown>>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { ok: true, ...data },
    { status }
  )
}

export function jsonResult<T extends { ok: boolean }>(result: T): NextResponse {
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
