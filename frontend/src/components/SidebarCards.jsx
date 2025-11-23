import React from 'react'
import { ChevronRight } from 'lucide-react'

function Card({ title, subtitle, href, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-yellow-400 to-yellow-500',
    accent: 'from-orange-400 to-orange-500',
    green: 'from-green-400 to-green-500',
    purple: 'from-purple-400 to-purple-500'
  }

  return (
    <a 
      href={href} 
      className="group block bg-gray-800 rounded-xl border border-gray-700 p-3.5 hover:border-yellow-400 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-lg shadow-md`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-black text-white group-hover:text-yellow-400 transition-colors text-sm leading-tight truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 truncate">
              {subtitle}
            </div>
          )}
        </div>

        <ChevronRight className="flex-shrink-0 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all" />
      </div>
    </a>
  )
}

export default function SidebarCards() {
  return (
    <aside className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-black text-base text-white">Links Rápidos</h3>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
      </div>

      <Card 
        title="Educação Financeira" 
        subtitle="Aprenda administração financeira" 
        href="#" 
        icon="💰"
        color="primary"
      />
      
      <Card 
        title="Habilidades de Comunicação" 
        subtitle="Técnicas de comunicação pública" 
        href="#" 
        icon="💬"
        color="accent"
      />
      
      <Card 
        title="Cursos Técnicos" 
        subtitle="Aprenda novas habilidades" 
        href="#" 
        icon="💼"
        color="purple"
      />
    </aside>
  )
}
