from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    User,
    UserPreferences,
    Draft,
    Shipment,
    ShipmentStatusHistory,
    Notification
)
from app.core.security import get_password_hash
from app.prediction.delivery_estimator import DeliveryEstimator

def seed_database(db: Session):
    # 1. Check if demo user already seeded
    existing_user = db.query(User).filter(User.email == "demo@onelogistics.com").first()
    if existing_user:
        return

    now_utc = datetime.now(timezone.utc)

    # 2. Create Demo User (Alex Morgan)
    demo_user = User(
        id="usr_demo_onelogistics_001",
        name="Alex Morgan",
        email="demo@onelogistics.com",
        email_verified=True,
        image=None,
        created_at=now_utc - timedelta(days=60),
        updated_at=now_utc
    )
    db.add(demo_user)
    db.flush()

    # 3. User Preferences
    preferences = UserPreferences(
        user_id=demo_user.id,
        theme="light",
        preferred_delivery_type="express",
        preferred_payment_mode="upi",
        preferred_payment_location="sender",
        updated_at=now_utc
    )
    db.add(preferences)

    # 4. Realistic Shipments
    # Shipment 1: IN TRANSIT (Ready for the primary simulation demo: In Transit -> Out for Delivery)
    s1 = Shipment(
        id="shp_demo_001",
        shipment_number="UPS-84920194",
        user_id=demo_user.id,
        sender_name="Alex Morgan (BioLabs)",
        sender_email="demo@onelogistics.com",
        sender_phone="+1 (312) 555-0182",
        sender_address="450 N Michigan Ave, Suite 1200",
        sender_city="Chicago",
        sender_state="IL",
        sender_postal_code="60611",
        sender_country="United States",
        receiver_name="Dr. Elena Vance",
        receiver_email="elena.vance@mountsinai.org",
        receiver_phone="+1 (212) 555-0199",
        receiver_address="1425 Madison Ave, Floor 8",
        receiver_city="New York",
        receiver_state="NY",
        receiver_postal_code="10029",
        receiver_country="United States",
        product_name="Biomedical Sensor Kit & Reagents",
        product_description="Temperature-sensitive diagnostics sensors and calibration modules",
        length=25.0,
        width=20.0,
        height=15.0,
        weight=3.2,
        product_type="fragile",
        delivery_type="express",
        payment_mode="upi",
        billing_location="sender",
        total_amount=109.50,
        current_status="in_transit",
        created_at=now_utc - timedelta(hours=18),
        updated_at=now_utc - timedelta(hours=4)
    )
    db.add(s1)
    db.flush()

    # S1 Checkpoints
    h1_1 = ShipmentStatusHistory(
        shipment_id=s1.id,
        status="created",
        location="Chicago, IL",
        note="Shipment booked and initial shipping label generated",
        timestamp=now_utc - timedelta(hours=18)
    )
    h1_2 = ShipmentStatusHistory(
        shipment_id=s1.id,
        status="picked_up",
        location="Chicago Courier Logistics Depot",
        note="Cargo picked up by courier vehicle and scanned",
        timestamp=now_utc - timedelta(hours=14)
    )
    h1_3 = ShipmentStatusHistory(
        shipment_id=s1.id,
        status="in_transit",
        location="Midwest Regional Air Freight Linehaul Hub",
        note="Loaded onto express linehaul air transit to JFK Terminal 4",
        timestamp=now_utc - timedelta(hours=4)
    )
    db.add_all([h1_1, h1_2, h1_3])

    p1 = DeliveryEstimator.estimate_delivery(s1, [h1_1, h1_2, h1_3])
    s1.estimated_delivery_time = p1.estimated_delivery_time

    # Shipment 2: DELIVERED
    s2 = Shipment(
        id="shp_demo_002",
        shipment_number="UPS-19482011",
        user_id=demo_user.id,
        sender_name="Alex Morgan",
        sender_email="demo@onelogistics.com",
        sender_phone="+1 (312) 555-0182",
        sender_address="450 N Michigan Ave, Suite 1200",
        sender_city="Chicago",
        sender_state="IL",
        sender_postal_code="60611",
        sender_country="United States",
        receiver_name="Marcus Brody",
        receiver_email="mbrody@stanford.edu",
        receiver_phone="+1 (650) 555-0144",
        receiver_address="450 Jane Stanford Way",
        receiver_city="Stanford",
        receiver_state="CA",
        receiver_postal_code="94305",
        receiver_country="United States",
        product_name="Server Rack Power Enclosure",
        product_description="1U Rackmount power distributor unit",
        length=45.0,
        width=30.0,
        height=10.0,
        weight=8.5,
        product_type="electronics",
        delivery_type="standard",
        payment_mode="cash",
        billing_location="sender",
        total_amount=145.00,
        current_status="delivered",
        created_at=now_utc - timedelta(days=5),
        updated_at=now_utc - timedelta(days=2),
        estimated_delivery_time=now_utc - timedelta(days=2)
    )
    db.add(s2)
    db.flush()

    h2_1 = ShipmentStatusHistory(
        shipment_id=s2.id,
        status="created",
        location="Chicago, IL",
        note="Shipment created",
        timestamp=now_utc - timedelta(days=5)
    )
    h2_2 = ShipmentStatusHistory(
        shipment_id=s2.id,
        status="picked_up",
        location="Chicago Central Hub",
        note="Picked up by freight carrier",
        timestamp=now_utc - timedelta(days=4, hours=18)
    )
    h2_3 = ShipmentStatusHistory(
        shipment_id=s2.id,
        status="in_transit",
        location="Omaha Central Routing Center",
        note="Interstate linehaul transfer",
        timestamp=now_utc - timedelta(days=3, hours=10)
    )
    h2_4 = ShipmentStatusHistory(
        shipment_id=s2.id,
        status="out_for_delivery",
        location="Palo Alto Local Distribution Vehicle",
        note="Package loaded on local courier route",
        timestamp=now_utc - timedelta(days=2, hours=4)
    )
    h2_5 = ShipmentStatusHistory(
        shipment_id=s2.id,
        status="delivered",
        location="Stanford Receiving Dock #3",
        note="Delivered and signed by M. Brody",
        timestamp=now_utc - timedelta(days=2)
    )
    db.add_all([h2_1, h2_2, h2_3, h2_4, h2_5])

    # Shipment 3: CREATED (Ready to test created -> picked_up)
    s3 = Shipment(
        id="shp_demo_003",
        shipment_number="UPS-55928103",
        user_id=demo_user.id,
        sender_name="Alex Morgan",
        sender_email="demo@onelogistics.com",
        sender_phone="+1 (312) 555-0182",
        sender_address="450 N Michigan Ave, Suite 1200",
        sender_city="Chicago",
        sender_state="IL",
        sender_postal_code="60611",
        sender_country="United States",
        receiver_name="Sarah Connor",
        receiver_email="sconnor@cyberdyne.io",
        receiver_phone="+1 (415) 555-0177",
        receiver_address="100 Enterprise Way",
        receiver_city="San Francisco",
        receiver_state="CA",
        receiver_postal_code="94105",
        receiver_country="United States",
        product_name="Microfluidic Testing Cartridges",
        product_description="Diagnostic lab cartridges",
        length=15.0,
        width=15.0,
        height=10.0,
        weight=1.5,
        product_type="fragile",
        delivery_type="express",
        payment_mode="upi",
        billing_location="sender",
        total_amount=58.00,
        current_status="created",
        created_at=now_utc - timedelta(hours=2),
        updated_at=now_utc - timedelta(hours=2)
    )
    db.add(s3)
    db.flush()

    h3_1 = ShipmentStatusHistory(
        shipment_id=s3.id,
        status="created",
        location="Chicago, IL",
        note="Shipment digital manifest created",
        timestamp=now_utc - timedelta(hours=2)
    )
    db.add(h3_1)
    p3 = DeliveryEstimator.estimate_delivery(s3, [h3_1])
    s3.estimated_delivery_time = p3.estimated_delivery_time

    # 5. Saved Drafts
    d1 = Draft(
        id="drf_demo_001",
        user_id=demo_user.id,
        name="Austin Datacenter Expansion Hardware",
        current_step=3,
        sender_details={
            "full_name": "Alex Morgan",
            "email": "demo@onelogistics.com",
            "phone": "+1 (312) 555-0182",
            "address": "450 N Michigan Ave",
            "city": "Chicago",
            "state": "IL",
            "postal_code": "60611",
            "country": "United States"
        },
        receiver_details={
            "full_name": "David Chen (Austin Site)",
            "email": "dchen@texastech.org",
            "phone": "+1 (512) 555-0133",
            "address": "800 Brazos St, Suite 400",
            "city": "Austin",
            "state": "TX",
            "postal_code": "78701",
            "country": "United States"
        },
        product_details={
            "product_name": "Fiber Optic Switch Matrix",
            "product_description": "High-density 400G network switch modules",
            "length": 40.0,
            "width": 25.0,
            "height": 15.0,
            "weight": 6.5,
            "product_type": "electronics"
        },
        payment_details={
            "delivery_type": "express",
            "payment_mode": "upi",
            "billing_location": "sender"
        },
        created_at=now_utc - timedelta(days=1),
        updated_at=now_utc - timedelta(hours=5)
    )
    db.add(d1)

    # 6. Seed Notifications
    notif1 = Notification(
        user_id=demo_user.id,
        shipment_id=s1.id,
        title="Shipment In Transit",
        message="Shipment UPS-84920194 is in transit at Midwest Regional Air Freight Hub.",
        type="status_update",
        is_read=False,
        created_at=now_utc - timedelta(hours=4)
    )
    notif2 = Notification(
        user_id=demo_user.id,
        shipment_id=s2.id,
        title="Delivery Completed",
        message="Shipment UPS-19482011 was successfully delivered to Stanford Receiving Dock #3.",
        type="delivery",
        is_read=True,
        created_at=now_utc - timedelta(days=2)
    )
    db.add_all([notif1, notif2])

    db.commit()
    print("Database seeding completed successfully for demo account.")

