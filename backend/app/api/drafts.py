from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import DraftCreate, DraftUpdate, DraftOut
from app.services.draft_service import DraftService

router = APIRouter(prefix="/drafts", tags=["Drafts"])

@router.get("", response_model=List[DraftOut])
def get_all_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DraftService.get_all_user_drafts(db, current_user.id)

@router.post("", response_model=DraftOut, status_code=status.HTTP_201_CREATED)
def create_draft(
    payload: DraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DraftService.create_draft(db, current_user.id, payload)

@router.get("/{draft_id}", response_model=DraftOut)
def get_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DraftService.get_draft_by_id(db, draft_id, current_user.id)

@router.patch("/{draft_id}", response_model=DraftOut)
def update_draft(
    draft_id: str,
    payload: DraftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return DraftService.update_draft(db, draft_id, current_user.id, payload)

@router.delete("/{draft_id}")
def delete_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    DraftService.delete_draft(db, draft_id, current_user.id)
    return {"success": True, "message": "Draft deleted successfully"}

