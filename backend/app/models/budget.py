"""
Budget Model

Tracks spending budgets for aquarium expenses.
Supports global (all tanks) and per-tank budgets with monthly/yearly periods.
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Text
from app.models.types import GUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tank_id = Column(GUID, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=True, index=True)

    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="EUR")
    period = Column(String, nullable=False, default="monthly")  # monthly, yearly
    category = Column(String, nullable=True)  # equipment, consumables, livestock, icp_tests, or null (all)
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="budgets")
    tank = relationship("Tank", back_populates="budgets")

    def __repr__(self):
        scope = f"Tank {self.tank_id}" if self.tank_id else "Global"
        return f"<Budget {self.name} - {self.amount} {self.currency} ({scope})>"
