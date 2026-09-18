"""
Financial Analytics Service
Uses Pandas to compute financial metrics from transaction data.
All calculations are scoped to a specific user.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.transaction import Transaction
from app.models.budget import Budget, BudgetCategory
from app.models.finance import SavingsGoal, RecurringExpense
from app.models.category import Category


def get_transactions_df(db: Session, user_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> pd.DataFrame:
    """Load user transactions into a Pandas DataFrame."""
    query = db.query(
        Transaction.id,
        Transaction.type,
        Transaction.amount,
        Transaction.title,
        Transaction.date,
        Transaction.payment_method,
        Transaction.category_id,
        Category.name.label("category_name"),
        Category.icon.label("category_icon"),
        Category.color.label("category_color"),
    ).outerjoin(
        Category, Transaction.category_id == Category.id
    ).filter(
        Transaction.user_id == user_id
    )

    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    rows = query.all()
    if not rows:
        return pd.DataFrame({
            "id": pd.Series(dtype="str"),
            "type": pd.Series(dtype="str"),
            "amount": pd.Series(dtype="float64"),
            "title": pd.Series(dtype="str"),
            "date": pd.Series(dtype="datetime64[ns]"),
            "payment_method": pd.Series(dtype="str"),
            "category_id": pd.Series(dtype="str"),
            "category_name": pd.Series(dtype="str"),
            "category_icon": pd.Series(dtype="str"),
            "category_color": pd.Series(dtype="str"),
        })

    df = pd.DataFrame(rows, columns=["id", "type", "amount", "title", "date", "payment_method", "category_id", "category_name", "category_icon", "category_color"])
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    df["date"] = pd.to_datetime(df["date"])
    return df


def calculate_monthly_income(df: pd.DataFrame, year: int, month: int) -> Decimal:
    """Calculate total income for a given month."""
    if df.empty:
        return Decimal("0.00")
    monthly = df[(df["date"].dt.year == year) & (df["date"].dt.month == month) & (df["type"] == "income")]
    return Decimal(str(round(monthly["amount"].sum(), 2)))


def calculate_monthly_expenses(df: pd.DataFrame, year: int, month: int) -> Decimal:
    """Calculate total expenses for a given month."""
    if df.empty:
        return Decimal("0.00")
    monthly = df[(df["date"].dt.year == year) & (df["date"].dt.month == month) & (df["type"] == "expense")]
    return Decimal(str(round(monthly["amount"].sum(), 2)))


def calculate_savings(income: Decimal, expenses: Decimal) -> Decimal:
    """Savings = Income - Expenses"""
    return income - expenses


def calculate_savings_rate(income: Decimal, expenses: Decimal) -> float:
    """Savings Rate = (Income - Expenses) / Income * 100. Returns 0 if income is 0."""
    if income == 0:
        return 0.0
    savings = income - expenses
    return round(float(savings / income * 100), 1)


def calculate_category_spending(df: pd.DataFrame, year: int, month: int) -> list:
    """Breakdown of expenses by category for a given month."""
    if df.empty:
        return []
    monthly_expenses = df[
        (df["date"].dt.year == year) &
        (df["date"].dt.month == month) &
        (df["type"] == "expense")
    ].copy()

    if monthly_expenses.empty:
        return []

    total = monthly_expenses["amount"].sum()
    if total == 0:
        return []

    category_spending = monthly_expenses.groupby(
        ["category_id", "category_name", "category_icon", "category_color"]
    )["amount"].sum().reset_index()
    category_spending = category_spending.sort_values("amount", ascending=False)

    result = []
    for _, row in category_spending.iterrows():
        percentage = round(float(row["amount"] / total * 100), 1) if total > 0 else 0
        result.append({
            "category_id": row["category_id"],
            "category_name": row["category_name"] or "Uncategorized",
            "category_icon": row["category_icon"] or "📦",
            "category_color": row["category_color"] or "#9CA3AF",
            "amount": round(float(row["amount"]), 2),
            "percentage": percentage,
        })
    return result


def calculate_month_over_month_change(df: pd.DataFrame, year: int, month: int) -> dict:
    """Compare current month vs previous month for income and expenses."""
    # Current month
    curr_income = float(calculate_monthly_income(df, year, month))
    curr_expenses = float(calculate_monthly_expenses(df, year, month))

    # Previous month
    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    prev_income = float(calculate_monthly_income(df, prev_year, prev_month))
    prev_expenses = float(calculate_monthly_expenses(df, prev_year, prev_month))

    def pct_change(current, previous):
        if previous == 0:
            return None
        return round((current - previous) / previous * 100, 1)

    return {
        "income_change": pct_change(curr_income, prev_income),
        "expense_change": pct_change(curr_expenses, prev_expenses),
        "has_previous_data": prev_income > 0 or prev_expenses > 0,
    }


def calculate_spending_trends(df: pd.DataFrame, months: int = 6) -> list:
    """Return monthly income/expense totals for the past N months."""
    if df.empty:
        return []

    now = datetime.utcnow()
    result = []
    for i in range(months - 1, -1, -1):
        month = (now.month - i - 1) % 12 + 1
        year = now.year - ((now.month - i - 1) // 12)
        income = float(calculate_monthly_income(df, year, month))
        expenses = float(calculate_monthly_expenses(df, year, month))
        result.append({
            "year": year,
            "month": month,
            "month_name": datetime(year, month, 1).strftime("%b"),
            "income": income,
            "expenses": expenses,
            "savings": income - expenses,
        })
    return result


def calculate_average_daily_spending(df: pd.DataFrame, year: int, month: int) -> Decimal:
    """Average daily spending for the month."""
    monthly_expenses = df[
        (df["date"].dt.year == year) &
        (df["date"].dt.month == month) &
        (df["type"] == "expense")
    ]
    if monthly_expenses.empty:
        return Decimal("0")

    days = monthly_expenses["date"].dt.day.max()
    if days == 0:
        return Decimal("0")
    total = monthly_expenses["amount"].sum()
    return Decimal(str(round(total / days, 2)))


def calculate_largest_expenses(df: pd.DataFrame, year: int, month: int, limit: int = 5) -> list:
    """Top N largest expenses in a month."""
    monthly_expenses = df[
        (df["date"].dt.year == year) &
        (df["date"].dt.month == month) &
        (df["type"] == "expense")
    ].copy()

    if monthly_expenses.empty:
        return []

    top = monthly_expenses.nlargest(limit, "amount")
    result = []
    for _, row in top.iterrows():
        result.append({
            "title": row["title"],
            "amount": round(float(row["amount"]), 2),
            "category": row["category_name"] or "Other",
            "date": row["date"].isoformat(),
        })
    return result


def calculate_budget_utilization(db: Session, user_id: str, year: int, month: int) -> list:
    """Calculate budget utilization per category."""
    from datetime import date
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)

    # Get active budgets
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.is_active == True,
        Budget.start_date <= end,
    ).all()

    # Get transactions for the month
    df = get_transactions_df(db, user_id, start, end)
    expense_df = df[df["type"] == "expense"]

    result = []
    for budget in budgets:
        total_spent = float(expense_df["amount"].sum()) if not expense_df.empty else 0
        budget_amount = float(budget.total_amount)
        percentage = min(round(total_spent / budget_amount * 100, 1) if budget_amount > 0 else 0, 999)

        category_results = []
        for bc in budget.categories:
            cat_spent = float(expense_df[expense_df["category_id"] == bc.category_id]["amount"].sum()) if not expense_df.empty else 0
            cat_budget = float(bc.amount)
            cat_pct = min(round(cat_spent / cat_budget * 100, 1) if cat_budget > 0 else 0, 999)
            status = "safe"
            if cat_pct >= 100:
                status = "over"
            elif cat_pct >= 75:
                status = "approaching"

            category_results.append({
                "category_id": bc.category_id,
                "category_name": bc.category.name if bc.category else "Unknown",
                "category_icon": bc.category.icon if bc.category else "📦",
                "category_color": bc.category.color if bc.category else "#9CA3AF",
                "budget_amount": cat_budget,
                "spent": cat_spent,
                "remaining": max(cat_budget - cat_spent, 0),
                "percentage_used": cat_pct,
                "status": status,
            })

        result.append({
            "budget_id": budget.id,
            "budget_name": budget.name,
            "total_amount": budget_amount,
            "total_spent": total_spent,
            "remaining": max(budget_amount - total_spent, 0),
            "percentage_used": percentage,
            "categories": category_results,
        })
    return result


def calculate_recurring_expense_total(db: Session, user_id: str) -> dict:
    """Calculate total monthly recurring expense load."""
    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == user_id,
        RecurringExpense.is_active == True,
    ).all()

    monthly_total = 0.0
    items = []
    for r in recurring:
        amount = float(r.amount)
        if r.frequency == "weekly":
            monthly_amount = amount * 4.33
        elif r.frequency == "monthly":
            monthly_amount = amount
        elif r.frequency == "quarterly":
            monthly_amount = amount / 3
        elif r.frequency == "yearly":
            monthly_amount = amount / 12
        else:
            monthly_amount = amount

        monthly_total += monthly_amount
        items.append({
            "id": r.id,
            "name": r.name,
            "amount": amount,
            "frequency": r.frequency,
            "monthly_equivalent": round(monthly_amount, 2),
            "next_payment_date": r.next_payment_date.isoformat(),
        })

    return {
        "monthly_total": round(monthly_total, 2),
        "items": items,
    }


def calculate_financial_health_score(
    savings_rate: float,
    budget_utilization_pct: float,
    has_savings_goal: bool,
    expense_stability: float,  # 0-1, lower variance is better
) -> dict:
    """
    Calculate a transparent financial health score (0-100).
    Components:
      - Savings rate (40 pts): 0% = 0, 20%+ = full
      - Budget adherence (30 pts): under budget = full
      - Goals existence (15 pts): has any savings goal
      - Spending stability (15 pts): low variance
    """
    # Savings rate score (0-40)
    savings_score = min(savings_rate / 20 * 40, 40)

    # Budget adherence (0-30): 100% utilized = 0, 0% = 30
    if budget_utilization_pct <= 80:
        budget_score = 30
    elif budget_utilization_pct <= 100:
        budget_score = 30 * (1 - (budget_utilization_pct - 80) / 20)
    else:
        budget_score = 0

    # Goals (0-15)
    goal_score = 15 if has_savings_goal else 0

    # Stability (0-15)
    stability_score = round(expense_stability * 15, 1)

    total = round(savings_score + budget_score + goal_score + stability_score)
    total = max(0, min(100, total))

    return {
        "score": total,
        "components": {
            "savings_rate": round(savings_score),
            "budget_adherence": round(budget_score),
            "goals": round(goal_score),
            "stability": round(stability_score),
        },
        "explanation": (
            "Score based on: savings rate (40pts), budget adherence (30pts), "
            "savings goals (15pts), and spending stability (15pts)."
        ),
    }


def generate_automatic_insights(df: pd.DataFrame, year: int, month: int) -> list:
    """Generate data-driven automatic insights. Never invents statistics."""
    insights = []

    if df.empty:
        return insights

    curr_income = float(calculate_monthly_income(df, year, month))
    curr_expenses = float(calculate_monthly_expenses(df, year, month))

    # Previous month
    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    prev_expenses = float(calculate_monthly_expenses(df, prev_year, prev_month))
    prev_income = float(calculate_monthly_income(df, prev_year, prev_month))

    # Category spending
    curr_cats = calculate_category_spending(df, year, month)
    prev_cats = calculate_category_spending(df, prev_year, prev_month)

    prev_cat_map = {c["category_name"]: c["amount"] for c in prev_cats}

    # Insight: spending change
    if prev_expenses > 0:
        exp_change_pct = (curr_expenses - prev_expenses) / prev_expenses * 100
        if abs(exp_change_pct) > 5:
            direction = "higher" if exp_change_pct > 0 else "lower"
            insights.append({
                "type": "spending_change",
                "text": f"Your spending is {abs(round(exp_change_pct, 1))}% {direction} than last month.",
                "value": round(exp_change_pct, 1),
                "positive": exp_change_pct < 0,
            })

    # Insight: top category change
    if curr_cats:
        top_cat = curr_cats[0]
        prev_amount = prev_cat_map.get(top_cat["category_name"], 0)
        if prev_amount > 0:
            cat_change = (top_cat["amount"] - prev_amount) / prev_amount * 100
            if abs(cat_change) > 10:
                direction = "higher" if cat_change > 0 else "lower"
                insights.append({
                    "type": "category_change",
                    "text": f"Your {top_cat['category_name']} spending is {abs(round(cat_change, 1))}% {direction} than last month.",
                    "category": top_cat["category_name"],
                    "value": round(cat_change, 1),
                    "positive": cat_change < 0,
                })

    # Insight: savings rate
    if curr_income > 0:
        savings_rate = (curr_income - curr_expenses) / curr_income * 100
        if savings_rate > 0:
            insights.append({
                "type": "savings_rate",
                "text": f"You're saving {round(savings_rate, 1)}% of your income this month — great work!",
                "value": round(savings_rate, 1),
                "positive": True,
            })
        elif curr_expenses > curr_income:
            insights.append({
                "type": "overspending",
                "text": f"Your expenses exceeded your income by ₹{round(curr_expenses - curr_income, 0):,.0f} this month.",
                "value": curr_expenses - curr_income,
                "positive": False,
            })

    return insights[:5]  # Max 5 insights
