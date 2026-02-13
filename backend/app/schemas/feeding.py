"""Feeding Management Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class FeedingScheduleBase(BaseModel):
    """Base feeding schedule schema"""
    food_name: str = Field(..., min_length=1, max_length=200)
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = Field(None, description="cube, pinch, ml, g, sheet, drop, piece")
    frequency_hours: int = Field(24, gt=0, description="How often in hours")
    notes: Optional[str] = Field(None, max_length=1000)


class FeedingScheduleCreate(FeedingScheduleBase):
    """Schema for creating a feeding schedule"""
    tank_id: UUID
    consumable_id: Optional[UUID] = None
    next_due: Optional[datetime] = None


class FeedingScheduleUpdate(BaseModel):
    """Schema for updating a feeding schedule"""
    food_name: Optional[str] = Field(None, min_length=1, max_length=200)
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    frequency_hours: Optional[int] = Field(None, gt=0)
    consumable_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=1000)


class FeedingScheduleResponse(FeedingScheduleBase):
    """Schema for feeding schedule responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    consumable_id: Optional[UUID]
    last_fed: Optional[datetime]
    next_due: Optional[datetime]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FeedingLogBase(BaseModel):
    """Base feeding log schema"""
    food_name: str = Field(..., min_length=1, max_length=200)
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=1000)


class FeedingLogCreate(FeedingLogBase):
    """Schema for creating a feeding log entry"""
    tank_id: UUID
    schedule_id: Optional[UUID] = None
    fed_at: Optional[datetime] = None


class FeedingLogResponse(FeedingLogBase):
    """Schema for feeding log responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    schedule_id: Optional[UUID]
    fed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class FeedingOverview(BaseModel):
    """Aggregated feeding overview for a tank"""
    tank_id: UUID
    active_schedules: int
    last_fed: Optional[datetime]
    next_due: Optional[datetime]
    overdue_count: int
    recent_logs: List[FeedingLogResponse]
