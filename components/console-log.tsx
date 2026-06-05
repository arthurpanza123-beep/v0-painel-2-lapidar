'use client'

import { cn } from '@/lib/utils'

interface ConsoleLogProps {
  lines: string[]
}

const LOG_COLORS: Record<string, string> = {
  FAILED: 'text-destructive',
  ERROR: 'text-destructive',
  RETRY: 'text-destructive',
  SUCCESS: 'text-success',
  DONE: 'text-success',
  CONFIRMED: 'text-success',
  READY: 'text-accent',
  SELECTED: 'text-accent',
  RECEIVED: 'text-primary',
  STARTED: 'text-primary',
  INITIATED: 'text-primary',
}

function lineColor(line: string): string {
  const upper = line.toUpperCase()
  for (const [key, color] of Object.entries(LOG_COLORS)) {
    if (upper.includes(key)) return color
  }
  return 'text-muted-foreground'
}

export function ConsoleLog({ lines }: ConsoleLogProps) {
  const visible = lines.slice(-5)

  return (
    <div className="w-full rounded-xl border border-border bg-muted/10 px-4 py-3 font-mono">
      <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Console
      </p>
      <div className="space-y-1">
        {visible.length === 0 && (
          <p className="text-[11px] text-muted-foreground/50">
            {'>'} aguardando evento<span className="animate-blink">_</span>
          </p>
        )}
        {visible.map((line, i) => (
          <p
            key={i}
            className={cn(
              'animate-fade-up text-[11px] leading-relaxed',
              lineColor(line),
            )}
          >
            {'>'} {line}
          </p>
        ))}
      </div>
    </div>
  )
}
