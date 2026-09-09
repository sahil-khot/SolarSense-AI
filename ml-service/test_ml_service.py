import unittest
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from inference.predictor import predictor


class TestMLPredictor(unittest.TestCase):
    def test_predictor_status(self):
        status = predictor.get_status()
        self.assertIn("status", status)
        self.assertIn("models", status)
        self.assertIn("consumptionForecaster", status["models"])
        self.assertIn("solarForecaster", status["models"])

    def test_consumption_prediction_valid(self):
        res = predictor.predict_consumption(
            baseline_kwh=350.0,
            user_type="residential",
            state="Maharashtra",
            start_month=1
        )
        self.assertIn("forecast", res)
        self.assertIn("monthlyBreakdown", res)
        self.assertEqual(len(res["monthlyBreakdown"]), 12)
        self.assertGreater(res["forecast"]["twelveMonthKWh"], 0)
        self.assertGreater(res["forecast"]["nextMonthKWh"], 0)

    def test_solar_prediction_valid(self):
        res = predictor.predict_solar(
            capacity_kw=5.0,
            performance_ratio=0.78
        )
        self.assertIn("annualSummary", res)
        self.assertGreater(res["annualSummary"]["mlCalibratedTotalKWh"], 0)
        self.assertGreater(res["annualSummary"]["engineeringBaselineTotalKWh"], 0)
        self.assertIn("monthlyComparison", res)
        self.assertEqual(len(res["monthlyComparison"]), 12)

    def test_anomaly_detection_insufficient_history(self):
        res = predictor.detect_anomalies([{"unitsConsumed": 300}])
        self.assertFalse(res["hasAnomaly"])
        self.assertEqual(res["level"], "Normal")

    def test_anomaly_detection_spike(self):
        # Index 0 is the most recent bill
        history = [
            {"unitsConsumed": 600},  # Recent spike
            {"unitsConsumed": 205},
            {"unitsConsumed": 195},
            {"unitsConsumed": 210},
            {"unitsConsumed": 200}
        ]
        res = predictor.detect_anomalies(history)
        self.assertTrue(res["hasAnomaly"])
        self.assertIn(res["level"], ["High Anomaly", "Moderate Anomaly"])
        self.assertGreater(len(res["reasons"]), 0)
        self.assertGreater(res["percentageChange"], 50)


if __name__ == "__main__":
    unittest.main()
