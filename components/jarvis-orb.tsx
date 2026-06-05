'use client'

import type { JarvisCtx } from '@/app/page'

interface Props {
  ctx: JarvisCtx
}

type RingConfig = {
  size: number
  opacity: string
  animation: string
  border: string
  glow?: string
}

const STATE_COLOR: Record<string, string> = {
  aguardando:    '#3b82f6',
  recebendo:     '#22d3ee',
  interpretando: '#a78bfa',
  preparando:    '#3b82f6',
  executando:    '#22d3ee',
  falha:         '#ef4444',
  reenvio:       '#f59e0b',
  concluido:     '#22c55e',
}

const STATE_GLOW: Record<string, string> = {
  aguardando:    'animate-jarvis-pulse',
  recebendo:     'animate-jarvis-pulse',
  interpretando: 'animate-jarvis-pulse',
  preparando:    'animate-jarvis-pulse',
  executando:    'animate-jarvis-pulse',
  falha:         'animate-jarvis-alert',
  reenvio:       'animate-jarvis-pulse',
  concluido:     'animate-jarvis-success',
}

export function JarvisOrb({ ctx }: Props) {
  const color = STATE_COLOR[ctx.state] ?? '#3b82f6'
  const glowClass = STATE_GLOW[ctx.state] ?? 'animate-jarvis-pulse'
  const isAlert = ctx.state === 'falha'
  const isSuccess = ctx.state === 'concluido'

  const rings: RingConfig[] = [
    { size: 320, opacity: '0.08', animation: 'animate-ring-slow',     border: `1px solid ${color}` },
    { size: 280, opacity: '0.12', animation: 'animate-ring-rev-slow', border: `1px solid ${color}` },
    { size: 240, opacity: '0.18', animation: 'animate-ring-med',      border: `1.5px solid ${color}` },
    { size: 200, opacity: '0.25', animation: 'animate-ring-rev-med',  border: `1.5px solid ${color}` },
    { size: 162, opacity: '0.35', animation: 'animate-ring-cw',       border: `2px solid ${color}`, glow: `0 0 18px ${color}33` },
  ]

  // dots orbitais no anel exterior (decorativos)
  const orbitalDots = [
    { angle: 135, size: 4, color: '#ec4899' },
    { angle: 20,  size: 3.5, color: '#22d3ee' },
    { angle: 260, size: 4, color: '#ec4899' },
  ]

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Rings */}
      {rings.map((r, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${r.animation}`}
          style={{
            width: r.size,
            height: r.size,
            border: r.border,
            opacity: Number(r.opacity),
            boxShadow: r.glow,
          }}
        />
      ))}

      {/* Orbital dots no anel de 162px */}
      {orbitalDots.map((d, i) => {
        const rad = (d.angle * Math.PI) / 180
        const r = 81
        const x = Math.cos(rad) * r
        const y = Math.sin(rad) * r
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: d.size,
              height: d.size,
              background: d.color,
              boxShadow: `0 0 6px ${d.color}`,
              transform: `translate(${x}px, ${y}px)`,
            }}
          />
        )
      })}

      {/* Núcleo — glow + scan line */}
      <div
        className={`relative flex h-36 w-36 items-center justify-center rounded-full ${glowClass}`}
        style={{
          background: isAlert
            ? 'radial-gradient(circle at 40% 35%, #2a0a0a 0%, #120505 60%, #080c18 100%)'
            : isSuccess
              ? 'radial-gradient(circle at 40% 35%, #0a2a12 0%, #051205 60%, #080c18 100%)'
              : 'radial-gradient(circle at 40% 35%, #0d1e3d 0%, #071228 60%, #080c18 100%)',
          border: `1.5px solid ${color}50`,
        }}
      >
        {/* Reflexo interno */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${color}22 0%, transparent 65%)`,
          }}
        />

        {/* Scan line */}
        <div
          className="animate-scan pointer-events-none absolute inset-x-3 h-px rounded-full"
          style={{ background: `linear-gradient(to right, transparent, ${color}55, transparent)` }}
        />

        {/* Texto central */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 px-2 text-center">
          <p
            key={ctx.label}
            className="animate-fade-up font-mono text-xs font-bold uppercase tracking-[0.22em]"
            style={{ color }}
          >
            {ctx.label}
          </p>
          <p
            key={ctx.sub}
            className="animate-fade-up font-sans text-[10px] leading-tight text-foreground/60"
          >
            {ctx.sub}
          </p>

          {/* Dots de atividade */}
          <div className="mt-1 flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 4px ${color}`,
                  animation: `dot-bounce 1.4s ${i * 0.18}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Título abaixo do orb */}
      <div
        className="absolute flex flex-col items-center gap-1 whitespace-nowrap"
        style={{ top: '50%', transform: 'translateY(108px)' }}
      >
        <p className="font-mono text-[18px] font-bold tracking-[0.35em] text-foreground/90">
          J A R V I S
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground/50">
          Central Play
        </p>
      </div>
    </div>
  )
}
