"""Note API Endpoints"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.tank import Tank
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new note for a tank"""
    # Verify tank ownership
    tank = db.query(Tank).filter(
        Tank.id == note_in.tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    note = Note(
        content=note_in.content,
        tank_id=note_in.tank_id,
        user_id=current_user.id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=List[NoteResponse])
def list_notes(
    tank_id: UUID = Query(None, description="Filter by tank ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List notes (optionally filtered by tank)"""
    query = db.query(Note).filter(Note.user_id == current_user.id)

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
        query = query.filter(Note.tank_id == tank_id)

    notes = query.order_by(Note.created_at.desc()).all()
    return notes


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: UUID,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    note.content = note_in.content
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()
    return None
