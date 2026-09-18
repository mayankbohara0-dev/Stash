from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import List

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.finance import SavingsGoal, RecurringExpense
from app.models.category import Category
from app.services import analytics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Optimized single endpoint returning all dashboard data.
    Avoids N+1 queries by using Pandas for aggregation.
    """
    now = datetime.utcnow()
    year, month = now.year, now.month

    # Load all user transactions into DataFrame
    df = analytics.get_transactions_df(db, current_user.id)

    # Monthly calculations
    monthly_income = analytics.calculate_monthly_income(df, year, month)
    monthly_expenses = analytics.calculate_monthly_expenses(df, year, month)
    monthly_savings = analytics.calculate_savings(monthly_income, monthly_expenses)
    savings_rate = analytics.calculate_savings_rate(monthly_income, monthly_expenses)

    # Total balance = all-time income - all-time expenses
    total_income_all = float(df[df["type"] == "income"]["amount"].sum()) if not df.empty else 0
    total_expenses_all = float(df[df["type"] == "expense"]["amount"].sum()) if not df.empty else 0
    total_balance = total_income_all - total_expenses_all

    # Category spending
    category_spending = analytics.calculate_category_spending(df, year, month)

    # Month comparison
    month_comparison = analytics.calculate_month_over_month_change(df, year, month)

    # Spending trends (6 months)
    spending_trends = analytics.calculate_spending_trends(df, months=6)

    # Budget summary
    budget_summary = analytics.calculate_budget_utilization(db, current_user.id, year, month)

    # Savings goals
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id,
        SavingsGoal.is_active == True,
    ).all()
    goals_data = []
    for g in goals:
        target = float(g.target_amount)
        current_amt = float(g.current_amount)
        progress = round(current_amt / target * 100, 1) if target > 0 else 0
        goals_data.append({
            "id": g.id,
            "name": g.name,
            "icon": g.icon,
            "target_amount": target,
            "current_amount": current_amt,
            "progress_percentage": progress,
            "remaining_amount": max(target - current_amt, 0),
        })

    # Recurring expenses (upcoming in 30 days)
    from datetime import timedelta
    upcoming_cutoff = now + timedelta(days=30)
    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == current_user.id,
        RecurringExpense.is_active == True,
        RecurringExpense.next_payment_date <= upcoming_cutoff,
    ).order_by(RecurringExpense.next_payment_date.asc()).limit(5).all()

    recurring_data = []
    for r in recurring:
        days_until = (r.next_payment_date - now).days
        recurring_data.append({
            "id": r.id,
            "name": r.name,
            "amount": float(r.amount),
            "frequency": r.frequency,
            "next_payment_date": r.next_payment_date.isoformat(),
            "days_until_due": max(days_until, 0),
            "category_name": r.category.name if r.category else None,
            "category_icon": r.category.icon if r.category else "📱",
        })

    # Recent transactions
    from sqlalchemy import desc
    recent_txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(desc(Transaction.date)).limit(10).all()

    recent_data = []
    for t in recent_txns:
        recent_data.append({
            "id": t.id,
            "type": t.type,
            "amount": float(t.amount),
            "title": t.title,
            "date": t.date.isoformat(),
            "category_name": t.category.name if t.category else "Other",
            "category_icon": t.category.icon if t.category else "📦",
            "category_color": t.category.color if t.category else "#9CA3AF",
            "payment_method": t.payment_method,
        })

    # Auto insights
    insights = analytics.generate_automatic_insights(df, year, month)

    # Financial health score
    avg_budget_pct = (
        sum(b["percentage_used"] for b in budget_summary) / len(budget_summary)
        if budget_summary else 50.0
    )
    has_goal = len(goals_data) > 0
    health_score = analytics.calculate_financial_health_score(
        savings_rate=float(savings_rate),
        budget_utilization_pct=avg_budget_pct,
        has_savings_goal=has_goal,
        expense_stability=0.7,  # Default stability
    )

    # Average daily spending
    avg_daily = analytics.calculate_average_daily_spending(df, year, month)

    # Largest expenses
    largest = analytics.calculate_largest_expenses(df, year, month)

    return {
        "user_name": current_user.full_name,
        "current_month": now.strftime("%B %Y"),
        "current_date": now.isoformat(),

        # Financial summary
        "total_balance": round(total_balance, 2),
        "monthly_income": float(monthly_income),
        "monthly_expenses": float(monthly_expenses),
        "monthly_savings": float(monthly_savings),
        "savings_rate": float(savings_rate),

        # Comparisons
        "month_comparison": month_comparison,

        # Analytics
        "category_spending": category_spending,
        "spending_trends": spending_trends,
        "average_daily_spending": float(avg_daily),
        "largest_expenses": largest,

        # Budget
        "budget_summary": budget_summary,

        # Goals
        "savings_goals": goals_data,

        # Recurring
        "upcoming_recurring": recurring_data,

        # Recent transactions
        "recent_transactions": recent_data,

        # Insights & health
        "financial_insights": insights,
        "financial_health": health_score,
    }
