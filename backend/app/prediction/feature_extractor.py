from datetime import datetime, timezone
from typing import List, Dict, Any
from app.models.models import Shipment, ShipmentStatusHistory

def ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

class FeatureExtractor:
    """Extracts analytical features from shipment characteristics and stage progression logs."""

    @staticmethod
    def extract_features(shipment: Shipment, history: List[ShipmentStatusHistory]) -> Dict[str, Any]:
        sorted_history = sorted(
            history,
            key=lambda h: ensure_utc(h.timestamp)
        )

        total_stages = 4  # created -> picked_up -> in_transit -> out_for_delivery -> delivered
        status_rank_map = {
            "created": 0,
            "picked_up": 1,
            "in_transit": 2,
            "out_for_delivery": 3,
            "delivered": 4,
            "delayed": 2,
            "exception": 2,
            "failed": 2
        }

        current_rank = status_rank_map.get(shipment.current_status, 0)
        progress_ratio = current_rank / total_stages

        stage_durations = []
        for i in range(1, len(sorted_history)):
            prev_ts = ensure_utc(sorted_history[i - 1].timestamp)
            curr_ts = ensure_utc(sorted_history[i].timestamp)
            delta_hours = max(0.1, (curr_ts - prev_ts).total_seconds() / 3600.0)
            stage_durations.append(delta_hours)

        avg_stage_duration = (
            sum(stage_durations) / len(stage_durations) if stage_durations else None
        )

        is_express = shipment.delivery_type.lower() == "express"
        volumetric_weight = (shipment.length * shipment.width * shipment.height) / 5000.0
        billable_weight = max(shipment.weight or 1.0, volumetric_weight)

        is_fragile = shipment.product_type.lower() == "fragile"
        is_electronics = shipment.product_type.lower() == "electronics"

        return {
            "current_status": shipment.current_status,
            "current_rank": current_rank,
            "progress_ratio": progress_ratio,
            "history_count": len(sorted_history),
            "observed_stage_durations": stage_durations,
            "avg_stage_duration": avg_stage_duration,
            "is_express": is_express,
            "billable_weight": billable_weight,
            "is_fragile": is_fragile,
            "is_electronics": is_electronics,
            "created_at": ensure_utc(shipment.created_at)
        }

