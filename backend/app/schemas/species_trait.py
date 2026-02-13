"""Pydantic schemas for species traits (compatibility database)."""

from typing import Optional
from pydantic import BaseModel, Field


class SpeciesTraitBase(BaseModel):
    genusOrFamily: str = Field(..., min_length=1, description="Genus, family, or species name for matching")
    matchLevel: str = Field("genus", pattern="^(genus|family|species)$")
    commonGroupName: str = Field(..., min_length=1)
    category: str = Field(..., pattern="^(fish|coral|invertebrate)$")
    waterType: str = Field(..., pattern="^(saltwater|freshwater|both)$")
    temperament: str = Field(..., pattern="^(peaceful|semi-aggressive|aggressive)$")
    reefSafe: str = Field(..., pattern="^(yes|no|caution)$")
    minTankSizeLiters: int = Field(..., ge=1)
    diet: str = Field(..., pattern="^(herbivore|carnivore|omnivore|filter-feeder|corallivore)$")
    sizeClass: str = Field(..., pattern="^(tiny|small|medium|large|xlarge)$")
    territorial: bool = False
    maxGroupConflict: bool = False
    predatorOf: list[str] = Field(default_factory=list)


class SpeciesTraitCreate(SpeciesTraitBase):
    id: Optional[str] = Field(None, description="Optional custom ID (auto-generated if omitted)")


class SpeciesTraitUpdate(BaseModel):
    genusOrFamily: Optional[str] = None
    matchLevel: Optional[str] = Field(None, pattern="^(genus|family|species)$")
    commonGroupName: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(fish|coral|invertebrate)$")
    waterType: Optional[str] = Field(None, pattern="^(saltwater|freshwater|both)$")
    temperament: Optional[str] = Field(None, pattern="^(peaceful|semi-aggressive|aggressive)$")
    reefSafe: Optional[str] = Field(None, pattern="^(yes|no|caution)$")
    minTankSizeLiters: Optional[int] = Field(None, ge=1)
    diet: Optional[str] = Field(None, pattern="^(herbivore|carnivore|omnivore|filter-feeder|corallivore)$")
    sizeClass: Optional[str] = Field(None, pattern="^(tiny|small|medium|large|xlarge)$")
    territorial: Optional[bool] = None
    maxGroupConflict: Optional[bool] = None
    predatorOf: Optional[list[str]] = None


class SpeciesTraitResponse(SpeciesTraitBase):
    id: str
