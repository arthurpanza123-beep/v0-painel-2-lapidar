'use client'

import type { JarvisCtx } from '@/app/page'

interface Props {
  ctx: JarvisCtx
  onReset: () => void
}

const BAR_HEIGHTS = [3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10, 7, 9, 8, 12, 10, 9, 11, 13]

export function StatusBar({ ctx, onReset }: Props) {
  const isOk = ctx.state !== 'falha'
  const barColor = isOk ? '#3b82f6' : '#ef4444'
  const dotColor = isOk ? '#22c55e' : '#ef4444'
  const dotLabel = isOk ? 'Sistema estavel' : 'Atencao: falha'

  return (
    <div
      className="absolute bottom-0 left-0 z-10 flex w-44 flex-col gap-1.5 px-3 py-2.5"
      style={{
        background: 'linear-gradient(135deg, rgba(13,18,32,0.96) 0%, rgba(9,14,28,0.92) 100%)',
        borderTop:   '1px solid rgba(30,45,71,0.6)',
        borderRight: '1px solid rgba(30,45,71,0.4)',
        backdropFilter: 'blur(12px)',
        boxShadow: '4px -4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{
              background: dotColor,
              boxShadow: `0 0 7px ${dotColor}`,
            }}
          />
          <span className="font-mono text-[10px] font-medium" style={{ color: 'rgba(226,232,244,0.75)' }}>
            {dotLabel}
          </span>
        </div>
        <button
          onClick={onReset}
          className="font-mono text-[9px] transition-colors"
          style={{ color: 'rgba(107,127,168,0.35)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(107,127,168,0.7)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(107,127,168,0.35)' }}
          title="Reiniciar"
        >
          reset
        </button>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.55)' }}>
          Processados{' '}
          <span style={{ color: 'rgba(226,232,244,0.5)' }}>{ctx.processados}</span>
        </span>
        <span className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.55)' }}>
          Fila{' '}
          <span style={{ color: 'rgba(226,232,244,0.5)' }}>{ctx.fila}</span>
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex h-5 items-end gap-px overflow-hidden">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="animate-bar w-1 rounded-sm origin-bottom"
            style={{
              height: `${h}px`,
              background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}55 100%)`,
              opacity: 0.3 + (h / 13) * 0.5,
              animationDelay: `${i * 0.07}s`,
              animationDuration: `${1.2 + (i % 5) * 0.22}s`,
              boxShadow: h >= 10 ? `0 0 4px ${barColor}80` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
