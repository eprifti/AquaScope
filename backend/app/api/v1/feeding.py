"""
Feeding Management API Endpoints

Handles feeding schedules and feeding log events.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.tank import Tank
from app.models.feeding import FeedingSchedule, FeedingLog
from app.models.consumable import Consumable, ConsumableUsage
from app.schemas.feeding import (
    FeedingScheduleCreate,
    FeedingScheduleUpdate,
    FeedingScheduleResponse,
    FeedingLogCreate,
    FeedingLogResponse,
    FeedingOverview,
)
from app.api.deps import get_current_user

router = APIRouter()


# ============================================================================
# Feeding Schedules
# ============================================================================

@router.post("/schedules", response_model=FeedingScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    schedule_in: FeedingScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new feeding schedule."""
    tank = db.query(Tank).filter(
        Tank.id == schedule_in.tank_id,
        Tank.user_id == current_user.id
    ).first()
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")

    # Verify consumable ownership if provided
    if schedule_in.consumable_id:
        consumable = db.query(Consumable).filter(
            Consumable.id == schedule_in.consumable_id,
            Consumable.user_id == current_user.id
        ).first()
        if not consumable:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consumable not found")

    data = schedule_in.model_dump()
    # Set default next_due if not provided
    if not data.get("next_due"):
        data["next_due"] = datetime.utcnow() + timedelta(hours=schedule_in.frequency_hours)

    schedule = FeedingSchedule(**data, user_id=current_user.id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/schedules", response_model=List[FeedingScheduleResponse])
def list_schedules(
    tank_id: Optional[UUID] = Query(None, description="Filter by tank ID"),
    active_only: bool = Query(True, description="Show only active schedules"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List feeding schedules."""
    query = db.query(FeedingSchedule).filter(
        FeedingSchedule.user_id == current_user.id
    )

    if tank_id:
        tank = db.query(Tank).filter(Tank.id == tank_id, Tank.user_id == current_user.id).first()
        if not tank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")
        query = query.filter(FeedingSchedule.tank_id == tank_id)

    if active_only:
        query = query.filter(FeedingSchedule.is_active == True)

    return query.order_by(FeedingSchedule.next_due).all()


@router.get("/schedules/{schedule_id}", response_model=FeedingScheduleResponse)
def get_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific feeding schedule."""
    schedule = db.query(FeedingSchedule).filter(
        FeedingSchedule.id == schedule_id,
        FeedingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feeding schedule not found")
    return schedule


@router.put("/schedules/{schedule_id}", response_model=FeedingScheduleResponse)
def update_schedule(
    schedule_id: UUID,
    schedule_in: FeedingScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a feeding schedule."""
    schedule = db.query(FeedingSchedule).filter(
        FeedingSchedule.id == schedule_id,
        FeedingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feeding schedule not found")

    update_data = schedule_in.model_dump(exclude_unset=True)

    # Verify consumable ownership if changing
    if "consumable_id" in update_data and update_data["consumable_id"]:
        consumable = db.query(Consumable).filter(
            Consumable.id == update_data["consumable_id"],
            Consumable.user_id == current_user.id
        ).first()
        if not consumable:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consumable not found")

    for field, value in update_data.items():
        setattr(schedule, field, value)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a feeding schedule."""
    schedule = db.query(FeedingSchedule).filter(
        FeedingSchedule.id == schedule_id,
        FeedingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feeding schedule not found")
    db.delete(schedule)
    db.commit()
    return None


@router.post("/schedules/{schedule_id}/feed", response_model=FeedingLogResponse)
def mark_fed(
    schedule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a feeding schedule as fed.

    - Updates last_fed and next_due on the schedule
    - Creates a feeding log entry
    - If linked to a consumable, creates a ConsumableUsage record to deduct stock
    """
    schedule = db.query(FeedingSchedule).filter(
        FeedingSchedule.id == schedule_id,
        FeedingSchedule.user_id == current_user.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feeding schedule not found")

    now = datetime.utcnow()

    # Update schedule timing
    schedule.last_fed = now
    schedule.next_due = now + timedelta(hours=schedule.frequency_hours)

    # Create feeding log
    log = FeedingLog(
        tank_id=schedule.tank_id,
        user_id=current_user.id,
        schedule_id=schedule.id,
        food_name=schedule.food_name,
        quantity=schedule.quantity,
        quantity_unit=schedule.quantity_unit,
        fed_at=now,
    )
    db.add(log)

    # Deduct from consumable stock if linked
    if schedule.consumable_id and schedule.quantity:
        consumable = db.query(Consumable).filter(
            Consumable.id == schedule.consumable_id
        ).first()
        if consumable:
            usage = ConsumableUsage(
                consumable_id=consumable.id,
                user_id=current_user.id,
                usage_date=now.date(),
                quantity_used=schedule.quantity,
                quantity_unit=schedule.quantity_unit,
                notes=f"Feeding: {schedule.food_name}",
            )
            db.add(usage)

            # Deduct from stock
            if consumable.quantity_on_hand is not None:
                consumable.quantity_on_hand = max(0, consumable.quantity_on_hand - schedule.quantity)
                if consumable.quantity_on_hand <= 0:
                    consumable.status = "depleted"
                elif consumable.quantity_on_hand < schedule.quantity * 3:
                    consumable.status = "low_stock"

    db.commit()
    db.refresh(log)
    return log


# ============================================================================
# Feeding Logs
# ============================================================================

@router.get("/logs", response_model=List[FeedingLogResponse])
def list_logs(
    tank_id: Optional[UUID] = Query(None, description="Filter by tank ID"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List feeding log entries."""
    query = db.query(FeedingLog).filter(
        FeedingLog.user_id == current_user.id
    )

    if tank_id:
        tank = db.query(Tank).filter(Tank.id == tank_id, Tank.user_id == current_user.id).first()
        if not tank:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")
        query = query.filter(FeedingLog.tank_id == tank_id)

    return query.order_by(FeedingLog.fed_at.desc()).limit(limit).all()


@router.post("/logs", response_model=FeedingLogResponse, status_code=status.HTTP_201_CREATED)
def create_log(
    log_in: FeedingLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an ad-hoc feeding log entry (not tied to a schedule)."""
    tank = db.query(Tank).filter(
        Tank.id == log_in.tank_id,
        Tank.user_id == current_user.id
    ).first()
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")

    data = log_in.model_dump()
    if not data.get("fed_at"):
        data["fed_at"] = datetime.utcnow()

    log = FeedingLog(**data, user_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


# ============================================================================
# Overview
# ============================================================================

@router.get("/overview", response_model=FeedingOverview)
def get_overview(
    tank_id: UUID = Query(..., description="Tank ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feeding overview for a tank."""
    tank = db.query(Tank).filter(Tank.id == tank_id, Tank.user_id == current_user.id).first()
    if not tank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tank not found")

    now = datetime.utcnow()

    # Active schedules
    active_schedules = db.query(FeedingSchedule).filter(
        FeedingSchedule.tank_id == tank_id,
        FeedingSchedule.user_id == current_user.id,
        FeedingSchedule.is_active == True
    ).all()

    # Last fed (most recent log)
    last_log = db.query(FeedingLog).filter(
        FeedingLog.tank_id == tank_id,
        FeedingLog.user_id == current_user.id
    ).order_by(FeedingLog.fed_at.desc()).first()

    # Next due (earliest upcoming)
    next_schedule = db.query(FeedingSchedule).filter(
        FeedingSchedule.tank_id == tank_id,
        FeedingSchedule.user_id == current_user.id,
        FeedingSchedule.is_active == True,
        FeedingSchedule.next_due.isnot(None)
    ).order_by(FeedingSchedule.next_due).first()

    # Overdue count
    overdue_count = db.query(func.count(FeedingSchedule.id)).filter(
        FeedingSchedule.tank_id == tank_id,
        FeedingSchedule.user_id == current_user.id,
        FeedingSchedule.is_active == True,
        FeedingSchedule.next_due < now
    ).scalar() or 0

    # Recent logs
    recent_logs = db.query(FeedingLog).filter(
        FeedingLog.tank_id == tank_id,
        FeedingLog.user_id == current_user.id
    ).order_by(FeedingLog.fed_at.desc()).limit(10).all()

    return FeedingOverview(
        tank_id=tank_id,
        active_schedules=len(active_schedules),
        last_fed=last_log.fed_at if last_log else None,
        next_due=next_schedule.next_due if next_schedule else None,
        overdue_count=overdue_count,
        recent_logs=recent_logs,
    )
