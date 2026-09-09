const axios = require('axios');
const { analyzeBillMetrics } = require('./billAnalyzer');
const { predictAnnualConsumptionCurve } = require('./consumptionPredictor');
const { predictAnnualGenerationCurve } = require('./solarPredictor');
const { buildPersonalizedRecommendation } = require('./recommendationEngine');

/**
 * Unified AI/ML Service Interface
 * Coordinates:
 * 1. FastAPI Python ML Layer (Gradient Boosting consumption forecaster, solar ML yield, anomaly detector)
 * 2. Deterministic Solar Engineering & Financial Calculation Engine
 * 3. Gemini 3.8 Flash LLM Reasoning & Multimodal Analysis
 *
 * Principles:
 * - Deterministic calculations and ML models produce factual numerical figures.
 * - When ML service is unreachable, transparently fall back to engineering baselines and clearly label:
 *   "Engineering Baseline" (NEVER falsely claim "AI predicted" when fallback is active).
 */
class AIService {
  constructor() {
    this.mlServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    this.timeout = 3500;
  }

  /**
   * Diagnostic assessment of an electricity bill.
   */
  async analyzeBill(billData, billHistory = []) {
    let anomalies = [];
    let isMlModelActive = false;

    // Genuine historical bill consumption units (minimum 2 bills required for statistical validity)
    const genuineHistoryUnits = billHistory
      .map(b => b.unitsConsumed)
      .filter(u => typeof u === 'number' && u > 0);

    if (this.mlServiceUrl && billData.unitsConsumed && genuineHistoryUnits.length >= 2) {
      try {
        const mlRes = await axios.post(`${this.mlServiceUrl}/detect/anomalies`, {
          current_kwh: billData.unitsConsumed,
          history_kwh: genuineHistoryUnits,
          user_type: billData.userType || 'residential',
        }, { timeout: this.timeout });

        if (mlRes.data && mlRes.data.is_anomaly) {
          anomalies.push(`ML Anomaly Alert: Consumption (${billData.unitsConsumed} kWh) deviates significantly from your 3-month baseline (z-score: ${mlRes.data.z_score}). Possible seasonal HVAC spike or billing adjustment.`);
        }
        isMlModelActive = true;
      } catch (e) {
        // Fallback gracefully to rule engine without fabricating data
      }
    }

    const analysis = analyzeBillMetrics(billData);
    if (anomalies.length > 0) {
      analysis.anomalies = anomalies;
    }

    return {
      ...analysis,
      engine: isMlModelActive ? 'SolarSense ML Anomaly + Rule Analyzer' : 'Engineering Rule Engine Baseline',
      isMlModelActive,
    };
  }

  /**
   * Forecasts 1/3/6/12-month consumption using trained Python ML model (Gradient Boosting)
   * with fallback to seasonal engineering rules.
   */
  async predictConsumption(baselineKWh, userType = 'residential', location = 'Maharashtra', history = []) {
    if (this.mlServiceUrl) {
      try {
        const payload = {
          historical_kwh: history.length > 0 ? history : [baselineKWh, baselineKWh, baselineKWh],
          user_type: userType,
          location: location,
          forecast_months: 12,
        };

        const res = await axios.post(`${this.mlServiceUrl}/predict/consumption`, payload, {
          timeout: this.timeout,
        });

        if (res.data && res.data.forecast_curve) {
          return {
            forecastCurve: res.data.forecast_curve,
            nextMonthKWh: res.data.next_month_kwh,
            threeMonthForecastKWh: res.data.three_month_kwh,
            sixMonthForecastKWh: res.data.six_month_kwh,
            annualForecastKWh: res.data.annual_kwh,
            confidenceIntervals: res.data.confidence_intervals,
            modelMetadata: res.data.model_metadata,
            engine: `ML Model: ${res.data.model_metadata.modelName} (v${res.data.model_metadata.version})`,
            isMlModelActive: true,
          };
        }
      } catch (err) {
        console.warn(`[AI Service] ML consumption forecast unreachable (${err.message}). Engaging Engineering Baseline.`);
      }
    }

    // Honest baseline fallback
    const baselineCurve = predictAnnualConsumptionCurve(baselineKWh, userType);
    const annualKWh = baselineCurve.reduce((acc, m) => acc + m.units, 0);

    return {
      forecastCurve: baselineCurve,
      nextMonthKWh: baselineCurve[0]?.units || baselineKWh,
      threeMonthForecastKWh: Math.round(baselineCurve.slice(0, 3).reduce((acc, m) => acc + m.units, 0)),
      sixMonthForecastKWh: Math.round(baselineCurve.slice(0, 6).reduce((acc, m) => acc + m.units, 0)),
      annualForecastKWh: Math.round(annualKWh),
      confidenceIntervals: null,
      modelMetadata: {
        modelName: 'Engineering Baseline Seasonal Model',
        version: '1.0.0',
        datasetSource: 'Heuristic Seasonal Load Curve',
        mape: null,
      },
      engine: 'Engineering Baseline (Seasonal Rules)',
      isMlModelActive: false,
    };
  }

  /**
   * Forecasts 12-month solar generation comparing Engineering Engine against ML Model.
   */
  async predictSolarYield(capacityKW, performanceRatio = 0.78, location = 'Maharashtra', tilt = 20) {
    const engineeringYield = predictAnnualGenerationCurve(capacityKW, performanceRatio);
    const engineeringAnnualKWh = engineeringYield.reduce((acc, m) => acc + m.generationKWh, 0);

    let mlAnnualKWh = null;
    let mlYield = null;
    let isMlModelActive = false;

    if (this.mlServiceUrl) {
      try {
        const res = await axios.post(`${this.mlServiceUrl}/predict/solar`, {
          capacity_kw: capacityKW,
          location: location,
          tilt_degrees: tilt,
          performance_ratio: performanceRatio,
        }, { timeout: this.timeout });

        if (res.data && res.data.ml_annual_kwh) {
          mlAnnualKWh = res.data.ml_annual_kwh;
          mlYield = res.data.monthly_generation;
          isMlModelActive = true;
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    return {
      engineeringCurve: engineeringYield,
      engineeringAnnualKWh,
      mlAnnualKWh,
      mlCurve: mlYield,
      differenceKWh: mlAnnualKWh ? Math.round(mlAnnualKWh - engineeringAnnualKWh) : null,
      differencePercent: mlAnnualKWh ? Math.round(((mlAnnualKWh - engineeringAnnualKWh) / engineeringAnnualKWh) * 1000) / 10 : null,
      engine: isMlModelActive ? 'Engineering + ML Dual Forecast' : 'Solar Engineering Engine Baseline',
      isMlModelActive,
    };
  }

  /**
   * Generates comprehensive solar recommendation, financial payback analysis, and optimization matrix.
   */
  async generateRecommendation(assessmentData) {
    const recommendation = buildPersonalizedRecommendation(assessmentData);
    return {
      ...recommendation,
      engine: 'Deterministic Solar Engineering Engine',
      isMlModelActive: false, // Honestly report deterministic engine; ML is reserved for forecasting & anomaly detection
    };
  }

  /**
   * Retrieves live status and validation metrics of the Python ML layer.
   */
  async getMlStatus() {
    if (!this.mlServiceUrl) {
      return { status: 'offline', error: 'AI_SERVICE_URL not configured' };
    }
    try {
      const res = await axios.get(`${this.mlServiceUrl}/models/status`, { timeout: 2000 });
      return res.data;
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  }
}

module.exports = new AIService();
