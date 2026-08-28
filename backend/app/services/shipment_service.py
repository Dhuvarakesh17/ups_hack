import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Shipment, ShipmentStatusHistory, Draft
from app.schemas.schemas import ShipmentCreate, ShipmentDetailResponse
from app.prediction.delivery_estimator import DeliveryEstimator
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

class ShipmentService:
    @staticmethod
    def generate_shipment_number() -> str:
        digits = "".join(random.choices(string.digits, k=8))
        return f"UPS-{digits}"

    @classmethod
    def calculate_rate(cls, weight: float, length: float, width: float, height: float, delivery_type: str, product_type: str) -> float:
        volumetric_weight = (length * width * height) / 5000.0
        billable_weight = max(weight or 1.0, volumetric_weight)
        base_rate = 25.0
        weight_rate = billable_weight * 8.5

        multiplier = 1.0
        if delivery_type.lower() == "express":
            multiplier *= 1.6
        if product_type.lower() == "fragile":
            multiplier *= 1.25
        elif product_type.lower() == "electronics":
            multiplier *= 1.15

        total = (base_rate + weight_rate) * multiplier
        return round(total, 2)

    @classmethod
    def create_shipment(cls, db: Session, user_id: str, data: ShipmentCreate) -> Shipment:
        total_amount = data.total_amount or cls.calculate_rate(
            data.weight, data.length, data.width, data.height, data.delivery_type, data.product_type
        )

        shipment_num = cls.generate_shipment_number()
        now_utc = datetime.now(timezone.utc)

        shipment = Shipment(
            shipment_number=shipment_num,
            user_id=user_id,
            sender_name=data.sender_name,
            sender_email=data.sender_email,
            sender_phone=data.sender_phone,
            sender_address=data.sender_address,
            sender_city=data.sender_city,
            sender_state=data.sender_state,
            sender_postal_code=data.sender_postal_code,
            sender_country=data.sender_country,
            receiver_name=data.receiver_name,
            receiver_email=data.receiver_email,
            receiver_phone=data.receiver_phone,
            receiver_address=data.receiver_address,
            receiver_city=data.receiver_city,
            receiver_state=data.receiver_state,
            receiver_postal_code=data.receiver_postal_code,
            receiver_country=data.receiver_country,
            product_name=data.product_name,
            product_description=data.product_description,
            length=data.length,
            width=data.width,
            height=data.height,
            weight=data.weight,
            product_type=data.product_type,
            delivery_type=data.delivery_type,
            payment_mode=data.payment_mode,
            billing_location=data.billing_location,
            total_amount=total_amount,
            current_status="created",
            created_at=now_utc,
            updated_at=now_utc
        )

        db.add(shipment)
        db.flush()

        # Add initial history milestone
        initial_history = ShipmentStatusHistory(
            shipment_id=shipment.id,
            status="created",
            location=f"{data.sender_city}, {data.sender_state}",
            note="Shipment booked and initial shipping label generated",
            timestamp=now_utc
        )
        db.add(initial_history)

        # Initial predictive ETA
        prediction = DeliveryEstimator.estimate_delivery(shipment, [initial_history])
        shipment.estimated_delivery_time = prediction.estimated_delivery_time

        # If created from a draft, delete the draft
        if data.draft_id:
            db.query(Draft).filter(Draft.id == data.draft_id, Draft.user_id == user_id).delete()

        db.commit()
        db.refresh(shipment)

        NotificationService.create_notification(
            db=db,
            user_id=user_id,
            shipment_id=shipment.id,
            title="Shipment Created",
            message=f"Shipment {shipment.shipment_number} has been created and is ready for pickup.",
            type="status_update"
        )

        EmailService.send_status_update_email(shipment, "none", "created")
        return shipment

    @classmethod
    def get_shipment_details(cls, db: Session, shipment_id: str, user_id: str) -> ShipmentDetailResponse:
        shipment = db.query(Shipment).filter(
            Shipment.id == shipment_id,
            Shipment.user_id == user_id
        ).first()

        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found"
            )

        history = db.query(ShipmentStatusHistory).filter(
            ShipmentStatusHistory.shipment_id == shipment.id
        ).order_by(ShipmentStatusHistory.timestamp.desc()).all()

        prediction = DeliveryEstimator.estimate_delivery(shipment, history)

        return ShipmentDetailResponse(
            **{c.name: getattr(shipment, c.name) for c in shipment.__table__.columns},
            status_history=history,
            prediction=prediction
        )

