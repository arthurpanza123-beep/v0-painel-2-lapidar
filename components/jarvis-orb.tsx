'use client'

import type { JarvisCtx } from '@/app/page'

interface Props {
  ctx: JarvisCtx
}

const STATE_COLOR: Record<string, string> = {
  aguardando:    '#3b82f6',
  recebendo:     '#22d3ee',
  interpretando: '#a78bfa',
  preparando:    '#60a5fa',
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

type RingDef = {
  size: number
  opacity: number
  animation: string
  borderWidth: number
  dashes?: string
}

const RINGS: RingDef[] = [
  { size: 340, opacity: 0.04, animation: 'animate-ring-slow',     borderWidth: 1   },
  { size: 300, opacity: 0.07, animation: 'animate-ring-rev-slow', borderWidth: 1   },
  { size: 262, opacity: 0.11, animation: 'animate-ring-med',      borderWidth: 1.5 },
  { size: 224, opacity: 0.18, animation: 'animate-ring-rev-med',  borderWidth: 1.5, dashes: '8 6' },
  { size: 186, opacity: 0.28, animation: 'animate-ring-cw',       borderWidth: 2   },
  { size: 152, opacity: 0.45, animation: 'animate-ring-ccw',      borderWidth: 2   },
]

interface OrbitalDot {
  orbitRadius: number
  size: number
  color: string
  duration: number
  delay: number
  ccw?: boolean
}

const ORBITAL_DOTS: OrbitalDot[] = [
  { orbitRadius: 93,  size: 5,   color: '#ec4899', duration: 7,  delay: 0   },
  { orbitRadius: 93,  size: 3.5, color: '#22d3ee', duration: 7,  delay: 3.5 },
  { orbitRadius: 113, size: 4,   color: '#a78bfa', duration: 11, delay: 0,  ccw: true },
  { orbitRadius: 131, size: 3,   color: '#f59e0b', duration: 15, delay: 5   },
]

export function JarvisOrb({ ctx }: Props) {
  const color     = STATE_COLOR[ctx.state] ?? '#3b82f6'
  const glowClass = STATE_GLOW[ctx.state]  ?? 'animate-jarvis-pulse'
  const isAlert   = ctx.state === 'falha'
  const isSuccess = ctx.state === 'concluido'

  const coreGradient = isAlert
    ? 'radial-gradient(circle at 38% 32%, #2d0b0b 0%, #14060a 55%, #080c18 100%)'
    : isSuccess
    ? 'radial-gradient(circle at 38% 32%, #072d12 0%, #041509 55%, #080c18 100%)'
    : 'radial-gradient(circle at 38% 32%, #0e2040 0%, #07142e 55%, #080c18 100%)'

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 360, height: 360 }}>

      {/* Ambient glow behind everything */}
      <div
        className="pointer-events-none absolute rounded-full opacity-20 blur-3xl"
        style={{
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
        }}
      />

      {/* Orbital rings */}
      {RINGS.map((r, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${r.animation}`}
          style={{
            width:  r.size,
            height: r.size,
            border: `${r.borderWidth}px solid ${color}`,
            opacity: r.opacity,
            boxShadow: i >= 4 ? `0 0 ${12 + i * 4}px ${color}22` : undefined,
          }}
        />
      ))}

      {/* Orbital dots — animated around orb center */}
      {ORBITAL_DOTS.map((d, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{
            width: 0,
            height: 0,
            top: '50%',
            left: '50%',
            ['--orbit-r' as string]: `${d.orbitRadius}px`,
            animation: `${d.ccw ? 'orbit-ccw' : 'orbit-cw'} ${d.duration}s ${d.delay}s linear infinite`,
          }}
        >
          <div
            style={{
              width:  d.size,
              height: d.size,
              borderRadius: '50%',
              background: d.color,
              boxShadow: `0 0 8px ${d.color}, 0 0 20px ${d.color}55`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        </div>
      ))}

      {/* Core nucleus */}
      <div
        className={`relative flex h-[140px] w-[140px] items-center justify-center rounded-full ${glowClass}`}
        style={{
          background: coreGradient,
          border:     `1.5px solid ${color}60`,
          boxShadow: `inset 0 0 30px ${color}18, inset 0 1px 0 ${color}30`,
        }}
      >
        {/* Specular highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(ellipse at 35% 25%, ${color}28 0%, transparent 60%)` }}
        />

        {/* Inner glow ring */}
        <div
          className="pointer-events-none absolute inset-3 rounded-full opacity-20"
          style={{ border: `1px solid ${color}`, filter: `blur(1px)` }}
        />

        {/* Scan line */}
        <div
          className="animate-scan pointer-events-none absolute inset-x-4 h-px rounded-full"
          style={{ background: `linear-gradient(to right, transparent, ${color}70, transparent)` }}
        />

        {/* Text center */}
        <div className="relative z-10 flex flex-col items-center gap-2 px-3 text-center">
          <p
            key={ctx.state + '-label'}
            className="animate-fade-up font-mono text-[11px] font-bold uppercase tracking-[0.28em]"
            style={{ color, textShadow: `0 0 12px ${color}` }}
          >
            {ctx.label}
          </p>
          <p
            key={ctx.state + '-sub'}
            className="animate-fade-up font-sans text-[10px] leading-tight text-foreground/55"
          >
            {ctx.sub}
          </p>
          <div className="mt-0.5 flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 5px ${color}`,
                  animation: `dot-bounce 1.4s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Label below orb */}
      <div
        className="pointer-events-none absolute flex flex-col items-center gap-1.5 whitespace-nowrap"
        style={{ top: '50%', transform: 'translateY(82px)' }}
      >
        <p
          className="font-mono text-[17px] font-bold tracking-[0.4em] text-foreground/85"
          style={{ textShadow: '0 0 30px rgba(59,130,246,0.3)' }}
        >
          J A R V I S
        </p>
        <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-muted-foreground/40">
          Central Play
        </p>
      </div>
    </div>
  )
}
