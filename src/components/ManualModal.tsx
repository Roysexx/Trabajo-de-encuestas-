import React, { useState } from 'react';
import { X, BookOpen, GraduationCap, UserCheck, ShieldCheck, Download, ChevronRight } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  const [activeRole, setActiveRole] = useState<'instructor' | 'aprendiz' | 'coordinador'>('instructor');

  if (!isOpen) return null;

  const downloadManualFile = () => {
    // Trigger download of manual.md
    fetch('/manual.md')
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manual_pronostix.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(() => {
        window.open('/manual.md', '_blank');
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Guía de Uso Paso a Paso</h2>
              <p className="text-xs text-slate-500">Instrucciones claras para el Profesor (Instructor), Estudiante (Aprendiz) y Coordinador</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadManualFile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar archivo manual.md
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/40">
          <button
            onClick={() => setActiveRole('instructor')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeRole === 'instructor'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Para el Profesor / Instructor
          </button>

          <button
            onClick={() => setActiveRole('aprendiz')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeRole === 'aprendiz'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Para el Estudiante / Aprendiz
          </button>

          <button
            onClick={() => setActiveRole('coordinador')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeRole === 'coordinador'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Para el Coordinador del Curso
          </button>
        </div>

        {/* Role Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {activeRole === 'instructor' && (
            <div className="space-y-5 text-xs">
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl">
                <h3 className="font-bold text-blue-900 text-sm mb-1">Objetivo para el Profesor</h3>
                <p className="text-blue-800 leading-relaxed">
                  Guiar al estudiante desde la idea básica de estimar el futuro hasta comprobar los cálculos con datos reales. Esta herramienta te permite demostrar fácilmente por qué no basta con adivinar, sino que hay que medir qué tan lejos quedó el pronóstico y si está sobrestimando o subestimando de manera continua.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Paso a paso sugerido para la clase</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li><strong>Inicio (20 min):</strong> Mostrar el mapa de métodos (botón superior) y explicar la diferencia entre cuando hay datos del pasado y cuando solo hay opiniones de personas.</li>
                    <li><strong>Demostración de retraso (40 min):</strong> Cargar datos con subida continua (Encuesta IA: Personas que van respondiendo) y mostrar cómo el Promedio Simple se queda atrás, mientras que métodos con tendencia (como Holt) siguen la subida sin problemas.</li>
                    <li><strong>Datos con temporadas (40 min):</strong> Cargar las ventas por trimestres (16 periodos) y comparar cómo los métodos capturan los picos de fin de año.</li>
                    <li><strong>Dinámica de grupo Delphi (20 min):</strong> Abrir la sección de opiniones de expertos y mostrar cómo el método Delphi logra poner de acuerdo a personas en 3 rondas sin discusiones cara a cara.</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Conceptos y Números a Revisar</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>% de Error (MAPE):</strong> Es la forma más fácil de comparar métodos: mientras más bajo el porcentaje, mejor acertó.</li>
                    <li>• <strong>Control de Desvío (Señal de Rastreo):</strong> Si este número se sale de [-4 y +4] (marcado con ⚠️), significa que el método se desvió demasiado hacia arriba o hacia abajo.</li>
                    <li>• <strong>Falla Cuadrática (RMSE):</strong> Castiga con más fuerza las fallas grandes o días atípicos.</li>
                    <li>• <strong>Ajustar en Vivo:</strong> Pide a los estudiantes abrir el detalle con el ojo (👁) y mover las barras deslizadoras para ver cómo cambia la línea.</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Guía de Calificación Sugerida para el Profesor</h4>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="font-bold text-emerald-800 block">Identificar la forma de los datos (30%)</span>
                    <span className="text-slate-500">Sabe si los datos son planos, si suben/bajan o si se repiten por temporadas.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="font-bold text-blue-800 block">Elegir el mejor método (40%)</span>
                    <span className="text-slate-500">Justifica por qué el método #1 es el mejor mirando el % de error y que no tenga desvío.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="font-bold text-purple-800 block">Opiniones de expertos (30%)</span>
                    <span className="text-slate-500">Entiende qué hacer cuando no hay datos viejos (Delphi vs comparar con el pasado).</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === 'aprendiz' && (
            <div className="space-y-5 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl">
                <h3 className="font-bold text-emerald-900 text-sm mb-1">Guía Fácil para el Estudiante</h3>
                <p className="text-emerald-800 leading-relaxed">
                  Aprende a calcular el futuro con datos reales paso a paso, sin enredarte con fórmulas difíciles. Sigue estos 3 pasos sencillos para hacer tus talleres y tareas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">1</div>
                  <h4 className="font-bold text-slate-900 text-xs">Elige un Ejemplo de Datos</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Selecciona en el menú de arriba: la <strong>Encuesta Real sobre IA</strong> (22 personas), los <strong>Datos con Subida</strong> o las <strong>Ventas por Temporadas</strong>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">2</div>
                  <h4 className="font-bold text-slate-900 text-xs">Mira la Tabla Comparativa</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    El método en el <strong>Puesto #1</strong> es el ganador recomendado, con nota <strong>A+ o A</strong>. Asegúrate de que no tenga señal de advertencia ⚠️.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">3</div>
                  <h4 className="font-bold text-slate-900 text-xs">Descarga tus Resultados</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Presiona el botón <strong>"Descargar Resultados en Excel / CSV"</strong> para guardar la tabla completa y pegarla en tu reporte o entrega.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">¿Cómo ver las cuentas paso a paso y cambiar valores?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Haz clic en el icono del ojo (👁) o en el nombre de cualquier método en la tabla. Se abrirá una ventana donde podrás mover las barritas para darle más o menos importancia a los datos recientes, ver la fórmula explicada con palabras sencillas y revisar la tabla con la resta de cada punto real contra lo pronosticado.
                </p>
              </div>
            </div>
          )}

          {activeRole === 'coordinador' && (
            <div className="space-y-5 text-xs">
              <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl">
                <h3 className="font-bold text-purple-900 text-sm mb-1">Utilidad para el Programa Académico</h3>
                <p className="text-purple-800 leading-relaxed">
                  Esta plataforma apoya el aprendizaje práctico en carreras como Administración, Contaduría, Logística, Mercadeo, Producción y Sistemas, permitiendo que los aprendices entiendan los pronósticos de demanda y presupuestos con datos reales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Lo que el estudiante aprenderá a hacer</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>Habilidad 1:</strong> Reconocer cuándo se cuenta con datos históricos y cuándo toca apoyarse en opiniones de expertos.</li>
                    <li>• <strong>Habilidad 2:</strong> Evaluar con números reales qué método se equivoca menos (% de error) y no se desvía.</li>
                    <li>• <strong>Habilidad 3:</strong> Presentar conclusiones y gráficas claras para tomar decisiones de compras, inventario o presupuestos.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Cómo revisar los trabajos entregados</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Para comprobar que el estudiante realizó la práctica adecuadamente:
                  </p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>Solicitar el archivo descargado en Excel/CSV con la tabla comparativa de los métodos.</li>
                    <li>Comprobar que el estudiante explique por qué el método ganador fue el mejor.</li>
                    <li>Revisar que haya verificado que el método no presente desvío constante (Señal en rango seguro).</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Dónde encontrar el archivo del manual</h4>
                <p className="text-slate-600">
                  El manual completo está guardado en los archivos <code>/manual.md</code> y <code>/manual</code> en la raíz del proyecto para descargarlo, imprimirlo o compartirlo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Documento: <strong>manual.md</strong> (Disponible en la raíz del proyecto)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
