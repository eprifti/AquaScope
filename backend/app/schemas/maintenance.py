"""Maintenance Reminder Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional


class MaintenanceReminderBase(BaseModel):
    """Base maintenance reminder schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    reminder_type: str = Field(..., description="water_change, pump_cleaning, etc.")
    frequency_days: int = Field(..., gt=0, description="How often in days")


class MaintenanceReminderCreate(MaintenanceReminderBase):
    """Schema for creating a maintenance reminder"""
    tank_id: UUID
    next_due: date


class MaintenanceReminderUpdate(BaseModel):
    """Schema for updating a maintenance reminder"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    reminder_type: Optional[str] = None
    frequency_days: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class MaintenanceReminderResponse(MaintenanceReminderBase):
    """Schema for maintenance reminder responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    last_completed: Optional[date]
    next_due: date
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaintenanceComplete(BaseModel):
    """Schema for marking a reminder as complete"""
    completed_date: Optional[date] = None  # Defaults to today
