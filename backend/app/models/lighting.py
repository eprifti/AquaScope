"""
Lighting Schedule Models

Tracks LED lighting schedules per tank with per-channel intensity data.

LightingSchedule: a named light profile for a tank
  - channels: JSON array of channel definitions [{"name": "Royal blue", "color": "#0000FF"}, ...]
  - schedule_data: JSON dict mapping hours to intensity arrays {"10": [0,0,0,0,0,0], "11": [0,0,10,5,10,8], ...}
  - is_active: only one schedule per tank should be active at a time
"""
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from app.models.types import GUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class LightingSchedule(Base):
    __tablename__ = "lighting_schedules"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    tank_id = Column(GUID, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Channel definitions: [{"name": "Royal blue", "color": "#0000FF"}, ...]
    channels = Column(JSON, nullable=False)

    # Schedule data: {"10": [0,0,0,0,0,0], "11": [0,0,10,5,10,8], ...}
    # Keys are hours (0-23 as strings), values are arrays of intensity (0-100) per channel
    schedule_data = Column(JSON, nullable=False)

    is_active = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    tank = relationship("Tank", back_populates="lighting_schedules")
    owner = relationship("User")

    def __repr__(self):
        return f"<LightingSchedule {self.name}>"
