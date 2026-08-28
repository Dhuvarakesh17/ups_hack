from datetime import datetime, timezone
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Shipment, ShipmentStatusHistory
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService
from app.prediction.delivery_estimator import DeliveryEstimator

class ShipmentTransitionService:
    """State machine controller for shipment milestones and live simulation transitions."""

    VALID_TRANSITIONS = {
        "created": "picked_up",
        "picked_up": "in_transit",
        "in_transit": "out_for_delivery",
        "out_for_delivery": "delivered",
        "delayed": "in_transit",
        "exception": None,
        "delivered": None,
        "failed": None
    }

    LOCATION_DEFAULTS = {
        "created": "Origin Customer Facility (Chicago Dispatch)",
        "picked_up": "Local Courier Depot (Chicago Hub)",
        "in_transit": "Midwest Regional Freight Sorting Facility",
        "out_for_delivery": "Local Destination Van (New York Metro)",
        "delivered": "Destination Front Desk / Receiving Bay"
    }

    @classmethod
    def get_next_status(cls, current_status: str) -> Optional[str]:
        return cls.VALID_TRANSITIONS.get(current_status)

    @classmethod
    def transition_shipment(
        cls,
        db: Session,
        shipment: Shipment,
        target_status: Optional[str] = None,
        location: Optional[str] = None,
        note: Optional[str] = None
    ) -> Tuple[Shipment, str, str]:
        old_status = shipment.current_status

        if target_status is None:
            target_status = cls.get_next_status(old_status)
            if not target_status:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Shipment is in terminal or unhandled status: '{old_status}'"
                )

        # 1. Update Shipment record
        shipment.current_status = target_status
        now_utc = datetime.now(timezone.utc)
        shipment.updated_at = now_utc

        # 2. Add history checkpoint
        checkpoint_location = location or cls.LOCATION_DEFAULTS.get(target_status, "En Route Hub")
        history_note = note or f"Status transitioned to {target_status.replace('_', ' ').upper()}"

        history_entry = ShipmentStatusHistory(
            shipment_id=shipment.id,
            status=target_status,
            location=checkpoint_location,
            note=history_note,
            timestamp=now_utc
        )
        db.add(history_entry)

        # 3. Recalculate predictive arrival time
        all_history = db.query(ShipmentStatusHistory).filter(
            ShipmentStatusHistory.shipment_id == shipment.id
        ).all()
        all_history.append(history_entry)

        prediction = DeliveryEstimator.estimate_delivery(shipment, all_history)
        if prediction.estimated_delivery_time:
            shipment.estimated_delivery_time = prediction.estimated_delivery_time

        db.commit()
        db.refresh(shipment)

        # 4. Trigger In-App Notification
        NotificationService.create_notification(
            db=db,
            user_id=shipment.user_id,
            shipment_id=shipment.id,
            title=f"Shipment {shipment.shipment_number} Updated",
            message=f"Status changed to {target_status.replace('_', ' ').upper()} at {checkpoint_location}.",
            type="delivery" if target_status == "delivered" else "status_update"
        )

        # 5. Trigger automated email
        EmailService.send_status_update_email(shipment, old_status, target_status)

        return shipment, old_status, target_status

