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
    email_verified: bool = False
    created_at: Optional[datetime] = None
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
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ----------------- Status History Schemas -----------------
class ShipmentStatusHistoryOut(BaseModel):
    id: str
    shipment_id: str
    status: str
    location: Optional[str] = None
    note: Optional[str] = None
    timestamp: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ShipmentStatusUpdate(BaseModel):
    status: str
    location: Optional[str] = None
    note: Optional[str] = None

# ----------------- Prediction Schemas -----------------
class PredictionDetails(BaseModel):
    estimated_delivery_time: Optional[datetime] = None
    prediction_state: str = "accurate"  # accurate, preliminary, completed, indeterminate
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
    user_id: Optional[str] = "usr_demo"
    sender_name: Optional[str] = "Alex Morgan"
    sender_email: Optional[str] = "demo@onelogistics.com"
    sender_phone: Optional[str] = ""
    sender_address: Optional[str] = ""
    sender_city: Optional[str] = ""
    sender_state: Optional[str] = ""
    sender_postal_code: Optional[str] = ""
    sender_country: Optional[str] = "United States"
    receiver_name: Optional[str] = "Recipient"
    receiver_email: Optional[str] = ""
    receiver_phone: Optional[str] = ""
    receiver_address: Optional[str] = ""
    receiver_city: Optional[str] = ""
    receiver_state: Optional[str] = ""
    receiver_postal_code: Optional[str] = ""
    receiver_country: Optional[str] = "United States"
    product_name: Optional[str] = "Package"
    product_description: Optional[str] = None
    length: Optional[float] = 10.0
    width: Optional[float] = 10.0
    height: Optional[float] = 10.0
    weight: Optional[float] = 1.0
    product_type: Optional[str] = "standard"
    delivery_type: Optional[str] = "standard"
    payment_mode: Optional[str] = "cash"
    billing_location: Optional[str] = "sender"
    total_amount: Optional[float] = 25.0
    current_status: Optional[str] = "created"
    estimated_delivery_time: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ShipmentDetailResponse(ShipmentOut):
    status_history: List[ShipmentStatusHistoryOut] = []
    prediction: PredictionDetails = Field(default_factory=lambda: PredictionDetails(prediction_state="accurate", confidence_score=0.95))

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
    user_id: Optional[str] = "usr_demo"
    name: str = "Untitled Draft"
    current_step: int = 1
    sender_details: Dict[str, Any] = {}
    receiver_details: Dict[str, Any] = {}
    product_details: Dict[str, Any] = {}
    payment_details: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ----------------- Notification Schemas -----------------
class NotificationOut(BaseModel):
    id: str
    user_id: Optional[str] = "usr_demo"
    shipment_id: Optional[str] = None
    title: str = "Notification"
    message: str = ""
    type: str = "info"
    is_read: bool = False
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ----------------- Analytics Schemas -----------------
class DashboardKPIs(BaseModel):
    total_shipments: int = 0
    drafts_count: int = 0
    completed_shipments: int = 0
    in_progress_shipments: int = 0
    failed_shipments: int = 0
    total_spent: float = 0.0
    average_spent: float = 0.0
    success_rate: float = 100.0

class MonthlyShipmentsData(BaseModel):
    month: str
    count: int = 0
    delivered: int = 0
    in_transit: int = 0

class MonthlySpendingData(BaseModel):
    month: str
    amount: float = 0.0

class DistributionData(BaseModel):
    name: str
    value: int = 0
    percentage: float = 0.0

class MonthlySuccessRateData(BaseModel):
    month: str
    success_rate: float = 100.0
    total: int = 0

class AnalyticsFullResponse(BaseModel):
    kpis: DashboardKPIs
    monthly_shipments: List[MonthlyShipmentsData] = []
    monthly_spending: List[MonthlySpendingData] = []
    status_distribution: List[DistributionData] = []
    delivery_type_distribution: List[DistributionData] = []
    monthly_success_rate: List[MonthlySuccessRateData] = []

# ----------------- AI Schemas -----------------
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

AIChatRequest = ChatRequest

class StructuredRecommendation(BaseModel):
    delivery_type: str = "standard"
    product_type: str = "standard"
    payment_mode: str = "cash"
    billing_location: str = "sender"
    estimated_cost: float = 35.0
    estimated_days: str = "3-5 business days"
    handling_notes: Optional[str] = None
    product_name: Optional[str] = "Standard Parcel"
    weight: Optional[float] = 1.0

class AIChatResponse(BaseModel):
    message: str
    recommendation: Optional[StructuredRecommendation] = None

# ----------------- Simulation Response -----------------
class SimulationResponse(BaseModel):
    success: bool = True
    message: str = "Status updated"
    shipment: ShipmentOut
    previous_status: str
    new_status: str
    next_possible_status: Optional[str] = None
    notification_triggered: bool = True
    email_triggered: bool = True
    prediction: Optional[PredictionDetails] = None
