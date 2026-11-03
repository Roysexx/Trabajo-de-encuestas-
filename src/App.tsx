/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DATASET_PRESETS } from './data/surveyData';
import { MethodParams } from './types/forecasting';
import {
  DEFAULT_PARAMS,
  executeAllQuantitativeMethods,
} from './utils/forecastingMath';
import { TopNav } from './components/TopNav';
import { ForecastCharts } from './components/ForecastCharts';
import { ComparativeTable } from './components/ComparativeTable';
import { QualitativeSection } from './components/QualitativeSection';
import { SurveyAnalysisSection } from './components/SurveyAnalysisSection';
import { TaxonomyDiagramModal } from './components/TaxonomyDiagramModal';
import { MethodDetailModal } from './components/MethodDetailModal';
import { ManualModal } from './components/ManualModal';
import {
  Award,
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cuantitativo' | 'cualitativo' | 'encuesta'>('cuantitativo');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('encuesta_acumulada');
  const [params, setParams] = useState<MethodParams>(DEFAULT_PARAMS);
  const [selectedMethodIds, setSelectedMethodIds] = useState<string[]>([
    'suavizacion_holt',
    'promedio_movil_doble',
    'descomposicion_multiplicativo',
    'regresion_lineal_simple',
  ]);

  // Modal states
  const [isTaxonomyOpen, setIsTaxonomyOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [inspectedMethodId, setInspectedMethodId] = useState<string | null>(null);

  // Active dataset
  const activePreset = useMemo(() => {
    return DATASET_PRESETS.find((p) => p.id === selectedDatasetId) || DATASET_PRESETS[0];
  }, [selectedDatasetId]);

  // Execute all 12 quantitative models
  const computedMethods = useMemo(() => {
    return executeAllQuantitativeMethods(activePreset.data, params, activePreset.suggestedPattern);
  }, [activePreset, params]);

  // Top recommended model
  const topMethod = computedMethods[0];

  const handleUpdateParams = (newParams: Partial<MethodParams>) => {
    setParams((prev: MethodParams) => ({ ...prev, ...newParams }));
  };

  const handleToggleMethodSelection = (methodId: string) => {
    setSelectedMethodIds((prev: string[]) =>
      prev.includes(methodId) ? prev.filter((id) => id !== methodId) : [...prev, methodId]
    );
  };

  const handleSelectOnlyTopMethods = (count: number) => {
    const topIds = computedMethods.slice(0, count).map((m) => m.id);
    setSelectedMethodIds(topIds);
  };

  const inspectedMethod = useMemo(() => {
    if (!inspectedMethodId) return null;
    return computedMethods.find((m) => m.id === inspectedMethodId) || null;
  }, [inspectedMethodId, computedMethods]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTaxonomy={() => setIsTaxonomyOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
      />

      {/* Main Content Container (Desktop baseline 1440px max width) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Executive Banner & Dataset Selection Toolbar */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                <span>Pronósticos Fáciles y Explicados</span>
                <span aria-hidden="true">·</span>
                <span>Todos los Métodos de la Guía</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {activePreset.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {activePreset.description}
              </p>
            </div>

            {/* Quick Dataset Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch lg:self-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                Elegir Ejemplo de Datos:
              </span>
              <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {DATASET_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedDatasetId(preset.id);
                      // Update horizon and defaults if seasonal
                      if (preset.id === 'demanda_licencias_ia_trimestral') {
                        setParams((p: MethodParams) => ({ ...p, seasonalPeriod: 4 }));
                        setSelectedMethodIds([
                          'suavizacion_winter_multiplicativo',
                          'descomposicion_multiplicativo',
                          'suavizacion_holt',
                        ]);
                      } else {
                        setSelectedMethodIds([
                          'suavizacion_holt',
                          'promedio_movil_doble',
                          'regresion_lineal_simple',
                        ]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedDatasetId === preset.id
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.name.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Ribbon: Summary Stats and Best Model Score */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/70">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                Método Ganador (#1 Recomendado)
              </span>
              <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {topMethod.name.split(':')[0]}
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="font-mono font-bold text-emerald-700">
                  Nota: {topMethod.metrics.score}/100 ({topMethod.metrics.grade})
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">Error: {topMethod.metrics.mape}%</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Próximo Valor Estimado (t+1)
              </span>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5 tabular-nums">
                {topMethod.nextForecast.toFixed(2)} {activePreset.frequencyUnit.toLowerCase()}s
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Calculado con el método más acertado
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Forma de los Datos
              </span>
              <div className="text-sm font-bold text-slate-900 capitalize mt-0.5">
                Tipo: {activePreset.suggestedPattern === 'tendencia' ? 'Van Subiendo (Tendencia)' : activePreset.suggestedPattern === 'estacional' ? 'Por Temporadas (Épocas del año)' : 'Valores Estables'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {activePreset.data.length} datos pasados analizados
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Total de Métodos Probados
              </span>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                16 Métodos en Total
              </div>
              <div className="text-xs text-slate-500 mt-1">
                12 con datos numéricos + 4 con opiniones
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Quantitative Models Dashboard */}
        {activeTab === 'cuantitativo' && (
          <div className="space-y-6">
            {/* Interactive Multi-Method Charts */}
            <ForecastCharts
              data={activePreset.data}
              methods={computedMethods}
              selectedMethodIds={selectedMethodIds}
              onToggleMethodSelection={handleToggleMethodSelection}
              onSelectOnlyTopMethods={handleSelectOnlyTopMethods}
              horizon={params.horizon}
            />

            {/* Exhaustive Comparative Table */}
            <ComparativeTable
              methods={computedMethods}
              onInspectMethod={(id) => setInspectedMethodId(id)}
              selectedMethodIds={selectedMethodIds}
              onToggleMethodSelection={handleToggleMethodSelection}
            />
          </div>
        )}

        {/* Tab 2: Qualitative Methods Simulation */}
        {activeTab === 'cualitativo' && (
          <QualitativeSection baseValue={activePreset.data[activePreset.data.length - 1]?.value || 22} />
        )}

        {/* Tab 3: AI Survey (Original Attachment Analysis) */}
        {activeTab === 'encuesta' && (
          <SurveyAnalysisSection
            onSelectSurveyDataset={() => {
              setSelectedDatasetId('encuesta_acumulada');
              setActiveTab('cuantitativo');
            }}
            isSurveyActive={selectedDatasetId.startsWith('encuesta')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Pronostix · Aprende, prueba y compara métodos de pronóstico de forma sencilla
          </span>
          <button
            onClick={() => setIsTaxonomyOpen(true)}
            className="text-emerald-700 hover:text-emerald-900 font-medium hover:underline cursor-pointer"
          >
            Ver Mapa Completo de Métodos
          </button>
        </div>
      </footer>

      {/* Interactive Taxonomy Diagram Modal */}
      <TaxonomyDiagramModal
        isOpen={isTaxonomyOpen}
        onClose={() => setIsTaxonomyOpen(false)}
        onSelectMethod={(methodId) => {
          if (
            [
              'consenso_panel',
              'pronostico_visionario',
              'analogia_historica',
              'metodo_delphi',
            ].includes(methodId)
          ) {
            setActiveTab('cualitativo');
          } else {
            setActiveTab('cuantitativo');
            setInspectedMethodId(methodId);
            if (!selectedMethodIds.includes(methodId)) {
              setSelectedMethodIds((prev) => [...prev, methodId]);
            }
          }
        }}
      />

      {/* Method Detail Step-by-Step Modal */}
      <MethodDetailModal
        method={inspectedMethod}
        onClose={() => setInspectedMethodId(null)}
        params={params}
        onUpdateParams={handleUpdateParams}
      />

      {/* Manual Modal Viewer */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}
