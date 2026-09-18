from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import Optional
from datetime import datetime
from decimal import Decimal
import math

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse,
    PaginatedTransactions, CategoryInfo
)
import uuid

router = APIRouter(prefix="/transactions", tags=["transactions"])


def transaction_to_response(t: Transaction) -> TransactionResponse:
    cat = None
    if t.category:
        cat = CategoryInfo(
            id=t.category.id,
            name=t.category.name,
            icon=t.category.icon,
            color=t.category.color,
        )
    return TransactionResponse(
        id=t.id,
        type=t.type,
        amount=t.amount,
        category_id=t.category_id,
        category=cat,
        title=t.title,
        date=t.date,
        payment_method=t.payment_method,
        notes=t.notes,
        receipt_url=t.receipt_url,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.get("", response_model=PaginatedTransactions)
def get_transactions(
    type: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    payment_method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    sort_by: str = Query("date_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if search:
        query = query.filter(
            or_(
                Transaction.title.ilike(f"%{search}%"),
                Transaction.notes.ilike(f"%{search}%"),
            )
        )
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Sorting
    sort_map = {
        "date_desc": desc(Transaction.date),
        "date_asc": asc(Transaction.date),
        "amount_desc": desc(Transaction.amount),
        "amount_asc": asc(Transaction.amount),
    }
    query = query.order_by(sort_map.get(sort_by, desc(Transaction.date)))

    total = query.count()
    offset = (page - 1) * page_size
    transactions = query.offset(offset).limit(page_size).all()

    return PaginatedTransactions(
        transactions=[transaction_to_response(t) for t in transactions],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate category belongs to user
    if data.category_id:
        cat = db.query(Category).filter(
            Category.id == data.category_id,
            Category.user_id == current_user.id,
        ).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category")

    t = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=data.type,
        amount=data.amount,
        category_id=data.category_id,
        title=data.title,
        date=data.date,
        payment_method=data.payment_method,
        notes=data.notes,
        receipt_url=data.receipt_url,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return transaction_to_response(t)


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,  # SECURITY: user_id from JWT
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction_to_response(t)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if data.category_id is not None:
        cat = db.query(Category).filter(
            Category.id == data.category_id,
            Category.user_id == current_user.id,
        ).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(t, field, value)

    t.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(t)
    return transaction_to_response(t)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id,
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(t)
    db.commit()
