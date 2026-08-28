export type ShipmentStatus = 
  | "created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delayed"
  | "exception"
  | "failed";

export type DeliveryType = "standard" | "express";
export type PaymentMode = "cash" | "upi";
export type BillingLocation = "sender" | "receiver";
export type ProductType = "standard" | "fragile" | "electronics" | "documents" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  email_verified: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: "light" | "dark";
  preferred_delivery_type: DeliveryType;
  preferred_payment_mode: PaymentMode;
  preferred_payment_location: BillingLocation;
  updated_at: string;
}

export interface ShipmentStatusHistory {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location?: string | null;
  note?: string | null;
  timestamp: string;
}

export interface PredictionDetails {
  estimated_delivery_time?: string | null;
  prediction_state: "accurate" | "preliminary" | "completed" | "indeterminate";
  confidence_score?: number | null;
  estimated_hours_remaining?: number | null;
  explanation_factors: string[];
}

export interface Shipment {
  id: string;
  shipment_number: string;
  user_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  sender_postal_code: string;
  sender_country: string;
  receiver_name: string;
  receiver_email: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  receiver_postal_code: string;
  receiver_country: string;
  product_name: string;
  product_description?: string | null;
  length: number;
  width: number;
  height: number;
  weight: number;
  product_type: ProductType;
  delivery_type: DeliveryType;
  payment_mode: PaymentMode;
  billing_location: BillingLocation;
  total_amount: number;
  current_status: ShipmentStatus;
  estimated_delivery_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentDetailResponse extends Shipment {
  status_history: ShipmentStatusHistory[];
  prediction: PredictionDetails;
}

export interface ShipmentCreatePayload {
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  sender_postal_code: string;
  sender_country: string;
  receiver_name: string;
  receiver_email: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  receiver_postal_code: string;
  receiver_country: string;
  product_name: string;
  product_description?: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  product_type: ProductType;
  delivery_type: DeliveryType;
  payment_mode: PaymentMode;
  billing_location: BillingLocation;
  total_amount?: number;
  draft_id?: string;
}

export interface Draft {
  id: string;
  user_id: string;
  name: string;
  current_step: number;
  sender_details: Record<string, any>;
  receiver_details: Record<string, any>;
  product_details: Record<string, any>;
  payment_details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DraftCreatePayload {
  name: string;
  current_step?: number;
  sender_details?: Record<string, any>;
  receiver_details?: Record<string, any>;
  product_details?: Record<string, any>;
  payment_details?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  shipment_id?: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  total_shipments: number;
  drafts_count: number;
  completed_shipments: number;
  in_progress_shipments: number;
  failed_shipments: number;
  total_spent: number;
  average_spent: number;
  success_rate: number;
}

export interface MonthlyShipmentsData {
  month: string;
  count: number;
  delivered: number;
  in_transit: number;
}

export interface MonthlySpendingData {
  month: string;
  amount: number;
}

export interface DistributionData {
  name: string;
  value: number;
  percentage: number;
}

export interface MonthlySuccessRateData {
  month: string;
  success_rate: number;
  total: number;
}

export interface AnalyticsFullResponse {
  kpis: DashboardKPIs;
  monthly_shipments: MonthlyShipmentsData[];
  monthly_spending: MonthlySpendingData[];
  status_distribution: DistributionData[];
  delivery_type_distribution: DistributionData[];
  monthly_success_rate: MonthlySuccessRateData[];
}

export interface StructuredRecommendation {
  delivery_type: DeliveryType;
  product_type: ProductType;
  payment_mode: PaymentMode;
  billing_location: BillingLocation;
  estimated_cost?: number;
  estimated_days?: string;
  handling_notes?: string;
  product_name?: string;
  weight?: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatResponse {
  message: string;
  recommendation?: StructuredRecommendation | null;
}

export interface SimulationResponse {
  success: boolean;
  message: string;
  shipment: Shipment;
  previous_status: ShipmentStatus;
  new_status: ShipmentStatus;
  next_possible_status?: ShipmentStatus | null;
  notification_triggered: boolean;
  email_triggered: boolean;
}
