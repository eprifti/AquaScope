"""
AppSettings Model

Global key-value store for application-level settings.
Used for module toggles, feature flags, and other admin-configurable options.
"""
from sqlalchemy import Column, String, DateTime
from datetime import datetime

from app.database import Base


class AppSettings(Base):
    __tablename__ = "app_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<AppSettings {self.key}={self.value}>"
