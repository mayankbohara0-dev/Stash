from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.finance import AIConversation, AIMessage
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.finance import SavingsGoal, RecurringExpense
from app.services.ai_service import get_ai_response
from app.services import analytics
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

# Rate limiting (simple in-memory, use Redis in production)
_rate_limit_store: dict = {}


class ChatRequest(BaseModel):
    message: str
    conversation_id: str = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


def build_financial_context(db: Session, user: User) -> dict:
    """
    Build structured financial context for AI.
    NEVER includes passwords, tokens, or other user's data.
    """
    now = datetime.utcnow()
    year, month = now.year, now.month

    df = analytics.get_transactions_df(db, user.id)

    monthly_income = float(analytics.calculate_monthly_income(df, year, month))
    monthly_expenses = float(analytics.calculate_monthly_expenses(df, year, month))
    monthly_savings = monthly_income - monthly_expenses
    savings_rate = analytics.calculate_savings_rate(
        analytics.calculate_monthly_income(df, year, month),
        analytics.calculate_monthly_expenses(df, year, month),
    )

    total_income_all = float(df[df["type"] == "income"]["amount"].sum()) if not df.empty else 0
    total_expenses_all = float(df[df["type"] == "expense"]["amount"].sum()) if not df.empty else 0
    total_balance = total_income_all - total_expenses_all

    category_spending = analytics.calculate_category_spending(df, year, month)
    month_comparison = analytics.calculate_month_over_month_change(df, year, month)

    # Budget status
    budget_summary = analytics.calculate_budget_utilization(db, user.id, year, month)

    # Savings goals
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == user.id,
        SavingsGoal.is_active == True,
    ).all()
    goals_data = [
        {
            "name": g.name,
            "target_amount": float(g.target_amount),
            "current_amount": float(g.current_amount),
            "progress_percentage": round(float(g.current_amount) / float(g.target_amount) * 100, 1) if float(g.target_amount) > 0 else 0,
        }
        for g in goals
    ]

    # Recurring
    recurring = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == user.id,
        RecurringExpense.is_active == True,
    ).all()
    recurring_data = [
        {
            "name": r.name,
            "amount": float(r.amount),
            "frequency": r.frequency,
            "next_payment_date": r.next_payment_date.isoformat(),
        }
        for r in recurring
    ]

    # Recent transactions
    from sqlalchemy import desc
    recent = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(desc(Transaction.date)).limit(15).all()
    recent_data = [
        {
            "type": t.type,
            "amount": float(t.amount),
            "title": t.title,
            "date": t.date.isoformat(),
            "category": t.category.name if t.category else "Other",
        }
        for t in recent
    ]

    return {
        "user_name": user.full_name,
        "currency": "INR",
        "current_month": now.strftime("%B %Y"),
        "total_balance": round(total_balance, 2),
        "monthly_income": round(monthly_income, 2),
        "monthly_expenses": round(monthly_expenses, 2),
        "monthly_savings": round(monthly_savings, 2),
        "savings_rate": float(savings_rate),
        "category_spending": category_spending,
        "budget_summary": budget_summary,
        "savings_goals": goals_data,
        "recurring_expenses": recurring_data,
        "recent_transactions": recent_data,
        "month_comparison": month_comparison,
    }


def check_rate_limit(user_id: str) -> bool:
    """Simple in-memory rate limiter. Replace with Redis in production."""
    from app.core.config import settings
    now = datetime.utcnow()
    key = f"{user_id}:{now.strftime('%Y-%m-%d-%H-%M')}"

    if key not in _rate_limit_store:
        _rate_limit_store[key] = 0

    # Cleanup old keys
    old_keys = [k for k in _rate_limit_store if k < f"{user_id}:{now.strftime('%Y-%m-%d-%H-%M')}"]
    for k in old_keys[:50]:
        _rate_limit_store.pop(k, None)

    _rate_limit_store[key] += 1
    return _rate_limit_store[key] <= settings.AI_RATE_LIMIT_PER_MINUTE


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Rate limit check
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment before asking again.",
        )

    # Sanitize input - prevent very long messages
    user_message = data.message.strip()[:1000]
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get or create conversation
    if data.conversation_id:
        conversation = db.query(AIConversation).filter(
            AIConversation.id == data.conversation_id,
            AIConversation.user_id == current_user.id,
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = AIConversation(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            title=user_message[:50],
        )
        db.add(conversation)
        db.flush()

    # Get conversation history (last 10 messages)
    history = db.query(AIMessage).filter(
        AIMessage.conversation_id == conversation.id,
    ).order_by(AIMessage.created_at.asc()).limit(20).all()

    history_list = [{"role": m.role, "content": m.content} for m in history]

    # Build financial context (safe, structured)
    financial_context = build_financial_context(db, current_user)

    # Get AI response
    ai_response = await get_ai_response(user_message, financial_context, history_list)

    # Save messages
    user_msg = AIMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="user",
        content=user_message,
    )
    db.add(user_msg)

    ai_msg = AIMessage(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response,
    )
    db.add(ai_msg)

    conversation.updated_at = datetime.utcnow()
    db.commit()

    return ChatResponse(response=ai_response, conversation_id=conversation.id)


@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id,
    ).order_by(AIConversation.updated_at.desc()).limit(20).all()
    return [{"id": c.id, "title": c.title, "updated_at": c.updated_at} for c in convs]
