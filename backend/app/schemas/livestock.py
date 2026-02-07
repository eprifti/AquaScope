"""Livestock Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional


class LivestockBase(BaseModel):
    """Base livestock schema"""
    species_name: str = Field(..., min_length=1, max_length=200)
    common_name: Optional[str] = Field(None, max_length=200)
    type: str = Field(..., description="fish, coral, invertebrate")
    notes: Optional[str] = Field(None, max_length=2000)


class LivestockCreate(LivestockBase):
    """Schema for adding livestock"""
    tank_id: UUID
    fishbase_species_id: Optional[str] = None
    added_date: Optional[date] = None


class LivestockUpdate(BaseModel):
    """Schema for updating livestock"""
    species_name: Optional[str] = Field(None, min_length=1, max_length=200)
    common_name: Optional[str] = Field(None, max_length=200)
    type: Optional[str] = None
    fishbase_species_id: Optional[str] = None
    added_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=2000)


class LivestockResponse(LivestockBase):
    """Schema for livestock responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    fishbase_species_id: Optional[str]
    added_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
