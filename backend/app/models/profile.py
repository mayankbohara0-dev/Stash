import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    monthly_income = Column(Numeric(15, 2), default=0)
    monthly_essential_expenses = Column(Numeric(15, 2), default=0)
    currency = Column(String(10), default="INR")
    onboarding_completed = Column(Boolean, default=False)
    financial_goals = Column(JSON, default=list)
    savings_target = Column(Numeric(15, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="system")  # system, light, dark
    currency = Column(String(10), default="INR")
    notifications_budget = Column(Boolean, default=True)
    notifications_recurring = Column(Boolean, default=True)
    notifications_weekly_summary = Column(Boolean, default=True)
    notifications_savings = Column(Boolean, default=True)
    ai_personalization = Column(Boolean, default=True)
    budget_alert_thresholds = Column(JSON, default=lambda: [50, 75, 90, 100])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")
