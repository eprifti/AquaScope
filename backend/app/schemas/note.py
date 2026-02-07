"""Note Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class NoteBase(BaseModel):
    """Base note schema"""
    content: str = Field(..., min_length=1, max_length=10000)


class NoteCreate(NoteBase):
    """Schema for creating a note"""
    tank_id: UUID


class NoteUpdate(BaseModel):
    """Schema for updating a note"""
    content: str = Field(..., min_length=1, max_length=10000)


class NoteResponse(NoteBase):
    """Schema for note responses"""
    id: UUID
    tank_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
