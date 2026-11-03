import React, { useState } from 'react';
import { QualitativeMethodResult } from '../types/forecasting';
import { getQualitativeMethods } from '../utils/forecastingMath';
import { Users, Eye, History, GitMerge, Award, Sliders, CheckCircle2 } from 'lucide-react';

interface QualitativeSectionProps {
  baseValue: number;
}

export const QualitativeSection: React.FC<QualitativeSectionProps> = ({ baseValue }) => {
  const qualitativeMethods = getQualitativeMethods(baseValue);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('metodo_delphi');

  // Interactive Delphi Simulator state
  const [delphiRounds, setDelphiRounds] = useState<number>(3);
  const [panelExpertsCount, setPanelExpertsCount] = useState<number>(5);

  // Panel weights simulator state
  const [panelOpinions, setPanelOpinions] = useState([
    { role: 'Dir. Tecnología (CTO)', estimate: Math.round(baseValue * 1.35), weight: 0.35 },
    { role: 'Dir. Comercial / Ventas', estimate: Math.round(baseValue * 1.45), weight: 0.25 },
    { role: 'Científico de Datos Principal', estimate: Math.round(baseValue * 1.2), weight: 0.25 },
    { role: 'Consultor Externo de Mercado', estimate: Math.round(baseValue * 1.15), weight: 0.15 },
  ]);

  const weightedConsensus = panelOpinions.reduce((acc, p) => acc + p.estimate * p.weight, 0);

  const selectedMethod = qualitativeMethods.find((m) => m.id === selectedMethodId) || qualitativeMethods[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Pronósticos Basados en Opiniones de Expertos (Cuando No Hay Datos del Pasado)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prueba y compara los 4 métodos basados en criterio humano: Acuerdo en Grupo, Visión del Líder, Parecido con el Pasado y Método Delphi
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {qualitativeMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMethodId(m.id)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                selectedMethodId === m.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of the 4 methods with qualification cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {qualitativeMethods.map((m) => {
          const isSelected = selectedMethodId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMethodId(m.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-amber-50/20 shadow-xs ring-1 ring-amber-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {m.costComplexity} esfuerzo
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      m.qualification.grade === 'A+'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.qualification.grade === 'A'
                        ? 'bg-green-100 text-green-800'
                        : m.qualification.grade === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.qualification.grade} · {m.qualification.score}/100
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{m.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Próximo valor estimado:</span>
                <span className="font-mono font-bold text-slate-900">{m.forecastValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Qualitative Method Deep Dive */}
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{selectedMethod.name}</h3>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                Puntaje: {selectedMethod.qualification.grade} ({selectedMethod.qualification.score} pts)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{selectedMethod.description}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Opinión o Consejo de Uso</span>
            <span className="text-xs font-medium text-slate-800">{selectedMethod.qualification.verdict}</span>
          </div>
        </div>

        {/* Qualitative Parameters & Rubric Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">¿En qué se basa?</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">{selectedMethod.assumptions}</p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">¿Cuándo conviene usarlo?</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">{selectedMethod.bestUseCase}</p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">Nivel de acierto esperado</span>
            <div className="font-mono text-emerald-700 font-bold text-sm">{selectedMethod.typicalAccuracy}</div>
            <span className="text-[10px] text-slate-400 block">Qué tanto depende de la opinión: {selectedMethod.subjectivityScore}%</span>
          </div>
        </div>

        {/* Interactive Simulation for specific qualitative method */}
        {selectedMethod.id === 'metodo_delphi' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Cómo funciona el Método Delphi (Ponerse de acuerdo por rondas sin verse las caras)</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Grupo: 12 Expertos de forma anónima</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">Ronda 1 (Cada uno da su número)</div>
                <div className="font-mono text-slate-500 mt-1">Rango: [14 - 38] u</div>
                <div className="font-mono text-slate-500">Separación: 18.0 · Valor del medio: 24.5</div>
                <span className="text-[10px] text-amber-700 block mt-1 font-medium">Opiniones muy dispersas al inicio</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-700">Ronda 2 (Ven promedios y corrigen)</div>
                <div className="font-mono text-slate-500 mt-1">Rango: [21 - 32] u</div>
                <div className="font-mono text-slate-500">Separación: 8.5 · Valor del medio: 27.2</div>
                <span className="text-[10px] text-blue-700 block mt-1 font-medium">Las opiniones se acercan un 52%</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="font-semibold text-emerald-900">Ronda 3 (Acuerdo Definitivo)</div>
                <div className="font-mono text-emerald-800 font-bold mt-1">Rango: [26 - 30] u</div>
                <div className="font-mono text-emerald-800 font-bold">Acuerdo central: 28.2 u</div>
                <span className="text-[10px] text-emerald-700 block mt-1 font-medium">✓ Llegaron a un acuerdo mutuo</span>
              </div>
            </div>
          </div>
        )}

        {selectedMethod.id === 'consenso_panel' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Calculadora de Promedio de Opiniones con Distinto Peso</span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-800">
                Resultado del Acuerdo: {weightedConsensus.toFixed(1)} unidades
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {panelOpinions.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{p.role}</div>
                    <div className="text-[11px] text-slate-500">Peso del voto: {(p.weight * 100).toFixed(0)}%</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {p.estimate} u
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMethod.id === 'analogia_historica' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Comparación con Tecnologías Anteriores (Qué tan rápido crecieron)</span>
              </div>
              <span className="text-xs text-slate-500">Curvas de Adopción</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px]">Computador de Escritorio</div>
                <div className="font-mono font-bold text-slate-800 mt-1">16 Años</div>
                <span className="text-[10px] text-slate-400">para llegar a 100M usuarios</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px]">Internet / Web</div>
                <div className="font-mono font-bold text-slate-800 mt-1">7 Años</div>
                <span className="text-[10px] text-slate-400">para llegar a 100M usuarios</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px]">Teléfonos Celulares Inteligentes</div>
                <div className="font-mono font-bold text-slate-800 mt-1">4.5 Años</div>
                <span className="text-[10px] text-slate-400">para llegar a 100M usuarios</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <div className="text-emerald-700 font-semibold text-[10px]">Inteligencia Artificial (ChatGPT/Gemini)</div>
                <div className="font-mono font-bold text-emerald-900 text-sm mt-1">2 Meses</div>
                <span className="text-[10px] text-emerald-700">25 veces más veloz que la PC</span>
              </div>
            </div>
          </div>
        )}

        {/* Projections horizon vector */}
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-slate-500">Estimaciones para los próximos 4 periodos futuros:</span>
          <div className="flex gap-2 font-mono text-xs">
            {selectedMethod.horizonValues.map((val, idx) => (
              <span key={idx} className="bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-800">
                futuro +{idx + 1}: {val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
