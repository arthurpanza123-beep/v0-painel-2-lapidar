/**
 * Envio de audio via Evolution API.
 */

import { getEvolutionConfig } from './config'
import { sendEvolutionRequest } from './client'
import type { SendAudioInput } from './types'

export async function sendAudio(input: SendAudioInput) {
  const config = getEvolutionConfig()
  const audio = input.audioUrl || input.audioPath || ''
  
  if (!audio) {
    return {
      ok: false,
      dryRun: true,
      code: 'AUDIO_REQUIRED' as const,
      message: 'Nenhum audio informado (audioUrl ou audioPath).',
      logs: [],
    }
  }
  
  return sendEvolutionRequest({
    action: 'send_audio',
    endpoint: `/message/sendWhatsAppAudio/${config.instance}`,
    phone: input.phone,
    body: {
      audio,
      delay: 1200,
      linkPreview: false,
      context: input.context || {},
    },
    config,
    forceDryRun: input.dryRun,
  })
}
