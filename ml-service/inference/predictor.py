import os
import pickle
import json
from typing import Dict, Any, List
import numpy as np

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessing.feature_engineer import extract_features, SEASON_FACTORS

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

class MLPredictor:
    def __init__(self):
        self.consumption_model = None
        self.solar_model = None
        self.consumption_meta = {}
        self.solar_meta = {}
        self.load_models()

    def load_models(self):
        c_model_path = os.path.join(MODELS_DIR, 'consumption_forecaster.pkl')
        c_meta_path = os.path.join(MODELS_DIR, 'consumption_metadata.json')
        s_model_path = os.path.join(MODELS_DIR, 'solar_model.pkl')
        s_meta_path = os.path.join(MODELS_DIR, 'solar_metadata.json')

        if os.path.exists(c_model_path):
            with open(c_model_path, 'rb') as f:
                self.consumption_model = pickle.load(f)
        if os.path.exists(c_meta_path):
            with open(c_meta_path, 'r') as f:
                self.consumption_meta = json.load(f)

        if os.path.exists(s_model_path):
            with open(s_model_path, 'rb') as f:
                self.solar_model = pickle.load(f)
        if os.path.exists(s_meta_path):
            with open(s_meta_path, 'r') as f:
                self.solar_meta = json.load(f)

    def is_ready(self) -> bool:
        return self.consumption_model is not None

    def get_status(self) -> Dict[str, Any]:
        return {
            'status': 'active' if self.is_ready() else 'standby',
            'models': {
                'consumptionForecaster': self.consumption_meta,
                'solarForecaster': self.solar_meta
            }
        }

    def predict_consumption(self, baseline_kwh: float, user_type: str = 'residential', state: str = 'Maharashtra', start_month: int = 1) -> Dict[str, Any]:
        """
        Generates 1, 3, 6, and 12-month consumption forecasts with prediction confidence intervals.
        """
        if not self.consumption_model:
            # Revert to deterministic baseline if weights not loaded
            raise RuntimeError("Consumption model is not loaded.")

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        mape_error = self.consumption_meta.get('mape', 4.5) / 100.0

        monthly_forecast = []
        for i in range(12):
            m = ((start_month - 1 + i) % 12) + 1
            feat = extract_features(m, baseline_kwh, user_type, state).reshape(1, -1)
            pred = float(self.consumption_model.predict(feat)[0])
            pred = max(10.0, round(pred, 1))

            # 90% confidence interval based on empirical MAPE
            interval_delta = round(pred * mape_error * 1.645, 1)
            lower_bound = max(0.0, round(pred - interval_delta, 1))
            upper_bound = round(pred + interval_delta, 1)

            monthly_forecast.append({
                'month': month_names[m - 1],
                'monthIndex': m,
                'predictedKWh': pred,
                'lowerBoundKWh': lower_bound,
                'upperBoundKWh': upper_bound
            })

        next_month = monthly_forecast[0]['predictedKWh']
        next_3_months = sum(f['predictedKWh'] for f in monthly_forecast[:3])
        next_6_months = sum(f['predictedKWh'] for f in monthly_forecast[:6])
        annual_kwh = sum(f['predictedKWh'] for f in monthly_forecast)

        return {
            'engine': 'SolarSense GradientBoosting ML v1.0',
            'baselineKWh': baseline_kwh,
            'userType': user_type,
            'forecast': {
                'nextMonthKWh': next_month,
                'threeMonthKWh': round(next_3_months, 1),
                'sixMonthKWh': round(next_6_months, 1),
                'twelveMonthKWh': round(annual_kwh, 1),
            },
            'monthlyBreakdown': monthly_forecast,
            'modelMetrics': {
                'mape': self.consumption_meta.get('mape', 0),
                'mae': self.consumption_meta.get('mae', 0),
                'rmse': self.consumption_meta.get('rmse', 0)
            }
        }

    def predict_solar(self, capacity_kw: float, performance_ratio: float = 0.78) -> Dict[str, Any]:
        """
        Hybrid Solar Yield Model:
        1. Deterministic Engineering Physics Baseline (Capacity * PSH * Days * PR)
        2. ML Empirical Calibration Factor (Thermal derating + seasonal atmospheric dust/soiling)
        3. Final Calibrated Solar Yield Estimate
        """
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        MONTHLY_PSH = [5.0, 5.3, 5.6, 5.7, 5.5, 4.0, 3.4, 3.5, 4.5, 5.1, 5.0, 4.8]
        DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        breakdown = []
        total_eng = 0.0
        total_calibrated = 0.0

        for m in range(1, 13):
            psh = MONTHLY_PSH[m - 1]
            days = DAYS[m - 1]
            eng_baseline_kwh = round(capacity_kw * psh * days * performance_ratio, 1)

            # ML empirical calibration factor
            if self.solar_model:
                X = np.array([[capacity_kw, m, psh, performance_ratio]])
                raw_ml_pred = float(self.solar_model.predict(X)[0])
                # Compute calibration ratio bounded within realistic physical envelope [0.88, 1.05]
                calibration_ratio = min(1.05, max(0.88, raw_ml_pred / (eng_baseline_kwh if eng_baseline_kwh > 0 else 1.0)))
                calibrated_kwh = round(eng_baseline_kwh * calibration_ratio, 1)
            else:
                calibration_ratio = 1.0
                calibrated_kwh = eng_baseline_kwh

            diff = round(calibrated_kwh - eng_baseline_kwh, 1)
            diff_percent = round((diff / eng_baseline_kwh * 100) if eng_baseline_kwh > 0 else 0, 1)

            total_eng += eng_baseline_kwh
            total_calibrated += calibrated_kwh

            breakdown.append({
                'month': month_names[m - 1],
                'monthIndex': m,
                'dailySunHours': psh,
                'engineeringBaselineKWh': eng_baseline_kwh,
                'mlCalibrationFactor': round(calibration_ratio, 3),
                'calibratedYieldKWh': calibrated_kwh,
                'calibrationAdjustmentKWh': diff,
                'adjustmentPercent': diff_percent
            })

        return {
            'architecture': 'Hybrid Physics Engine + ML Calibration (Engineering Baseline -> Empirical Derate -> Calibrated Yield)',
            'capacityKW': capacity_kw,
            'performanceRatio': performance_ratio,
            'annualSummary': {
                'engineeringBaselineTotalKWh': round(total_eng, 1),
                'mlCalibratedTotalKWh': round(total_calibrated, 1),
                'netCalibrationAdjustmentPercent': round(((total_calibrated - total_eng) / total_eng * 100) if total_eng > 0 else 0, 1)
            },
            'modelMetadata': {
                'modelName': self.solar_meta.get('modelName', 'SolarSense Hybrid Calibrator'),
                'version': self.solar_meta.get('version', '1.0.0'),
                'features': self.solar_meta.get('features', ['capacity_kw', 'month', 'peak_sun_hours', 'performance_ratio']),
                'validationMape': self.solar_meta.get('mape', 1.8),
            },
            'monthlyComparison': breakdown
        }

    def detect_anomalies(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates consumption anomaly based on rolling standard deviations and trend jumps.
        """
        if not history or len(history) < 2:
            return {
                'hasAnomaly': False,
                'level': 'Normal',
                'description': 'Insufficient billing history (requires at least 2 historical bills for anomaly trend analysis).'
            }

        kwh_values = [h.get('unitsConsumed', 0) for h in history if h.get('unitsConsumed')]
        if len(kwh_values) < 2:
            return {'hasAnomaly': False, 'level': 'Normal', 'description': 'Consistent consumption.'}

        current = kwh_values[0] # most recent bill
        past = kwh_values[1:]
        avg_past = float(np.mean(past))
        std_past = float(np.std(past)) if len(past) > 1 else (avg_past * 0.15)
        std_past = max(std_past, avg_past * 0.05) # avoid div by zero

        z_score = (current - avg_past) / std_past
        change_pct = round(((current - avg_past) / avg_past) * 100, 1)

        has_anomaly = abs(z_score) > 1.8 or abs(change_pct) > 28.0
        level = 'Normal'
        reasons = []

        if change_pct > 25.0:
            level = 'High Anomaly' if change_pct > 50 else 'Moderate Anomaly'
            reasons.append(f"Consumption is {change_pct}% higher than your recent average ({round(avg_past)} kWh).")
            reasons.append("Potential drivers: Heavy air conditioning / heating loads, EV charging sessions, water pump usage, or billing adjustments.")
        elif change_pct < -25.0:
            level = 'Low Anomaly'
            reasons.append(f"Consumption dropped by {abs(change_pct)}% below average ({round(avg_past)} kWh).")
            reasons.append("Potential drivers: Vacancy/travel, seasonality, or meter change.")

        return {
            'hasAnomaly': has_anomaly,
            'level': level,
            'currentKWh': current,
            'historicalAverageKWh': round(avg_past, 1),
            'percentageChange': change_pct,
            'zScore': round(float(z_score), 2),
            'reasons': reasons
        }

predictor = MLPredictor()
