from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.category import Category
from app.services import analytics
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/insights", tags=["insights"])


class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    type: str

    class Config:
        from_attributes = True


@router.get("")
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    year, month = now.year, now.month

    df = analytics.get_transactions_df(db, current_user.id)

    monthly_income = analytics.calculate_monthly_income(df, year, month)
    monthly_expenses = analytics.calculate_monthly_expenses(df, year, month)
    monthly_savings = analytics.calculate_savings(monthly_income, monthly_expenses)
    savings_rate = analytics.calculate_savings_rate(monthly_income, monthly_expenses)

    category_spending = analytics.calculate_category_spending(df, year, month)
    spending_trends = analytics.calculate_spending_trends(df, months=6)
    month_comparison = analytics.calculate_month_over_month_change(df, year, month)
    avg_daily = analytics.calculate_average_daily_spending(df, year, month)
    largest = analytics.calculate_largest_expenses(df, year, month, limit=5)
    insights = analytics.generate_automatic_insights(df, year, month)
    recurring_info = analytics.calculate_recurring_expense_total(db, current_user.id)

    top_category = category_spending[0] if category_spending else None

    return {
        "current_month": now.strftime("%B %Y"),
        "monthly_income": float(monthly_income),
        "monthly_expenses": float(monthly_expenses),
        "monthly_savings": float(monthly_savings),
        "savings_rate": float(savings_rate),
        "average_daily_spending": float(avg_daily),
        "category_spending": category_spending,
        "spending_trends": spending_trends,
        "month_comparison": month_comparison,
        "largest_expenses": largest,
        "top_category": top_category,
        "recurring_expenses": recurring_info,
        "automatic_insights": insights,
    }


@router.get("/categories")
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cats = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.is_active == True,
    ).order_by(Category.is_default.desc(), Category.name.asc()).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "icon": c.icon,
            "color": c.color,
            "type": c.type,
            "is_default": c.is_default,
        }
        for c in cats
    ]
