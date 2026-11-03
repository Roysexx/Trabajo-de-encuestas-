import React, { useState } from 'react';
import { RAW_SURVEY_RECORDS } from '../data/surveyData';
import { FileText, Smartphone, Laptop, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface SurveyAnalysisSectionProps {
  onSelectSurveyDataset: () => void;
  isSurveyActive: boolean;
}

export const SurveyAnalysisSection: React.FC<SurveyAnalysisSectionProps> = ({
  onSelectSurveyDataset,
  isSurveyActive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Count tools
  const toolMentions: Record<string, number> = {
    'ChatGPT': 14,
    'Gemini / Géminis': 11,
    'Meta AI / WhatsApp': 6,
    'Copilot': 4,
    'LuzIA': 3,
    'Dola': 3,
    'Notebook': 2,
    'Claude': 1,
    'Perplexity': 1,
  };

  const filteredRecords = RAW_SURVEY_RECORDS.filter(
    (r) =>
      r.understanding.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tools.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tasks.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Resultados de la Encuesta Real sobre Inteligencia Artificial
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            22 personas respondieron el 27/10/2026 sobre qué saben de IA, qué programas usan, qué tan seguido y en qué aparatos
          </p>
        </div>

        <button
          onClick={onSelectSurveyDataset}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            isSurveyActive
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isSurveyActive ? '✓ Usando estos datos en los pronósticos' : 'Probar estos datos en los pronósticos'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Personas Encuestadas</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">22</div>
          <span className="text-[10px] text-emerald-700 font-medium">100% respondieron todo</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Uso Todos los Días</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">41%</div>
          <span className="text-[10px] text-slate-500">9 de 22 personas la usan a diario</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Uso desde el Teléfono</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">77%</div>
          <span className="text-[10px] text-slate-500">Prefieren el celular para usarla</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Programas Conocidos</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">2.8</div>
          <span className="text-[10px] text-slate-500">promedio por persona</span>
        </div>
      </div>

      {/* Tools Cloud / Distribution */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Programas de IA más conocidos y usados
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(toolMentions).map(([tool, count]) => (
            <div
              key={tool}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-medium"
            >
              <span className="text-slate-800">{tool}</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Responses Table with Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lista de Respuestas en Orden de Llegada
          </span>
          <input
            type="text"
            placeholder="Buscar por palabra o tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-64 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 sticky top-0 text-slate-600 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-2.5 px-3 w-12">#</th>
                <th className="py-2.5 px-3 w-24">Hora</th>
                <th className="py-2.5 px-4">¿Qué cree que es la IA?</th>
                <th className="py-2.5 px-3">Programas</th>
                <th className="py-2.5 px-3">¿Qué tan seguido?</th>
                <th className="py-2.5 px-3">¿En qué aparato?</th>
                <th className="py-2.5 px-4">¿Para qué la usa?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-mono font-bold text-slate-500">R{r.id}</td>
                  <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {r.timestamp.split(' ')[1]}
                  </td>
                  <td className="py-2 px-4 text-slate-800 max-w-xs truncate" title={r.understanding}>
                    {r.understanding}
                  </td>
                  <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{r.tools}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.frequencyScore === 3
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.frequencyScore === 1
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.frequency}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{r.device}</td>
                  <td className="py-2 px-4 text-slate-700 max-w-xs truncate" title={r.tasks}>
                    {r.tasks || '(No especificado)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
