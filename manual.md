# MANUAL DE USUARIO Y GUÍA PEDAGÓGICA DE PRONOSTIX
## Plataforma Analítica para Métodos de Pronósticos y Proyecciones de Series de Tiempo

**Versión:** 1.0  
**Fecha de Publicación:** 27 de Octubre de 2026  
**Proyecto:** Pronostix - Sistema de Simulación, Proyección y Calificación de Modelos de Pronóstico  
**Referencia Metodológica:** Taxonomía Integral de Métodos de Pronósticos Cualitativos y Cuantitativos  

---

## ÍNDICE GENERAL

1. [Presentación de la Plataforma](#1-presentación-de-la-plataforma)
2. [Estructura del Sistema y Taxonomía Integrada](#2-estructura-del-sistema-y-taxonomía-integrada)
3. [Manual para el Rol de Instructor](#3-manual-para-el-rol-de-instructor)
   - 3.1. Objetivos Pedagógicos y Metodología de Clase
   - 3.2. Guía de Conducción de Sesiones Prácticas
   - 3.3. Explicación de Métricas Estadísticas de Error y Señal de Rastreo
   - 3.4. Dinámica de Calibración de Hiperparámetros
   - 3.5. Rúbrica y Criterios de Evaluación para el Aprendiz
4. [Manual para el Rol de Aprendiz](#4-manual-para-el-rol-de-aprendiz)
   - 4.1. Primeros Pasos e Interfaz General
   - 4.2. Cómo Explorar y Proyectar Métodos Cuantitativos
   - 4.3. Cómo Interpretar la Tabla Comparativa y las Calificaciones
   - 4.4. Cómo Simular Métodos Cualitativos (Delphi, Panel, Analogía, Visionario)
   - 4.5. Exploración de Datos Reales de la Encuesta de IA
   - 4.6. Exportación de Resultados y Elaboración de Informes
5. [Manual para el Rol de Coordinador Académico](#5-manual-para-el-rol-de-coordinador-académico)
   - 5.1. Pertinencia Curricular y Alineación con Programas de Formación
   - 5.2. Resultados de Aprendizaje del Programa (RAP)
   - 5.3. Modelo de Evaluación por Competencias
   - 5.4. Protocolo de Auditoría y Verificación de Evidencias
6. [Glosario de Fórmulas y Métricas Estadísticas](#6-glosario-de-fórmulas-y-métricas-estadísticas)

---

## 1. PRESENTACIÓN DE LA PLATAFORMA

**Pronostix** es un entorno interactivo y académico diseñado para la enseñanza, experimentación, contraste y evaluación objetiva de métodos de pronóstico. Permite abordar tanto situaciones donde **no existen datos históricos** (métodos cualitativos) como escenarios donde **sí existen registros temporales o variables causales** (métodos cuantitativos).

La plataforma resuelve el problema tradicional de las hojas de cálculo dispersas al unificar en un solo panel:
- Modelado matemático riguroso en tiempo real.
- Visualización de series observadas vs. proyectadas en horizontes futuros.
- Tabla comparativa con 7 métricas de error estándar de la industria.
- Sistema de puntuación y semaforización (Score 0-100 y Grados A+, A, B, C, D).
- Análisis descriptivo y modelado sobre la base de datos de campo real de la **Encuesta de Inteligencia Artificial** del 27/10/2026.

---

## 2. ESTRUCTURA DEL SISTEMA Y TAXONOMÍA INTEGRADA

El sistema reproduce de forma exhaustiva la taxonomía metodológica de pronósticos:

```
                            MÉTODOS DE PRONÓSTICOS
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
MÉTODOS CUALITATIVOS                                         MÉTODOS CUANTITATIVOS
(No existen datos históricos)                               (Sí existen datos históricos)
  • Consenso de un panel                                              │
  • Pronóstico visionario                      ┌──────────────────────┴──────────────────────┐
  • Analogía histórica                         ▼                                             ▼
  • Método Delphi                  ANÁLISIS DE SERIES DE TIEMPO                     MODELOS CAUSALES
                                   (Univariados: X = f(Xt-1...))                     (Multivariados)
                                               │                                            │
               ┌───────────────────────────────┴──────────────┐                             ├─ Regresión lineal simple
               ▼                                              ▼                             │  Y = f(X1)
     MÉTODOS DE SUAVIZACIÓN                         DESCOMPOSICIÓN                          └─ Regresión lineal múltiple
               │                                   DE SERIES DE TIEMPO                         Y = f(X1, X2... Xk)
   ┌───────────┼───────────┐                         • Multiplicativo
   ▼           ▼           ▼                         • Aditivo
 SERIES      SERIES      SERIES
ESTACIONARIAS CON        CON
             TENDENCIA   ESTACIONALIDAD
 • Promedio  • Promedio  • Suavización
   móvil       móvil       exponencial triple:
   simple      doble       Método de Winter
 • Promedio  • Suav.       (Multiplicativo /
   móvil de    exponencial   Aditivo)
   k periodos  doble:
 • Suav.       - Brown
   exponencial - Holt
   simple
```

---

## 3. MANUAL PARA EL ROL DE INSTRUCTOR

### 3.1. Objetivos Pedagógicos y Metodología de Clase
El instructor debe utilizar Pronostix como un laboratorio computacional donde los conceptos teóricos de pronósticos cobren vida inmediatamente.

**Objetivos clave:**
1. Desmitificar la elección subjetiva del modelo demostrando empíricamente por qué ciertos modelos fallan ante ciertas estructuras de datos (ej. el rezago sistemático de SMA ante tendencias).
2. Desarrollar en el estudiante la capacidad crítica de evaluar no solo el error medio (MAPE/RMSE), sino el **sesgo direccional** mediante la **Señal de Rastreo (Tracking Signal)**.
3. Fomentar la toma de decisiones basada en datos cuantitativos y en juicio cualitativo estructurado.

### 3.2. Guía de Conducción de Sesiones Prácticas
Se recomienda estructurar una sesión de 2 a 3 horas siguiendo estas etapas:

- **Etapa 1: Demostración Conceptual (20 min)**
  - Abrir el botón **"Ver Mapa de Métodos"** en el encabezado.
  - Explicar la diferencia principal: ¿Cuándo usar opiniones de personas y cuándo cálculos con datos del pasado?
  - Mostrar la imagen de referencia original adjunta en el botón secundario del modal para validar el origen del mapa.

- **Etapa 2: Comparación en Serie con Tendencia (40 min)**
  - Seleccionar en el menú superior la serie: **"Encuesta IA: Personas que van respondiendo (Subida continua)"**.
  - Preguntar a la clase: *¿Qué ocurre si aplicamos un Promedio Móvil Simple a esta serie que no para de subir?*
  - Mostrar en la gráfica cómo el Promedio Simple queda siempre por debajo de la realidad (retraso evidente y señal de desvío > +4 con ⚠️).
  - Activar el **Método de Holt** y el **Promedio Móvil Doble**. Mostrar cómo se adaptan a la subida sin quedarse atrás.
  - Observar la tabla comparativa: Holt obtiene el **Puesto #1 con nota A+**, mientras el Promedio Simple baja a notas menores.

- **Etapa 3: Demostración de Temporadas y Ciclos (40 min)**
  - Cambiar al ejemplo: **"Ventas de Servicios de IA (16 Trimestres por Temporadas)"**.
  - Destacar cómo se repiten los picos al final de cada año.
  - Activar **Winter Multiplicativo** y **Descomposición por Temporadas**.
  - Mostrar cómo ambos métodos capturan la subida de fondo y los picos de fin de año.

- **Etapa 4: Sesión de Métodos con Personas y Expertos (20 min)**
  - Cambiar a la pestaña **"Opiniones de Expertos"**.
  - Probar el **Método Delphi**: mostrar cómo tras 3 rondas anónimas las opiniones se acercan y se llega a un acuerdo mutuo sin peleas de grupo.
  - Contrastar con la **Comparación con el Pasado (Analogía)** y el **Acuerdo en Grupo (Panel)**.

### 3.3. Explicación de las Métricas en Palabras Sencillas
El profesor debe asegurar que el estudiante entienda cada columna de la tabla:

1. **Diferencia Media (MAD / MAE):** El promedio simple de cuánto se desvió la predicción del dato real, en las mismas unidades (ej. personas o licencias).
2. **Error Cuadrático (MSE):** Eleva las fallas al cuadrado para castigar fuertemente cuando el error fue grande.
3. **Error General (RMSE):** La raíz del error cuadrático; devuelve el número castigado al tamaño normal de los datos.
4. **% de Error (MAPE):** La métrica más clara de todas: mide qué porcentaje se equivocó el pronóstico:
   - $< 10\%$: Excelente acierto.
   - $10\% - 20\%$: Buen pronóstico.
   - $> 20\%$: Cuidado, se equivoca bastante.
5. **Control de Desvío (Señal de Rastreo):** Indica si el método tiene la mala costumbre de estimar siempre por debajo (número muy positivo) o siempre por arriba (número muy negativo). Debe mantenerse seguro entre -4 y +4; si se sale, se muestra con ⚠️.

### 3.4. Dinámica de Ajuste en Vivo
El profesor puede pedir a los estudiantes hacer clic en el icono del ojo (👁) o en el nombre de un método para abrir la ventana de detalle:
- Mover la barra de sensibilidad ($\alpha$) en el promedio exponencial: ver cómo al subirlo el método reacciona rápido a lo último que pasó, y al bajarlo se vuelve más suave y tranquilo.
- Ajustar la fuerza de la tendencia ($\beta$) en Holt para ver cómo sigue la inclinación de la subida.

---

## 4. MANUAL PARA EL ROL DE APRENDIZ

### 4.1. Primeros Pasos e Interfaz General
¡Bienvenido a Pronostix! La plataforma tiene 3 pestañas principales en la barra superior:
1. **Pronósticos con Datos:** Pantalla principal con la gráfica interactiva de líneas, los indicadores clave y la tabla comparativa completa.
2. **Opiniones de Expertos:** Simuladores interactivos para cuando no hay números viejos (Método Delphi, Acuerdo en Grupo, Parecido con el Pasado y Visión del Líder).
3. **Encuesta sobre IA (22 Respuestas):** Los datos reales de la encuesta realizada a personas sobre el uso cotidiano de la Inteligencia Artificial.

### 4.2. Cómo Explorar y Proyectar Métodos Cuantitativos
1. **Elige un Ejemplo de Datos:**
   En la barra superior, haz clic en el menú **"Elegir Ejemplo de Datos:"** y prueba:
   - *Encuesta IA: Personas que van respondiendo* (subida continua).
   - *Datos Estables: Frecuencia de Uso Diario* (datos parejos y planos).
   - *Ventas de Servicios de IA (16 Trimestres por Temporadas)* (con subidas en fin de año).
   - *Crecimiento Mensual de Usuarios Registrados* (subida mes a mes).
2. **Revisa la Gráfica:**
   - La línea negra con puntos muestra los **Datos Reales ($Y_t$)**.
   - Las líneas de colores muestran los pronósticos calculados por cada método.
   - A la derecha de la línea roja vertical punteada (**"Fin Historial | Inicio Proyección"**) están las estimaciones hacia el futuro ($t+1, t+2$, etc.).
3. **Filtra lo que Quieres Ver:**
   - Usa los botones rápidos: *"Solo el #1 Recomendado"*, *"Top 3 Mejores"* o *"Ver Todos"*.
   - También puedes prender o apagar métodos en la lista con sus casillas de verificación.

### 4.3. Cómo Interpretar la Tabla Comparativa
Mira la **Tabla Comparativa de Métodos de Pronóstico**:
- **Columna Puesto:** Del 1° al 12°. El que está en el **Puesto #1** es el ganador recomendado.
- **Columna Próximo Valor Estimado ($t+1$):** El número que el método calcula que va a pasar en el siguiente periodo.
- **Columna % de Error (MAPE):** Qué tanto falla en promedio en porcentaje. ¡Menor es mejor!
- **Columna Control de Desvío (Señal):** Debe estar en rango normal (entre -4 y +4). Si ves el icono ⚠️, significa que el método tiende a sobrestimar o subestimar de forma continua.
- **Columna Puntaje y Nota:** Nota general de 0 a 100 puntos y letras (A+, A, B, C, D) para saber de un vistazo qué tan confiable es.

### 4.4. Cómo Probar los Métodos de Expertos (Cualitativos)
Haz clic en la pestaña **"Opiniones de Expertos"**:
- **Acuerdo en Grupo (Consenso de Panel):** Prueba cómo darle distinto porcentaje de peso al voto del gerente, del vendedor y del técnico para llegar a un número balanceado.
- **Método Delphi:** Mira cómo 12 expertos reducen sus diferencias a lo largo de 3 rondas anónimas hasta ponerse de acuerdo.
- **Parecido con el Pasado (Analogía):** Compara qué tan rápido creció la IA (2 meses en llegar a 100 millones de personas) frente a los computadores (16 años) o internet (7 años).

### 4.5. Exploración de Datos Reales de la Encuesta de IA
Haz clic en la pestaña **"Encuesta sobre IA (22 Respuestas)"**:
- Conoce qué respondieron 22 personas reales: qué programas conocen (ChatGPT, Gemini, Meta AI, Copilot), si usan celular (77%) y si la usan todos los días (41%).
- Si presionas el botón verde **"Probar estos datos en los pronósticos"**, la plataforma cargará estas respuestas para que las proyectes con los métodos matemáticos.

### 4.6. Descarga de Resultados para Tareas e Informes
1. En la tabla comparativa, haz clic en el botón **"Descargar Resultados en Excel / CSV"**.
2. Se guardará un archivo en tu equipo con todos los métodos, errores, cálculos y notas.
3. Puedes abrirlo con Excel o Google Sheets para adjuntarlo como evidencia a tu trabajo o informe técnico.

---

## 5. MANUAL PARA EL ROL DE COORDINADOR ACADÉMICO

### 5.1. Pertinencia Curricular y Alineación con Programas de Formación
**Pronostix** da respuesta directa a las necesidades de formación técnica y profesional en áreas clave:

- **Ingeniería Industrial y Gestión de Operaciones:**
  - Asignaturas: Planeación y Control de la Producción (PCP), Modelado de la Demanda, Gestión de Inventarios.
  - Aplicación: Selección de modelos univariados para alimentar planes maestros de producción (MPS) y políticas de reorden (ROP).
- **Administración de Empresas y Finanzas:**
  - Asignaturas: Presupuestos, Pronóstico de Ventas, Inteligencia de Negocios.
  - Aplicación: Proyección de flujos de caja y ventas estacionales mediante descomposición aditiva/multiplicativa.
- **Ciencia de Datos y Estadística Aplicada:**
  - Asignaturas: Econometría, Series de Tiempo, Modelos de Regresión Causal.
  - Aplicación: Comparación empírica entre regresión lineal múltiple por mínimos cuadrados ordinarios (OLS) y suavización exponencial triple (Holt-Winters).

### 5.2. Resultados de Aprendizaje del Programa (RAP)
La utilización de Pronostix asegura el cumplimiento de los siguientes Resultados de Aprendizaje:

1. **RAP-1:** Formular pronósticos de demanda o variables de interés utilizando métodos cualitativos y cuantitativos de acuerdo con el ciclo de vida del producto y la disponibilidad de información histórica.
2. **RAP-2:** Calcular y contrastar indicadores estadísticos de precisión (MAD, MSE, RMSE, MAPE) y de control de sesgo (Tracking Signal) para clasificar modelos de pronóstico.
3. **RAP-3:** Seleccionar de manera justificada el modelo predictivo óptimo para una serie de tiempo dada, optimizando sus parámetros característicos.
4. **RAP-4:** Comunicar proyecciones ejecutivas fundamentadas con soporte gráfico, tablas de contingencia y análisis de escenarios cualitativos.

### 5.3. Modelo de Evaluación por Competencias
Se sugiere incorporar Pronostix como instrumento de evaluación de desempeño y producto en evaluaciones sumativas:

```
                                  EVALUACIÓN POR COMPETENCIAS
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
      EVIDENCIA DE DESEMPEÑO                                         EVIDENCIA DE PRODUCTO
  • Demostración práctica en el software.                         • Informe técnico exportado en CSV.
  • Calibración y optimización de parámetros.                     • Gráfica comparativa con horizonte proyectado.
  • Sustentación de la elección del modelo #1.                   • Justificación del método frente a la taxonomía.
```

### 5.4. Protocolo de Auditoría y Verificación de Evidencias
Para verificar que el proceso formativo se llevó a cabo con rigor académico, el coordinador académico o comité evaluador debe solicitar:
1. El archivo CSV generado directamente desde la plataforma conteniendo los resultados de los 12 métodos cuantitativos.
2. Captura de la pantalla con la gráfica de dispersión y verificación de que el estudiante comprobó la **Señal de Rastreo** en el intervalo $[-4, 4]$.
3. Hoja de cálculo complementaria donde el estudiante audite al menos 3 periodos del método ganador utilizando la formulación matemática indicada en el modal de detalle de Pronostix.

---

## 6. GLOSARIO DE FÓRMULAS Y MÉTRICAS ESTADÍSTICAS

Para facilitar el estudio y la homologación teórica, a continuación se detallan las ecuaciones empleadas en el código fuente de Pronostix:

### 1. Métodos Cuantitativos Univariados

- **Promedio Móvil Simple (SMA):**
  $$\hat{Y}_{t+1} = \frac{1}{k} \sum_{i=0}^{k-1} Y_{t-i}$$

- **Promedio Móvil Ponderado (WMA):**
  $$\hat{Y}_{t+1} = \sum_{i=1}^{k} w_i \cdot Y_{t-k+i} \quad \text{donde } \sum w_i = 1$$

- **Suavización Exponencial Simple (SES):**
  $$\hat{Y}_{t+1} = \alpha Y_t + (1 - \alpha) \hat{Y}_t$$

- **Promedio Móvil Doble (DMA):**
  $$M_t = \frac{1}{k}\sum_{i=0}^{k-1} Y_{t-i}, \quad M'_t = \frac{1}{k}\sum_{i=0}^{k-1} M_{t-i}$$
  $$a_t = 2M_t - M'_t, \quad b_t = \frac{2}{k-1}(M_t - M'_t)$$
  $$\hat{Y}_{t+m} = a_t + b_t \cdot m$$

- **Suavización Exponencial Doble de Brown:**
  $$S'_t = \alpha Y_t + (1-\alpha)S'_{t-1}, \quad S''_t = \alpha S'_t + (1-\alpha)S''_{t-1}$$
  $$a_t = 2S'_t - S''_t, \quad b_t = \frac{\alpha}{1-\alpha}(S'_t - S''_t)$$
  $$\hat{Y}_{t+m} = a_t + b_t \cdot m$$

- **Suavización Exponencial Doble de Holt:**
  $$L_t = \alpha Y_t + (1-\alpha)(L_{t-1} + T_{t-1})$$
  $$T_t = \beta (L_t - L_{t-1}) + (1-\beta) T_{t-1}$$
  $$\hat{Y}_{t+m} = L_t + m \cdot T_t$$

- **Suavización Exponencial Triple de Holt-Winters (Multiplicativo):**
  $$L_t = \alpha \frac{Y_t}{S_{t-s}} + (1-\alpha)(L_{t-1} + T_{t-1})$$
  $$T_t = \beta (L_t - L_{t-1}) + (1-\beta) T_{t-1}$$
  $$S_t = \gamma \frac{Y_t}{L_t} + (1-\gamma) S_{t-s}$$
  $$\hat{Y}_{t+m} = (L_t + m T_t) \cdot S_{t-s+m}$$

- **Descomposición de Series de Tiempo:**
  - Multiplicativa: $Y_t = T_t \times S_t \times I_t \implies \hat{Y}_{t+m} = (a + b(t+m)) \times S_{(t+m)\%s}$
  - Aditiva: $Y_t = T_t + S_t + I_t \implies \hat{Y}_{t+m} = (a + b(t+m)) + S_{(t+m)\%s}$

### 2. Modelos Causales Multivariados

- **Regresión Lineal Simple:**
  $$Y = \beta_0 + \beta_1 X_1$$
  $$\beta_1 = \frac{\sum (X_i - \bar{X})(Y_i - \bar{Y})}{\sum (X_i - \bar{X})^2}, \quad \beta_0 = \bar{Y} - \beta_1 \bar{X}$$

- **Regresión Lineal Múltiple:**
  $$\mathbf{Y} = \mathbf{X}\mathbf{\beta} + \mathbf{\epsilon} \implies \hat{\mathbf{\beta}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

### 3. Métricas de Error y Desempeño

- **Error en el periodo $t$ ($e_t$):**
  $$e_t = Y_t - \hat{Y}_t$$

- **Desviación Absoluta Media (MAD / MAE):**
  $$MAD = \frac{1}{n} \sum_{t=1}^n |e_t|$$

- **Error Cuadrático Medio (MSE):**
  $$MSE = \frac{1}{n} \sum_{t=1}^n e_t^2$$

- **Raíz del Error Cuadrático Medio (RMSE):**
  $$RMSE = \sqrt{MSE}$$

- **Error Porcentual Absoluto Medio (MAPE):**
  $$MAPE = \frac{100\%}{n} \sum_{t=1}^n \left|\frac{e_t}{Y_t}\right|$$

- **Señal de Rastreo (Tracking Signal - TS):**
  $$TS = \frac{\sum_{t=1}^n e_t}{MAD}$$
  *Rango de control admisible:* $-4.0 \le TS \le +4.0$.

---

**Pronostix** — Documento de Distribución Académica.  
Aprobado para uso docente, estudiantil e institucional.
