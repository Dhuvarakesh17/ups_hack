from datetime import datetime, timedelta, timezone
from typing import List
from app.models.models import Shipment, ShipmentStatusHistory
from app.prediction.feature_extractor import FeatureExtractor, ensure_utc
from app.schemas.schemas import PredictionDetails

class DeliveryEstimator:
    """Predicts dynamic delivery timestamps, confidence intervals, and explanations."""

    BASE_STAGE_HOURS_STANDARD = 12.0
    BASE_STAGE_HOURS_EXPRESS = 5.0

    @classmethod
    def estimate_delivery(
        cls, shipment: Shipment, history: List[ShipmentStatusHistory]
    ) -> PredictionDetails:
        if shipment.current_status == "delivered":
            return PredictionDetails(
                estimated_delivery_time=shipment.estimated_delivery_time or ensure_utc(shipment.updated_at),
                prediction_state="completed",
                confidence_score=1.0,
                estimated_hours_remaining=0.0,
                explanation_factors=["Package successfully delivered to destination recipient."]
            )

        features = FeatureExtractor.extract_features(shipment, history)
        factors = []

        # 1. Base stage duration
        if features["is_express"]:
            stage_duration = cls.BASE_STAGE_HOURS_EXPRESS
            factors.append("Express priority linehaul routing (-58% transit time multiplier)")
        else:
            stage_duration = cls.BASE_STAGE_HOURS_STANDARD
            factors.append("Standard ground linehaul routing")

        # 2. Adjust using observed stage velocities if available
        if features["avg_stage_duration"]:
            weight_observed = min(0.6, len(features["observed_stage_durations"]) * 0.2)
            stage_duration = (stage_duration * (1 - weight_observed)) + (features["avg_stage_duration"] * weight_observed)
            factors.append(f"Derived from {len(features['observed_stage_durations'])} observed stage transitions (avg {features['avg_stage_duration']:.1f}h/stage)")

        # 3. Cargo modifiers
        if features["is_fragile"]:
            stage_duration *= 1.15
            factors.append("Fragile cargo handling buffer applied (+15% transit buffer)")
        if features["billable_weight"] > 15.0:
            stage_duration *= 1.10
            factors.append(f"Heavy freight ({features['billable_weight']:.1f}kg billable) linehaul scheduling factor")

        remaining_stages = max(1, 4 - features["current_rank"])
        total_remaining_hours = remaining_stages * stage_duration

        now_utc = datetime.now(timezone.utc)
        estimated_arrival = now_utc + timedelta(hours=total_remaining_hours)

        # 4. Confidence scoring
        if features["history_count"] >= 3:
            confidence = 0.95
            state = "accurate"
        elif features["history_count"] >= 2:
            confidence = 0.85
            state = "accurate"
        elif features["history_count"] == 1:
            confidence = 0.65
            state = "preliminary"
        else:
            confidence = 0.40
            state = "preliminary"

        factors.append(f"Confidence score calculated from {features['history_count']} verified checkpoints")

        return PredictionDetails(
            estimated_delivery_time=estimated_arrival,
            prediction_state=state,
            confidence_score=round(confidence, 2),
            estimated_hours_remaining=round(total_remaining_hours, 1),
            explanation_factors=factors
        )

