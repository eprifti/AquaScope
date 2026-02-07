"""
Tank API Endpoints

CRUD operations for user tanks.

Multi-tenancy: Users can only access their own tanks.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.tank import Tank
from app.schemas.tank import TankCreate, TankUpdate, TankResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=TankResponse, status_code=status.HTTP_201_CREATED)
def create_tank(
    tank_in: TankCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new tank for the current user.

    Users can have multiple tanks (display tank, quarantine, frag tank, etc.)
    """
    tank = Tank(
        **tank_in.model_dump(),
        user_id=current_user.id
    )
    db.add(tank)
    db.commit()
    db.refresh(tank)
    return tank


@router.get("/", response_model=List[TankResponse])
def list_tanks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all tanks owned by the current user.

    Returns empty list if user has no tanks.
    """
    tanks = db.query(Tank).filter(Tank.user_id == current_user.id).all()
    return tanks


@router.get("/{tank_id}", response_model=TankResponse)
def get_tank(
    tank_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific tank by ID.

    Security: Ensures tank belongs to current user.
    """
    tank = db.query(Tank).filter(
        Tank.id == tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    return tank


@router.put("/{tank_id}", response_model=TankResponse)
def update_tank(
    tank_id: UUID,
    tank_in: TankUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a tank's information.

    Only provided fields will be updated.
    """
    tank = db.query(Tank).filter(
        Tank.id == tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    # Update only provided fields
    update_data = tank_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tank, field, value)

    db.commit()
    db.refresh(tank)
    return tank


@router.delete("/{tank_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tank(
    tank_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a tank.

    Warning: This will cascade delete all associated data:
    - Notes
    - Photos
    - Maintenance reminders
    - Livestock records
    - Parameter data remains in InfluxDB (manual cleanup if desired)
    """
    tank = db.query(Tank).filter(
        Tank.id == tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    db.delete(tank)
    db.commit()
    return None
