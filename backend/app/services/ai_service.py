import json
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Shipment, Draft
from app.schemas.schemas import ChatMessage, AIChatResponse, StructuredRecommendation

logger = logging.getLogger("ai_service")

class AIService:
    @staticmethod
    def _build_system_prompt(user_id: str, db: Session) -> str:
        active_shipments = db.query(Shipment).filter(
            Shipment.user_id == user_id,
            Shipment.current_status.notin_(["delivered", "failed", "exception"])
        ).all()

        drafts = db.query(Draft).filter(Draft.user_id == user_id).all()

        shipment_context = []
        for s in active_shipments:
            shipment_context.append(
                f"- Tracking: {s.shipment_number}, Item: {s.product_name}, Status: {s.current_status}, "
                f"Route: {s.sender_city} -> {s.receiver_city}, Service: {s.delivery_type}"
            )

        draft_context = [f"- Draft: '{d.name}' (Step {d.current_step}/5)" for d in drafts]

        return f"""You are the One Logistics Experience AI Assistant.
You have real-time access to the user's active logistics records:

ACTIVE SHIPMENTS:
{chr(10).join(shipment_context) if shipment_context else 'No active shipments en route.'}

SAVED DRAFTS:
{chr(10).join(draft_context) if draft_context else 'No saved drafts.'}

INSTRUCTIONS:
1. Answer customer queries about package statuses, linehaul routes, and service options concisely and accurately.
2. If the user asks for shipping advice or describes cargo they want to send (e.g. weight, fragility, speed, destination), provide a helpful explanation AND include a structured recommendation in JSON block formatted as:
```json
{{
  "recommendation": {{
    "delivery_type": "express" or "standard",
    "product_type": "fragile", "electronics", "standard", or "documents",
    "payment_mode": "cash" or "upi",
    "billing_location": "sender" or "receiver",
    "estimated_cost": 45.0,
    "estimated_days": "1-2 days" or "3-5 days",
    "handling_notes": "Special fragile cushioning recommended",
    "product_name": "Suggested Item Name",
    "weight": 3.5
  }}
}}
```
"""

    @classmethod
    def process_chat(cls, db: Session, user_id: str, messages: List[ChatMessage]) -> AIChatResponse:
        system_prompt = cls._build_system_prompt(user_id, db)
        user_query = messages[-1].content if messages else ""

        # Try Groq API if key is present
        if settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_demo"):
            try:
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)

                groq_messages = [{"role": "system", "content": system_prompt}]
                for m in messages:
                    groq_messages.append({"role": m.role, "content": m.content})

                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=groq_messages,
                    temperature=0.3,
                    max_tokens=600
                )

                response_text = completion.choices[0].message.content
                recommendation = cls._extract_json_recommendation(response_text)
                clean_text = cls._strip_json_block(response_text)

                return AIChatResponse(
                    message=clean_text,
                    recommendation=recommendation
                )
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Falling back to rule-based logistics intelligence.")

        # Intelligent Rule-Based Logistics Assistant Fallback
        return cls._rule_based_fallback(db, user_id, user_query)

    @classmethod
    def _rule_based_fallback(cls, db: Session, user_id: str, query: str) -> AIChatResponse:
        q = query.lower()
        shipments = db.query(Shipment).filter(Shipment.user_id == user_id).all()
        active = [s for s in shipments if s.current_status not in ("delivered", "failed", "exception")]

        # Query tracking status
        if any(k in q for k in ["where", "status", "track", "latest", "active", "package"]):
            if active:
                latest = active[0]
                return AIChatResponse(
                    message=f"Your active shipment **{latest.shipment_number}** ({latest.product_name}) is currently **{latest.current_status.replace('_', ' ').upper()}**.\n\n"
                            f"• **Origin:** {latest.sender_city}, {latest.sender_state}\n"
                            f"• **Destination:** {latest.receiver_city}, {latest.receiver_state}\n"
                            f"• **Service:** {latest.delivery_type.capitalize()} Linehaul\n\n"
                            f"You can view real-time milestone checkpoints or simulate the next carrier stage from your dashboard."
                )
            else:
                return AIChatResponse(
                    message="You currently have no active packages in transit. All previous shipments have been delivered."
                )

        # Shipping Recommendations
        is_fragile = any(k in q for k in ["fragile", "glass", "sensor", "lens", "delicate", "camera"])
        is_express = any(k in q for k in ["fast", "quick", "urgent", "express", "overnight", "priority", "rush"])
        
        product_type = "fragile" if is_fragile else ("electronics" if "laptop" in q or "phone" in q else "standard")
        delivery_type = "express" if is_express else "standard"
        cost = 68.50 if delivery_type == "express" else 34.00

        rec = StructuredRecommendation(
            delivery_type=delivery_type,
            product_type=product_type,
            payment_mode="cash",
            billing_location="sender",
            estimated_cost=cost,
            estimated_days="1-2 business days" if delivery_type == "express" else "3-5 business days",
            handling_notes="Air cushion reinforcement & tamper-evident seal applied." if is_fragile else "Standard parcel sorting and scanning.",
            product_name="Fragile Equipment" if is_fragile else "Standard Parcel",
            weight=3.5
        )

        return AIChatResponse(
            message=f"Based on your specifications, I recommend **{delivery_type.upper()} Linehaul** with **{product_type.upper()}** classification.\n\n"
                    f"• **Estimated Transit:** {rec.estimated_days}\n"
                    f"• **Estimated Freight:** ${rec.estimated_cost:.2f}\n"
                    f"• **Handling:** {rec.handling_notes}\n\n"
                    f"Click **[ Proceed to Shipment ]** below to load this plan into your 5-step booking wizard.",
            recommendation=rec
        )

    @staticmethod
    def _extract_json_recommendation(text: str) -> Optional[StructuredRecommendation]:
        try:
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
                data = json.loads(json_str)
                rec_data = data.get("recommendation", data)
                return StructuredRecommendation(**rec_data)
        except Exception:
            pass
        return None

    @staticmethod
    def _strip_json_block(text: str) -> str:
        if "```json" in text:
            parts = text.split("```json")
            after = parts[1].split("```", 1)[1] if "```" in parts[1] else ""
            return (parts[0] + after).strip()
        return text

