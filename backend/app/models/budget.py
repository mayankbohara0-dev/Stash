import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False)
    period = Column(String(20), nullable=False, default="monthly")  # monthly, weekly, yearly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_recurring = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    alert_thresholds = Column(JSON, default=lambda: [50, 75, 90, 100])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="budgets")
    categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan")


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    budget_id = Column(String, ForeignKey("budgets.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    budget = relationship("Budget", back_populates="categories")
    category = relationship("Category", back_populates="budget_categories")
