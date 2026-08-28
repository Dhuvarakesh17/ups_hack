import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Float,
    Integer,
    ForeignKey,
    DateTime,
    Text,
    JSON
)
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

# ----------------- Better Auth Compatible Tables -----------------

class User(Base):
    __tablename__ = "user"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    email_verified = Column("emailVerified", Boolean, default=False)
    image = Column(Text, nullable=True)
    created_at = Column("createdAt", DateTime, default=get_utc_now)
    updated_at = Column("updatedAt", DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="user", cascade="all, delete-orphan")
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "session"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column("userId", String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column("expiresAt", DateTime, nullable=False)
    ip_address = Column("ipAddress", String, nullable=True)
    user_agent = Column("userAgent", String, nullable=True)
    created_at = Column("createdAt", DateTime, default=get_utc_now)
    updated_at = Column("updatedAt", DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="sessions")


class Account(Base):
    __tablename__ = "account"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column("userId", String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    account_id = Column("accountId", String, nullable=False)
    provider_id = Column("providerId", String, nullable=False)
    access_token = Column("accessToken", Text, nullable=True)
    refresh_token = Column("refreshToken", Text, nullable=True)
    access_token_expires_at = Column("accessTokenExpiresAt", DateTime, nullable=True)
    refresh_token_expires_at = Column("refreshTokenExpiresAt", DateTime, nullable=True)
    scope = Column(String, nullable=True)
    id_token = Column("idToken", Text, nullable=True)
    password = Column(String, nullable=True)
    created_at = Column("createdAt", DateTime, default=get_utc_now)
    updated_at = Column("updatedAt", DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="accounts")


# ----------------- Application Domain Tables -----------------

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String, default="light")  # light, dark
    preferred_delivery_type = Column(String, default="standard")  # standard, express
    preferred_payment_mode = Column(String, default="cash")  # cash, upi
    preferred_payment_location = Column(String, default="sender")  # sender, receiver
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="preferences")


class Draft(Base):
    __tablename__ = "drafts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    current_step = Column(Integer, default=1)
    sender_details = Column(JSON, default=dict)
    receiver_details = Column(JSON, default=dict)
    product_details = Column(JSON, default=dict)
    payment_details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    user = relationship("User", back_populates="drafts")


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, default=generate_uuid)
    shipment_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Origin / Sender
    sender_name = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    sender_phone = Column(String, nullable=False)
    sender_address = Column(String, nullable=False)
    sender_city = Column(String, nullable=False)
    sender_state = Column(String, nullable=False)
    sender_postal_code = Column(String, nullable=False)
    sender_country = Column(String, default="United States")

    # Destination / Receiver
    receiver_name = Column(String, nullable=False)
    receiver_email = Column(String, nullable=False)
    receiver_phone = Column(String, nullable=False)
    receiver_address = Column(String, nullable=False)
    receiver_city = Column(String, nullable=False)
    receiver_state = Column(String, nullable=False)
    receiver_postal_code = Column(String, nullable=False)
    receiver_country = Column(String, default="United States")

    # Product Specifications
    product_name = Column(String, nullable=False)
    product_description = Column(Text, nullable=True)
    length = Column(Float, nullable=False, default=10.0)
    width = Column(Float, nullable=False, default=10.0)
    height = Column(Float, nullable=False, default=10.0)
    weight = Column(Float, nullable=False, default=1.0)
    product_type = Column(String, default="standard")  # standard, fragile, electronics, documents, other

    # Service & Payment
    delivery_type = Column(String, default="standard")  # standard, express
    payment_mode = Column(String, default="cash")  # cash, upi
    billing_location = Column(String, default="sender")  # sender, receiver
    total_amount = Column(Float, nullable=False, default=25.0)

    # State Machine & Tracking
    current_status = Column(String, default="created", index=True)
    estimated_delivery_time = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    user = relationship("User", back_populates="shipments")
    status_history = relationship("ShipmentStatusHistory", back_populates="shipment", cascade="all, delete-orphan", order_by="desc(ShipmentStatusHistory.timestamp)")


class ShipmentStatusHistory(Base):
    __tablename__ = "shipment_status_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    shipment_id = Column(String, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, nullable=False)
    location = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

    shipment = relationship("Shipment", back_populates="status_history")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    shipment_id = Column(String, ForeignKey("shipments.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="status_update")  # status_update, delivery, draft_saved, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)

    user = relationship("User", back_populates="notifications")
