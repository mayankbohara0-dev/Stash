from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./moneymate.db"

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # AI Provider
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "gemini"
    AI_MODEL: str = "gemini-2.5-flash"

    # App
    APP_NAME: str = "MoneyMate"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:19006,exp://localhost:8081"

    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: str = "noreply@moneymate.app"

    # Rate Limiting
    AI_RATE_LIMIT_PER_MINUTE: int = 10
    AI_RATE_LIMIT_PER_DAY: int = 100

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        # If wildcard is in the list, return just ["*"] for FastAPI
        if "*" in origins:
            return ["*"]
        return origins

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
