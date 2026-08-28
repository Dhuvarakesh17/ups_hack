from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.models import User, UserPreferences
from app.schemas.schemas import UserPreferencesOut, UserPreferencesUpdate

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=UserPreferencesOut)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs

@router.patch("", response_model=UserPreferencesOut)
def update_preferences(
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    if payload.theme is not None:
        prefs.theme = payload.theme
    if payload.preferred_delivery_type is not None:
        prefs.preferred_delivery_type = payload.preferred_delivery_type
    if payload.preferred_payment_mode is not None:
        prefs.preferred_payment_mode = payload.preferred_payment_mode
    if payload.preferred_payment_location is not None:
        prefs.preferred_payment_location = payload.preferred_payment_location

    db.commit()
    db.refresh(prefs)
    return prefs

