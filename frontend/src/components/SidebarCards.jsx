
// === File: /frontend/src/components/SidebarCards.jsx ===
import React from 'react'

function Card({ title, subtitle, href }) {
  return (
    <a href={href} className="block border rounded-lg p-3 bg-white hover:shadow transition text-sm">
      <div className="font-medium text-slate-800">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </a>
  )
}

export default function SidebarCards() {
  return (
    <aside className="space-y-3">
      <Card title="IPTU e Tributos" subtitle="2 opções rápidas" href="#" />
      <Card title="Ouvidoria" subtitle="Fale conosco" href="#" />
      <Card title="Transparência" subtitle="Visão pública" href="#" />
      <Card title="Vagas de Emprego" subtitle="Atualizado" href="#" />
    </aside>
  )
}
