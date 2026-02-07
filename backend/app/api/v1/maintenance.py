"""
Maintenance Reminder API Endpoints

Handles recurring maintenance task scheduling.
"""
from typing import List
from uuid import UUID
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.tank import Tank
from app.models.maintenance import MaintenanceReminder
from app.schemas.maintenance import (
    MaintenanceReminderCreate,
    MaintenanceReminderUpdate,
    MaintenanceReminderResponse,
    MaintenanceComplete
)
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/reminders", response_model=MaintenanceReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: MaintenanceReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new maintenance reminder.

    Common reminder types:
    - water_change
    - pump_cleaning
    - skimmer_cleaning
    - filter_media_change
    - glass_cleaning
    - dosing_refill
    - test_kit_calibration
    """
    # Verify tank ownership
    tank = db.query(Tank).filter(
        Tank.id == reminder_in.tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    reminder = MaintenanceReminder(
        **reminder_in.model_dump(),
        user_id=current_user.id
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("/reminders", response_model=List[MaintenanceReminderResponse])
def list_reminders(
    tank_id: UUID = Query(None, description="Filter by tank ID"),
    active_only: bool = Query(True, description="Show only active reminders"),
    overdue_only: bool = Query(False, description="Show only overdue reminders"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List maintenance reminders.

    Filters:
    - tank_id: Specific tank
    - active_only: Only active reminders (default: true)
    - overdue_only: Only overdue reminders
    """
    query = db.query(MaintenanceReminder).filter(
        MaintenanceReminder.user_id == current_user.id
    )

    if tank_id:
        # Verify tank ownership
        tank = db.query(Tank).filter(
            Tank.id == tank_id,
            Tank.user_id == current_user.id
        ).first()
        if not tank:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tank not found"
            )
        query = query.filter(MaintenanceReminder.tank_id == tank_id)

    if active_only:
        query = query.filter(MaintenanceReminder.is_active == True)

    if overdue_only:
        today = date.today()
        query = query.filter(MaintenanceReminder.next_due < today)

    reminders = query.order_by(MaintenanceReminder.next_due).all()
    return reminders


@router.get("/reminders/{reminder_id}", response_model=MaintenanceReminderResponse)
def get_reminder(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific maintenance reminder"""
    reminder = db.query(MaintenanceReminder).filter(
        MaintenanceReminder.id == reminder_id,
        MaintenanceReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    return reminder


@router.put("/reminders/{reminder_id}", response_model=MaintenanceReminderResponse)
def update_reminder(
    reminder_id: UUID,
    reminder_in: MaintenanceReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a maintenance reminder"""
    reminder = db.query(MaintenanceReminder).filter(
        MaintenanceReminder.id == reminder_id,
        MaintenanceReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    update_data = reminder_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)
    return reminder


@router.post("/reminders/{reminder_id}/complete", response_model=MaintenanceReminderResponse)
def complete_reminder(
    reminder_id: UUID,
    complete_in: MaintenanceComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a maintenance task as completed.

    Automatically calculates next due date based on frequency.

    Example: If completed today and frequency is 7 days,
    next_due will be set to today + 7 days.
    """
    reminder = db.query(MaintenanceReminder).filter(
        MaintenanceReminder.id == reminder_id,
        MaintenanceReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    # Update last_completed
    completed_date = complete_in.completed_date or date.today()
    reminder.last_completed = completed_date

    # Calculate next_due
    reminder.next_due = completed_date + timedelta(days=reminder.frequency_days)

    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a maintenance reminder"""
    reminder = db.query(MaintenanceReminder).filter(
        MaintenanceReminder.id == reminder_id,
        MaintenanceReminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )

    db.delete(reminder)
    db.commit()
    return None
