import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


DEFAULT_CATEGORIES = [
    {"name": "Food", "icon": "🍔", "color": "#F59E0B", "type": "expense"},
    {"name": "Transport", "icon": "🚗", "color": "#3B82F6", "type": "expense"},
    {"name": "Shopping", "icon": "🛍️", "color": "#EC4899", "type": "expense"},
    {"name": "Bills", "icon": "📄", "color": "#6B7280", "type": "expense"},
    {"name": "Entertainment", "icon": "🎬", "color": "#8B5CF6", "type": "expense"},
    {"name": "Education", "icon": "📚", "color": "#10B981", "type": "expense"},
    {"name": "Health", "icon": "💊", "color": "#EF4444", "type": "expense"},
    {"name": "Travel", "icon": "✈️", "color": "#0EA5E9", "type": "expense"},
    {"name": "Rent", "icon": "🏠", "color": "#F97316", "type": "expense"},
    {"name": "Subscriptions", "icon": "📱", "color": "#7C3AED", "type": "expense"},
    {"name": "Personal Care", "icon": "💅", "color": "#DB2777", "type": "expense"},
    {"name": "Groceries", "icon": "🛒", "color": "#65A30D", "type": "expense"},
    {"name": "Other", "icon": "📦", "color": "#9CA3AF", "type": "expense"},
    {"name": "Salary", "icon": "💼", "color": "#16A34A", "type": "income"},
    {"name": "Freelance", "icon": "💻", "color": "#0D9488", "type": "income"},
    {"name": "Business", "icon": "🏢", "color": "#2563EB", "type": "income"},
    {"name": "Allowance", "icon": "🎁", "color": "#7C3AED", "type": "income"},
    {"name": "Investment", "icon": "📈", "color": "#16A34A", "type": "income"},
    {"name": "Gift", "icon": "🎀", "color": "#EC4899", "type": "income"},
    {"name": "Other Income", "icon": "💰", "color": "#F59E0B", "type": "income"},
]


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(10), nullable=True, default="📦")
    color = Column(String(20), nullable=True, default="#9CA3AF")
    type = Column(String(10), nullable=False)  # income, expense, both
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budget_categories = relationship("BudgetCategory", back_populates="category")
    recurring_expenses = relationship("RecurringExpense", back_populates="category")
