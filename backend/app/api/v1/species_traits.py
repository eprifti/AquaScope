"""
Species Traits API Endpoints

Admin-only CRUD for the shared species compatibility database.
Read access is available to all authenticated users.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.user import User
from app.schemas.species_trait import (
    SpeciesTraitCreate,
    SpeciesTraitResponse,
    SpeciesTraitUpdate,
)
from app.api.deps import get_current_admin_user, get_current_user
from app.services import species_traits_service

router = APIRouter()


@router.get("/", response_model=list[SpeciesTraitResponse])
def list_species_traits(
    category: Optional[str] = Query(None, description="Filter by category"),
    water_type: Optional[str] = Query(None, description="Filter by water type"),
    search: Optional[str] = Query(None, description="Search by name"),
    current_user: User = Depends(get_current_user),
):
    """List all species traits (accessible to all authenticated users)."""
    return species_traits_service.list_traits(
        category=category, water_type=water_type, search=search
    )


@router.get("/{trait_id}", response_model=SpeciesTraitResponse)
def get_species_trait(
    trait_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single species trait by ID."""
    trait = species_traits_service.get_trait(trait_id)
    if not trait:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species trait '{trait_id}' not found",
        )
    return trait


@router.post("/", response_model=SpeciesTraitResponse, status_code=status.HTTP_201_CREATED)
def create_species_trait(
    data: SpeciesTraitCreate,
    admin: User = Depends(get_current_admin_user),
):
    """Create a new species trait entry (admin only)."""
    try:
        return species_traits_service.create_trait(data.model_dump())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.put("/{trait_id}", response_model=SpeciesTraitResponse)
def update_species_trait(
    trait_id: str,
    data: SpeciesTraitUpdate,
    admin: User = Depends(get_current_admin_user),
):
    """Update a species trait (admin only)."""
    try:
        updated = species_traits_service.update_trait(
            trait_id, data.model_dump(exclude_unset=True)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species trait '{trait_id}' not found",
        )
    return updated


@router.delete("/{trait_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_species_trait(
    trait_id: str,
    admin: User = Depends(get_current_admin_user),
):
    """Delete a species trait (admin only)."""
    if not species_traits_service.delete_trait(trait_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species trait '{trait_id}' not found",
        )
    return None
