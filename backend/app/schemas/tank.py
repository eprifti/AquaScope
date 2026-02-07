"""
Tank Schemas

Pydantic models for tank request/response validation.
"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional


class TankBase(BaseModel):
    """Base tank schema with common fields"""
    name: str = Field(..., min_length=1, max_length=100)
    volume_liters: Optional[float] = Field(None, gt=0)
    setup_date: Optional[date] = None


class TankCreate(TankBase):
    """Schema for creating a new tank"""
    pass


class TankUpdate(BaseModel):
    """Schema for updating a tank (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    volume_liters: Optional[float] = Field(None, gt=0)
    setup_date: Optional[date] = None


class TankResponse(TankBase):
    """Schema for tank responses"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
