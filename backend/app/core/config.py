import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "One Logistics Experience API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database Connection
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_Her4c9KkvYfa@ep-plain-tree-az579qjq-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )

    # Groq API
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", "")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jhuieqhweiduiweuivjopopwqyugcdjioew")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Simulation Mode
    ENABLE_SHIPMENT_SIMULATION: bool = os.getenv("ENABLE_SHIPMENT_SIMULATION", "true").lower() in ("true", "1", "yes")

    # Email
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "notifications@onelogistics.com")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
