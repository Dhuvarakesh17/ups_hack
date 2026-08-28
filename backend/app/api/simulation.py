from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import User, Shipment
from app.schemas.schemas import SimulationResponse, ShipmentOut
from app.services.shipment_transition_service import ShipmentTransitionService

router = APIRouter(prefix="/shipments", tags=["Simulation"])

@router.post("/{shipment_id}/simulate-next-status", response_model=SimulationResponse)
def simulate_next_status(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.ENABLE_SHIPMENT_SIMULATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shipment status simulation is disabled in this environment"
        )

    shipment = db.query(Shipment).filter(
        Shipment.id == shipment_id,
        Shipment.user_id == current_user.id
    ).first()

    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )

    updated_shipment, old_status, new_status = ShipmentTransitionService.transition_shipment(
        db=db,
        shipment=shipment
    )

    next_status = ShipmentTransitionService.get_next_status(new_status)

    return SimulationResponse(
        success=True,
        message=f"Shipment transitioned from {old_status.upper()} to {new_status.upper()}",
        shipment=ShipmentOut.model_validate(updated_shipment),
        previous_status=old_status,
        new_status=new_status,
        next_possible_status=next_status,
        notification_triggered=True,
        email_triggered=True
    )

