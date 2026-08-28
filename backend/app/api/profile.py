import base64
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user, verify_password, get_password_hash
from app.models.models import User, Account
from app.schemas.schemas import UserOut, UserUpdate, PasswordChangeRequest

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.image is not None:
        current_user.image = payload.image

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/image", response_model=UserOut)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{encoded}"

    current_user.image = data_url
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.provider_id == "credential"
    ).first()

    if account and account.password:
        if not verify_password(payload.current_password, account.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password verification failed"
            )
        account.password = get_password_hash(payload.new_password)
    else:
        # Create credential account entry
        new_account = Account(
            user_id=current_user.id,
            account_id=current_user.email,
            provider_id="credential",
            password=get_password_hash(payload.new_password)
        )
        db.add(new_account)

    db.commit()
    return {"success": True, "message": "Password changed successfully"}

