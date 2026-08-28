from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ----------------- User & Auth Schemas -----------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None

class UserOut(UserBase):
    id: str
    email_verified: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

# ----------------- Preferences Schemas -----------------
class UserPreferencesBase(BaseModel):
    theme: str = "light"
    preferred_delivery_type: str = "standard"
    preferred_payment_mode: str = "cash"
    preferred_payment_location: str = "sender"

class UserPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    preferred_delivery_type: Optional[str] = None
    preferred_payment_mode: Optional[str] = None
    preferred_payment_location: Optional[str] = None

class UserPreferencesOut(UserPreferencesBase):
    id: str
    user_id: str
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Status History Schemas -----------------
class ShipmentStatusHistoryOut(BaseModel):
    id: str
    shipment_id: str
    status: str
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class ShipmentStatusUpdate(BaseModel):
    status: str
    location: Optional[str] = None
    note: Optional[str] = None

# ----------------- Prediction Schemas -----------------
class PredictionDetails(BaseModel):
    estimated_delivery_time: Optional[datetime] = None
    prediction_state: str  # accurate, preliminary, completed, indeterminate
    confidence_score: Optional[float] = None
    estimated_hours_remaining: Optional[float] = None
    explanation_factors: List[str] = []

# ----------------- Shipment Schemas -----------------
class ShipmentCreate(BaseModel):
    sender_name: str
    sender_email: EmailStr
    sender_phone: str
    sender_address: str
    sender_city: str
    sender_state: str
    sender_postal_code: str
    sender_country: str = "United States"

    receiver_name: str
    receiver_email: EmailStr
    receiver_phone: str
    receiver_address: str
    receiver_city: str
    receiver_state: str
    receiver_postal_code: str
    receiver_country: str = "United States"

    product_name: str
    product_description: Optional[str] = None
    length: float = 10.0
    width: float = 10.0
    height: float = 10.0
    weight: float = 1.0
    product_type: str = "standard"

    delivery_type: str = "standard"
    payment_mode: str = "cash"
    billing_location: str = "sender"
    total_amount: Optional[float] = None
    draft_id: Optional[str] = None

class ShipmentOut(BaseModel):
    id: str
    shipment_number: str
    user_id: str
    sender_name: str
    sender_email: str
    sender_phone: str
    sender_address: str
    sender_city: str
    sender_state: str
    sender_postal_code: str
    sender_country: str
    receiver_name: str
    receiver_email: str
    receiver_phone: str
    receiver_address: str
    receiver_city: str
    receiver_state: str
    receiver_postal_code: str
    receiver_country: str
    product_name: str
    product_description: Optional[str] = None
    length: float
    width: float
    height: float
    weight: float
    product_type: str
    delivery_type: str
    payment_mode: str
    billing_location: str
    total_amount: float
    current_status: str
    estimated_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ShipmentDetailResponse(ShipmentOut):
    status_history: List[ShipmentStatusHistoryOut] = []
    prediction: PredictionDetails

# ----------------- Draft Schemas -----------------
class DraftCreate(BaseModel):
    name: str
    current_step: int = 1
    sender_details: Optional[Dict[str, Any]] = None
    receiver_details: Optional[Dict[str, Any]] = None
    product_details: Optional[Dict[str, Any]] = None
    payment_details: Optional[Dict[str, Any]] = None

class DraftUpdate(BaseModel):
    name: Optional[str] = None
    current_step: Optional[int] = None
    sender_details: Optional[Dict[str, Any]] = None
    receiver_details: Optional[Dict[str, Any]] = None
    product_details: Optional[Dict[str, Any]] = None
    payment_details: Optional[Dict[str, Any]] = None

class DraftOut(BaseModel):
    id: str
    user_id: str
    name: str
    current_step: int
    sender_details: Dict[str, Any]
    receiver_details: Dict[str, Any]
    product_details: Dict[str, Any]
    payment_details: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Notification Schemas -----------------
class NotificationOut(BaseModel):
    id: str
    user_id: str
    shipment_id: Optional[str] = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Analytics Schemas -----------------
class DashboardKPIs(BaseModel):
    total_shipments: int
    drafts_count: int
    completed_shipments: int
    in_progress_shipments: int
    failed_shipments: int
    total_spent: float
    average_spent: float
    success_rate: float

class MonthlyShipmentsData(BaseModel):
    month: str
    count: int
    delivered: int
    in_transit: int

class MonthlySpendingData(BaseModel):
    month: str
    amount: float

class DistributionData(BaseModel):
    name: str
    value: int
    percentage: float

class MonthlySuccessRateData(BaseModel):
    month: str
    success_rate: float
    total: int

class AnalyticsFullResponse(BaseModel):
    kpis: DashboardKPIs
    monthly_shipments: List[MonthlyShipmentsData]
    monthly_spending: List[MonthlySpendingData]
    status_distribution: List[DistributionData]
    delivery_type_distribution: List[DistributionData]
    monthly_success_rate: List[MonthlySuccessRateData]

# ----------------- AI Schemas -----------------
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class AIChatRequest(BaseModel):
    messages: List[ChatMessage]

class StructuredRecommendation(BaseModel):
    delivery_type: str = "standard"
    product_type: str = "standard"
    payment_mode: str = "cash"
    billing_location: str = "sender"
    estimated_cost: Optional[float] = None
    estimated_days: Optional[str] = None
    handling_notes: Optional[str] = None
    product_name: Optional[str] = None
    weight: Optional[float] = None

class AIChatResponse(BaseModel):
    message: str
    recommendation: Optional[StructuredRecommendation] = None

class SimulationResponse(BaseModel):
    success: bool
    message: str
    shipment: ShipmentOut
    previous_status: str
    new_status: str
    next_possible_status: Optional[str] = None
    notification_triggered: bool = True
    email_triggered: bool = True

