from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Draft
from app.schemas.schemas import DraftCreate, DraftUpdate
from app.services.notification_service import NotificationService

class DraftService:
    @staticmethod
    def get_all_user_drafts(db: Session, user_id: str) -> List[Draft]:
        return db.query(Draft).filter(Draft.user_id == user_id).order_by(Draft.updated_at.desc()).all()

    @staticmethod
    def get_draft_by_id(db: Session, draft_id: str, user_id: str) -> Draft:
        draft = db.query(Draft).filter(
            Draft.id == draft_id,
            Draft.user_id == user_id
        ).first()

        if not draft:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Draft not found"
            )
        return draft

    @staticmethod
    def create_draft(db: Session, user_id: str, data: DraftCreate) -> Draft:
        now_utc = datetime.now(timezone.utc)
        draft = Draft(
            user_id=user_id,
            name=data.name,
            current_step=data.current_step,
            sender_details=data.sender_details or {},
            receiver_details=data.receiver_details or {},
            product_details=data.product_details or {},
            payment_details=data.payment_details or {},
            created_at=now_utc,
            updated_at=now_utc
        )
        db.add(draft)
        db.commit()
        db.refresh(draft)

        NotificationService.create_notification(
            db=db,
            user_id=user_id,
            title="Draft Saved",
            message=f"Booking draft '{draft.name}' saved at Step {draft.current_step}.",
            type="draft_saved"
        )
        return draft

    @staticmethod
    def update_draft(db: Session, draft_id: str, user_id: str, data: DraftUpdate) -> Draft:
        draft = DraftService.get_draft_by_id(db, draft_id, user_id)

        if data.name is not None:
            draft.name = data.name
        if data.current_step is not None:
            draft.current_step = data.current_step
        if data.sender_details is not None:
            draft.sender_details = data.sender_details
        if data.receiver_details is not None:
            draft.receiver_details = data.receiver_details
        if data.product_details is not None:
            draft.product_details = data.product_details
        if data.payment_details is not None:
            draft.payment_details = data.payment_details

        draft.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(draft)
        return draft

    @staticmethod
    def delete_draft(db: Session, draft_id: str, user_id: str) -> bool:
        draft = DraftService.get_draft_by_id(db, draft_id, user_id)
        db.delete(draft)
        db.commit()
        return True

