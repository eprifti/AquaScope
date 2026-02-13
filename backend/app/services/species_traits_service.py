"""
Species Traits Service

CRUD operations on the shared species-traits.json database.
This file is the single source of truth for compatibility data,
used by both the frontend (bundled at build time) and the backend.
"""

import json
import re
import threading
from pathlib import Path

# Resolve the path to the shared JSON file
# Local dev: <repo>/data/species-traits.json
# Docker: /data/species-traits.json (mounted or copied)
_SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "species-traits.json"

# Thread lock for safe concurrent writes
_lock = threading.Lock()


def _load() -> list[dict]:
    """Load all species traits from the JSON file."""
    try:
        with open(_SPECIES_DATA_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save(traits: list[dict]) -> None:
    """Persist traits list to the JSON file."""
    _SPECIES_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(_SPECIES_DATA_PATH, "w") as f:
        json.dump(traits, f, indent=2, ensure_ascii=False)
        f.write("\n")


def _generate_id(genus_or_family: str) -> str:
    """Generate a URL-safe slug ID from the genus/family name."""
    return re.sub(r"[^a-z0-9]+", "_", genus_or_family.lower()).strip("_")


def list_traits(
    category: str | None = None,
    water_type: str | None = None,
    search: str | None = None,
) -> list[dict]:
    """List species traits with optional filters."""
    traits = _load()

    if category:
        traits = [t for t in traits if t.get("category") == category]
    if water_type:
        traits = [t for t in traits if t.get("waterType") in (water_type, "both")]
    if search:
        q = search.lower()
        traits = [
            t for t in traits
            if q in t.get("genusOrFamily", "").lower()
            or q in t.get("commonGroupName", "").lower()
            or q in t.get("id", "").lower()
        ]

    return sorted(traits, key=lambda t: t.get("genusOrFamily", ""))


def get_trait(trait_id: str) -> dict | None:
    """Get a single species trait by ID."""
    for t in _load():
        if t.get("id") == trait_id:
            return t
    return None


def create_trait(data: dict) -> dict:
    """Add a new species trait entry. Returns the created entry."""
    with _lock:
        traits = _load()

        # Generate ID if not provided
        trait_id = data.get("id") or _generate_id(data["genusOrFamily"])

        # Check for duplicate ID
        if any(t.get("id") == trait_id for t in traits):
            raise ValueError(f"A species trait with ID '{trait_id}' already exists")

        # Check for duplicate genusOrFamily
        genus = data["genusOrFamily"].lower()
        if any(t.get("genusOrFamily", "").lower() == genus for t in traits):
            raise ValueError(f"A species trait for '{data['genusOrFamily']}' already exists")

        entry = {"id": trait_id, **{k: v for k, v in data.items() if k != "id"}}
        traits.append(entry)
        _save(traits)
        return entry


def update_trait(trait_id: str, data: dict) -> dict | None:
    """Update an existing species trait. Returns the updated entry or None."""
    with _lock:
        traits = _load()

        for i, t in enumerate(traits):
            if t.get("id") == trait_id:
                # If genusOrFamily is changing, check for duplicates
                new_genus = data.get("genusOrFamily")
                if new_genus and new_genus.lower() != t.get("genusOrFamily", "").lower():
                    if any(
                        other.get("genusOrFamily", "").lower() == new_genus.lower()
                        for j, other in enumerate(traits) if j != i
                    ):
                        raise ValueError(f"A species trait for '{new_genus}' already exists")

                # Merge updates
                updated = {**t, **{k: v for k, v in data.items() if v is not None}}
                traits[i] = updated
                _save(traits)
                return updated

        return None


def delete_trait(trait_id: str) -> bool:
    """Delete a species trait by ID. Returns True if deleted."""
    with _lock:
        traits = _load()
        original_len = len(traits)
        traits = [t for t in traits if t.get("id") != trait_id]
        if len(traits) < original_len:
            _save(traits)
            return True
        return False
