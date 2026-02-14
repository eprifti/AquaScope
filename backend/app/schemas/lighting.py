"""Lighting Schedule Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any


class LightingChannelDef(BaseModel):
    """A single LED channel definition"""
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., min_length=4, max_length=9, description="Hex color code, e.g. #0000FF")


class LightingScheduleBase(BaseModel):
    """Base lighting schedule schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    channels: List[LightingChannelDef]
    schedule_data: Dict[str, List[int]]  # {"10": [0,0,60,25,55,50], ...}
    notes: Optional[str] = Field(None, max_length=2000)


class LightingScheduleCreate(LightingScheduleBase):
    """Schema for creating a lighting schedule"""
    tank_id: UUID


class LightingScheduleUpdate(BaseModel):
    """Schema for updating a lighting schedule"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    channels: Optional[List[LightingChannelDef]] = None
    schedule_data: Optional[Dict[str, List[int]]] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=2000)


class LightingScheduleResponse(LightingScheduleBase):
    """Schema for lighting schedule responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LightingPreset(BaseModel):
    """A built-in lighting preset"""
    id: str
    name: str
    description: str
    category: str  # reef, freshwater, refugium
    channels: List[LightingChannelDef]
    schedule_data: Dict[str, List[int]]
