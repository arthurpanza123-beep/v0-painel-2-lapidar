'use client'

import type { JarvisCtx } from '@/app/page'

interface Props {
  ctx: JarvisCtx
  onReset: () => void
}

const BAR_HEIGHTS = [3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10, 7, 9, 8, 12, 10, 9, 11, 13]

export function StatusBar({ ctx, onReset }: Props) {
  const isOk = ctx.state !== 'falha'

  return (
    <div className="absolute bottom-0 left-0 z-10 flex w-44 flex-col gap-1 border-t border-border/30 bg-card/60 px-3 py-2 backdrop-blur-sm">
      {/* Status text */}
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: isOk ? '#22c55e' : '#ef4444',
            boxShadow: isOk ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
          }}
        />
        <span className="font-mono text-[10px] font-medium text-foreground/70">
          {isOk ? 'Sistema estavel' : 'Atencao: falha'}
        </span>
      </div>

      {/* Contadores */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-muted-foreground/60">
          Processados{' '}
          <span className="text-foreground/50">{ctx.processados}</span>
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/60">
          Fila{' '}
          <span className="text-foreground/50">{ctx.fila}</span>
        </span>
        <button
          onClick={onReset}
          className="ml-auto font-mono text-[9px] text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
          title="Reiniciar"
        >
          reset
        </button>
      </div>

      {/* Bar chart */}
      <div className="flex h-5 items-end gap-px overflow-hidden">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="animate-bar w-1 rounded-sm origin-bottom"
            style={{
              height: `${h}px`,
              background: isOk ? '#3b82f6' : '#ef4444',
              opacity: 0.35 + (h / 13) * 0.45,
              animationDelay: `${i * 0.07}s`,
              animationDuration: `${1.2 + (i % 5) * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
