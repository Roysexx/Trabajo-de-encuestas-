export type MethodCategory = 'cualitativo' | 'cuantitativo_univariado' | 'cuantitativo_causal';

export type SeriesPattern = 'estacionaria' | 'tendencia' | 'estacional' | 'causal' | 'cualitativa';

export interface MethodParams {
  kWindowSMA: number;
  kWindowWMA: number;
  wmaWeights: number[];
  alphaSES: number;
  kWindowDMA: number;
  alphaBrown: number;
  alphaHolt: number;
  betaHolt: number;
  alphaWinter: number;
  betaWinter: number;
  gammaWinter: number;
  seasonalPeriod: number;
  horizon: number;
}

export interface DataPoint {
  period: number;
  label: string;
  value: number;
  // For multivariate causal regression
  x1?: number;
  x2?: number;
  x3?: number;
}

export interface ErrorMetrics {
  mad: number; // Mean Absolute Deviation (MAE)
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mape: number; // Mean Absolute Percentage Error (%)
  mpe: number; // Mean Percentage Error (Bias)
  trackingSignal: number; // Tracking Signal (Cumulative error / MAD)
  rSquared?: number; // Coefficient of determination (0-1)
  score: number; // Overall score 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  gradeDescription: string;
}

export interface ForecastItemResult {
  period: number;
  label: string;
  actual?: number;
  forecast: number;
  error?: number;
  absError?: number;
  sqError?: number;
  pctError?: number;
  lowerConfidence?: number;
  upperConfidence?: number;
}

export interface MethodResult {
  id: string;
  name: string;
  category: MethodCategory;
  subcategory: string;
  patternSuitability: SeriesPattern;
  color: string;
  formula: string;
  description: string;
  parameters: Record<string, number | string>;
  results: ForecastItemResult[];
  nextForecast: number;
  horizonForecasts: number[];
  metrics: ErrorMetrics;
  ranking: number;
  isRecommended?: boolean;
  strengths: string[];
  limitations: string[];
}

export interface QualitativeMethodResult {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  assumptions: string;
  pros: string[];
  cons: string[];
  typicalAccuracy: string;
  costComplexity: 'Bajo' | 'Medio' | 'Alto';
  subjectivityScore: number; // 0 - 100
  bestUseCase: string;
  forecastValue: number;
  horizonValues: number[];
  qualification: {
    score: number;
    grade: 'A+' | 'A' | 'B' | 'C';
    verdict: string;
  };
}

export interface SurveyRecord {
  id: number;
  timestamp: string;
  understanding: string;
  tools: string;
  frequency: string;
  device: string;
  tasks: string;
  frequencyScore: number; // 1: Nunca, 2: A veces, 3: Diario
  toolsCount: number;
  isMobile: boolean;
}

export interface DatasetPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  data: DataPoint[];
  frequencyUnit: string;
  seasonalPeriod: number;
  suggestedPattern: SeriesPattern;
}
