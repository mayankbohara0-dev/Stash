import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(10), nullable=False)  # income, expense
    amount = Column(Numeric(15, 2), nullable=False)
    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    payment_method = Column(String(50), nullable=True)  # cash, upi, credit_card, debit_card, bank_transfer, other
    notes = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "date"),
        Index("idx_transactions_user_type", "user_id", "type"),
        Index("idx_transactions_user_category", "user_id", "category_id"),
    )
