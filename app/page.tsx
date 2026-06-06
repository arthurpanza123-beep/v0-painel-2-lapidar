"use client"

import { Suspense, useState, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity, AlertTriangle, Terminal, Settings, Zap, Tv, MessageSquare,
  History, User, Layers, Play, CheckCircle2, XCircle, Loader2, ListOrdered, Clock
} from "lucide-react"

// Types
type JarvisState = "idle" | "receiving" | "interpreting" | "detecting" | "preparing" | "executing" | "validating" | "completed" | "failed" | "retry"
type LogEntry = { id: string; timestamp: Date; level: "info" | "success" | "warning" | "error"; code: string; detail?: string }
type FailureEntry = { id: string; timestamp: Date; code: string; message: string; resolved: boolean }
type EvolutionUiResult = {
  ok?: boolean
  code?: string
  message?: string
  dryRun?: boolean
  preview?: string
  phone?: string
  flow?: string
  flags?: { enabled?: boolean; dryRun?: boolean; configured?: boolean }
  logs?: Array<{ code?: string; message?: string }>
}

// Sequencia de estados ao vivo para um evento real recebido (Painel 1 / webhook).
const LIVE_SEQUENCE: { state: JarvisState; text: string; duration: number }[] = [
  { state: "receiving", text: "Recebendo evento", duration: 500 },
  { state: "interpreting", text: "Interpretando contexto", duration: 600 },
  { state: "preparing", text: "Preparando resposta", duration: 700 },
  { state: "completed", text: "Evento processado", duration: 1800 },
]

// State config
const stateConfig: Record<JarvisState, { label: string; color: string }> = {
  idle: { label: "AGUARDANDO", color: "text-primary" },
  receiving: { label: "RECEBENDO", color: "text-primary" },
  interpreting: { label: "INTERPRETANDO", color: "text-primary" },
  detecting: { label: "DETECTANDO", color: "text-chart-3" },
  preparing: { label: "PREPARANDO", color: "text-chart-3" },
  executing: { label: "EXECUTANDO", color: "text-chart-2" },
  validating: { label: "VALIDANDO", color: "text-chart-3" },
  completed: { label: "CONCLUIDO", color: "text-chart-2" },
  failed: { label: "FALHA", color: "text-destructive" },
  retry: { label: "RETRY", color: "text-chart-3" },
}

// Sidebar items
const sidebarItems = [
  { id: "central", label: "Central", icon: Activity },
  { id: "falhas", label: "Falhas", icon: AlertTriangle },
  { id: "console", label: "Console", icon: Terminal },
  { id: "historico", label: "Historico", icon: History },
  { id: "config", label: "Config", icon: Settings },
]

function JarvisPageContent() {
  const searchParams = useSearchParams()
  const hydratedFromQuery = useRef(false)
  const [activeTab, setActiveTab] = useState("central")
  const [jarvisState, setJarvisState] = useState<JarvisState>("idle")
  const [statusText, setStatusText] = useState("Aguardando evento")
  const [lastEvent, setLastEvent] = useState<{ text: string; time: Date } | null>(null)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [context, setContext] = useState<{ name: string; device: string; flow: string; preview?: string; source?: string; testId?: string; clientId?: string } | null>(null)
  const [failures, setFailures] = useState<FailureEntry[]>([])
  const [processedCount, setProcessedCount] = useState(0)
  const [history, setHistory] = useState<{ id: string; label: string; module: string; time: Date; success: boolean }[]>([])
  const [evolutionResult, setEvolutionResult] = useState<EvolutionUiResult | null>(null)
  const [evolutionLoading, setEvolutionLoading] = useState(false)

  // Add log
  const addLog = useCallback((level: LogEntry["level"], code: string, detail?: string) => {
    setLogs(prev => [{
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      code,
      detail,
    }, ...prev].slice(0, 100))
  }, [])

  // Processa um evento real recebido (via query/webhook) com a sequencia ao vivo.
  const runLiveEvent = useCallback(async (label: string, module: string) => {
    setIsProcessing(true)
    setLastEvent({ text: label, time: new Date() })

    for (const step of LIVE_SEQUENCE) {
      setJarvisState(step.state)
      setStatusText(step.text)
      if (step.state === "executing" || step.state === "retry") {
        setCurrentAction(step.text)
      }
      await new Promise(r => setTimeout(r, step.duration))
    }

    setHistory(prev => [{
      id: `hist-${Date.now()}`,
      label,
      module,
      time: new Date(),
      success: true,
    }, ...prev].slice(0, 50))
    setProcessedCount(prev => prev + 1)

    setJarvisState("idle")
    setStatusText("Aguardando evento")
    setCurrentAction(null)
    setIsProcessing(false)
  }, [])

  const callEvolutionEndpoint = useCallback(async (path: string, payload?: Record<string, unknown>) => {
    setEvolutionLoading(true)
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      })
      const data = await res.json().catch(() => ({ ok: false, code: "INVALID_RESPONSE", message: "Resposta invalida" }))
      setEvolutionResult(data)
      addLog(res.ok ? "success" : "warning", data.code || "EVOLUTION_RESULT", data.message || "Endpoint Evolution respondeu")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setEvolutionResult({ ok: false, code: "REQUEST_FAILED", message })
      addLog("error", "REQUEST_FAILED", message)
    } finally {
      setEvolutionLoading(false)
    }
  }, [addLog])

  const handleTestEvolution = useCallback(() => {
    callEvolutionEndpoint("/api/evolution/test-connection")
  }, [callEvolutionEndpoint])

  // Hidrata contexto a partir da query (Painel 1 / webhook) e dispara o evento ao vivo.
  useEffect(() => {
    if (hydratedFromQuery.current) return
    hydratedFromQuery.current = true

    const source = searchParams.get("source")
    const clientId = searchParams.get("client_id")
    const testId = searchParams.get("test_id")
    const deviceKey = searchParams.get("device_key")
    const requestedFlow = searchParams.get("flow") || searchParams.get("event")

    if (!source && !clientId && !testId && !deviceKey && !requestedFlow) return

    addLog("success", "QUERY_CONTEXT_RECEIVED", [
      source ? `source=${source}` : null,
      clientId ? `client_id=${clientId}` : null,
      testId ? `test_id=${testId}` : null,
      deviceKey ? "device_key=presente" : null,
      requestedFlow ? `flow=${requestedFlow}` : null,
    ].filter(Boolean).join(" "))

    const moduleLabel = requestedFlow || (testId ? "test_created" : "Contexto")

    setContext({
      name: searchParams.get("client_name") || searchParams.get("name") || "Cliente em contexto",
      device: deviceKey || "—",
      flow: moduleLabel,
      preview: "Contexto recebido do Painel 1 para processamento ao vivo.",
      source: source || undefined,
      testId: testId || undefined,
      clientId: clientId || undefined,
    })

    runLiveEvent(requestedFlow ? `Evento: ${requestedFlow}` : "Contexto recebido", moduleLabel)
  }, [addLog, runLiveEvent, searchParams])

  const config = stateConfig[jarvisState]
  const isActive = jarvisState !== "idle"

  // Format time
  const formatTime = (date: Date) => date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    return `${Math.floor(diff / 3600)}h`
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* ULTRA PREMIUM background with multiple layers */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base metallic gradient */}
        <div className="absolute inset-0 bg-metallic-dark" />
        {/* Circuit board tech texture */}
        <div className="absolute inset-0 bg-circuit bg-circuit-animated" />
        {/* Hex grid pattern overlay */}
        <div className="absolute inset-0 bg-hex-grid opacity-50" />
        {/* Brushed metal texture */}
        <div className="absolute inset-0 brushed-metal opacity-60" />
        {/* Ambient glow from center - more intense */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,_oklch(0.68_0.25_255_/_10%)_0%,_transparent_55%)]" />
        {/* Secondary glow points */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,_oklch(0.60_0.20_285_/_5%)_0%,_transparent_50%)]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,_oklch(0.70_0.18_200_/_4%)_0%,_transparent_50%)]" />
        {/* Top light reflection */}
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent" />
        {/* Vignette effect - deeper */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,_transparent_20%,_oklch(0_0_0_/_60%)_100%)]" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer opacity-40" />

        {/* FLOATING PARTICLES */}
        <div className="floating-particle floating-particle-slow" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
        <div className="floating-particle floating-particle-cyan" style={{ top: '25%', left: '85%', animationDelay: '2s' }} />
        <div className="floating-particle floating-particle-purple floating-particle-fast" style={{ top: '60%', left: '15%', animationDelay: '4s' }} />
        <div className="floating-particle" style={{ top: '70%', left: '80%', animationDelay: '1s' }} />
        <div className="floating-particle floating-particle-slow floating-particle-cyan" style={{ top: '40%', left: '5%', animationDelay: '3s' }} />
        <div className="floating-particle floating-particle-purple" style={{ top: '80%', left: '50%', animationDelay: '5s' }} />
        <div className="floating-particle floating-particle-fast" style={{ top: '10%', left: '60%', animationDelay: '2.5s' }} />
        <div className="floating-particle floating-particle-cyan floating-particle-slow" style={{ top: '50%', left: '92%', animationDelay: '1.5s' }} />
        <div className="floating-particle floating-particle-purple" style={{ top: '90%', left: '20%', animationDelay: '4.5s' }} />
        <div className="floating-particle" style={{ top: '35%', left: '70%', animationDelay: '0.5s' }} />
      </div>

      {/* Sidebar - hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex w-[200px] border-r border-primary/10 bg-gradient-to-b from-card/50 via-card/20 to-transparent backdrop-blur-md flex-col relative z-10">
        <nav className="flex-1 p-3 space-y-1 pt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActiveTab = item.id === activeTab
            const count = item.id === "falhas" ? failures.filter(f => !f.resolved).length : 0
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                  isActiveTab
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-destructive text-white rounded-full font-bold">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* System status */}
        <div className="p-4 border-t border-border/20 bg-card/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-chart-2 pulse-dot glow-green" />
            <span className="text-xs font-medium text-foreground">Sistema estavel</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mb-3">
            <span>Processados: {processedCount}</span>
            <span>{isProcessing ? "Ativo" : "Ocioso"}</span>
          </div>
          <div className="h-8 flex items-end gap-0.5">
            {[40, 65, 45, 80, 55, 70, 50, 65, 85, 60, 75, 90].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-primary/30 to-primary/10 rounded-t transition-all duration-300" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/30 bg-card/90 backdrop-blur-lg safe-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActiveTab = item.id === activeTab
            const count = item.id === "falhas" ? failures.filter(f => !f.resolved).length : 0
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all relative min-w-[60px]",
                  isActiveTab
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-destructive text-white rounded-full font-bold min-w-[18px] text-center">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-14 border-b border-border/30 bg-card/20 backdrop-blur-md flex items-center px-6 gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-2/10 border border-chart-2/20">
            <div className="w-1.5 h-1.5 rounded-full bg-chart-2 pulse-dot" />
            <span className="text-[11px] font-semibold text-chart-2">ATIVO</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Central Play</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Plus</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {isProcessing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <Loader2 className="w-3.5 h-3.5 text-chart-3 animate-spin" />
                <span className="text-xs font-medium text-chart-3">Processando</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              <Zap className="w-3.5 h-3.5" />
              <span>Tempo real</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-card flex items-center justify-center text-xs font-semibold text-foreground border border-border/30 relative">
              JS
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-chart-2 border-2 border-background" />
            </div>
          </div>
        </header>

        {/* Main area - add bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {activeTab === "central" && (
            <div className="h-full flex flex-col">
              {/* JARVIS Section */}
              <div className="flex-1 flex items-center justify-center py-8 relative">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.02] rounded-full blur-[120px]" />

                {/* Side cards - Last Event */}
                <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-[200px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground/60">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold tracking-wider">ULTIMO EVENTO</span>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl backdrop-blur-md transition-all duration-500 card-glass",
                      lastEvent ? "card-glow" : "bg-card/30 border-border/20"
                    )}>
                      {lastEvent ? (
                        <>
                          <p className="text-sm font-medium text-foreground mb-3">{lastEvent.text}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                            <Clock className="w-3 h-3" />
                            Ha {formatTimeAgo(lastEvent.time)}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground/30">Aguardando...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* JARVIS Core - ULTRA PREMIUM */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-[460px] h-[460px] flex items-center justify-center">
                    {/* Ambient glow behind rings */}
                    <div className="absolute w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,_oklch(0.68_0.25_255_/_12%)_0%,_transparent_60%)]" />

                    {/* Outer decorative ring - faint */}
                    <div className="absolute w-[440px] h-[440px] rounded-full border border-primary/5 orbit-ring-slow" />

                    {/* Outer rings with intense neon */}
                    <div className={cn(
                      "absolute w-[400px] h-[400px] rounded-full border-[1.5px] orbit-ring-slow ring-pulse",
                      isActive ? "border-primary/40 neon-ring" : "border-primary/20"
                    )} />

                    <div className={cn(
                      "absolute w-[350px] h-[350px] rounded-full border-2 orbit-ring-reverse ring-pulse-delayed",
                      isActive ? "border-primary/60 neon-ring-intense" : "border-primary/30 neon-ring"
                    )} />

                    <div className={cn(
                      "absolute w-[300px] h-[300px] rounded-full border-[2.5px] orbit-ring ring-pulse-delayed-2",
                      isActive ? "border-primary/80 neon-ring-intense" : "border-primary/40 neon-ring"
                    )} />

                    {/* Inner bright ring */}
                    <div className={cn(
                      "absolute w-[260px] h-[260px] rounded-full border-2 orbit-ring-reverse",
                      isActive ? "border-primary neon-ring-intense" : "border-primary/50 neon-ring"
                    )} />

                    {/* Energy particles on multiple rings */}
                    <div className="absolute w-[400px] h-[400px] orbit-ring-slow">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary energy-particle" style={{ boxShadow: '0 0 15px oklch(0.68 0.22 255), 0 0 30px oklch(0.68 0.22 255 / 50%)' }} />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-chart-5 energy-particle" style={{ animationDelay: '1.5s' }} />
                    </div>
                    <div className="absolute w-[350px] h-[350px] orbit-ring-reverse">
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 energy-particle" style={{ animationDelay: '0.5s', boxShadow: '0 0 12px oklch(0.75 0.15 200)' }} />
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/80 energy-particle" style={{ animationDelay: '2s' }} />
                    </div>
                    <div className="absolute w-[300px] h-[300px] orbit-ring">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-400 energy-particle" style={{ animationDelay: '0.8s', boxShadow: '0 0 10px oklch(0.60 0.20 285)' }} />
                    </div>

                    {/* Inner gradient glow ring */}
                    <div className={cn(
                      "absolute w-[230px] h-[230px] rounded-full transition-all duration-500",
                      isActive
                        ? "bg-gradient-to-br from-primary/35 via-primary/15 to-primary/30 orbit-ring-fast"
                        : "bg-gradient-to-br from-primary/20 via-primary/8 to-primary/18 orbit-ring-slow"
                    )} style={{ boxShadow: isActive ? 'inset 0 0 60px oklch(0.68 0.22 255 / 30%)' : 'inset 0 0 40px oklch(0.68 0.22 255 / 15%)' }} />

                    {/* Core orb - PREMIUM */}
                    <div className={cn(
                      "relative w-[190px] h-[190px] rounded-full flex flex-col items-center justify-center",
                      "bg-gradient-to-br from-[#050a14] via-[#081220] to-[#050a14]",
                      "border-2 transition-all duration-300",
                      isActive ? "border-primary/80" : "border-primary/50",
                      isActive ? "jarvis-processing" : "jarvis-breathe"
                    )}>
                      {/* Inner highlight */}
                      <div className="absolute inset-0 rounded-full core-inner-glow" />
                      {/* Specular highlight */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                      {isActive && (
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent scanning" style={{ backgroundSize: "200% 100%" }} />
                        </div>
                      )}

                      <div className="relative z-10 text-center px-5">
                        <div className={cn("text-sm font-bold tracking-[0.25em] mb-2 text-glow", config.color)}>
                          {config.label}
                        </div>
                        <div className="text-[13px] text-foreground/85 max-w-[150px] leading-snug">
                          {statusText}
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className={cn(
                              "w-2 h-2 rounded-full bg-primary transition-all",
                              isActive && "energy-particle"
                            )} style={{ animationDelay: `${i * 200}ms`, boxShadow: '0 0 8px oklch(0.68 0.22 255)' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mt-5">
                    <h1 className="text-2xl font-bold tracking-[0.35em] text-foreground text-glow">JARVIS</h1>
                    <p className="text-[11px] text-muted-foreground/50 tracking-[0.2em] mt-1.5">CENTRAL PLAY</p>
                  </div>

                  {/* Context pill - glass effect */}
                  {context && (
                    <div className="mt-5 w-full max-w-[560px] rounded-2xl card-glass px-6 py-4">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <User className="w-4 h-4 text-primary/70" />
                        <span className="text-sm font-medium text-foreground">{context.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="text-sm text-muted-foreground/80">{context.device}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="text-sm font-medium text-primary">{context.flow}</span>
                      </div>
                      {(context.source || context.testId || context.clientId) && (
                        <div className="mt-3 rounded-xl border border-primary/15 bg-background/35 px-4 py-3 text-center">
                          <p className="font-mono text-[10px] text-muted-foreground/60">
                            {[context.source && `source=${context.source}`, context.testId && `test_id=${context.testId}`, context.clientId && `client_id=${context.clientId}`].filter(Boolean).join("  ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Side cards - Current Action */}
                <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[200px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground/60">
                      <Play className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold tracking-wider">ACAO ATUAL</span>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl backdrop-blur-md transition-all duration-500",
                      currentAction ? "card-glass card-glow" : "bg-card/30 border border-border/20"
                    )}>
                      {currentAction ? (
                        <>
                          <p className="text-sm font-medium text-foreground mb-3">{currentAction}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-chart-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Em andamento
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground/30">Nenhuma acao</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section - Console ao vivo */}
              <div className="border-t border-border/20 bg-card/20 backdrop-blur-sm p-6">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-4 h-4 text-primary/70" />
                    <span className="text-xs font-semibold text-muted-foreground/70 tracking-wider">CONSOLE AO VIVO</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#080c14] border border-border/20 font-mono text-xs space-y-1.5 h-[120px] overflow-hidden">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-2 terminal-line">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          log.level === "success" ? "bg-chart-2" :
                          log.level === "error" ? "bg-destructive" :
                          log.level === "warning" ? "bg-chart-3" : "bg-primary"
                        )} />
                        <span className="text-foreground/80">{log.code}</span>
                        {log.detail && <span className="text-muted-foreground/40 truncate">— {log.detail}</span>}
                        <span className="ml-auto text-muted-foreground/40 shrink-0">{formatTime(log.timestamp)}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-muted-foreground/30 flex items-center gap-2">
                        <span className="terminal-cursor">_</span>
                        aguardando eventos...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Falhas Tab */}
          {activeTab === "falhas" && (
            <div className="p-8 max-w-[1000px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Falhas</h2>
                  <p className="text-sm text-muted-foreground/60 mt-1">Historico de erros e falhas do sistema</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">{failures.filter(f => !f.resolved).length} nao resolvidas</span>
                </div>
              </div>

              {failures.length === 0 ? (
                <div className="text-center py-20">
                  <CheckCircle2 className="w-12 h-12 text-chart-2/30 mx-auto mb-4" />
                  <p className="text-muted-foreground/50">Nenhuma falha registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {failures.map((failure) => (
                    <div key={failure.id} className={cn(
                      "p-4 rounded-xl border transition-all",
                      failure.resolved
                        ? "bg-card/30 border-border/20"
                        : "bg-destructive/5 border-destructive/20"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {failure.resolved ? (
                            <CheckCircle2 className="w-5 h-5 text-chart-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{failure.code}</p>
                            <p className="text-sm text-muted-foreground/70 mt-0.5">{failure.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground/50">{formatTime(failure.timestamp)}</p>
                          {!failure.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 text-xs text-chart-2 hover:text-chart-2 hover:bg-chart-2/10"
                              onClick={() => setFailures(prev => prev.map(f => f.id === failure.id ? { ...f, resolved: true } : f))}
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Console Tab */}
          {activeTab === "console" && (
            <div className="p-8 max-w-[1200px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Console</h2>
                  <p className="text-sm text-muted-foreground/60 mt-1">Logs detalhados do sistema</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLogs([])} className="text-xs">
                  Limpar
                </Button>
              </div>

              <div className="rounded-xl bg-[#080c14] border border-border/20 overflow-hidden">
                <div className="p-3 border-b border-border/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-3/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-2/60" />
                  <span className="ml-2 text-xs text-muted-foreground/40 font-mono">jarvis-console</span>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-4 font-mono text-sm space-y-2">
                    {logs.length === 0 ? (
                      <div className="text-muted-foreground/30 flex items-center gap-2">
                        <span className="terminal-cursor">_</span>
                        Aguardando logs...
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 terminal-line">
                          <span className="text-muted-foreground/40 shrink-0 w-20">{formatTime(log.timestamp)}</span>
                          <span className={cn(
                            "shrink-0 w-16 font-semibold",
                            log.level === "success" ? "text-chart-2" :
                            log.level === "error" ? "text-destructive" :
                            log.level === "warning" ? "text-chart-3" : "text-primary"
                          )}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <span className="text-foreground/90">{log.code}</span>
                          {log.detail && (
                            <span className="text-muted-foreground/50">— {log.detail}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Historico Tab */}
          {activeTab === "historico" && (
            <div className="p-8 max-w-[1000px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Historico</h2>
                  <p className="text-sm text-muted-foreground/60 mt-1">Eventos processados recentemente</p>
                </div>
                <div className="text-sm text-muted-foreground/50">
                  {history.length} eventos
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-20">
                  <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground/50">Nenhum evento processado ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/20">
                      {item.success ? (
                        <CheckCircle2 className="w-5 h-5 text-chart-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">{item.module}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground/40">{formatTime(item.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Config Tab */}
          {activeTab === "config" && (
            <div className="p-8 max-w-[1000px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Configuracoes</h2>
                  <p className="text-sm text-muted-foreground/60 mt-1">Ajustes do sistema e Evolution</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Status do Sistema */}
                <div className="rounded-xl bg-card/40 border border-border/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Status do Sistema
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 rounded-lg bg-background/30 border border-border/20">
                      <p className="text-xs text-muted-foreground/60 mb-1">Dry-run</p>
                      <p className={cn(
                        "font-semibold",
                        evolutionResult?.flags?.dryRun !== false ? "text-chart-3" : "text-chart-2"
                      )}>
                        {evolutionResult?.flags?.dryRun !== false ? "Ativo (seguro)" : "Desativado (real)"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/30 border border-border/20">
                      <p className="text-xs text-muted-foreground/60 mb-1">Evolution API</p>
                      <p className={cn(
                        "font-semibold",
                        evolutionResult?.flags?.configured ? "text-chart-2" : "text-muted-foreground"
                      )}>
                        {evolutionResult?.flags?.configured ? "Configurado" : "Verificar conexao"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/30 border border-border/20">
                      <p className="text-xs text-muted-foreground/60 mb-1">Envio real</p>
                      <p className={cn(
                        "font-semibold",
                        evolutionResult?.flags?.enabled && !evolutionResult?.flags?.dryRun ? "text-chart-2" : "text-chart-3"
                      )}>
                        {evolutionResult?.flags?.enabled && !evolutionResult?.flags?.dryRun ? "Liberado" : "Bloqueado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evolution API */}
                <div className="rounded-xl bg-card/40 border border-border/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Evolution API
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    Configurado via variaveis de ambiente. Nunca expor token no frontend.
                  </p>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">EVOLUTION_API_URL</span>
                      <span className="font-mono text-xs text-foreground/60">***configurado***</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">EVOLUTION_API_KEY</span>
                      <span className="font-mono text-xs text-foreground/60">***mascarado***</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">EVOLUTION_INSTANCE</span>
                      <span className="font-mono text-xs text-foreground/60">***configurado***</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">OPERATOR_WHATSAPP</span>
                      <span className="font-mono text-xs text-foreground/60">***mascarado***</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestEvolution}
                      disabled={evolutionLoading}
                      className="h-9 gap-2"
                    >
                      {evolutionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
                      Testar conexao
                    </Button>
                    {evolutionResult && (
                      <p className={cn(
                        "mt-3 font-mono text-xs",
                        evolutionResult.ok ? "text-chart-2" : "text-destructive"
                      )}>
                        {evolutionResult.code || "RESULT"}: {evolutionResult.message || "-"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Midias */}
                <div className="rounded-xl bg-card/40 border border-border/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tv className="w-4 h-4 text-primary" />
                    Midias de Fluxo
                  </h3>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    URLs de audios, imagens e figurinhas configuradas via ambiente.
                  </p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Audio boas-vindas</span>
                      <span className="text-xs text-chart-2">Configurado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Audio explicacao</span>
                      <span className="text-xs text-chart-2">Configurado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Imagem prova social</span>
                      <span className="text-xs text-chart-2">Configurado</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Audio aparelho</span>
                      <span className="text-xs text-chart-2">Configurado</span>
                    </div>
                  </div>
                </div>

                {/* Codigos Downloader */}
                <div className="rounded-xl bg-card/40 border border-border/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Codigos Downloader
                  </h3>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">FunPlay</span>
                      <span className="font-mono text-foreground">257286</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">PlaySim</span>
                      <span className="font-mono text-foreground">7275096</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Blessed Player</span>
                      <span className="font-mono text-foreground">6552503</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Padrao</span>
                      <span className="font-mono text-foreground">4866905</span>
                    </div>
                  </div>
                </div>

                {/* Links uteis */}
                <div className="rounded-xl bg-card/40 border border-border/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Links de Instalacao
                  </h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">Video Downloader</span>
                      <span className="font-mono text-xs text-primary/80 truncate max-w-[200px]">youtube.com/watch?v=ZCKnfzt1qaU</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">XCloud Android</span>
                      <span className="font-mono text-xs text-primary/80 truncate max-w-[200px]">apk.centralplayplus.com.br</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">XCloud iPhone</span>
                      <span className="font-mono text-xs text-primary/80 truncate max-w-[200px]">apps.apple.com</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/20">
                      <span className="text-muted-foreground">PC Web</span>
                      <span className="font-mono text-xs text-primary/80">webx.daxy.top/login</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function JarvisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <span className="font-mono text-xs text-muted-foreground">Inicializando painel 2...</span>
        </div>
      }
    >
      <JarvisPageContent />
    </Suspense>
  )
}
