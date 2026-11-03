import React from 'react';
import { Network, Sparkles, TrendingUp, Layers, BookOpen } from 'lucide-react';

interface TopNavProps {
  activeTab: 'cuantitativo' | 'cualitativo' | 'encuesta';
  setActiveTab: (tab: 'cuantitativo' | 'cualitativo' | 'encuesta') => void;
  onOpenTaxonomy: () => void;
  onOpenManual: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenTaxonomy,
  onOpenManual,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
          Px
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Pronostix
        </span>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('cuantitativo')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'cuantitativo' ? 'text-slate-900 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          Pronósticos con Datos
        </button>
        <button
          onClick={() => setActiveTab('cualitativo')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'cualitativo' ? 'text-slate-900 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          Opiniones de Expertos
        </button>
        <button
          onClick={() => setActiveTab('encuesta')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'encuesta' ? 'text-slate-900 font-bold border-b-2 border-emerald-600 py-1' : ''
          }`}
        >
          Encuesta de IA (22 Personas)
        </button>
        <button
          onClick={onOpenManual}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          Guía de Uso
        </button>
      </nav>

      {/* Zone 3: Exactly 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenTaxonomy}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
        >
          <Network className="w-3.5 h-3.5 text-emerald-400" />
          Ver Mapa de Métodos
        </button>
      </div>
    </header>
  );
};
