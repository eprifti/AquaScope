#!/usr/bin/env python3
"""
Enrich livestock items that have no photo source.

For each livestock item missing cached_photo_url, inaturalist_id, and
fishbase_species_id, search the unified species API and populate the
taxonomy IDs and cached photo URL.

Usage (inside container):
    python /app/scripts/enrich_livestock_photos.py

Or from host:
    docker compose exec backend python scripts/enrich_livestock_photos.py
"""

import requests
import time
import sys

API_BASE = "http://localhost:8000/api/v1"
EMAIL = "***REDACTED_EMAIL***"
PASSWORD = "***REDACTED***"

RATE_LIMIT_SECONDS = 1.0


def login():
    resp = requests.post(
        f"{API_BASE}/auth/login",
        data={"username": EMAIL, "password": PASSWORD},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def fetch_all_livestock(headers):
    """Fetch livestock from all tanks."""
    resp = requests.get(f"{API_BASE}/livestock/", headers=headers)
    resp.raise_for_status()
    return resp.json()


def search_species(headers, query, sources="worms,inaturalist"):
    """Search unified species endpoint."""
    resp = requests.get(
        f"{API_BASE}/livestock/species/search",
        headers=headers,
        params={"query": query, "sources": sources, "limit": 3},
    )
    if resp.status_code != 200:
        return None
    return resp.json()


def update_livestock(headers, livestock_id, data):
    """Update a livestock item via PUT."""
    resp = requests.put(
        f"{API_BASE}/livestock/{livestock_id}",
        headers=headers,
        json=data,
    )
    return resp.status_code in (200, 201), resp


def extract_best_match(search_result, species_name):
    """Extract the best iNaturalist/WoRMS/FishBase match from search results."""
    if not search_result or "sources" not in search_result:
        return None

    sources = search_result["sources"]
    update_data = {}

    # Try iNaturalist first (best photo source)
    inat_results = sources.get("inaturalist", [])
    if inat_results:
        best = inat_results[0]
        update_data["inaturalist_id"] = str(best.get("id", ""))
        photo = best.get("default_photo") or {}
        photo_url = photo.get("medium_url") or photo.get("square_url")
        if photo_url:
            update_data["cached_photo_url"] = photo_url
        common = best.get("preferred_common_name")
        if common:
            update_data["common_name"] = common

    # Try WoRMS for taxonomy
    worms_results = sources.get("worms", [])
    if worms_results:
        best = worms_results[0]
        aphia_id = best.get("AphiaID")
        if aphia_id:
            update_data["worms_id"] = str(aphia_id)

    # Try FishBase as fallback
    fishbase_results = sources.get("fishbase", [])
    if fishbase_results:
        best = fishbase_results[0]
        spec_code = best.get("SpecCode")
        if spec_code:
            update_data["fishbase_species_id"] = str(spec_code)
        # Use FishBase photo if iNaturalist didn't have one
        if "cached_photo_url" not in update_data:
            thumb = best.get("ThumbPic") or best.get("Pic")
            if thumb:
                update_data["cached_photo_url"] = thumb

    return update_data if update_data else None


def main():
    print("=" * 60)
    print("AquaScope Livestock Photo Enrichment")
    print("=" * 60)

    # Login
    print("\n[1] Logging in...")
    token = login()
    headers = get_headers(token)
    print("    Authenticated")

    # Fetch all livestock
    print("\n[2] Fetching all livestock...")
    all_livestock = fetch_all_livestock(headers)
    print(f"    Total livestock: {len(all_livestock)}")

    # Filter to those missing photo sources
    needs_enrichment = [
        item for item in all_livestock
        if not item.get("cached_photo_url")
        and not item.get("inaturalist_id")
        and not item.get("fishbase_species_id")
    ]
    print(f"    Missing photo source: {len(needs_enrichment)}")

    if not needs_enrichment:
        print("\n    All livestock already have photo sources. Nothing to do.")
        return

    # Enrich each item
    print(f"\n[3] Enriching {len(needs_enrichment)} items...")
    success = 0
    failed = 0
    no_match = 0

    for i, item in enumerate(needs_enrichment):
        species = item.get("species_name", "Unknown")
        item_id = item["id"]
        item_type = item.get("type", "?")

        print(f"\n    [{i+1}/{len(needs_enrichment)}] {species} ({item_type})")

        # Search with all sources
        sources = "worms,inaturalist"
        if item_type == "fish":
            sources = "worms,inaturalist,fishbase"

        search_result = search_species(headers, species, sources)
        time.sleep(RATE_LIMIT_SECONDS)

        if not search_result:
            print(f"        Search failed for '{species}'")
            failed += 1
            continue

        update_data = extract_best_match(search_result, species)

        if not update_data:
            # Try with just the first word (genus) if species name has multiple words
            words = species.strip().split()
            if len(words) > 1:
                print(f"        No match for full name, trying genus: '{words[0]}'")
                search_result = search_species(headers, words[0], sources)
                time.sleep(RATE_LIMIT_SECONDS)
                if search_result:
                    update_data = extract_best_match(search_result, species)

        if not update_data:
            print(f"        No match found")
            no_match += 1
            continue

        # Update the livestock item
        ok, resp = update_livestock(headers, item_id, update_data)
        if ok:
            photo = "yes" if "cached_photo_url" in update_data else "no"
            inat = update_data.get("inaturalist_id", "-")
            worms = update_data.get("worms_id", "-")
            print(f"        Updated: iNat={inat}, WoRMS={worms}, photo={photo}")
            success += 1
        else:
            print(f"        Update failed: {resp.status_code} {resp.text[:100]}")
            failed += 1

    # Summary
    print("\n" + "=" * 60)
    print("Enrichment Summary")
    print("=" * 60)
    print(f"    Success:  {success}")
    print(f"    No match: {no_match}")
    print(f"    Failed:   {failed}")
    print(f"    Total:    {len(needs_enrichment)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
