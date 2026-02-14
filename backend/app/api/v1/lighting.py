"""
Lighting Schedule API Endpoints

Handles LED lighting schedules with per-channel intensity data and built-in presets.
"""
import json
from typing import List, Optional
from uuid import UUID
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.tank import Tank
from app.models.lighting import LightingSchedule
from app.schemas.lighting import (
    LightingScheduleCreate,
    LightingScheduleUpdate,
    LightingScheduleResponse,
)
from app.api.deps import get_current_user

router = APIRouter()

PRESETS_FILE = Path(__file__).resolve().parents[3] / "data" / "lighting-presets.json"


# ============================================================================
# Lighting Schedules
# ============================================================================

@router.post("/", response_model=LightingScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    schedule_in: LightingScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lighting schedule."""
    tank = db.query(Tank).filter(
        Tank.id == schedule_in.tank_id,
        Tank.user_id == current_user.id
    ).first()
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")

    data = schedule_in.model_dump()
    # Serialize channel defs to plain dicts for JSON column
    data["channels"] = [ch.model_dump() if hasattr(ch, "model_dump") else ch for ch in schedule_in.channels]

    schedule = LightingSchedule(**data, user_id=current_user.id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/", response_model=List[LightingScheduleResponse])
def list_schedules(
    tank_id: Optional[UUID] = Query(None, description="Filter by tank ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List lighting schedules for the current user."""
    query = db.query(LightingSchedule).filter(
        LightingSchedule.user_id == current_user.id
    )

    if tank_id:
        tank = db.query(Tank).filter(Tank.id == tank_id, Tank.user_id == current_user.id).first()
        if not tank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")
        query = query.filter(LightingSchedule.tank_id == tank_id)

    return query.order_by(LightingSchedule.created_at.desc()).all()


@router.get("/presets")
def get_presets():
    """Return built-in lighting presets from JSON file. No auth required."""
    if PRESETS_FILE.exists():
        with open(PRESETS_FILE) as f:
            return json.load(f)
    return []


@router.get("/{schedule_id}", response_model=LightingScheduleResponse)
def get_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific lighting schedule."""
    schedule = db.query(LightingSchedule).filter(
        LightingSchedule.id == schedule_id,
        LightingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighting schedule not found")
    return schedule


@router.put("/{schedule_id}", response_model=LightingScheduleResponse)
def update_schedule(
    schedule_id: UUID,
    schedule_in: LightingScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a lighting schedule."""
    schedule = db.query(LightingSchedule).filter(
        LightingSchedule.id == schedule_id,
        LightingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighting schedule not found")

    update_data = schedule_in.model_dump(exclude_unset=True)

    # Serialize channel defs if present
    if "channels" in update_data and update_data["channels"] is not None:
        update_data["channels"] = [
            ch.model_dump() if hasattr(ch, "model_dump") else ch
            for ch in schedule_in.channels
        ]

    for field, value in update_data.items():
        setattr(schedule, field, value)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a lighting schedule."""
    schedule = db.query(LightingSchedule).filter(
        LightingSchedule.id == schedule_id,
        LightingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighting schedule not found")
    db.delete(schedule)
    db.commit()
    return None


@router.post("/{schedule_id}/activate", response_model=LightingScheduleResponse)
def activate_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Activate a lighting schedule.

    Sets is_active=True for this schedule and deactivates all other
    schedules for the same tank, ensuring only one is active at a time.
    """
    schedule = db.query(LightingSchedule).filter(
        LightingSchedule.id == schedule_id,
        LightingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lighting schedule not found")

    # Deactivate all other schedules for the same tank
    db.query(LightingSchedule).filter(
        LightingSchedule.tank_id == schedule.tank_id,
        LightingSchedule.user_id == current_user.id,
        LightingSchedule.id != schedule_id
    ).update({"is_active": False})

    # Activate this one
    schedule.is_active = True

    db.commit()
    db.refresh(schedule)
    return schedule
