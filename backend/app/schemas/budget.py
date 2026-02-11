"""Budget Schemas"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class BudgetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    currency: str = Field(default="EUR", max_length=10)
    period: str = Field(default="monthly", description="monthly or yearly")
    category: Optional[str] = Field(None, description="equipment, consumables, livestock, icp_tests, or null for all")
    is_active: bool = True
    notes: Optional[str] = None


class BudgetCreate(BudgetBase):
    tank_id: Optional[UUID] = None


class BudgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=10)
    period: Optional[str] = None
    category: Optional[str] = None
    tank_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class BudgetResponse(BudgetBase):
    id: UUID
    user_id: UUID
    tank_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetStatus(BaseModel):
    """Budget with current spending status"""
    budget: BudgetResponse
    spent: float
    remaining: float
    percentage_used: float
    is_over_budget: bool
