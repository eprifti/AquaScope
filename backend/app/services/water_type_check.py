"""
Water Type Compatibility Check

Validates that a species' water type matches the target tank.
Uses genus-level prefix matching against the shared species-traits.json database.
"""

import json
from pathlib import Path

# Load species traits from the shared JSON (single source of truth)
_SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "species-traits.json"

_GENUS_WATER_TYPE: dict[str, str] = {}


def _load_species_data() -> None:
    """Load genus -> waterType mapping from the shared JSON file."""
    global _GENUS_WATER_TYPE
    try:
        with open(_SPECIES_DATA_PATH, "r") as f:
            species = json.load(f)
        _GENUS_WATER_TYPE = {
            entry["genusOrFamily"].lower(): entry["waterType"]
            for entry in species
            if entry.get("waterType") not in (None, "both")
        }
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load species-traits.json: {e}")
        _GENUS_WATER_TYPE = {}


# Load on import
_load_species_data()


def check_species_water_type(species_name: str, tank_water_type: str) -> str | None:
    """
    Check if a species is compatible with a tank's water type.

    Returns an error message string if incompatible, or None if compatible/unknown.
    Species not in the database are allowed through (no false positives).
    """
    if not species_name or not tank_water_type:
        return None

    normalized = species_name.strip().lower()

    for genus, water_type in _GENUS_WATER_TYPE.items():
        if normalized.startswith(genus):
            if water_type != tank_water_type:
                return (
                    f"{species_name} is a {water_type} species "
                    f"and cannot be added to a {tank_water_type} tank."
                )
            return None

    return None
