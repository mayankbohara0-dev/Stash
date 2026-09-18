from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List
import uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.finance import SavingsGoal, RecurringExpense
from app.models.category import Category
from app.schemas.finance import (
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse,
    RecurringExpenseCreate, RecurringExpenseUpdate, RecurringExpenseResponse
)

router = APIRouter(tags=["finance"])

# ── Savings Goals ────────────────────────────────────────────────────────────

goals_router = APIRouter(prefix="/goals")


def goal_to_response(g: SavingsGoal) -> SavingsGoalResponse:
    target = float(g.target_amount)
    current = float(g.current_amount)
    progress = round(current / target * 100, 1) if target > 0 else 0
    remaining = max(target - current, 0)
    return SavingsGoalResponse(
        id=g.id,
        name=g.name,
        icon=g.icon,
        target_amount=g.target_amount,
        current_amount=g.current_amount,
        monthly_contribution=g.monthly_contribution,
        target_date=g.target_date,
        notes=g.notes,
        is_completed=g.is_completed,
        progress_percentage=progress,
        remaining_amount=Decimal(str(round(remaining, 2))),
        created_at=g.created_at,
    )


@goals_router.get("", response_model=List[SavingsGoalResponse])
def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id,
        SavingsGoal.is_active == True,
    ).order_by(SavingsGoal.created_at.desc()).all()
    return [goal_to_response(g) for g in goals]


@goals_router.post("", response_model=SavingsGoalResponse, status_code=201)
def create_goal(data: SavingsGoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = SavingsGoal(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        icon=data.icon or "🎯",
        target_amount=data.target_amount,
        current_amount=data.current_amount or Decimal("0"),
        monthly_contribution=data.monthly_contribution or Decimal("0"),
        target_date=data.target_date,
        notes=data.notes,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal_to_response(goal)


@goals_router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_goal(goal_id: str, data: SavingsGoalUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(goal)
    return goal_to_response(goal)


@goals_router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()


# ── Recurring Expenses ───────────────────────────────────────────────────────

recurring_router = APIRouter(prefix="/recurring")


def recurring_to_response(r: RecurringExpense) -> RecurringExpenseResponse:
    days_until = (r.next_payment_date - datetime.utcnow()).days
    return RecurringExpenseResponse(
        id=r.id,
        name=r.name,
        amount=r.amount,
        frequency=r.frequency,
        next_payment_date=r.next_payment_date,
        category_id=r.category_id,
        category_name=r.category.name if r.category else None,
        category_icon=r.category.icon if r.category else None,
        notes=r.notes,
        is_active=r.is_active,
        days_until_due=max(days_until, 0),
        created_at=r.created_at,
    )


@recurring_router.get("", response_model=List[RecurringExpenseResponse])
def get_recurring(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(RecurringExpense).filter(
        RecurringExpense.user_id == current_user.id,
        RecurringExpense.is_active == True,
    ).order_by(RecurringExpense.next_payment_date.asc()).all()
    return [recurring_to_response(r) for r in items]


@recurring_router.post("", response_model=RecurringExpenseResponse, status_code=201)
def create_recurring(data: RecurringExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.category_id:
        cat = db.query(Category).filter(Category.id == data.category_id, Category.user_id == current_user.id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category")

    r = RecurringExpense(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        amount=data.amount,
        frequency=data.frequency,
        next_payment_date=data.next_payment_date,
        category_id=data.category_id,
        notes=data.notes,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return recurring_to_response(r)


@recurring_router.put("/{recurring_id}", response_model=RecurringExpenseResponse)
def update_recurring(recurring_id: str, data: RecurringExpenseUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(RecurringExpense).filter(RecurringExpense.id == recurring_id, RecurringExpense.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    r.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(r)
    return recurring_to_response(r)


@recurring_router.delete("/{recurring_id}", status_code=204)
def delete_recurring(recurring_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(RecurringExpense).filter(RecurringExpense.id == recurring_id, RecurringExpense.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    db.delete(r)
    db.commit()
