from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import io
import csv

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile, UserPreferences
from app.models.transaction import Transaction
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_essential_expenses: Optional[float] = None
    currency: Optional[str] = None
    savings_target: Optional[float] = None
    onboarding_completed: Optional[bool] = None
    financial_goals: Optional[list] = None


class PreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    currency: Optional[str] = None
    notifications_budget: Optional[bool] = None
    notifications_recurring: Optional[bool] = None
    notifications_weekly_summary: Optional[bool] = None
    notifications_savings: Optional[bool] = None
    ai_personalization: Optional[bool] = None
    budget_alert_thresholds: Optional[list] = None


@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at,
        "profile": {
            "monthly_income": float(profile.monthly_income) if profile and profile.monthly_income else 0,
            "monthly_essential_expenses": float(profile.monthly_essential_expenses) if profile and profile.monthly_essential_expenses else 0,
            "currency": profile.currency if profile else "INR",
            "savings_target": float(profile.savings_target) if profile and profile.savings_target else 0,
            "onboarding_completed": profile.onboarding_completed if profile else False,
            "financial_goals": profile.financial_goals if profile else [],
        } if profile else None,
        "preferences": {
            "theme": prefs.theme if prefs else "system",
            "currency": prefs.currency if prefs else "INR",
            "notifications_budget": prefs.notifications_budget if prefs else True,
            "notifications_recurring": prefs.notifications_recurring if prefs else True,
            "notifications_weekly_summary": prefs.notifications_weekly_summary if prefs else True,
            "notifications_savings": prefs.notifications_savings if prefs else True,
            "ai_personalization": prefs.ai_personalization if prefs else True,
            "budget_alert_thresholds": prefs.budget_alert_thresholds if prefs else [50, 75, 90, 100],
        } if prefs else None,
    }


@router.put("")
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name.strip()

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        from app.models.profile import Profile as P
        import uuid
        profile = P(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(profile)

    update_fields = data.model_dump(exclude_unset=True, exclude={"full_name"})
    for field, value in update_fields.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Profile updated successfully"}


@router.put("/preferences")
def update_preferences(
    data: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    if not prefs:
        from app.models.profile import UserPreferences as UP
        import uuid
        prefs = UP(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(prefs)

    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(prefs, field, value)

    prefs.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Preferences updated successfully"}


@router.get("/export/csv")
def export_transactions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all user transactions as CSV."""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Type", "Amount", "Category", "Title", "Payment Method", "Notes"])

    for t in transactions:
        writer.writerow([
            t.date.strftime("%Y-%m-%d"),
            t.type,
            float(t.amount),
            t.category.name if t.category else "Uncategorized",
            t.title,
            t.payment_method or "",
            t.notes or "",
        ])

    output.seek(0)
    filename = f"moneymate_transactions_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.delete("/account", status_code=204)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete user account and all associated data."""
    db.delete(current_user)
    db.commit()
