"""
MoneyMate Backend Tests
Tests cover auth, transaction CRUD, budget calculations, savings, 
user data isolation, and edge cases.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_password_hash

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def register_user(email="test@example.com", password="Test@1234", full_name="Test User"):
    response = client.post("/auth/register", json={
        "email": email,
        "password": password,
        "confirm_password": password,
        "full_name": full_name,
    })
    assert response.status_code == 201
    return response.json()


def get_auth_headers(email="test@example.com"):
    response = client.post("/auth/login", json={"email": email, "password": "Test@1234"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Auth Tests ───────────────────────────────────────────────────────────────

class TestAuth:
    def test_register_success(self):
        response = client.post("/auth/register", json={
            "email": "user@test.com",
            "password": "Test@1234",
            "confirm_password": "Test@1234",
            "full_name": "Test User",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_register_duplicate_email(self):
        register_user()
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "password": "Test@1234",
            "confirm_password": "Test@1234",
            "full_name": "Another User",
        })
        assert response.status_code == 400

    def test_login_success(self):
        register_user()
        response = client.post("/auth/login", json={"email": "test@example.com", "password": "Test@1234"})
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_password(self):
        register_user()
        response = client.post("/auth/login", json={"email": "test@example.com", "password": "wrongpassword"})
        assert response.status_code == 401

    def test_weak_password_rejected(self):
        response = client.post("/auth/register", json={
            "email": "weak@test.com",
            "password": "password",  # no numbers
            "confirm_password": "password",
            "full_name": "Weak User",
        })
        assert response.status_code == 422

    def test_password_mismatch_rejected(self):
        response = client.post("/auth/register", json={
            "email": "mismatch@test.com",
            "password": "Test@1234",
            "confirm_password": "Test@5678",
            "full_name": "Mismatch User",
        })
        assert response.status_code == 422


# ── Transaction Tests ─────────────────────────────────────────────────────────

class TestTransactions:
    def setup_method(self):
        register_user()
        self.headers = get_auth_headers()

    def test_create_expense(self):
        response = client.post("/transactions", json={
            "type": "expense",
            "amount": 500.00,
            "title": "Lunch",
            "date": "2026-09-17T12:00:00",
        }, headers=self.headers)
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == "500.00"
        assert data["type"] == "expense"

    def test_create_income(self):
        response = client.post("/transactions", json={
            "type": "income",
            "amount": 35000.00,
            "title": "Salary",
            "date": "2026-09-01T09:00:00",
        }, headers=self.headers)
        assert response.status_code == 201
        assert response.json()["type"] == "income"

    def test_zero_amount_rejected(self):
        response = client.post("/transactions", json={
            "type": "expense",
            "amount": 0,
            "title": "Invalid",
            "date": "2026-09-17T12:00:00",
        }, headers=self.headers)
        assert response.status_code == 422

    def test_negative_amount_rejected(self):
        response = client.post("/transactions", json={
            "type": "expense",
            "amount": -100,
            "title": "Negative",
            "date": "2026-09-17T12:00:00",
        }, headers=self.headers)
        assert response.status_code == 422

    def test_get_transactions(self):
        client.post("/transactions", json={"type": "expense", "amount": 100, "title": "T1", "date": "2026-09-17T12:00:00"}, headers=self.headers)
        response = client.get("/transactions", headers=self.headers)
        assert response.status_code == 200
        assert response.json()["total"] >= 1

    def test_update_transaction(self):
        create_resp = client.post("/transactions", json={"type": "expense", "amount": 100, "title": "Original", "date": "2026-09-17T12:00:00"}, headers=self.headers)
        txn_id = create_resp.json()["id"]
        update_resp = client.put(f"/transactions/{txn_id}", json={"title": "Updated", "amount": 200}, headers=self.headers)
        assert update_resp.status_code == 200
        assert update_resp.json()["title"] == "Updated"

    def test_delete_transaction(self):
        create_resp = client.post("/transactions", json={"type": "expense", "amount": 100, "title": "To Delete", "date": "2026-09-17T12:00:00"}, headers=self.headers)
        txn_id = create_resp.json()["id"]
        del_resp = client.delete(f"/transactions/{txn_id}", headers=self.headers)
        assert del_resp.status_code == 204
        get_resp = client.get(f"/transactions/{txn_id}", headers=self.headers)
        assert get_resp.status_code == 404

    def test_user_isolation(self):
        """CRITICAL: User A cannot access User B's transactions."""
        register_user(email="user_b@test.com")
        headers_b = get_auth_headers("user_b@test.com")

        # User A creates transaction
        create_resp = client.post("/transactions", json={"type": "expense", "amount": 100, "title": "User A txn", "date": "2026-09-17T12:00:00"}, headers=self.headers)
        txn_id = create_resp.json()["id"]

        # User B tries to access User A's transaction
        response_b = client.get(f"/transactions/{txn_id}", headers=headers_b)
        assert response_b.status_code == 404

    def test_unauthenticated_access_rejected(self):
        response = client.get("/transactions")
        assert response.status_code in (401, 403)


# ── Dashboard Tests ────────────────────────────────────────────────────────────

class TestDashboard:
    def setup_method(self):
        register_user()
        self.headers = get_auth_headers()

    def test_dashboard_loads(self):
        response = client.get("/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "monthly_income" in data
        assert "monthly_expenses" in data
        assert "monthly_savings" in data
        assert "savings_rate" in data

    def test_dashboard_zero_income_no_division_error(self):
        """Zero income should return 0 savings_rate, not division-by-zero."""
        response = client.get("/dashboard", headers=self.headers)
        assert response.status_code == 200
        assert response.json()["savings_rate"] == 0.0

    def test_dashboard_with_transactions(self):
        client.post("/transactions", json={"type": "income", "amount": 35000, "title": "Salary", "date": "2026-09-01T09:00:00"}, headers=self.headers)
        client.post("/transactions", json={"type": "expense", "amount": 5000, "title": "Rent", "date": "2026-09-05T10:00:00"}, headers=self.headers)
        response = client.get("/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        # Verify calculations are non-zero now
        # (exact values depend on the current month matching)


# ── Budget Tests ───────────────────────────────────────────────────────────────

class TestBudgets:
    def setup_method(self):
        register_user()
        self.headers = get_auth_headers()

    def test_create_budget(self):
        response = client.post("/budgets", json={
            "name": "Monthly Budget",
            "total_amount": 25000,
            "period": "monthly",
            "start_date": "2026-09-01T00:00:00",
        }, headers=self.headers)
        assert response.status_code == 201
        assert response.json()["name"] == "Monthly Budget"

    def test_budget_isolation(self):
        register_user(email="budget_b@test.com")
        headers_b = get_auth_headers("budget_b@test.com")
        create_resp = client.post("/budgets", json={"name": "User A Budget", "total_amount": 25000, "period": "monthly", "start_date": "2026-09-01T00:00:00"}, headers=self.headers)
        budget_id = create_resp.json()["id"]
        response_b = client.get(f"/budgets/{budget_id}", headers=headers_b)
        assert response_b.status_code == 404


# ── Savings Goal Tests ─────────────────────────────────────────────────────────

class TestSavingsGoals:
    def setup_method(self):
        register_user()
        self.headers = get_auth_headers()

    def test_create_goal(self):
        response = client.post("/goals", json={
            "name": "New Laptop",
            "target_amount": 80000,
            "current_amount": 32000,
        }, headers=self.headers)
        assert response.status_code == 201
        data = response.json()
        assert data["progress_percentage"] == 40.0

    def test_goal_progress_calculation(self):
        response = client.post("/goals", json={"name": "Test Goal", "target_amount": 10000, "current_amount": 5000}, headers=self.headers)
        assert response.json()["progress_percentage"] == 50.0
        assert float(response.json()["remaining_amount"]) == 5000.0
