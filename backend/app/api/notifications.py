from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import User, Notification
from app.schemas.schemas import NotificationOut
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    limit: int = Query(20, le=50),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.get_user_notifications(db, current_user.id, limit, unread_only)

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.mark_as_read(db, notification_id, current_user.id)

@router.patch("/read-all")
@router.post("/mark-all-read")
@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"success": True, "count": count, "marked_count": count}

@router.post("/test-email")
def send_test_email(
    current_user: User = Depends(get_current_user)
):
    recipient = current_user.email or settings.SMTP_USER or settings.FROM_EMAIL
    subject = "One Logistics SMTP Verification Test"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #f8fafc; color: #17231b;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #e2ebd0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="background-color: #17231b; padding: 20px; border-radius: 14px; text-align: center; margin-bottom: 20px;">
                <span style="color: #d9ff69; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">ONE LOGISTICS</span>
                <h2 style="color: #edf7cd; margin: 6px 0 0 0; font-size: 18px;">SMTP Integration Verified</h2>
            </div>
            <p style="font-size: 14px; margin: 0 0 16px 0;">Hello <strong>{current_user.name}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                Your Gmail SMTP email notification integration is now fully verified and operational on One Logistics.
            </p>
            <div style="background-color: #edf7cd; padding: 14px; border-radius: 12px; font-size: 12px; margin: 16px 0; border: 1px solid #d9ff69;">
                <p style="margin: 0; color: #17231b;"><strong>Sender Host:</strong> {settings.SMTP_HOST}:{settings.SMTP_PORT}</p>
                <p style="margin: 4px 0 0 0; color: #17231b;"><strong>From:</strong> {settings.FROM_EMAIL}</p>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
                One Logistics Experience Platform &copy; 2026
            </p>
        </div>
    </body>
    </html>
    """
    sent = EmailService.dispatch_email(recipient, subject, html_body)
    return {
        "success": sent,
        "recipient": recipient,
        "from": settings.FROM_EMAIL,
        "host": settings.SMTP_HOST
    }
