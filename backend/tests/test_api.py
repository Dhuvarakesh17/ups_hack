import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.seed.seed_data import seed_database

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_logistics.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

AUTH_HEADERS = {
    "x-user-id": "usr_demo_onelogistics_001",
    "x-user-email": "demo@onelogistics.com"
}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["simulation_enabled"] is True

def test_get_shipments():
    response = client.get("/api/shipments", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

def test_create_shipment():
    payload = {
        "sender_name": "Test Sender",
        "sender_email": "test@sender.com",
        "sender_phone": "+1234567890",
        "sender_address": "123 Test St",
        "sender_city": "Austin",
        "sender_state": "TX",
        "sender_postal_code": "78701",
        "receiver_name": "Test Receiver",
        "receiver_email": "test@receiver.com",
        "receiver_phone": "+1987654321",
        "receiver_address": "456 Destination Ave",
        "receiver_city": "Seattle",
        "receiver_state": "WA",
        "receiver_postal_code": "98101",
        "product_name": "Test Parcel Item",
        "length": 15.0,
        "width": 10.0,
        "height": 5.0,
        "weight": 2.5,
        "product_type": "standard",
        "delivery_type": "express",
        "payment_mode": "upi",
        "billing_location": "sender"
    }
    response = client.post("/api/shipments", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 201
    data = response.json()
    assert data["shipment_number"].startswith("UPS-")
    assert data["current_status"] == "created"

def test_simulate_next_status_in_transit_to_out_for_delivery():
    # Find the seeded in_transit shipment (shp_demo_001)
    response = client.post(
        "/api/shipments/shp_demo_001/simulate-next-status",
        headers=AUTH_HEADERS
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["previous_status"] == "in_transit"
    assert data["new_status"] == "out_for_delivery"
    assert data["next_possible_status"] == "delivered"
    assert data["notification_triggered"] is True
    assert data["email_triggered"] is True

def test_draft_crud_lifecycle():
    # 1. Create Draft
    create_payload = {
        "name": "Integration Test Draft",
        "current_step": 2,
        "sender_details": {"city": "Chicago", "state": "IL"},
        "receiver_details": {"city": "Miami", "state": "FL"}
    }
    create_res = client.post("/api/drafts", json=create_payload, headers=AUTH_HEADERS)
    assert create_res.status_code == 201
    draft_id = create_res.json()["id"]

    # 2. Get Draft
    get_res = client.get(f"/api/drafts/{draft_id}", headers=AUTH_HEADERS)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Integration Test Draft"

    # 3. Update Draft
    update_res = client.patch(
        f"/api/drafts/{draft_id}",
        json={"current_step": 4, "name": "Updated Test Draft"},
        headers=AUTH_HEADERS
    )
    assert update_res.status_code == 200
    assert update_res.json()["current_step"] == 4

    # 4. Delete Draft
    del_res = client.delete(f"/api/drafts/{draft_id}", headers=AUTH_HEADERS)
    assert del_res.status_code == 200

def test_analytics_dashboard():
    response = client.get("/api/analytics/dashboard", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "total_shipments" in data
    assert "success_rate" in data
    assert data["total_shipments"] >= 3

def test_user_preferences():
    response = client.get("/api/preferences", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "preferred_delivery_type" in data

    update_res = client.patch(
        "/api/preferences",
        json={"preferred_delivery_type": "express"},
        headers=AUTH_HEADERS
    )
    assert update_res.status_code == 200
    assert update_res.json()["preferred_delivery_type"] == "express"

def test_ai_assistant_chat():
    payload = {
        "messages": [
            {"role": "user", "content": "Where is my package?"}
        ]
    }
    response = client.post("/api/ai/chat", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data

def test_notifications_flow():
    response = client.get("/api/notifications", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

