"""
Seed script for development/testing.
Creates demo data for a test user.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import random

from app.db.database import SessionLocal, engine
from app.models import *
from app.db.database import Base
from app.core.security import get_password_hash
from app.models.category import DEFAULT_CATEGORIES

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if demo user already exists
    existing = db.query(User).filter(User.email == "demo@moneymate.app").first()
    if existing:
        print("Demo user already exists. Skipping seed.")
        db.close()
        return

    print("Creating demo user...")
    user = User(
        id=str(uuid.uuid4()),
        email="demo@moneymate.app",
        hashed_password=get_password_hash("Demo@1234"),
        full_name="Mayank Sharma",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()

    # Profile
    profile = Profile(
        id=str(uuid.uuid4()),
        user_id=user.id,
        monthly_income=Decimal("35000"),
        currency="INR",
        onboarding_completed=True,
        financial_goals=["save_money", "control_spending", "build_budget"],
    )
    db.add(profile)

    # Preferences
    prefs = UserPreferences(id=str(uuid.uuid4()), user_id=user.id)
    db.add(prefs)

    # Categories
    cat_map = {}
    for cat_data in DEFAULT_CATEGORIES:
        cat = Category(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name=cat_data["name"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            type=cat_data["type"],
            is_default=True,
        )
        db.add(cat)
        cat_map[cat_data["name"]] = cat

    db.flush()

    now = datetime.utcnow()

    # Current month transactions
    def make_txn(t, amount, cat_name, title, days_ago, payment="upi"):
        return Transaction(
            id=str(uuid.uuid4()),
            user_id=user.id,
            type=t,
            amount=Decimal(str(amount)),
            category_id=cat_map.get(cat_name, cat_map.get("Other")).id if cat_map.get(cat_name) else None,
            title=title,
            date=now - timedelta(days=days_ago, hours=random.randint(0, 10)),
            payment_method=payment,
        )

    transactions = [
        # Income
        make_txn("income", 35000, "Salary", "Monthly Salary", 16, "bank_transfer"),

        # Expenses - current month
        make_txn("expense", 12000, "Rent", "Monthly Rent", 16, "bank_transfer"),
        make_txn("expense", 450, "Food", "Breakfast at cafe", 14, "upi"),
        make_txn("expense", 180, "Food", "Lunch", 14, "cash"),
        make_txn("expense", 350, "Transport", "Ola ride", 13, "upi"),
        make_txn("expense", 1200, "Shopping", "T-shirts", 12, "upi"),
        make_txn("expense", 649, "Subscriptions", "Netflix", 11, "credit_card"),
        make_txn("expense", 99, "Subscriptions", "Spotify", 11, "credit_card"),
        make_txn("expense", 2500, "Bills", "Electricity bill", 10, "upi"),
        make_txn("expense", 500, "Bills", "Internet bill", 10, "upi"),
        make_txn("expense", 800, "Food", "Grocery shopping", 9, "upi"),
        make_txn("expense", 150, "Transport", "Metro card recharge", 8, "upi"),
        make_txn("expense", 299, "Entertainment", "Movie tickets", 7, "credit_card"),
        make_txn("expense", 600, "Health", "Doctor visit", 6, "cash"),
        make_txn("expense", 1500, "Education", "Online course", 5, "credit_card"),
        make_txn("expense", 320, "Food", "Restaurant dinner", 4, "credit_card"),
        make_txn("expense", 80, "Transport", "Rickshaw", 3, "cash"),
        make_txn("expense", 450, "Personal Care", "Haircut + grooming", 3, "upi"),
        make_txn("expense", 250, "Food", "Coffee + snacks", 2, "upi"),
        make_txn("expense", 1800, "Shopping", "Electronics accessories", 1, "credit_card"),

        # Previous month
        make_txn("income", 35000, "Salary", "Monthly Salary", 46, "bank_transfer"),
        make_txn("expense", 12000, "Rent", "Monthly Rent", 46, "bank_transfer"),
        make_txn("expense", 3200, "Food", "Food expenses", 40, "upi"),
        make_txn("expense", 1500, "Transport", "Transport expenses", 38, "upi"),
        make_txn("expense", 2000, "Shopping", "Shopping", 35, "upi"),
        make_txn("expense", 3000, "Bills", "Monthly bills", 36, "upi"),
        make_txn("expense", 1200, "Entertainment", "Entertainment", 34, "credit_card"),
        make_txn("expense", 1000, "Education", "Study material", 30, "upi"),
    ]

    for t in transactions:
        db.add(t)

    db.flush()

    # Budget
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
    budget = Budget(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name="September Budget",
        total_amount=Decimal("25000"),
        period="monthly",
        start_date=start_of_month,
        is_recurring=True,
        is_active=True,
    )
    db.add(budget)
    db.flush()

    budget_cats = [
        ("Food", 5000), ("Transport", 3000), ("Shopping", 4000),
        ("Bills", 6000), ("Entertainment", 2000), ("Education", 3000),
    ]
    for cat_name, amount in budget_cats:
        if cat_map.get(cat_name):
            bc = BudgetCategory(
                id=str(uuid.uuid4()),
                budget_id=budget.id,
                category_id=cat_map[cat_name].id,
                amount=Decimal(str(amount)),
            )
            db.add(bc)

    # Savings goals
    goals = [
        SavingsGoal(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="New Laptop",
            icon="💻",
            target_amount=Decimal("80000"),
            current_amount=Decimal("32000"),
            monthly_contribution=Decimal("5000"),
            target_date=now + timedelta(days=180),
        ),
        SavingsGoal(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Emergency Fund",
            icon="🛡️",
            target_amount=Decimal("100000"),
            current_amount=Decimal("45000"),
            monthly_contribution=Decimal("3000"),
        ),
    ]
    for g in goals:
        db.add(g)

    # Recurring expenses
    recurring = [
        RecurringExpense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Netflix",
            amount=Decimal("649"),
            frequency="monthly",
            next_payment_date=now + timedelta(days=11),
            category_id=cat_map.get("Subscriptions").id if cat_map.get("Subscriptions") else None,
        ),
        RecurringExpense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Spotify",
            amount=Decimal("99"),
            frequency="monthly",
            next_payment_date=now + timedelta(days=11),
            category_id=cat_map.get("Subscriptions").id if cat_map.get("Subscriptions") else None,
        ),
        RecurringExpense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Internet Bill",
            amount=Decimal("500"),
            frequency="monthly",
            next_payment_date=now + timedelta(days=3),
            category_id=cat_map.get("Bills").id if cat_map.get("Bills") else None,
        ),
        RecurringExpense(
            id=str(uuid.uuid4()),
            user_id=user.id,
            name="Gym Membership",
            amount=Decimal("1200"),
            frequency="monthly",
            next_payment_date=now + timedelta(days=7),
            category_id=cat_map.get("Health").id if cat_map.get("Health") else None,
        ),
    ]
    for r in recurring:
        db.add(r)

    db.commit()
    print("[OK] Demo data created successfully!")
    print("   Email: demo@moneymate.app")
    print("   Password: Demo@1234")
    db.close()


if __name__ == "__main__":
    seed()
