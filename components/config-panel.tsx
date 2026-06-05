'use client'

import { useState } from 'react'

type Section = 'conexao' | 'templates' | 'midias'

const SECTION_LABELS: { id: Section; label: string }[] = [
  { id: 'conexao',   label: 'Conexao' },
  { id: 'templates', label: 'Templates' },
  { id: 'midias',    label: 'Midias' },
]

const GLASS: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(13,18,32,0.95) 0%, rgba(9,14,28,0.9) 100%)',
  border: '1px solid rgba(30,45,71,0.8)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.025)',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(107,127,168,0.55)' }}>
      {children}
    </p>
  )
}

function Field({ label, placeholder, type = 'text', hint }: { label: string; placeholder?: string; type?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px]" style={{ color: 'rgba(226,232,244,0.6)' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 font-mono text-[11px] outline-none transition-all"
        style={{
          background: 'rgba(8,12,24,0.8)',
          border: '1px solid rgba(30,45,71,0.9)',
          color: 'rgba(226,232,244,0.8)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
        onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(30,45,71,0.9)';  e.currentTarget.style.boxShadow = '' }}
      />
      {hint && <p className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.4)' }}>{hint}</p>}
    </div>
  )
}

function Textarea({ label, placeholder, rows = 4, hint }: { label: string; placeholder?: string; rows?: number; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px]" style={{ color: 'rgba(226,232,244,0.6)' }}>
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl px-3 py-2 font-mono text-[11px] leading-relaxed outline-none transition-all"
        style={{
          background: 'rgba(8,12,24,0.8)',
          border: '1px solid rgba(30,45,71,0.9)',
          color: 'rgba(226,232,244,0.8)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
        onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(30,45,71,0.9)';  e.currentTarget.style.boxShadow = '' }}
      />
      {hint && <p className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.4)' }}>{hint}</p>}
    </div>
  )
}

function MediaSlot({ label, hint }: { label: string; hint?: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-3.5 py-3"
      style={GLASS}
    >
      <div>
        <p className="font-mono text-[11px]" style={{ color: 'rgba(226,232,244,0.75)' }}>{label}</p>
        {hint && <p className="mt-0.5 font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.4)' }}>{hint}</p>}
      </div>
      <button
        className="rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all"
        style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.25)',
          color: '#60a5fa',
        }}
      >
        Configurar
      </button>
    </div>
  )
}

function ConexaoSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl p-5" style={GLASS}>
        <SectionTitle>Evolution API</SectionTitle>
        <div className="flex flex-col gap-4">
          <Field label="URL da API" placeholder="https://sua-evolution-api.com" hint="Nao expor em producao sem autenticacao" />
          <Field label="Instancia WhatsApp" placeholder="nome-da-instancia" />
          <Field label="API Key" type="password" placeholder="••••••••••••••••" hint="Armazenado localmente — sem envio real" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(107,127,168,0.4)' }} />
          <span className="font-mono text-[9px]" style={{ color: 'rgba(107,127,168,0.4)' }}>
            Sem envio real de WhatsApp ate configuracao final
          </span>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={GLASS}>
        <SectionTitle>Status da Conexao</SectionTitle>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
            <span className="font-mono text-[10px]" style={{ color: '#f59e0b' }}>Nao configurado</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplatesSection() {
  return (
    <div className="flex flex-col gap-4">
      {[
        { key: 'teste',           label: 'Template: Teste',           placeholder: 'Ola {nome}, seu teste foi criado...' },
        { key: 'teste_expirado',  label: 'Template: Teste Expirado',  placeholder: 'Teste encerrado: {cliente}\nApp: {app}\nPainel: {painel}\nAbrir: {link}' },
        { key: 'renovacao',       label: 'Template: Renovacao',       placeholder: 'Sua renovacao esta pronta...' },
        { key: 'cobranca',        label: 'Template: Cobranca',        placeholder: 'Ola {nome}, identificamos seu pagamento...' },
        { key: 'instalacao',      label: 'Template: Instalacao',      placeholder: 'Guia de instalacao para {aparelho}...' },
      ].map(t => (
        <div key={t.key} className="rounded-2xl p-4" style={GLASS}>
          <Textarea label={t.label} placeholder={t.placeholder} rows={3} hint="Variaveis: {nome} {app} {painel} {link} {aparelho}" />
        </div>
      ))}
    </div>
  )
}

function MidiasSection() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl p-4" style={GLASS}>
        <SectionTitle>Audios de Boas-vindas</SectionTitle>
        <div className="flex flex-col gap-2">
          <MediaSlot label="Audio 1 — Boas-vindas"        hint="Primeiro contato com o cliente" />
          <MediaSlot label="Audio 2 — Explicacao"         hint="Apresentacao do servico" />
          <MediaSlot label="Audio 4 — Pergunta aparelho"  hint="Qual TV / dispositivo?" />
        </div>
      </div>

      <div className="rounded-2xl p-4" style={GLASS}>
        <SectionTitle>Figurinhas e Imagens</SectionTitle>
        <div className="flex flex-col gap-2">
          <MediaSlot label="Figurinha — Teste Expirado"   hint="Arquivo .webp da figurinha" />
          <MediaSlot label="Arte — Teste"                 hint="Imagem do cartao de teste" />
          <MediaSlot label="Imagem — Prova Social"        hint="Print / comprovante de resultado" />
        </div>
      </div>
    </div>
  )
}

export function ConfigPanel() {
  const [section, setSection] = useState<Section>('conexao')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-6 py-4"
        style={{ borderBottom: '1px solid rgba(30,45,71,0.7)' }}
      >
        {SECTION_LABELS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="rounded-lg px-3.5 py-1.5 font-mono text-[11px] transition-all duration-150"
            style={
              section === s.id
                ? {
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.1) 100%)',
                    border: '1px solid rgba(59,130,246,0.35)',
                    color: '#60a5fa',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'rgba(107,127,168,0.6)',
                  }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {section === 'conexao'   && <ConexaoSection />}
        {section === 'templates' && <TemplatesSection />}
        {section === 'midias'    && <MidiasSection />}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid rgba(30,45,71,0.6)' }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(107,127,168,0.3)' }}>
          Sem envio real de WhatsApp
        </p>
        <button
          className="rounded-xl px-4 py-1.5 font-mono text-[11px] font-bold transition-all"
          style={{
            background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(34,211,238,0.12) 100%)',
            border: '1px solid rgba(59,130,246,0.35)',
            color: '#60a5fa',
          }}
        >
          Salvar configuracoes
        </button>
      </div>
    </div>
  )
}
