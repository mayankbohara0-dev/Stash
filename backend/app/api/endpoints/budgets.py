from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import List
import uuid

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.budget import Budget, BudgetCategory
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.finance import (
    BudgetCreate, BudgetUpdate, BudgetResponse, BudgetCategoryResponse
)

router = APIRouter(prefix="/budgets", tags=["budgets"])


def get_budget_with_spending(budget: Budget, db: Session, user_id: str) -> BudgetResponse:
    """Calculate spending for budget period and return enriched response."""
    # Calculate spending for the budget period
    start = budget.start_date
    end = budget.end_date or datetime.utcnow()

    expenses = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start,
        Transaction.date <= end,
    ).all()

    total_spent = sum(float(e.amount) for e in expenses)
    budget_amount = float(budget.total_amount)
    pct = min(round(total_spent / budget_amount * 100, 1) if budget_amount > 0 else 0, 999)

    # Category budgets
    category_responses = []
    for bc in budget.categories:
        cat_spent = sum(float(e.amount) for e in expenses if e.category_id == bc.category_id)
        cat_budget = float(bc.amount)
        cat_pct = min(round(cat_spent / cat_budget * 100, 1) if cat_budget > 0 else 0, 999)
        status = "safe"
        if cat_pct >= 100:
            status = "over"
        elif cat_pct >= 75:
            status = "approaching"

        category_responses.append(BudgetCategoryResponse(
            id=bc.id,
            category_id=bc.category_id,
            category_name=bc.category.name if bc.category else "Unknown",
            category_icon=bc.category.icon if bc.category else "📦",
            category_color=bc.category.color if bc.category else "#9CA3AF",
            amount=bc.amount,
            spent=Decimal(str(round(cat_spent, 2))),
            remaining=Decimal(str(max(cat_budget - cat_spent, 0))),
            percentage_used=cat_pct,
            status=status,
        ))

    return BudgetResponse(
        id=budget.id,
        name=budget.name,
        total_amount=budget.total_amount,
        period=budget.period,
        start_date=budget.start_date,
        end_date=budget.end_date,
        is_recurring=budget.is_recurring,
        is_active=budget.is_active,
        total_spent=Decimal(str(round(total_spent, 2))),
        remaining=Decimal(str(max(budget_amount - total_spent, 0))),
        percentage_used=pct,
        categories=category_responses,
        created_at=budget.created_at,
    )


@router.get("", response_model=List[BudgetResponse])
def get_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True,
    ).order_by(Budget.created_at.desc()).all()

    return [get_budget_with_spending(b, db, current_user.id) for b in budgets]


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = Budget(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=data.name,
        total_amount=data.total_amount,
        period=data.period,
        start_date=data.start_date,
        end_date=data.end_date,
        is_recurring=data.is_recurring,
    )
    db.add(budget)
    db.flush()

    if data.categories:
        for cat_data in data.categories:
            # Validate category belongs to user
            cat = db.query(Category).filter(
                Category.id == cat_data.category_id,
                Category.user_id == current_user.id,
            ).first()
            if not cat:
                raise HTTPException(status_code=400, detail=f"Invalid category: {cat_data.category_id}")

            bc = BudgetCategory(
                id=str(uuid.uuid4()),
                budget_id=budget.id,
                category_id=cat_data.category_id,
                amount=cat_data.amount,
            )
            db.add(bc)

    db.commit()
    db.refresh(budget)
    return get_budget_with_spending(budget, db, current_user.id)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return get_budget_with_spending(budget, db, current_user.id)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    data: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    update_data = data.model_dump(exclude_unset=True, exclude={"categories"})
    for field, value in update_data.items():
        setattr(budget, field, value)

    if data.categories is not None:
        # Remove existing category budgets and re-add
        db.query(BudgetCategory).filter(BudgetCategory.budget_id == budget_id).delete()
        for cat_data in data.categories:
            bc = BudgetCategory(
                id=str(uuid.uuid4()),
                budget_id=budget.id,
                category_id=cat_data.category_id,
                amount=cat_data.amount,
            )
            db.add(bc)

    budget.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(budget)
    return get_budget_with_spending(budget, db, current_user.id)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
