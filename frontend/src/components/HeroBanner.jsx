import React from 'react'

export default function HeroBanner({ 
  title = 'Aprenda com organização', 
  subtitle = 'Conteúdos curtos, objetivos e direcionados por série, matéria e tópico.' 
}) {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-28">

      {/* ELEMENTOS DECORATIVOS DE FUNDO */}
      <div
        className="absolute top-0 right-0 pointer-events-none rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-float"
        style={{ width: '14rem', height: '14rem', backgroundColor: '#FDB913' }}
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"
        style={{ width: '14rem', height: '14rem', backgroundColor: '#F77F00', animationDelay: '1s' }}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:gap-12 items-center">
          
          {/* TEXTO */}
          <div className="text-center lg:text-left space-y-6">
            <div className="space-y-4 animate-slide-up">
              
              {/* BADGE */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-missao-yellow rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                <span className="text-sm font-bold text-black">Plataforma Educacional Online</span>
              </div>

              {/* TÍTULO */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight text-white">
                {title}
              </h1>

              {/* SUBTÍTULO */}
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-slide-up">

              <a 
                href="#series" 
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-missao-yellow text-black font-black rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-missao-yellow"
              >
                <span>Explorar Séries</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>

              <a 
                href="/admin" 
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-transparent border-2 border-missao-yellow text-missao-yellow font-black rounded-lg hover:bg-missao-yellow hover:text-black hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Área do Professor</span>
              </a>

            </div>

            {/* STATS (removidos, mas espaço mantido) */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-6">
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
