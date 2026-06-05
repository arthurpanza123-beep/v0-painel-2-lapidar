'use client'

import type { JarvisCtx, FlowKey } from '@/app/page'

interface Props {
  ctx: JarvisCtx
}

const FLOW_TITLE: Record<string, string> = {
  test_created:          'Teste Criado',
  test_expired:          'Teste Expirado',
  renewal_created:       'Renovacao',
  app_swap:              'Troca de Aplicativo',
  second_screen:         'Segunda Tela',
  problem_created:       'Problema / Suporte',
  xcloud_remove_device:  'Remover Device XCloud',
  xcloud_recreate_device:'Recriar Device XCloud',
  charge_customer:       'Cobranca',
  installation:          'Instalacao',
  boas_vindas:           'Boas-vindas',
}

const FLOW_COLOR: Record<string, string> = {
  test_created:          '#22c55e',
  test_expired:          '#f59e0b',
  renewal_created:       '#60a5fa',
  app_swap:              '#a78bfa',
  second_screen:         '#22d3ee',
  problem_created:       '#fb923c',
  xcloud_remove_device:  '#f87171',
  xcloud_recreate_device:'#a78bfa',
  charge_customer:       '#22c55e',
  installation:          '#3b82f6',
  boas_vindas:           '#22d3ee',
}

const VARIANT_STYLE: Record<string, React.CSSProperties> = {
  primary: {
    background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.35)',
    color: '#60a5fa',
  },
  warn: {
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#ef4444',
  },
  muted: {
    background: 'rgba(13,18,32,0.6)',
    border: '1px solid rgba(30,45,71,0.7)',
    color: 'rgba(107,127,168,0.75)',
  },
}

// Per-flow content blocks
function FlowContent({ ctx }: { ctx: JarvisCtx }) {
  const { flow, appAtual, appNovo, painel, dispositivo, clienteNome } = ctx

  if (flow === 'test_created') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Mensagem" value="Preparar texto do teste" />
        <MsgRow label="Arte" value="Preparar imagem do teste" />
        <MsgRow label="Status" value="Aguardando confirmacao do operador" dim />
      </div>
    )
  }

  if (flow === 'test_expired') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Figurinha" value="Teste expirado — pronto para envio" />
        {appAtual && <MsgRow label="App" value={appAtual} />}
        {painel && <MsgRow label="Painel" value={painel} />}
        <MsgRow label="XCloud" value="Verificar se deve remover device" dim />
      </div>
    )
  }

  if (flow === 'app_swap') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="App atual" value={appAtual ?? 'App Atual'} />
        <MsgRow label="App novo"  value={appNovo  ?? 'App Novo'} accent />
        {painel && <MsgRow label="Painel"    value={painel} />}
        <MsgRow label="Credenciais" value="Novas credenciais quando disponiveis" dim />
      </div>
    )
  }

  if (flow === 'second_screen') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Conta atual" value={clienteNome ?? 'Conta principal'} />
        <MsgRow label="Tela"        value="Verificar slot disponivel" />
        {appAtual && <MsgRow label="App" value={appAtual} />}
        {painel && <MsgRow label="Painel" value={painel} />}
        <MsgRow label="Obs" value="Liberar ou renovar no painel se necessario" dim />
      </div>
    )
  }

  if (flow === 'xcloud_recreate_device' || flow === 'xcloud_remove_device') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Operacao" value={flow === 'xcloud_recreate_device' ? 'Recriar device' : 'Remover device'} accent={flow === 'xcloud_recreate_device'} />
        <MsgRow label="Etapas"   value="Ver barra inferior para sequencia" dim />
        {flow === 'xcloud_recreate_device' && (
          <MsgRow label="Pos-recriacao" value="Vincular Xtream + confirmar RELOAD" />
        )}
      </div>
    )
  }

  if (flow === 'problem_created') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        {appAtual && <MsgRow label="App" value={appAtual} />}
        {painel && <MsgRow label="Painel" value={painel} />}
        <MsgRow label="Codex"  value="Preparar prompt para analise" dim />
        <MsgRow label="Saber"  value="Salvar solucao no knowledge base" dim />
      </div>
    )
  }

  if (flow === 'boas_vindas') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Audio 1" value="Boas-vindas" />
        <MsgRow label="Audio 2" value="Explicacao" />
        <MsgRow label="Imagem"  value="Prova social" />
        <MsgRow label="Audio 4" value="Pergunta sobre aparelho" dim />
      </div>
    )
  }

  if (flow === 'installation') {
    return (
      <div className="mt-3 flex flex-col gap-1.5">
        <MsgRow label="Aparelho" value={dispositivo ?? 'Nao selecionado'} accent={!!dispositivo} />
        <MsgRow label="Guia"     value="Preparar mensagem de instalacao" />
        <MsgRow label="Status"   value="Aguardando confirmacao" dim />
      </div>
    )
  }

  return null
}

function MsgRow({ label, value, accent, dim }: { label: string; value: string; accent?: boolean; dim?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-20 shrink-0 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(107,127,168,0.5)' }}>
        {label}
      </span>
      <span
        className="font-mono text-[10px] leading-tight"
        style={{
          color: accent ? '#22d3ee' : dim ? 'rgba(107,127,168,0.5)' : 'rgba(226,232,244,0.75)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function FlowPanel({ ctx }: Props) {
  const { flow, acoes } = ctx
  if (!flow) return null

  const title = FLOW_TITLE[flow] ?? flow
  const color = FLOW_COLOR[flow] ?? '#3b82f6'

  return (
    <div
      className="absolute bottom-4 right-4 z-20 w-64 animate-fade-up rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(10,15,30,0.97) 0%, rgba(8,12,24,0.95) 100%)',
        border: `1px solid ${color}30`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}10, inset 0 1px 0 rgba(255,255,255,0.03)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <p className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: `${color}bb` }}>
          {title}
        </p>
      </div>

      {/* Flow-specific context rows */}
      <FlowContent ctx={ctx} />

      {/* Acoes sugeridas */}
      {acoes.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: 'rgba(107,127,168,0.4)' }}>
            Acoes sugeridas
          </p>
          <div className="flex flex-col gap-1.5">
            {acoes.map((a, i) => (
              <button
                key={i}
                className="w-full rounded-lg px-3 py-1.5 text-left font-mono text-[10px] transition-all duration-150 active:scale-[0.98]"
                style={VARIANT_STYLE[a.variant]}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sem envio real */}
      <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: 'rgba(107,127,168,0.25)' }}>
        Simulacao — sem envio real
      </p>
    </div>
  )
}
