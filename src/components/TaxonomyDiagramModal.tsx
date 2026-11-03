import React, { useState } from 'react';
import { X, Network, ExternalLink, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface TaxonomyDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (methodId: string) => void;
}

export const TaxonomyDiagramModal: React.FC<TaxonomyDiagramModalProps> = ({
  isOpen,
  onClose,
  onSelectMethod,
}) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'originalImage'>('interactive');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mapa Completo de Métodos para Pronosticar</h2>
              <p className="text-xs text-slate-500">Guía visual organizada según el esquema original de la imagen</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200/70 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('interactive')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'interactive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ver en Pantalla
              </button>
              <button
                onClick={() => setActiveTab('originalImage')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  activeTab === 'originalImage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Foto Original
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'originalImage' ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-slate-950 p-2 rounded-xl shadow-inner max-w-4xl border border-slate-800">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-10-27_at_3.04.54_PM_1b61259b.jpeg"
                  alt="Esquema Metodológico de Pronósticos Original"
                  className="w-full h-auto rounded-lg max-h-[68vh] object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to absolute public path
                    (e.target as HTMLImageElement).src = '/public/assets/aistudio/WhatsApp_Image_2026-10-27_at_3.04.54_PM_1b61259b.jpeg';
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center max-w-2xl">
                Diagrama de clasificación de pronósticos: división entre métodos cualitativos (sin datos) y cuantitativos (con datos pasados), subdivididos en series estables, con tendencia, con temporadas y por causas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Root node banner */}
              <div className="text-center py-2 px-4 bg-emerald-900 text-white rounded-xl shadow-xs font-semibold text-sm max-w-xs mx-auto">
                ¿Cómo predecir el futuro?
              </div>

              {/* Main split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch 1: Cualitativos */}
                <div className="border border-amber-200/80 bg-amber-50/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                    <div>
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Cuando NO hay datos del pasado</span>
                      <h3 className="text-base font-bold text-amber-950">Métodos con Opiniones de Expertos</h3>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">4 Métodos</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Se basan en la experiencia, consejos de especialistas, comparaciones con el pasado o intuición cuando no hay números guardados.
                  </p>

                  <div className="space-y-2">
                    {[
                      { id: 'consenso_panel', name: 'Reunión de Expertos (Panel)', desc: 'Reunión abierta donde especialistas conversan hasta ponerse de acuerdo.' },
                      { id: 'pronostico_visionario', name: 'Visión del Líder o Fundador', desc: 'Intuición y olfato de personas con gran experiencia para ideas nuevas.' },
                      { id: 'analogia_historica', name: 'Comparación con el Pasado', desc: 'Compara con inventos anteriores (PC, Internet, Móviles) para ver qué tan rápido crecerá.' },
                      { id: 'metodo_delphi', name: 'Método Delphi (Votación Secreta)', desc: 'Votaciones anónimas en varias rondas hasta lograr un acuerdo sin presiones.' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectMethod(item.id);
                          onClose();
                        }}
                        className="group flex items-start justify-between p-3 bg-white rounded-lg border border-amber-200/70 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 flex items-center gap-1.5">
                            <span>•</span> {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch 2: Cuantitativos */}
                <div className="border border-emerald-200/80 bg-emerald-50/20 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                    <div>
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Cuando SÍ hay datos del pasado</span>
                      <h3 className="text-base font-bold text-emerald-950">Métodos Basados en Números</h3>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">12 Modelos</span>
                  </div>

                  {/* Sub-branch: Series de tiempo univariados */}
                  <div className="bg-white rounded-lg p-3.5 border border-emerald-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">Pronósticos con el Historial del Mismo Dato</div>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Predecir hoy usando los días anteriores
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {/* Estacionarias */}
                      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <div className="font-semibold text-slate-800 mb-1.5 text-[11px]">Datos Estables (Sin subidas)</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => { onSelectMethod('promedio_movil_simple'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            • Promedio móvil simple
                          </button>
                          <button
                            onClick={() => { onSelectMethod('promedio_movil_ponderado'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            • Promedio dando peso al último
                          </button>
                          <button
                            onClick={() => { onSelectMethod('suavizacion_exponencial_simple'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            • Suavizado simple (Alfa)
                          </button>
                        </div>
                      </div>

                      {/* Tendencia */}
                      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <div className="font-semibold text-slate-800 mb-1.5 text-[11px]">Datos con Subida o Bajada</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => { onSelectMethod('promedio_movil_doble'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                          >
                            • Promedio doble (Corrige retraso)
                          </button>
                          <button
                            onClick={() => { onSelectMethod('suavizacion_brown'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                          >
                            • Método Brown (1 parámetro)
                          </button>
                          <button
                            onClick={() => { onSelectMethod('suavizacion_holt'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                          >
                            • Método Holt (Nivel y Tendencia)
                          </button>
                        </div>
                      </div>

                      {/* Estacionalidad */}
                      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <div className="font-semibold text-slate-800 mb-1.5 text-[11px]">Datos con Temporadas</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => { onSelectMethod('suavizacion_winter_multiplicativo'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                          >
                            • Winter Multiplicativo
                          </button>
                          <button
                            onClick={() => { onSelectMethod('suavizacion_winter_aditivo'); onClose(); }}
                            className="w-full text-left p-1 text-[11px] text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                          >
                            • Winter Aditivo
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Descomposición */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 text-[11px]">Separar por partes (Descomposición):</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { onSelectMethod('descomposicion_multiplicativo'); onClose(); }}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors cursor-pointer"
                        >
                          • Multiplicativa
                        </button>
                        <button
                          onClick={() => { onSelectMethod('descomposicion_aditivo'); onClose(); }}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded transition-colors cursor-pointer"
                        >
                          • Aditiva
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sub-branch: Modelos causales multivariados */}
                  <div className="bg-white rounded-lg p-3.5 border border-emerald-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">Pronósticos por Causas o Factores Externos</div>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Predecir Y a partir de otras variables (X)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => { onSelectMethod('regresion_lineal_simple'); onClose(); }}
                        className="p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded transition-all cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 text-[11px]">Línea Recta Simple</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">Predecir usando 1 causa (X₁)</div>
                      </button>

                      <button
                        onClick={() => { onSelectMethod('regresion_lineal_multiple'); onClose(); }}
                        className="p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded transition-all cursor-pointer"
                      >
                        <div className="font-semibold text-slate-800 text-[11px]">Línea Recta Múltiple</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">Predecir usando varias causas a la vez</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Haz clic en cualquier método para ver su fórmula y cálculos paso a paso</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
