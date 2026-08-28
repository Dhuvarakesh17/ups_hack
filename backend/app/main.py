from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.seed.seed_data import seed_database

# API Routers
from app.api.shipments import router as shipments_router
from app.api.simulation import router as simulation_router
from app.api.drafts import router as drafts_router
from app.api.analytics import router as analytics_router
from app.api.preferences import router as preferences_router
from app.api.profile import router as profile_router
from app.api.notifications import router as notifications_router
from app.api.ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables & seed demo data on startup
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE shipments ALTER COLUMN sender_details DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE shipments ALTER COLUMN receiver_details DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE shipments ALTER COLUMN product_details DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE shipments ALTER COLUMN amount DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE shipments ALTER COLUMN prediction_state DROP NOT NULL;"))
            conn.commit()
    except Exception:
        pass

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware for Next.js App Router (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(shipments_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(drafts_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(preferences_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "simulation_enabled": settings.ENABLE_SHIPMENT_SIMULATION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

