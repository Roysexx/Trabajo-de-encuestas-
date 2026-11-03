import React, { useState } from 'react';
import { MethodResult } from '../types/forecasting';
import { Award, ArrowUpDown, ChevronDown, ChevronUp, Eye, Sliders, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface ComparativeTableProps {
  methods: MethodResult[];
  onInspectMethod: (methodId: string) => void;
  selectedMethodIds: string[];
  onToggleMethodSelection: (methodId: string) => void;
}

type SortField = 'ranking' | 'score' | 'mape' | 'rmse' | 'mad' | 'trackingSignal' | 'nextForecast';

export const ComparativeTable: React.FC<ComparativeTableProps> = ({
  methods,
  onInspectMethod,
  selectedMethodIds,
  onToggleMethodSelection,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('ranking');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter methods
  const filteredMethods = methods.filter((m) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'estacionaria') return m.patternSuitability === 'estacionaria';
    if (filterCategory === 'tendencia') return m.patternSuitability === 'tendencia';
    if (filterCategory === 'estacional') return m.patternSuitability === 'estacional';
    if (filterCategory === 'causal') return m.category === 'cuantitativo_causal';
    return true;
  });

  // Sort methods
  const sortedMethods = [...filteredMethods].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    switch (sortField) {
      case 'ranking':
        valA = a.ranking;
        valB = b.ranking;
        break;
      case 'score':
        valA = a.metrics.score;
        valB = b.metrics.score;
        break;
      case 'mape':
        valA = a.metrics.mape;
        valB = b.metrics.mape;
        break;
      case 'rmse':
        valA = a.metrics.rmse;
        valB = b.metrics.rmse;
        break;
      case 'mad':
        valA = a.metrics.mad;
        valB = b.metrics.mad;
        break;
      case 'trackingSignal':
        valA = Math.abs(a.metrics.trackingSignal);
        valB = Math.abs(b.metrics.trackingSignal);
        break;
      case 'nextForecast':
        valA = a.nextForecast;
        valB = b.nextForecast;
        break;
    }

    if (valA === valB) return 0;
    const diff = valA > valB ? 1 : -1;
    return sortDirection === 'asc' ? diff : -diff;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For score, default desc (higher is better). For error, asc (lower is better)
      setSortDirection(field === 'score' || field === 'nextForecast' ? 'desc' : 'asc');
    }
  };

  const exportTableCSV = () => {
    const headers = ['Ranking', 'Método', 'Categoría', 'Pronóstico t+1', 'Horizonte Promedio', 'MAD', 'MSE', 'RMSE', 'MAPE (%)', 'Sesgo MPE (%)', 'Tracking Signal', 'R2', 'Score (0-100)', 'Calificación', 'Diagnóstico'];
    const rows = sortedMethods.map((m) => [
      m.ranking,
      `"${m.name}"`,
      `"${m.subcategory}"`,
      m.nextForecast,
      m.horizonForecasts[m.horizonForecasts.length - 1],
      m.metrics.mad,
      m.metrics.mse,
      m.metrics.rmse,
      m.metrics.mape,
      m.metrics.mpe,
      m.metrics.trackingSignal,
      m.metrics.rSquared ?? 'N/A',
      m.metrics.score,
      m.metrics.grade,
      `"${m.metrics.gradeDescription}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comparativa_pronosticos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-200/70 rounded-lg text-xs font-medium flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Todos los Métodos' },
              { id: 'estacionaria', label: 'Datos Estables' },
              { id: 'tendencia', label: 'Con Subida/Bajada' },
              { id: 'estacional', label: 'Por Temporadas' },
              { id: 'causal', label: 'Por Causas y Factores' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterCategory === cat.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">
            Comparando <span className="font-semibold text-slate-800">{sortedMethods.length}</span> métodos con datos numéricos
          </span>
          <button
            onClick={exportTableCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Tabla (CSV)
          </button>
        </div>
      </div>

      {/* High density data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 select-none">
              <th className="py-2.5 px-3 w-10 text-center font-medium">Ver</th>
              <th
                onClick={() => handleSort('ranking')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Puesto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold">Método de Pronóstico</th>
              <th className="py-2.5 px-3 font-semibold">Tipo de Datos</th>
              <th
                onClick={() => handleSort('nextForecast')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Próximo Valor Estimado</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('mape')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
                title="Porcentaje promedio de error (mientras menor sea, más exacto es)"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>% de Error (MAPE)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rmse')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
                title="Error general promedio (penaliza fallas grandes)"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Error General (RMSE)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('mad')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
                title="Diferencia promedio simple entre lo real y lo estimado"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Diferencia Media (MAD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('trackingSignal')}
                className="py-2.5 px-3 text-right font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
                title="Control de desvío: avisa si el método se queda siempre corto o siempre se pasa (lo ideal es entre -4 y +4)"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Desvío (Señal)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-2.5 px-3 text-center font-semibold cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Puntaje y Nota</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center font-semibold">Paso a Paso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {sortedMethods.map((m) => {
              const isSelected = selectedMethodIds.includes(m.id);
              const isRecommended = m.isRecommended;
              const tsAlert = Math.abs(m.metrics.trackingSignal) > 4;

              // Grade badge style
              let gradeBg = 'bg-slate-100 text-slate-700';
              if (m.metrics.grade === 'A+') gradeBg = 'bg-emerald-100 text-emerald-800 font-bold';
              else if (m.metrics.grade === 'A') gradeBg = 'bg-green-100 text-green-800 font-semibold';
              else if (m.metrics.grade === 'B') gradeBg = 'bg-blue-100 text-blue-800';
              else if (m.metrics.grade === 'C') gradeBg = 'bg-amber-100 text-amber-800';
              else if (m.metrics.grade === 'D') gradeBg = 'bg-rose-100 text-rose-800';

              return (
                <tr
                  key={m.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isRecommended ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Select Checkbox for Chart */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleMethodSelection(m.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Rank */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-700 text-xs">#{m.ranking}</span>
                      {isRecommended && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          <Award className="w-3 h-3 text-emerald-600" />
                          Mejor
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Method Name */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <div>
                        <div className="font-semibold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => onInspectMethod(m.id)}>
                          {m.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {Object.entries(m.parameters)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subcategory */}
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {m.subcategory}
                  </td>

                  {/* Forecast t+1 */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {m.nextForecast.toFixed(2)}
                  </td>

                  {/* MAPE */}
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                    {m.metrics.mape.toFixed(2)}%
                  </td>

                  {/* RMSE */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                    {m.metrics.rmse.toFixed(2)}
                  </td>

                  {/* MAD */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                    {m.metrics.mad.toFixed(2)}
                  </td>

                  {/* Tracking Signal */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        tsAlert ? 'text-amber-700 font-bold' : 'text-slate-600'
                      }`}
                      title={tsAlert ? 'Alerta: Señal fuera de [-4, 4], sesgo de sub/sobreestimación sistemática' : 'Señal bajo control'}
                    >
                      {m.metrics.trackingSignal > 0 ? `+${m.metrics.trackingSignal.toFixed(2)}` : m.metrics.trackingSignal.toFixed(2)}
                      {tsAlert && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    </span>
                  </td>

                  {/* Calificación / Score */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${gradeBg}`}>
                        {m.metrics.grade}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {m.metrics.score}/100
                      </span>
                    </div>
                  </td>

                  {/* Inspect action */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onInspectMethod(m.id)}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
                      title="Ver tabla paso a paso, fórmula y ajustar parámetros"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span>• <strong>MAD</strong>: Diferencia promedio simple</span>
          <span>• <strong>RMSE</strong>: Error general promedio</span>
          <span>• <strong>MAPE</strong>: Porcentaje de error (más bajo = mejor)</span>
          <span>• <strong>Señal</strong>: Control de desvío (ideal entre -4 y +4)</span>
        </div>
        <div className="text-slate-600 font-medium">
          El puntaje califica qué tan preciso y equilibrado es cada método
        </div>
      </div>
    </div>
  );
};
