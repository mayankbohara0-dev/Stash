from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class BudgetPeriod(str, Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class BudgetCategoryCreate(BaseModel):
    category_id: str
    amount: Decimal

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Budget amount must be greater than 0")
        return v


class BudgetCreate(BaseModel):
    name: str
    total_amount: Decimal
    period: BudgetPeriod = BudgetPeriod.monthly
    start_date: datetime
    end_date: Optional[datetime] = None
    is_recurring: bool = True
    categories: Optional[List[BudgetCategoryCreate]] = None

    @field_validator("total_amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Budget amount must be greater than 0")
        return v


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    total_amount: Optional[Decimal] = None
    period: Optional[BudgetPeriod] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    categories: Optional[List[BudgetCategoryCreate]] = None


class BudgetCategoryResponse(BaseModel):
    id: str
    category_id: str
    category_name: str
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    amount: Decimal
    spent: Decimal = Decimal("0")
    remaining: Decimal = Decimal("0")
    percentage_used: float = 0.0
    status: str = "safe"  # safe, approaching, over

    class Config:
        from_attributes = True


class BudgetResponse(BaseModel):
    id: str
    name: str
    total_amount: Decimal
    period: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_recurring: bool
    is_active: bool
    total_spent: Decimal = Decimal("0")
    remaining: Decimal = Decimal("0")
    percentage_used: float = 0.0
    categories: List[BudgetCategoryResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class SavingsGoalCreate(BaseModel):
    name: str
    icon: Optional[str] = "🎯"
    target_amount: Decimal
    current_amount: Optional[Decimal] = Decimal("0")
    monthly_contribution: Optional[Decimal] = Decimal("0")
    target_date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("target_amount")
    @classmethod
    def validate_target(cls, v):
        if v <= 0:
            raise ValueError("Target amount must be greater than 0")
        return v


class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    target_amount: Optional[Decimal] = None
    current_amount: Optional[Decimal] = None
    monthly_contribution: Optional[Decimal] = None
    target_date: Optional[datetime] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None


class SavingsGoalResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    target_amount: Decimal
    current_amount: Decimal
    monthly_contribution: Decimal
    target_date: Optional[datetime] = None
    notes: Optional[str] = None
    is_completed: bool
    progress_percentage: float = 0.0
    remaining_amount: Decimal = Decimal("0")
    created_at: datetime

    class Config:
        from_attributes = True


class FrequencyEnum(str, Enum):
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class RecurringExpenseCreate(BaseModel):
    name: str
    amount: Decimal
    frequency: FrequencyEnum
    next_payment_date: datetime
    category_id: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class RecurringExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    frequency: Optional[FrequencyEnum] = None
    next_payment_date: Optional[datetime] = None
    category_id: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class RecurringExpenseResponse(BaseModel):
    id: str
    name: str
    amount: Decimal
    frequency: str
    next_payment_date: datetime
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    days_until_due: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
