import {
  DataPoint,
  ErrorMetrics,
  ForecastItemResult,
  MethodParams,
  MethodResult,
  QualitativeMethodResult,
  SeriesPattern,
} from '../types/forecasting';

// Helper: Calculate standard regression line Y = a + b * X
export function calculateSimpleOLS(x: number[], y: number[]) {
  const n = x.length;
  if (n < 2) return { a: y[0] || 0, b: 0, rSquared: 0, r: 0 };
  const sumX = x.reduce((acc, v) => acc + v, 0);
  const sumY = y.reduce((acc, v) => acc + v, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let den = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    den += dx * dx;
    ssTot += dy * dy;
  }

  const b = den !== 0 ? num / den : 0;
  const a = meanY - b * meanX;

  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yHat = a + b * x[i];
    ssRes += Math.pow(y[i] - yHat, 2);
  }

  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const r = (b >= 0 ? 1 : -1) * Math.sqrt(rSquared);

  return { a, b, rSquared, r };
}

// Matrix operations for Multiple Linear Regression (up to 4 variables)
export function solveMultipleOLS(X: number[][], Y: number[]) {
  const n = X.length;
  if (n === 0) return { coefficients: [0], rSquared: 0, rSquaredAdj: 0 };
  const p = X[0].length; // includes intercept column 1

  // Transpose X
  const Xt: number[][] = Array.from({ length: p }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      Xt[j][i] = X[i][j];
    }
  }

  // XtX = Xt * X (p x p)
  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += Xt[i][k] * X[k][j];
      }
      XtX[i][j] = sum;
    }
  }

  // XtY = Xt * Y (p x 1)
  const XtY: number[] = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += Xt[i][k] * Y[k];
    }
    XtY[i] = sum;
  }

  // Gauss-Jordan elimination to invert XtX and solve (XtX) * Beta = XtY
  const augmented: number[][] = XtX.map((row, i) => [...row, XtY[i]]);
  for (let i = 0; i < p; i++) {
    let pivot = augmented[i][i];
    let pivotRow = i;
    for (let k = i + 1; k < p; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(pivot)) {
        pivot = augmented[k][i];
        pivotRow = k;
      }
    }

    if (pivotRow !== i) {
      const temp = augmented[i];
      augmented[i] = augmented[pivotRow];
      augmented[pivotRow] = temp;
    }

    pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) {
      // Degenerate matrix
      return { coefficients: Array(p).fill(0), rSquared: 0, rSquaredAdj: 0 };
    }

    for (let j = i; j <= p; j++) {
      augmented[i][j] /= pivot;
    }

    for (let k = 0; k < p; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = i; j <= p; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  const coefficients = augmented.map((row) => row[p]);

  // Compute R²
  const meanY = Y.reduce((acc, v) => acc + v, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    let yHat = 0;
    for (let j = 0; j < p; j++) {
      yHat += coefficients[j] * X[i][j];
    }
    ssRes += Math.pow(Y[i] - yHat, 2);
    ssTot += Math.pow(Y[i] - meanY, 2);
  }

  const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const kVars = p - 1;
  const rSquaredAdj = n > kVars + 1 ? 1 - ((1 - rSquared) * (n - 1)) / (n - kVars - 1) : rSquared;

  return { coefficients, rSquared, rSquaredAdj };
}

// Compute comprehensive error metrics and scoring
export function computeMetrics(results: ForecastItemResult[], pattern: SeriesPattern): ErrorMetrics {
  const evaluated = results.filter((r) => r.actual !== undefined && !isNaN(r.actual) && !isNaN(r.forecast));
  const n = evaluated.length;

  if (n === 0) {
    return {
      mad: 0,
      mse: 0,
      rmse: 0,
      mape: 0,
      mpe: 0,
      trackingSignal: 0,
      score: 50,
      grade: 'C',
      gradeDescription: 'Sin suficientes datos de prueba',
    };
  }

  let sumAbsError = 0;
  let sumSqError = 0;
  let sumPctError = 0;
  let sumError = 0;
  let sumActual = 0;
  let ssTot = 0;

  const meanActual = evaluated.reduce((sum, r) => sum + (r.actual ?? 0), 0) / n;

  for (const r of evaluated) {
    const act = r.actual ?? 0;
    const fc = r.forecast;
    const err = act - fc;
    const absErr = Math.abs(err);
    const sqErr = err * err;
    const pctErr = act !== 0 ? (absErr / Math.abs(act)) * 100 : 0;
    const mpePart = act !== 0 ? (err / act) * 100 : 0;

    sumAbsError += absErr;
    sumSqError += sqErr;
    sumPctError += pctErr;
    sumError += err;
    sumActual += act;
    ssTot += Math.pow(act - meanActual, 2);
  }

  const mad = sumAbsError / n;
  const mse = sumSqError / n;
  const rmse = Math.sqrt(mse);
  const mape = sumPctError / n;
  const mpe = sumError !== 0 ? (sumError / (sumActual || 1)) * 100 : 0;
  const trackingSignal = mad > 0 ? sumError / mad : 0;
  const rSquared = ssTot > 0 ? Math.max(0, 1 - sumSqError / ssTot) : undefined;

  // Composite objective scoring algorithm (0 to 100)
  // Base precision: 100 - MAPE (capped)
  let rawScore = 100 - mape * 1.15;

  // Penalty if tracking signal exceeds acceptable bounds [-4, 4]
  const absTS = Math.abs(trackingSignal);
  if (absTS > 4) {
    rawScore -= Math.min(20, (absTS - 4) * 3);
  }

  // Adjust for pattern fitness
  if (pattern === 'tendencia' && mad > 0) {
    // If systematic under-forecasting due to lack of trend handling
    if (trackingSignal > 4) rawScore -= 5;
  }

  const score = Math.round(Math.max(15, Math.min(99, rawScore)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  let gradeDescription = 'Aceptable, con algunos errores normales';

  if (score >= 90) {
    grade = 'A+';
    gradeDescription = 'Excelente: casi no falla y sigue muy bien los datos';
  } else if (score >= 80) {
    grade = 'A';
    gradeDescription = 'Muy bueno: pronóstico confiable y bien centrado';
  } else if (score >= 70) {
    grade = 'B';
    gradeDescription = 'Bueno: sirve para estimaciones generales';
  } else if (score >= 60) {
    grade = 'C';
    gradeDescription = 'Regular: se queda un poco atrás con respecto a la realidad';
  } else {
    grade = 'D';
    gradeDescription = 'No recomendado: este método no se adapta bien a este tipo de datos';
  }

  return {
    mad: Number(mad.toFixed(3)),
    mse: Number(mse.toFixed(3)),
    rmse: Number(rmse.toFixed(3)),
    mape: Number(mape.toFixed(2)),
    mpe: Number(mpe.toFixed(2)),
    trackingSignal: Number(trackingSignal.toFixed(2)),
    rSquared: rSquared !== undefined ? Number(rSquared.toFixed(3)) : undefined,
    score,
    grade,
    gradeDescription,
  };
}

// -------------------------------------------------------------
// ALL METHODS IMPLEMENTATIONS FROM THE USER'S DIAGRAM
// -------------------------------------------------------------

export const DEFAULT_PARAMS: MethodParams = {
  kWindowSMA: 3,
  kWindowWMA: 3,
  wmaWeights: [0.17, 0.33, 0.5], // sum to 1
  alphaSES: 0.3,
  kWindowDMA: 3,
  alphaBrown: 0.3,
  alphaHolt: 0.35,
  betaHolt: 0.2,
  alphaWinter: 0.3,
  betaWinter: 0.15,
  gammaWinter: 0.25,
  seasonalPeriod: 4,
  horizon: 4,
};

// 1. Promedio Móvil Simple (SMA)
export function runSMA(data: DataPoint[], k = 3, horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  for (let t = 0; t < n; t++) {
    const act = data[t].value;
    if (t < k) {
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: act, // warmup fallback
        error: 0,
        absError: 0,
        sqError: 0,
        pctError: 0,
      });
    } else {
      let sum = 0;
      for (let i = 1; i <= k; i++) {
        sum += data[t - i].value;
      }
      const fc = sum / k;
      const err = act - fc;
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: Number(fc.toFixed(2)),
        error: Number(err.toFixed(2)),
        absError: Number(Math.abs(err).toFixed(2)),
        sqError: Number((err * err).toFixed(2)),
        pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
      });
    }
  }

  // Next forecast
  let lastSum = 0;
  for (let i = 0; i < k; i++) {
    lastSum += data[n - 1 - i].value;
  }
  const nextForecast = Number((lastSum / k).toFixed(2));
  const horizonForecasts = Array(horizon).fill(nextForecast);

  const metrics = computeMetrics(results.slice(k), 'estacionaria');

  return {
    id: 'promedio_movil_simple',
    name: 'Promedio Móvil Simple (SMA)',
    category: 'cuantitativo_univariado',
    subcategory: 'Series Estacionarias / Suavización',
    patternSuitability: 'estacionaria',
    color: '#3b82f6', // blue
    formula: 'Ŷ_{t+1} = \\frac{1}{k} \\sum_{i=0}^{k-1} Y_{t-i}',
    description: 'Promedia los últimos k periodos para filtrar fluctuaciones aleatorias en series sin tendencia pronunciada.',
    parameters: { 'Ventana (k)': k },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Fácil comprensión y cálculo inmediato', 'Filtra eficazmente ruido blanco en demanda estable'],
    limitations: ['Ignora ponderaciones de recencia', 'Genera fuerte rezago (lag) ante tendencias ascendentes o estacionalidad'],
  };
}

// 2. Promedio Móvil de k periodos (Ponderado - WMA)
export function runWMA(data: DataPoint[], k = 3, weights = [0.17, 0.33, 0.5], horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];
  const normalizedWeights = [...weights];
  const totalWeight = normalizedWeights.reduce((a, b) => a + b, 0) || 1;
  for (let i = 0; i < normalizedWeights.length; i++) {
    normalizedWeights[i] /= totalWeight;
  }

  for (let t = 0; t < n; t++) {
    const act = data[t].value;
    if (t < k) {
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: act,
        error: 0,
        absError: 0,
        sqError: 0,
        pctError: 0,
      });
    } else {
      let fc = 0;
      for (let i = 0; i < k; i++) {
        // weights[0] is oldest, weights[k-1] is most recent
        const w = normalizedWeights[i];
        fc += w * data[t - k + i].value;
      }
      const err = act - fc;
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: Number(fc.toFixed(2)),
        error: Number(err.toFixed(2)),
        absError: Number(Math.abs(err).toFixed(2)),
        sqError: Number((err * err).toFixed(2)),
        pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
      });
    }
  }

  let nextFc = 0;
  for (let i = 0; i < k; i++) {
    nextFc += normalizedWeights[i] * data[n - k + i].value;
  }
  const nextForecast = Number(nextFc.toFixed(2));
  const horizonForecasts = Array(horizon).fill(nextForecast);

  const metrics = computeMetrics(results.slice(k), 'estacionaria');

  return {
    id: 'promedio_movil_ponderado',
    name: 'Promedio Móvil de k periodos (WMA)',
    category: 'cuantitativo_univariado',
    subcategory: 'Series Estacionarias / Suavización',
    patternSuitability: 'estacionaria',
    color: '#06b6d4', // cyan
    formula: 'Ŷ_{t+1} = \\sum_{i=1}^{k} w_i \\cdot Y_{t-k+i}',
    description: 'Asigna pesos diferenciados a las observaciones históricas, otorgando mayor relevancia a los datos más recientes.',
    parameters: { 'Ventana (k)': k, Pesos: normalizedWeights.map((w) => w.toFixed(2)).join(', ') },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Responde con mayor agilidad que el SMA a cambios recientes', 'Permite personalizar la importancia de cada periodo'],
    limitations: ['Determinación de pesos puede ser arbitraria sin optimización', 'Proyección plana a horizonte lejano'],
  };
}

// 3. Suavización Exponencial Simple (SES)
export function runSES(data: DataPoint[], alpha = 0.3, horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  let currentSmoothed = data[0].value;
  results.push({
    period: data[0].period,
    label: data[0].label,
    actual: data[0].value,
    forecast: data[0].value,
    error: 0,
    absError: 0,
    sqError: 0,
    pctError: 0,
  });

  for (let t = 1; t < n; t++) {
    const act = data[t].value;
    const prevAct = data[t - 1].value;
    const fc = alpha * prevAct + (1 - alpha) * currentSmoothed;
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });

    currentSmoothed = fc;
  }

  const nextForecast = Number((alpha * data[n - 1].value + (1 - alpha) * currentSmoothed).toFixed(2));
  const horizonForecasts = Array(horizon).fill(nextForecast);

  const metrics = computeMetrics(results.slice(1), 'estacionaria');

  return {
    id: 'suavizacion_exponencial_simple',
    name: 'Suavización Exponencial Simple (SES)',
    category: 'cuantitativo_univariado',
    subcategory: 'Series Estacionarias / Suavización',
    patternSuitability: 'estacionaria',
    color: '#10b981', // emerald
    formula: 'Ŷ_{t+1} = \\alpha Y_t + (1-\\alpha) Ŷ_t',
    description: 'Pondera todos los datos históricos con decaimiento exponencial decreciente gobernado por el factor alfa (α).',
    parameters: { 'Factor de suavizado (α)': alpha },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Bajo requerimiento de almacenamiento (solo requiere último pronóstico y dato real)', 'Excelente balance entre estabilidad y reactividad'],
    limitations: ['No captura pendiente de crecimiento ni patrones estacionales', 'Sensible a la calibración del parámetro α'],
  };
}

// 4. Promedio Móvil Doble (DMA)
export function runDMA(data: DataPoint[], k = 3, horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  // 1st moving average M_t
  const M: (number | null)[] = Array(n).fill(null);
  for (let t = k - 1; t < n; t++) {
    let sum = 0;
    for (let i = 0; i < k; i++) sum += data[t - i].value;
    M[t] = sum / k;
  }

  // 2nd moving average M'_t
  const Mp: (number | null)[] = Array(n).fill(null);
  for (let t = 2 * k - 2; t < n; t++) {
    let sum = 0;
    for (let i = 0; i < k; i++) {
      const val = M[t - i];
      if (val !== null) sum += val;
    }
    Mp[t] = sum / k;
  }

  const a: (number | null)[] = Array(n).fill(null);
  const b: (number | null)[] = Array(n).fill(null);

  for (let t = 0; t < n; t++) {
    const act = data[t].value;
    if (t < 2 * k - 1) {
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: act,
        error: 0,
        absError: 0,
        sqError: 0,
        pctError: 0,
      });
    } else {
      // Forecast made at t-1 for t
      const prevA = a[t - 1];
      const prevB = b[t - 1];
      const fc = prevA !== null && prevB !== null ? prevA + prevB * 1 : act;
      const err = act - fc;

      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: Number(fc.toFixed(2)),
        error: Number(err.toFixed(2)),
        absError: Number(Math.abs(err).toFixed(2)),
        sqError: Number((err * err).toFixed(2)),
        pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
      });
    }

    if (M[t] !== null && Mp[t] !== null) {
      a[t] = 2 * M[t]! - Mp[t]!;
      b[t] = (2 / (k - 1)) * (M[t]! - Mp[t]!);
    }
  }

  const lastA = a[n - 1] ?? data[n - 1].value;
  const lastB = b[n - 1] ?? 0;
  const nextForecast = Number((lastA + lastB * 1).toFixed(2));
  const horizonForecasts = Array.from({ length: horizon }, (_, m) => Number((lastA + lastB * (m + 1)).toFixed(2)));

  const metrics = computeMetrics(results.slice(2 * k - 1), 'tendencia');

  return {
    id: 'promedio_movil_doble',
    name: 'Promedio Móvil Doble (DMA)',
    category: 'cuantitativo_univariado',
    subcategory: 'Series con Tendencia / Suavización',
    patternSuitability: 'tendencia',
    color: '#8b5cf6', // violet
    formula: 'a_t = 2M_t - M\'_t, \\quad b_t = \\frac{2}{k-1}(M_t - M\'_t), \\quad Ŷ_{t+m} = a_t + b_t \\cdot m',
    description: 'Aplica un segundo promedio móvil sobre el primero para corregir el desfase de tendencia lineal.',
    parameters: { 'Ventana (k)': k },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Compensa el retardo sistemático en presencia de tendencia lineal', 'No requiere estimar varianza a priori'],
    limitations: ['Pierde 2k-1 observaciones iniciales', 'No maneja estacionalidad ni cambios bruscos de dirección'],
  };
}

// 5. Suavización Exponencial Doble: Método de Brown
export function runBrown(data: DataPoint[], alpha = 0.3, horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  const S1: number[] = Array(n).fill(0);
  const S2: number[] = Array(n).fill(0);
  const a: number[] = Array(n).fill(0);
  const b: number[] = Array(n).fill(0);

  S1[0] = data[0].value;
  S2[0] = data[0].value;
  a[0] = data[0].value;
  b[0] = 0;

  results.push({
    period: data[0].period,
    label: data[0].label,
    actual: data[0].value,
    forecast: data[0].value,
    error: 0,
    absError: 0,
    sqError: 0,
    pctError: 0,
  });

  for (let t = 1; t < n; t++) {
    const act = data[t].value;
    // Forecast generated at t-1 for period t
    const fc = a[t - 1] + b[t - 1] * 1;
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });

    // Update Brown equations
    S1[t] = alpha * act + (1 - alpha) * S1[t - 1];
    S2[t] = alpha * S1[t] + (1 - alpha) * S2[t - 1];
    a[t] = 2 * S1[t] - S2[t];
    b[t] = (alpha / (1 - alpha)) * (S1[t] - S2[t]);
  }

  const lastA = a[n - 1];
  const lastB = b[n - 1];
  const nextForecast = Number((lastA + lastB * 1).toFixed(2));
  const horizonForecasts = Array.from({ length: horizon }, (_, m) => Number((lastA + lastB * (m + 1)).toFixed(2)));

  const metrics = computeMetrics(results.slice(1), 'tendencia');

  return {
    id: 'suavizacion_brown',
    name: 'Suavización Exponencial Doble: Brown',
    category: 'cuantitativo_univariado',
    subcategory: 'Series con Tendencia / Suavización',
    patternSuitability: 'tendencia',
    color: '#ec4899', // pink
    formula: 'S\'_t = \\alpha Y_t + (1-\\alpha)S\'_{t-1}, \\quad a_t = 2S\'_t - S\'\'_t, \\quad b_t = \\frac{\\alpha}{1-\\alpha}(S\'_t - S\'\'_t)',
    description: 'Modelo de suavización lineal con un único parámetro alfa para nivel y pendiente en series con tendencia.',
    parameters: { 'Parámetro único (α)': alpha },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Solo requiere calibrar un parámetro (α)', 'Ajuste lineal continuo sin saltos bruscos'],
    limitations: ['Menor flexibilidad que Holt al acoplar nivel y tendencia al mismo parámetro', 'Sensible a cambios drásticos de pendiente'],
  };
}

// 6. Suavización Exponencial Doble: Método de Holt
export function runHolt(data: DataPoint[], alpha = 0.35, beta = 0.2, horizon = 4): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  const L: number[] = Array(n).fill(0);
  const T: number[] = Array(n).fill(0);

  L[0] = data[0].value;
  T[0] = n > 1 ? data[1].value - data[0].value : 0;

  results.push({
    period: data[0].period,
    label: data[0].label,
    actual: data[0].value,
    forecast: data[0].value,
    error: 0,
    absError: 0,
    sqError: 0,
    pctError: 0,
  });

  for (let t = 1; t < n; t++) {
    const act = data[t].value;
    const fc = L[t - 1] + T[t - 1];
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });

    L[t] = alpha * act + (1 - alpha) * (L[t - 1] + T[t - 1]);
    T[t] = beta * (L[t] - L[t - 1]) + (1 - beta) * T[t - 1];
  }

  const lastL = L[n - 1];
  const lastT = T[n - 1];
  const nextForecast = Number((lastL + lastT * 1).toFixed(2));
  const horizonForecasts = Array.from({ length: horizon }, (_, m) => Number((lastL + (m + 1) * lastT).toFixed(2)));

  const metrics = computeMetrics(results.slice(1), 'tendencia');

  return {
    id: 'suavizacion_holt',
    name: 'Suavización Exponencial Doble: Holt',
    category: 'cuantitativo_univariado',
    subcategory: 'Series con Tendencia / Suavización',
    patternSuitability: 'tendencia',
    color: '#f59e0b', // amber
    formula: 'L_t = \\alpha Y_t + (1-\\alpha)(L_{t-1}+T_{t-1}), \\quad T_t = \\beta(L_t - L_{t-1}) + (1-\\beta)T_{t-1}',
    description: 'Desacopla el suavizado del nivel (alfa) y la tasa de tendencia (beta), ofreciendo máxima adaptabilidad a series con crecimiento o decrecimiento.',
    parameters: { 'Nivel (α)': alpha, 'Tendencia (β)': beta },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Alta precisión en tendencias dinámicas', 'Parámetros independientes permiten afinar respuesta'],
    limitations: ['Proyección lineal infinita puede sobreestimar a muy largo plazo si la tendencia se satura'],
  };
}

// 7. Suavización Exponencial Triple: Método de Winter (Holt-Winters Aditivo y Multiplicativo)
export function runWinter(
  data: DataPoint[],
  alpha = 0.3,
  beta = 0.15,
  gamma = 0.25,
  s = 4,
  variant: 'aditivo' | 'multiplicativo' = 'multiplicativo',
  horizon = 4
): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  // Need at least 2 full cycles for proper initialization, otherwise fallback with cycle estimation
  const effectiveS = Math.min(s, Math.max(2, Math.floor(n / 2)));
  const L: number[] = Array(n).fill(0);
  const T: number[] = Array(n).fill(0);
  const S: number[] = Array(n + effectiveS).fill(variant === 'multiplicativo' ? 1.0 : 0.0);

  // Initial trend estimation
  let sumDiff = 0;
  for (let i = 0; i < effectiveS; i++) {
    if (i + effectiveS < n) {
      sumDiff += (data[i + effectiveS].value - data[i].value) / effectiveS;
    }
  }
  const initT = sumDiff / effectiveS || 0.5;
  const initL = data[0].value;

  L[0] = initL;
  T[0] = initT;

  // Initial seasonal factors
  for (let i = 0; i < effectiveS; i++) {
    if (variant === 'multiplicativo') {
      S[i] = data[i].value / (initL + (i + 1) * initT || 1);
    } else {
      S[i] = data[i].value - (initL + (i + 1) * initT);
    }
  }

  for (let t = 0; t < n; t++) {
    const act = data[t].value;
    if (t < effectiveS) {
      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: act,
        error: 0,
        absError: 0,
        sqError: 0,
        pctError: 0,
      });
    } else {
      const sIndex = t - effectiveS;
      let fc = 0;
      if (variant === 'multiplicativo') {
        fc = (L[t - 1] + T[t - 1]) * (S[sIndex] || 1);
      } else {
        fc = L[t - 1] + T[t - 1] + (S[sIndex] || 0);
      }
      const err = act - fc;

      results.push({
        period: data[t].period,
        label: data[t].label,
        actual: act,
        forecast: Number(fc.toFixed(2)),
        error: Number(err.toFixed(2)),
        absError: Number(Math.abs(err).toFixed(2)),
        sqError: Number((err * err).toFixed(2)),
        pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
      });

      // Update level, trend, seasonal
      if (variant === 'multiplicativo') {
        const sPrev = S[sIndex] || 1;
        L[t] = alpha * (act / (sPrev !== 0 ? sPrev : 1)) + (1 - alpha) * (L[t - 1] + T[t - 1]);
        T[t] = beta * (L[t] - L[t - 1]) + (1 - beta) * T[t - 1];
        S[t] = gamma * (act / (L[t] !== 0 ? L[t] : 1)) + (1 - gamma) * sPrev;
      } else {
        const sPrev = S[sIndex] || 0;
        L[t] = alpha * (act - sPrev) + (1 - alpha) * (L[t - 1] + T[t - 1]);
        T[t] = beta * (L[t] - L[t - 1]) + (1 - beta) * T[t - 1];
        S[t] = gamma * (act - L[t]) + (1 - gamma) * sPrev;
      }
    }
  }

  const lastL = L[n - 1];
  const lastT = T[n - 1];
  const horizonForecasts: number[] = [];

  for (let m = 1; m <= horizon; m++) {
    const sPos = n - effectiveS + ((m - 1) % effectiveS);
    const sFactor = S[sPos] ?? (variant === 'multiplicativo' ? 1 : 0);
    let hFc = 0;
    if (variant === 'multiplicativo') {
      hFc = (lastL + m * lastT) * sFactor;
    } else {
      hFc = lastL + m * lastT + sFactor;
    }
    horizonForecasts.push(Number(hFc.toFixed(2)));
  }

  const nextForecast = horizonForecasts[0] ?? Number(lastL.toFixed(2));
  const metrics = computeMetrics(results.slice(effectiveS), 'estacional');

  return {
    id: `suavizacion_winter_${variant}`,
    name: `Suavización Triple: Winter (${variant === 'multiplicativo' ? 'Multiplicativo' : 'Aditivo'})`,
    category: 'cuantitativo_univariado',
    subcategory: 'Series con Estacionalidad / Suavización Triple',
    patternSuitability: 'estacional',
    color: '#0ea5e9', // sky
    formula:
      variant === 'multiplicativo'
        ? 'Ŷ_{t+m} = (L_t + m T_t) \\cdot S_{t-s+m}'
        : 'Ŷ_{t+m} = L_t + m T_t + S_{t-s+m}',
    description: `Captura simultáneamente nivel (α), tendencia (β) y variaciones estacionales cíclicas (γ) bajo esquema ${variant}.`,
    parameters: {
      'Nivel (α)': alpha,
      'Tendencia (β)': beta,
      'Estacionalidad (γ)': gamma,
      'Periodo estacional (s)': effectiveS,
    },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Capacidad integral para proyectar patrones cíclicos complejos', 'Excelente desempeño en series de demanda con estacionalidad fija'],
    limitations: ['Requiere estimar 3 parámetros simultáneos', 'Necesita un historial con al menos 2 periodos estacionales completos'],
  };
}

// 8. Descomposición de Series de Tiempo: Multiplicativo y Aditivo
export function runDecomposition(
  data: DataPoint[],
  s = 4,
  variant: 'multiplicativo' | 'aditivo' = 'multiplicativo',
  horizon = 4
): MethodResult {
  const n = data.length;
  const results: ForecastItemResult[] = [];

  const periods = data.map((d) => d.period);
  const values = data.map((d) => d.value);

  // Step 1: Linear Trend fit via OLS: T_t = a + b * t
  const { a, b, rSquared } = calculateSimpleOLS(periods, values);

  // Step 2: Seasonal indexes
  const effectiveS = Math.min(s, Math.max(2, Math.floor(n / 2)));
  const seasonalSums = Array(effectiveS).fill(0);
  const seasonalCounts = Array(effectiveS).fill(0);

  for (let t = 0; t < n; t++) {
    const trend = a + b * periods[t];
    const seasonIdx = t % effectiveS;
    if (variant === 'multiplicativo') {
      const ratio = trend !== 0 ? values[t] / trend : 1;
      seasonalSums[seasonIdx] += ratio;
    } else {
      const diff = values[t] - trend;
      seasonalSums[seasonIdx] += diff;
    }
    seasonalCounts[seasonIdx]++;
  }

  const rawSeasonal = seasonalSums.map((sum, i) => (seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : variant === 'multiplicativo' ? 1 : 0));

  // Normalize seasonal factors
  let seasonalFactors = [...rawSeasonal];
  if (variant === 'multiplicativo') {
    const avgRatio = rawSeasonal.reduce((sum, v) => sum + v, 0) / effectiveS || 1;
    seasonalFactors = rawSeasonal.map((v) => v / avgRatio);
  } else {
    const avgDiff = rawSeasonal.reduce((sum, v) => sum + v, 0) / effectiveS;
    seasonalFactors = rawSeasonal.map((v) => v - avgDiff);
  }

  // Generate historical forecasts
  for (let t = 0; t < n; t++) {
    const act = values[t];
    const trend = a + b * periods[t];
    const sFactor = seasonalFactors[t % effectiveS];
    const fc = variant === 'multiplicativo' ? trend * sFactor : trend + sFactor;
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });
  }

  // Horizon forecast
  const horizonForecasts: number[] = [];
  for (let m = 1; m <= horizon; m++) {
    const futurePeriod = n + m;
    const futureTrend = a + b * futurePeriod;
    const futureSeasonFactor = seasonalFactors[(n + m - 1) % effectiveS];
    const hFc = variant === 'multiplicativo' ? futureTrend * futureSeasonFactor : futureTrend + futureSeasonFactor;
    horizonForecasts.push(Number(hFc.toFixed(2)));
  }

  const nextForecast = horizonForecasts[0] ?? Number((a + b * (n + 1)).toFixed(2));
  const metrics = computeMetrics(results, 'estacional');
  metrics.rSquared = Number(rSquared.toFixed(3));

  return {
    id: `descomposicion_${variant}`,
    name: `Descomposición de Series: ${variant === 'multiplicativo' ? 'Multiplicativo' : 'Aditivo'}`,
    category: 'cuantitativo_univariado',
    subcategory: 'Descomposición de Series de Tiempo',
    patternSuitability: 'estacional',
    color: '#14b8a6', // teal
    formula:
      variant === 'multiplicativo'
        ? 'Y_t = T_t \\times S_t \\times I_t, \\quad Ŷ_{t+m} = (a + b \\cdot (t+m)) \\cdot S_{(t+m)\\%s}'
        : 'Y_t = T_t + S_t + I_t, \\quad Ŷ_{t+m} = (a + b \\cdot (t+m)) + S_{(t+m)\\%s}',
    description: `Aísla de manera determinista los componentes de Tendencia (T), Estacionalidad (S) y Residuo/Irregularidad (I) bajo formulación ${variant}.`,
    parameters: {
      'Pendiente tendencia (b)': Number(b.toFixed(3)),
      'Intersepto (a)': Number(a.toFixed(2)),
      'Periodo estacional (s)': effectiveS,
      'R² de tendencia': Number(rSquared.toFixed(3)),
    },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Alta interpretabilidad ejecutiva', 'Permite desestacionalizar la serie para análisis de fondo'],
    limitations: ['Asume que el patrón estacional se repite sin cambio en el tiempo', 'Sensible a valores atípicos en la estimación de la tendencia'],
  };
}

// 9. Modelos Causales - Multivariados: Regresión Lineal Simple
export function runSimpleLinearRegression(data: DataPoint[], horizon = 4): MethodResult {
  const n = data.length;
  const x = data.map((d) => (d.x1 !== undefined ? d.x1 : d.period));
  const y = data.map((d) => d.value);

  const { a, b, rSquared, r } = calculateSimpleOLS(x, y);

  const results: ForecastItemResult[] = [];
  for (let t = 0; t < n; t++) {
    const act = y[t];
    const fc = a + b * x[t];
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });
  }

  // For horizon, extrapolate x linearly
  const lastX = x[n - 1];
  const deltaX = n > 1 ? (x[n - 1] - x[0]) / (n - 1) : 1;
  const horizonForecasts = Array.from({ length: horizon }, (_, m) => Number((a + b * (lastX + deltaX * (m + 1))).toFixed(2)));
  const nextForecast = horizonForecasts[0] ?? Number((a + b * (lastX + deltaX)).toFixed(2));

  const metrics = computeMetrics(results, 'causal');
  metrics.rSquared = Number(rSquared.toFixed(3));

  return {
    id: 'regresion_lineal_simple',
    name: 'Regresión Lineal Simple: Y = f(X₁)',
    category: 'cuantitativo_causal',
    subcategory: 'Modelos Causales / Multivariados',
    patternSuitability: 'causal',
    color: '#6366f1', // indigo
    formula: `Y = ${a.toFixed(2)} + ${b.toFixed(2)} \\cdot X_1 \\quad (R^2 = ${rSquared.toFixed(3)})`,
    description: 'Establece una relación funcional causal entre una variable predictora (X₁) y la variable respuesta proyectada (Y).',
    parameters: {
      'Intersepto (β₀)': Number(a.toFixed(3)),
      'Pendiente (β₁)': Number(b.toFixed(3)),
      'Correlación de Pearson (r)': Number(r.toFixed(3)),
      'Coeficiente R²': Number(rSquared.toFixed(3)),
    },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Explica la causa económica/conductual del pronóstico', 'Proporciona pruebas de significancia estadística R² y correlación'],
    limitations: ['Requiere proyectar la variable explicativa X₁ para predecir Y', 'Asume relación estrictamente lineal'],
  };
}

// 10. Modelos Causales - Multivariados: Regresión Lineal Múltiple
export function runMultipleLinearRegression(data: DataPoint[], horizon = 4): MethodResult {
  const n = data.length;
  // Construct Design matrix: [1, x1, x2]
  const X_matrix: number[][] = [];
  const Y_vec: number[] = [];

  for (let i = 0; i < n; i++) {
    const d = data[i];
    const x1 = d.x1 !== undefined ? d.x1 : d.period;
    const x2 = d.x2 !== undefined ? d.x2 : d.period * 1.5;
    X_matrix.push([1, x1, x2]);
    Y_vec.push(d.value);
  }

  const { coefficients, rSquared, rSquaredAdj } = solveMultipleOLS(X_matrix, Y_vec);
  const b0 = coefficients[0] || 0;
  const b1 = coefficients[1] || 0;
  const b2 = coefficients[2] || 0;

  const results: ForecastItemResult[] = [];
  for (let t = 0; t < n; t++) {
    const act = Y_vec[t];
    const fc = b0 + b1 * X_matrix[t][1] + b2 * X_matrix[t][2];
    const err = act - fc;

    results.push({
      period: data[t].period,
      label: data[t].label,
      actual: act,
      forecast: Number(fc.toFixed(2)),
      error: Number(err.toFixed(2)),
      absError: Number(Math.abs(err).toFixed(2)),
      sqError: Number((err * err).toFixed(2)),
      pctError: Number((act !== 0 ? (Math.abs(err) / Math.abs(act)) * 100 : 0).toFixed(2)),
    });
  }

  // Horizon forecasts
  const lastX1 = X_matrix[n - 1][1];
  const lastX2 = X_matrix[n - 1][2];
  const deltaX1 = n > 1 ? (X_matrix[n - 1][1] - X_matrix[0][1]) / (n - 1) : 1;
  const deltaX2 = n > 1 ? (X_matrix[n - 1][2] - X_matrix[0][2]) / (n - 1) : 1;

  const horizonForecasts = Array.from({ length: horizon }, (_, m) =>
    Number((b0 + b1 * (lastX1 + deltaX1 * (m + 1)) + b2 * (lastX2 + deltaX2 * (m + 1))).toFixed(2))
  );
  const nextForecast = horizonForecasts[0] ?? Number((b0 + b1 * (lastX1 + deltaX1) + b2 * (lastX2 + deltaX2)).toFixed(2));

  const metrics = computeMetrics(results, 'causal');
  metrics.rSquared = Number(rSquared.toFixed(3));

  return {
    id: 'regresion_lineal_multiple',
    name: 'Regresión Lineal Múltiple: Y = f(X₁, X₂, ..., Xₖ)',
    category: 'cuantitativo_causal',
    subcategory: 'Modelos Causales / Multivariados',
    patternSuitability: 'causal',
    color: '#4f46e5', // deeper indigo
    formula: `Y = ${b0.toFixed(2)} + ${b1.toFixed(2)}X_1 + ${b2.toFixed(2)}X_2 \\quad (R^2_{adj} = ${rSquaredAdj.toFixed(3)})`,
    description: 'Modela la variable dependiente Y incorporando simultáneamente múltiples factores explicativos exógenos.',
    parameters: {
      'Intersepto (β₀)': Number(b0.toFixed(3)),
      'Coeficiente X₁ (β₁)': Number(b1.toFixed(3)),
      'Coeficiente X₂ (β₂)': Number(b2.toFixed(3)),
      'R² Ajustado': Number(rSquaredAdj.toFixed(3)),
    },
    results,
    nextForecast,
    horizonForecasts,
    metrics,
    ranking: 0,
    strengths: ['Controla por múltiples variables causales reduciendo sesgo de omisión', 'Mayor capacidad explicativa R²'],
    limitations: ['Riesgo de multicolinealidad entre variables predictoras', 'Mayor complejidad de calibración y recopilación de covariables'],
  };
}

// Master function to execute all quantitative methods and produce comparative ranking
export function executeAllQuantitativeMethods(
  data: DataPoint[],
  params: MethodParams = DEFAULT_PARAMS,
  targetPattern: SeriesPattern = 'tendencia'
): MethodResult[] {
  const methods: MethodResult[] = [
    runSMA(data, params.kWindowSMA, params.horizon),
    runWMA(data, params.kWindowWMA, params.wmaWeights, params.horizon),
    runSES(data, params.alphaSES, params.horizon),
    runDMA(data, params.kWindowDMA, params.horizon),
    runBrown(data, params.alphaBrown, params.horizon),
    runHolt(data, params.alphaHolt, params.betaHolt, params.horizon),
    runWinter(data, params.alphaWinter, params.betaWinter, params.gammaWinter, params.seasonalPeriod, 'multiplicativo', params.horizon),
    runWinter(data, params.alphaWinter, params.betaWinter, params.gammaWinter, params.seasonalPeriod, 'aditivo', params.horizon),
    runDecomposition(data, params.seasonalPeriod, 'multiplicativo', params.horizon),
    runDecomposition(data, params.seasonalPeriod, 'aditivo', params.horizon),
    runSimpleLinearRegression(data, params.horizon),
    runMultipleLinearRegression(data, params.horizon),
  ];

  // Rank by composite score descending (and lowest RMSE as tiebreaker)
  methods.sort((a, b) => {
    if (b.metrics.score !== a.metrics.score) {
      return b.metrics.score - a.metrics.score;
    }
    return a.metrics.rmse - b.metrics.rmse;
  });

  methods.forEach((m, idx) => {
    m.ranking = idx + 1;
    if (idx === 0) {
      m.isRecommended = true;
    }
  });

  return methods;
}

// Métodos Cualitativos (Cuando no hay números pasados y se usan opiniones de expertos)
export function getQualitativeMethods(baseValue = 22): QualitativeMethodResult[] {
  return [
    {
      id: 'consenso_panel',
      name: 'Reunión de Expertos (Panel)',
      subtitle: 'Charla abierta entre líderes y especialistas para ponerse de acuerdo',
      description: 'Un grupo de personas con experiencia se reúne a discutir y dar sus estimaciones hasta llegar a un número en común.',
      assumptions: 'Las personas del grupo conocen bien el tema, aunque la opinión del jefe puede influir en los demás.',
      pros: ['Rápido de hacer', 'Aprovecha la experiencia y el debate del equipo'],
      cons: ['La persona con más autoridad puede imponer su opinión', 'No hay votos anónimos'],
      typicalAccuracy: 'Regular (falla entre un 15% y 25%)',
      costComplexity: 'Medio',
      subjectivityScore: 68,
      bestUseCase: 'Para decidir rápido el lanzamiento de un nuevo servicio o producto.',
      forecastValue: Number((baseValue * 1.25).toFixed(1)),
      horizonValues: [
        Number((baseValue * 1.25).toFixed(1)),
        Number((baseValue * 1.5).toFixed(1)),
        Number((baseValue * 1.8).toFixed(1)),
        Number((baseValue * 2.1).toFixed(1)),
      ],
      qualification: {
        score: 75,
        grade: 'B',
        verdict: 'Bueno para actuar rápido, aunque puede haber influencia del líder.',
      },
    },
    {
      id: 'pronostico_visionario',
      name: 'Visión del Líder o Fundador',
      subtitle: 'Intuición y experiencia directa de una persona visionaria',
      description: 'Una persona con gran trayectoria o visión de futuro estima cuánto va a crecer una idea totalmente nueva.',
      assumptions: 'Como la tecnología es tan nueva, los datos del pasado no sirven; se necesita intuición y olfato.',
      pros: ['Se adelanta a cambios que nadie ha visto antes', 'No necesita ningún dato del pasado'],
      cons: ['Depende del optimismo de una sola persona', 'No se puede comprobar matemáticamente'],
      typicalAccuracy: 'Variable (puede fallar entre 35% y 60%)',
      costComplexity: 'Bajo',
      subjectivityScore: 92,
      bestUseCase: 'Para inventos o ideas revolucionarias donde no existe nada parecido.',
      forecastValue: Number((baseValue * 1.45).toFixed(1)),
      horizonValues: [
        Number((baseValue * 1.45).toFixed(1)),
        Number((baseValue * 1.95).toFixed(1)),
        Number((baseValue * 2.65).toFixed(1)),
        Number((baseValue * 3.6).toFixed(1)),
      ],
      qualification: {
        score: 65,
        grade: 'C',
        verdict: 'Inspirador para pensar en grande, pero arriesgado para hacer presupuestos.',
      },
    },
    {
      id: 'analogia_historica',
      name: 'Comparación con el Pasado (Analogía)',
      subtitle: 'Comparar con cómo crecieron tecnologías anteriores (PC, Internet, Móviles)',
      description: 'Mira qué tan rápido crecieron inventos anteriores para calcular cómo crecerá la nueva tecnología.',
      assumptions: 'La gente adopta las nuevas tecnologías siguiendo pasos parecidos a inventos anteriores.',
      pros: ['Se apoya en casos reales y comprobados de la historia', 'Fácil de explicar con ejemplos conocidos'],
      cons: ['La IA está creciendo mucho más rápido que el PC o Internet', 'No todas las épocas son iguales'],
      typicalAccuracy: 'Buena (suele fallar entre 10% y 20%)',
      costComplexity: 'Medio',
      subjectivityScore: 45,
      bestUseCase: 'Para calcular cuántos clientes se tendrán a 3 o 5 años.',
      forecastValue: Number((baseValue * 1.35).toFixed(1)),
      horizonValues: [
        Number((baseValue * 1.35).toFixed(1)),
        Number((baseValue * 1.72).toFixed(1)),
        Number((baseValue * 2.22).toFixed(1)),
        Number((baseValue * 2.85).toFixed(1)),
      ],
      qualification: {
        score: 84,
        grade: 'A',
        verdict: 'Muy buen método si se toma en cuenta la rapidez del mundo actual.',
      },
    },
    {
      id: 'metodo_delphi',
      name: 'Método Delphi (Votación Secreta)',
      subtitle: 'Preguntas anónimas a expertos en varias rondas hasta ponerse de acuerdo',
      description: 'Varios expertos responden preguntas por separado y en secreto. Se les muestran los resultados generales y vuelven a votar hasta coincidir.',
      assumptions: 'Al ser anónimo, nadie tiene miedo de contradecir al jefe y todos piensan con calma.',
      pros: ['Nadie presiona a nadie gracias al anonimato', 'Se llega a un acuerdo muy serio y respaldado'],
      cons: ['Toma varias semanas o meses completar las rondas', 'Requiere paciencia y coordinación'],
      typicalAccuracy: 'Alta (margen de error pequeño: 8% a 15%)',
      costComplexity: 'Alto',
      subjectivityScore: 32,
      bestUseCase: 'Para planes importantes de país, empresas grandes o inversiones a muchos años.',
      forecastValue: Number((baseValue * 1.28).toFixed(1)),
      horizonValues: [
        Number((baseValue * 1.28).toFixed(1)),
        Number((baseValue * 1.58).toFixed(1)),
        Number((baseValue * 1.94).toFixed(1)),
        Number((baseValue * 2.38).toFixed(1)),
      ],
      qualification: {
        score: 91,
        grade: 'A+',
        verdict: 'El método de opiniones más confiable y libre de presiones personales.',
      },
    },
  ];
}
