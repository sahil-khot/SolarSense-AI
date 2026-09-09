import os
import sys
from typing import Dict, Any, List, Optional, Union
from fastapi import FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ML_ADMIN_SECRET = os.getenv("ML_ADMIN_SECRET")
if not ML_ADMIN_SECRET:
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("FATAL: ML_ADMIN_SECRET must be configured in production.")
    ML_ADMIN_SECRET = "solar_admin_secret_passphrase_2026"

# Ensure root paths are accessible
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from inference.predictor import predictor
from training.train_models import train_and_evaluate_consumption, train_and_evaluate_solar

app = FastAPI(
    title="SolarSense AI — Machine Learning Service",
    description="Production-grade ML service for electricity consumption forecasting, solar yield ML prediction, and bill anomaly detection.",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000,http://127.0.0.1:5000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BillItem(BaseModel):
    unitsConsumed: Optional[float] = 0.0
    totalAmount: Optional[float] = 0.0
    billingMonth: Optional[str] = ""
    billingYear: Optional[int] = None

class ConsumptionRequest(BaseModel):
    baselineKWh: Optional[float] = None
    baseline_kwh: Optional[float] = None
    historical_kwh: Optional[List[float]] = None
    userType: Optional[str] = None
    user_type: Optional[str] = "residential"
    state: Optional[str] = None
    location: Optional[str] = "Maharashtra"
    startMonth: Optional[int] = 1
    forecast_months: Optional[int] = 12

class SolarRequest(BaseModel):
    capacityKW: Optional[float] = None
    capacity_kw: Optional[float] = None
    performanceRatio: Optional[float] = None
    performance_ratio: Optional[float] = 0.78
    location: Optional[str] = "Maharashtra"
    tilt_degrees: Optional[float] = 20

class AnomalyRequest(BaseModel):
    history: Optional[List[BillItem]] = None
    current_kwh: Optional[float] = None
    history_kwh: Optional[List[float]] = None
    user_type: Optional[str] = "residential"

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "SolarSense AI Machine Learning Layer",
        "version": "1.0.0",
        "mlModelActive": predictor.is_ready()
    }

@app.get("/models/status", tags=["Model Registry"])
def model_status():
    return predictor.get_status()

@app.post("/predict/consumption", tags=["Inference"])
def predict_consumption(req: ConsumptionRequest):
    try:
        # Resolve baseline without silent defaults
        baseline = req.baselineKWh or req.baseline_kwh
        if not baseline and req.historical_kwh and len(req.historical_kwh) > 0:
            baseline = sum(req.historical_kwh) / len(req.historical_kwh)

        if not baseline or baseline <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing valid baseline electricity consumption. Provide baselineKWh or historical_kwh."
            )

        user_type = req.userType or req.user_type or "residential"
        state = req.state or req.location or "Maharashtra"
        start_m = req.startMonth or 1

        result = predictor.predict_consumption(
            baseline_kwh=baseline,
            user_type=user_type,
            state=state,
            start_month=start_m
        )

        annual_kwh = result['forecast']['twelveMonthKWh']
        next_month = result['forecast']['nextMonthKWh']
        three_month = result['forecast']['threeMonthKWh']
        six_month = result['forecast']['sixMonthKWh']
        curve = result['monthlyBreakdown']
        conf_intervals = [
            {"month": m['month'], "lower": m['lowerBoundKWh'], "upper": m['upperBoundKWh']}
            for m in curve
        ]

        return {
            "success": True,
            "annual_kwh": annual_kwh,
            "next_month_kwh": next_month,
            "three_month_kwh": three_month,
            "six_month_kwh": six_month,
            "confidence_intervals": conf_intervals,
            "forecast_curve": curve,
            "model_metadata": result.get('modelMetrics', {}),
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Consumption forecast error: {str(e)}"
        )

@app.post("/predict/solar", tags=["Inference"])
def predict_solar(req: SolarRequest):
    try:
        cap = req.capacityKW or req.capacity_kw
        if not cap or cap <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing valid solar system capacity. Provide a positive capacityKW value."
            )
        pr = req.performanceRatio or req.performance_ratio or 0.78

        result = predictor.predict_solar(
            capacity_kw=cap,
            performance_ratio=pr
        )

        ml_annual = result.get('annualSummary', {}).get('mlCalibratedTotalKWh', 0)
        return {
            "success": True,
            "ml_annual_kwh": ml_annual,
            "monthly_generation": result.get('monthlyComparison', []),
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Solar yield prediction error: {str(e)}"
        )

@app.post("/detect/anomalies", tags=["Inference"])
def detect_anomalies(req: AnomalyRequest):
    try:
        if req.history:
            history_dicts = [b.dict() for b in req.history]
        elif req.current_kwh and req.history_kwh:
            history_dicts = [{'unitsConsumed': req.current_kwh}] + [{'unitsConsumed': u} for u in req.history_kwh]
        else:
            history_dicts = []

        if len(history_dicts) < 2:
            return {
                "success": True,
                "is_anomaly": False,
                "z_score": 0.0,
                "hasAnomaly": False,
                "level": "Insufficient Data",
                "description": "Anomaly detection requires at least 2 historical bills to compute a valid baseline trend.",
                "reasons": []
            }

        result = predictor.detect_anomalies(history_dicts)
        is_anom = result.get('hasAnomaly', False)
        z = result.get('zScore', 0.0)

        return {
            "success": True,
            "is_anomaly": is_anom,
            "z_score": z,
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly detection error: {str(e)}"
        )

@app.post("/train", tags=["Training"])
def retrain_models(x_ml_secret_key: Optional[str] = Header(None)):
    if not x_ml_secret_key or x_ml_secret_key != ML_ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Valid X-ML-Secret-Key required for model retraining."
        )

    try:
        train_and_evaluate_consumption()
        train_and_evaluate_solar()
        predictor.load_models()
        return {
            "success": True,
            "message": "Models successfully retrained and reloaded.",
            "status": predictor.get_status()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model retraining failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
