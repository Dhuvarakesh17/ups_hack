from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.models import User, Shipment
from app.schemas.schemas import ShipmentCreate, ShipmentOut, ShipmentDetailResponse, ShipmentStatusUpdate
from app.services.shipment_service import ShipmentService
from app.services.shipment_transition_service import ShipmentTransitionService

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("", response_model=List[ShipmentOut])
def get_shipments(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Shipment).filter(Shipment.user_id == current_user.id)

    if status_filter:
        if status_filter == "in_progress":
            query = query.filter(Shipment.current_status.in_(["created", "picked_up", "in_transit", "out_for_delivery"]))
        else:
            query = query.filter(Shipment.current_status == status_filter)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Shipment.shipment_number.ilike(search_pattern)) |
            (Shipment.product_name.ilike(search_pattern)) |
            (Shipment.receiver_name.ilike(search_pattern)) |
            (Shipment.receiver_city.ilike(search_pattern)) |
            (Shipment.sender_city.ilike(search_pattern))
        )

    return query.order_by(Shipment.created_at.desc()).limit(limit).all()

@router.post("", response_model=ShipmentOut, status_code=status.HTTP_201_CREATED)
def create_shipment(
    payload: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ShipmentService.create_shipment(db, current_user.id, payload)

@router.get("/{shipment_id}", response_model=ShipmentDetailResponse)
def get_shipment_details(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ShipmentService.get_shipment_details(db, shipment_id, current_user.id)

@router.patch("/{shipment_id}/status", response_model=ShipmentOut)
def update_shipment_status(
    shipment_id: str,
    payload: ShipmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = db.query(Shipment).filter(
        Shipment.id == shipment_id,
        Shipment.user_id == current_user.id
    ).first()

    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )

    updated_shipment, _, _ = ShipmentTransitionService.transition_shipment(
        db=db,
        shipment=shipment,
        target_status=payload.status,
        location=payload.location,
        note=payload.note
    )
    return updated_shipment
