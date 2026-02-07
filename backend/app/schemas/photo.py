"""Photo Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class PhotoResponse(BaseModel):
    """Schema for photo responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    filename: str
    file_path: str
    thumbnail_path: Optional[str]
    description: Optional[str]
    taken_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class PhotoUpdate(BaseModel):
    """Schema for updating photo metadata"""
    description: Optional[str] = Field(None, max_length=500)
    taken_at: Optional[datetime] = None
