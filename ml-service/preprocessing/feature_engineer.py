import numpy as np
from typing import Dict, Any, List

USER_TYPE_MAP = {
    'residential': 0,
    'farm': 1,
    'small_business': 2,
    'large_business': 3
}

# Indian seasonal indices (base = 1.0)
SEASON_FACTORS = {
    'residential': [0.85, 0.90, 1.15, 1.30, 1.35, 1.10, 0.95, 0.90, 0.95, 1.05, 0.85, 0.80],
    'farm':        [1.10, 1.25, 1.35, 1.30, 1.10, 0.70, 0.65, 0.75, 1.00, 1.15, 1.20, 1.10],
    'small_business': [0.90, 0.95, 1.10, 1.20, 1.25, 1.15, 1.05, 1.00, 1.05, 1.10, 0.95, 0.90],
    'large_business': [0.95, 0.98, 1.05, 1.15, 1.20, 1.12, 1.05, 1.02, 1.04, 1.08, 0.98, 0.96],
}

def extract_features(month: int, baseline_kwh: float, user_type: str, state: str = 'Maharashtra') -> np.ndarray:
    """
    Construct numerical feature vector for time-series consumption modeling.
    Features:
    0: baseline_kwh
    1: month_sin
    2: month_cos
    3: user_type_code
    4: seasonal_multiplier
    5: is_peak_summer
    6: is_monsoon
    """
    u_type = user_type.lower() if user_type else 'residential'
    type_code = USER_TYPE_MAP.get(u_type, 0)
    
    # Cyclical month encodings
    month_angle = 2 * np.pi * (month - 1) / 12.0
    month_sin = np.sin(month_angle)
    month_cos = np.cos(month_angle)
    
    # Multiplier lookup
    multipliers = SEASON_FACTORS.get(u_type, SEASON_FACTORS['residential'])
    m_idx = (month - 1) % 12
    seasonal_multiplier = multipliers[m_idx]
    
    is_peak_summer = 1.0 if month in [4, 5] else 0.0
    is_monsoon = 1.0 if month in [6, 7, 8] else 0.0
    
    return np.array([
        baseline_kwh,
        month_sin,
        month_cos,
        type_code,
        seasonal_multiplier,
        is_peak_summer,
        is_monsoon
    ], dtype=float)
