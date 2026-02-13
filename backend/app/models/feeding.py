"""
Feeding Management Models

Tracks feeding schedules and feeding log events per tank.

FeedingSchedule: recurring feeding plan (e.g., "Reef Frenzy 1 cube every 12 hours")
  - Optionally linked to a Consumable (food item) for stock deduction
  - frequency_hours + last_fed + next_due for scheduling
  - is_active flag for soft disable

FeedingLog: individual feeding events
  - Can be linked to a schedule (auto-created on "Feed Now") or ad-hoc
  - Records food, quantity, timestamp, and optional notes
"""
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, Boolean
from app.models.types import GUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class FeedingSchedule(Base):
    __tablename__ = "feeding_schedules"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    tank_id = Column(GUID, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consumable_id = Column(GUID, ForeignKey("consumables.id", ondelete="SET NULL"), nullable=True, index=True)

    # Food information
    food_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=True)
    quantity_unit = Column(String, nullable=True)  # cube, pinch, ml, g, sheet, drop, piece

    # Scheduling
    frequency_hours = Column(Integer, nullable=False, default=24)
    last_fed = Column(DateTime, nullable=True)
    next_due = Column(DateTime, nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tank = relationship("Tank", back_populates="feeding_schedules")
    owner = relationship("User", back_populates="feeding_schedules")
    consumable = relationship("Consumable")
    feeding_logs = relationship("FeedingLog", back_populates="schedule", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FeedingSchedule {self.food_name} every {self.frequency_hours}h>"


class FeedingLog(Base):
    __tablename__ = "feeding_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    tank_id = Column(GUID, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    schedule_id = Column(GUID, ForeignKey("feeding_schedules.id", ondelete="SET NULL"), nullable=True, index=True)

    food_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=True)
    quantity_unit = Column(String, nullable=True)
    fed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tank = relationship("Tank", back_populates="feeding_logs")
    owner = relationship("User")
    schedule = relationship("FeedingSchedule", back_populates="feeding_logs")

    def __repr__(self):
        return f"<FeedingLog {self.food_name} at {self.fed_at}>"
