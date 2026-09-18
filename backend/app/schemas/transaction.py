from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class TransactionType(str, Enum):
    income = "income"
    expense = "expense"


class PaymentMethod(str, Enum):
    cash = "cash"
    upi = "upi"
    credit_card = "credit_card"
    debit_card = "debit_card"
    bank_transfer = "bank_transfer"
    other = "other"


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: Decimal
    category_id: Optional[str] = None
    title: str
    date: datetime
    payment_method: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 99999999:
            raise ValueError("Amount is too large")
        return v

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Title is required")
        return v.strip()


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    amount: Optional[Decimal] = None
    category_id: Optional[str] = None
    title: Optional[str] = None
    date: Optional[datetime] = None
    payment_method: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class CategoryInfo(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: Decimal
    category_id: Optional[str] = None
    category: Optional[CategoryInfo] = None
    title: str
    date: datetime
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    type: Optional[TransactionType] = None
    category_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    search: Optional[str] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    sort_by: Optional[str] = "date_desc"
    page: int = 1
    page_size: int = 20


class PaginatedTransactions(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
