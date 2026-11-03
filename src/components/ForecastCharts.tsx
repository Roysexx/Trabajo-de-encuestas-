import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DataPoint, MethodResult } from '../types/forecasting';
import { TrendingUp, BarChart2, Activity, CheckSquare, Square } from 'lucide-react';

interface ForecastChartsProps {
  data: DataPoint[];
  methods: MethodResult[];
  selectedMethodIds: string[];
  onToggleMethodSelection: (methodId: string) => void;
  onSelectOnlyTopMethods: (count: number) => void;
  horizon: number;
}

export const ForecastCharts: React.FC<ForecastChartsProps> = ({
  data,
  methods,
  selectedMethodIds,
  onToggleMethodSelection,
  onSelectOnlyTopMethods,
  horizon,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'projections' | 'errorComparison' | 'trackingSignal'>('projections');

  // Build combined dataset for time series chart:
  // Points: Historical (1..n) + Future Horizon (n+1 .. n+horizon)
  const combinedChartData = useMemo(() => {
    const n = data.length;
    const chartRows: Array<Record<string, any>> = [];

    // Historical rows
    for (let t = 0; t < n; t++) {
      const row: Record<string, any> = {
        period: data[t].period,
        label: data[t].label,
        actual: data[t].value,
        isFuture: false,
      };

      // Add each method's fitted forecast
      methods.forEach((m) => {
        const item = m.results[t];
        if (item && item.forecast !== undefined) {
          row[m.id] = item.forecast;
        }
      });

      chartRows.push(row);
    }

    // Connect bridge at last historical point: method projections start from here
    const lastLabel = data[n - 1].label;

    // Future horizon rows
    for (let h = 1; h <= horizon; h++) {
      const futurePeriod = n + h;
      const row: Record<string, any> = {
        period: futurePeriod,
        label: `+${h} Futuro`,
        actual: undefined, // no actual value in future
        isFuture: true,
      };

      methods.forEach((m) => {
        if (m.horizonForecasts && m.horizonForecasts[h - 1] !== undefined) {
          row[m.id] = m.horizonForecasts[h - 1];
        }
      });

      chartRows.push(row);
    }

    return chartRows;
  }, [data, methods, horizon]);

  // Error comparison data for bar chart
  const errorChartData = useMemo(() => {
    return methods.map((m) => ({
      name: m.name.split(':')[0].replace('Suavización Exponencial', 'Suav. Exp.'),
      mape: m.metrics.mape,
      rmse: m.metrics.rmse,
      score: m.metrics.score,
      color: m.color,
      ranking: m.ranking,
    }));
  }, [methods]);

  // Tracking signal data
  const trackingSignalData = useMemo(() => {
    return methods.map((m) => ({
      name: m.name.split(':')[0],
      ts: m.metrics.trackingSignal,
      isAlert: Math.abs(m.metrics.trackingSignal) > 4,
    }));
  }, [methods]);

  const activeMethods = methods.filter((m) => selectedMethodIds.includes(m.id));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Chart Header & Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Gráficas de Proyección y Comparación</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compara visualmente los datos reales del pasado y los próximos {horizon} valores estimados a futuro
          </p>
        </div>

        {/* Chart View Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveChartTab('projections')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeChartTab === 'projections' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Líneas de Pronóstico
            </button>
            <button
              onClick={() => setActiveChartTab('errorComparison')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeChartTab === 'errorComparison' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Comparar Fallas y Errores
            </button>
            <button
              onClick={() => setActiveChartTab('trackingSignal')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeChartTab === 'trackingSignal' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Control de Desvío (Sesgo)
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Projections Time Series */}
      {activeChartTab === 'projections' && (
        <div className="space-y-4">
          {/* Quick presets for visible series */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium mr-1">Atajos para la gráfica:</span>
              <button
                onClick={() => onSelectOnlyTopMethods(1)}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded font-medium transition-colors cursor-pointer"
              >
                Solo el Ganador (#1)
              </button>
              <button
                onClick={() => onSelectOnlyTopMethods(3)}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition-colors cursor-pointer"
              >
                Los 3 Mejores
              </button>
              <button
                onClick={() => onSelectOnlyTopMethods(5)}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition-colors cursor-pointer"
              >
                Los 5 Mejores
              </button>
              <button
                onClick={() => onSelectOnlyTopMethods(methods.length)}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition-colors cursor-pointer"
              >
                Mostrar Todos ({methods.length})
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <span className="w-3 h-0.5 bg-slate-900 inline-block"></span> Datos Reales (Pasado)
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span> Métodos Marcados
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <span className="w-3 border-t-2 border-dashed border-slate-500 inline-block"></span> Estimación a Futuro
              </span>
            </div>
          </div>

          {/* Interactive Checkbox Chips for all methods */}
          <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 max-h-24 overflow-y-auto">
            {methods.map((m) => {
              const isSelected = selectedMethodIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onToggleMethodSelection(m.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="truncate max-w-[140px]">{m.name.split(':')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#{m.ranking}</span>
                </button>
              );
            })}
          </div>

          {/* Recharts Canvas */}
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => Number(val).toFixed(0)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const isFuture = payload[0]?.payload?.isFuture;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800 min-w-[220px]">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 mb-2">
                          <span className="font-bold text-slate-200">{label}</span>
                          {isFuture ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Proyección Futura
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Histórico Observado</span>
                          )}
                        </div>

                        {/* Real value */}
                        {payload[0]?.payload?.actual !== undefined && (
                          <div className="flex items-center justify-between py-0.5 text-slate-300 font-bold">
                            <span>Valor Real:</span>
                            <span className="font-mono text-emerald-400">{payload[0].payload.actual}</span>
                          </div>
                        )}

                        {/* Methods forecasts */}
                        <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                          {payload.map((entry) => {
                            if (entry.dataKey === 'actual') return null;
                            const method = methods.find((m) => m.id === entry.dataKey);
                            if (!method) return null;
                            return (
                              <div key={String(entry.dataKey)} className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1.5 text-slate-300 truncate max-w-[140px]">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {method.name.split(':')[0]}
                                </span>
                                <span className="font-mono font-bold text-slate-100">
                                  {Number(entry.value).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Vertical Divider indicating forecast boundary */}
                <ReferenceLine
                  x={data[data.length - 1]?.label}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Datos Pasados | Pronóstico a Futuro',
                    position: 'top',
                    fill: '#dc2626',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                {/* Real Actual Line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Datos Reales (Pasados)"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0f172a', strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />

                {/* Active Method Lines */}
                {activeMethods.map((m) => (
                  <Line
                    key={m.id}
                    type="monotone"
                    dataKey={m.id}
                    name={m.name}
                    stroke={m.color}
                    strokeWidth={m.isRecommended ? 2.5 : 1.8}
                    strokeDasharray={m.isRecommended ? undefined : undefined}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Tab 2: Error Comparison (MAPE & RMSE Bar Chart) */}
      {activeChartTab === 'errorComparison' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Comparación de fallas: entre más bajita sea la barra de <strong>% de Error</strong> y <strong>Error General (RMSE)</strong>, más acertado es el método.
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorChartData} margin={{ top: 20, right: 20, left: 0, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs border border-slate-800">
                        <div className="font-bold text-slate-200 pb-1 border-b border-slate-700 mb-1.5 flex items-center justify-between gap-3">
                          <span>{item.name}</span>
                          <span className="font-mono text-emerald-400 font-bold">Puesto #{item.ranking}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">% de Error (MAPE):</span>
                            <span className="font-mono font-bold">{item.mape.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Error General (RMSE):</span>
                            <span className="font-mono font-bold">{item.rmse.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Puntaje:</span>
                            <span className="font-mono font-bold text-emerald-400">{item.score}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="mape" name="% de Error (MAPE)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rmse" name="Error General (RMSE)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Tab 3: Tracking Signal (Bias Control) */}
      {activeChartTab === 'trackingSignal' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            El <strong>Control de Desvío</strong> vigila si el método se queda siempre corto (por debajo) o siempre se pasa (por encima) de la realidad. Lo ideal es mantenerse entre <strong>-4 y +4</strong>.
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackingSignalData} margin={{ top: 20, right: 20, left: 0, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis domain={[-8, 8]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs border border-slate-800">
                        <div className="font-bold text-slate-200 pb-1 border-b border-slate-700 mb-1">
                          {item.name}
                        </div>
                        <div className="flex justify-between gap-4 mt-1">
                          <span className="text-slate-400">Tracking Signal:</span>
                          <span className={`font-mono font-bold ${item.isAlert ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.ts.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item.isAlert
                            ? '⚠️ Fuera de rango [-4, 4]: Existe sesgo direccional no corregido.'
                            : '✓ Bajo control estadístico.'}
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={4} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Límite Superior (+4)', fill: '#dc2626', fontSize: 10 }} />
                <ReferenceLine y={-4} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Límite Inferior (-4)', fill: '#dc2626', fontSize: 10 }} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="ts" name="Tracking Signal" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
