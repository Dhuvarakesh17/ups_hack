import pytest
from app.models.models import Shipment, ShipmentStatusHistory
from app.prediction.feature_extractor import FeatureExtractor
from app.prediction.delivery_estimator import DeliveryEstimator

def test_null_dimension_handling():
    s = Shipment(
        id="test-null-id",
        shipment_number="SHP-NULL-001",
        user_id="usr_demo",
        sender_name="Sender",
        sender_email="sender@test.com",
        sender_phone="1234567890",
        sender_address="123 Main St",
        sender_city="New York",
        sender_state="NY",
        sender_postal_code="10001",
        receiver_name="Receiver",
        receiver_email="receiver@test.com",
        receiver_phone="1234567890",
        receiver_address="456 Elm St",
        receiver_city="Boston",
        receiver_state="MA",
        receiver_postal_code="02101",
        product_name="Null Dimension Item",
        length=None,
        width=None,
        height=None,
        weight=None,
        total_amount=None,
        current_status="in_transit"
    )
    history = [ShipmentStatusHistory(id="h1", shipment_id=s.id, status="in_transit")]
    
    # Extract features must not crash with None
    features = FeatureExtractor.extract_features(s, history)
    assert features["billable_weight"] >= 1.0

    # Prediction must not crash with None
    prediction = DeliveryEstimator.estimate_delivery(s, history)
    assert prediction.confidence_score is not None
    assert prediction.estimated_hours_remaining is not None

