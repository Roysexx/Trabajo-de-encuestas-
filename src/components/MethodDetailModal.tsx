import React from 'react';
import { MethodResult, MethodParams } from '../types/forecasting';
import { X, Check, Award, Calculator, Info, Sliders, AlertCircle } from 'lucide-react';

interface MethodDetailModalProps {
  method: MethodResult | null;
  onClose: () => void;
  params: MethodParams;
  onUpdateParams: (newParams: Partial<MethodParams>) => void;
}

export const MethodDetailModal: React.FC<MethodDetailModalProps> = ({
  method,
  onClose,
  params,
  onUpdateParams,
}) => {
  if (!method) return null;

  const isRecommended = method.isRecommended;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
              style={{ backgroundColor: method.color }}
            >
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{method.name}</h2>
                {isRecommended && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    Modelo Recomendado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {method.subcategory} · Rank #{method.ranking} de 12 modelos evaluados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Formula and Description Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Fórmula del Método</span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                Ideal para: {method.patternSuitability === 'tendencia' ? 'Datos que van subiendo o bajando' : method.patternSuitability === 'estacional' ? 'Datos por temporadas' : method.patternSuitability === 'causal' ? 'Datos con causas externas' : 'Datos estables'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 overflow-x-auto text-center font-medium">
              {method.formula}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {method.description}
            </p>
          </div>

          {/* Hyperparameter Tuning Sliders */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Ajustar Parámetros del Método en Vivo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* SMA window */}
              {method.id === 'promedio_movil_simple' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Cantidad de periodos a promediar (k):</span>
                    <span className="font-mono font-bold">{params.kWindowSMA}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={params.kWindowSMA}
                    onChange={(e) => onUpdateParams({ kWindowSMA: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              )}

              {/* SES alpha */}
              {method.id === 'suavizacion_exponencial_simple' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Sensibilidad a datos recientes (Alfa - α):</span>
                    <span className="font-mono font-bold">{params.alphaSES}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={params.alphaSES}
                    onChange={(e) => onUpdateParams({ alphaSES: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Holt alpha & beta */}
              {method.id === 'suavizacion_holt' && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Nivel base (Alfa - α):</span>
                      <span className="font-mono font-bold">{params.alphaHolt}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={params.alphaHolt}
                      onChange={(e) => onUpdateParams({ alphaHolt: Number(e.target.value) })}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Fuerza de la tendencia (Beta - β):</span>
                      <span className="font-mono font-bold">{params.betaHolt}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={params.betaHolt}
                      onChange={(e) => onUpdateParams({ betaHolt: Number(e.target.value) })}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Brown alpha */}
              {method.id === 'suavizacion_brown' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Ajuste único (Alfa - α):</span>
                    <span className="font-mono font-bold">{params.alphaBrown}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={params.alphaBrown}
                    onChange={(e) => onUpdateParams({ alphaBrown: Number(e.target.value) })}
                    className="w-full accent-pink-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Winter alpha, beta, gamma */}
              {method.id.startsWith('suavizacion_winter') && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Nivel base (Alfa - α):</span>
                      <span className="font-mono font-bold">{params.alphaWinter}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={params.alphaWinter}
                      onChange={(e) => onUpdateParams({ alphaWinter: Number(e.target.value) })}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Fuerza de tendencia (Beta - β):</span>
                      <span className="font-mono font-bold">{params.betaWinter}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={params.betaWinter}
                      onChange={(e) => onUpdateParams({ betaWinter: Number(e.target.value) })}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Fuerza de temporada (Gamma - γ):</span>
                      <span className="font-mono font-bold">{params.gammaWinter}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={params.gammaWinter}
                      onChange={(e) => onUpdateParams({ gammaWinter: Number(e.target.value) })}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* General Horizon */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Periodos a futuro que deseas predecir:</span>
                  <span className="font-mono font-bold">{params.horizon}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={params.horizon}
                  onChange={(e) => onUpdateParams({ horizon: Number(e.target.value) })}
                  className="w-full accent-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Error Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Puntaje y Nota</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-slate-900 font-mono">{method.metrics.score}</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                  {method.metrics.grade}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">% de Error</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {method.metrics.mape.toFixed(2)}%
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Error General</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {method.metrics.rmse.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Diferencia Media</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {method.metrics.mad.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Desvío (Señal)</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {method.metrics.trackingSignal.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Próximo Valor (t+1)</span>
              <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                {method.nextForecast.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Horizon Projections Preview */}
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Valores Estimados para los Próximos Periodos a Futuro</span>
              <span className="text-emerald-700 font-mono text-[11px]">{params.horizon} periodos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 font-mono text-xs">
              {method.horizonForecasts.map((val, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-200 text-center shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-sans">Periodo t+{idx + 1}</span>
                  <span className="font-bold text-slate-900 text-sm">{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Historical Data Calculation Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tabla Paso a Paso de Datos Pasados y Errores
              </h3>
              <span className="text-[11px] text-slate-500">
                {method.results.length} periodos calculados
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 text-slate-600 font-semibold border-b border-slate-200 select-none">
                  <tr>
                    <th className="py-2 px-3">Periodo</th>
                    <th className="py-2 px-3 text-right">Valor Real</th>
                    <th className="py-2 px-3 text-right">Estimado</th>
                    <th className="py-2 px-3 text-right">Error</th>
                    <th className="py-2 px-3 text-right">Error sin signo</th>
                    <th className="py-2 px-3 text-right">Error²</th>
                    <th className="py-2 px-3 text-right">Error en %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {method.results.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-sans text-slate-700 font-medium">
                        {row.label}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-900 font-bold tabular-nums">
                        {row.actual !== undefined ? row.actual.toFixed(2) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right text-emerald-700 font-bold tabular-nums">
                        {row.forecast.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-600 tabular-nums">
                        {row.error !== undefined ? row.error.toFixed(2) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-600 tabular-nums">
                        {row.absError !== undefined ? row.absError.toFixed(2) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-600 tabular-nums">
                        {row.sqError !== undefined ? row.sqError.toFixed(2) : '-'}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-600 tabular-nums">
                        {row.pctError !== undefined ? `${row.pctError.toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths & Limitations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Puntos Fuertes (Ventajas)
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {method.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Cosas a Tener en Cuenta (Límites)
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {method.limitations.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Conclusión: <strong className="text-slate-800">{method.metrics.gradeDescription}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
