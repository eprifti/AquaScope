"""
Tank Model

Represents a reef aquarium. Users can have multiple tanks, each tracked separately.

Design Decisions:
- Separate tank entity: Allows users to manage multiple aquariums
- Volume in liters: Standardized metric unit (can be converted in UI)
- Setup date: Important for tracking tank maturity and parameter stability
- Foreign key to User: Implements multi-tenancy and data isolation

Why separate tanks from users?
- Hobbyists often maintain multiple tanks (display, quarantine, frag tanks)
- Parameters, livestock, and maintenance are tank-specific
- Allows for tank-specific analytics and comparisons
"""
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class Tank(Base):
    __tablename__ = "tanks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    volume_liters = Column(Float, nullable=True)  # Optional - not everyone measures precisely
    setup_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="tanks")
    notes = relationship("Note", back_populates="tank", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="tank", cascade="all, delete-orphan")
    maintenance_reminders = relationship("MaintenanceReminder", back_populates="tank", cascade="all, delete-orphan")
    livestock = relationship("Livestock", back_populates="tank", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tank {self.name}>"
