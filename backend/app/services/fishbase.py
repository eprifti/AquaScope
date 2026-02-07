"""
FishBase Service

Integrates with FishBase API for fish species information.

What is FishBase?
=================
FishBase (fishbase.org) is a global biodiversity information system on finfishes.
It's the world's largest and most extensively accessed online database on fish.

Data includes:
- Scientific and common names
- Taxonomy
- Distribution and habitat
- Biology (diet, reproduction, behavior)
- Maximum size
- Aquarium suitability
- And much more

API Access:
===========
FishBase provides a free RESTful API through rOpenSci:
https://fishbase.ropensci.org

Endpoints used:
- GET /species - Search for species
- GET /species/{id} - Get species details
- GET /comnames - Get common names

Why integrate FishBase?
========================
1. Accurate species identification
2. Care requirements and compatibility
3. Maximum size planning (bioload)
4. Diet and feeding requirements
5. Educational value for hobbyists

Limitations:
============
- FishBase focuses on fish (not corals or invertebrates)
- For corals: Consider CoralTraits Database or AIMS Coral Database
- For invertebrates: WoRMS (World Register of Marine Species)

Future Enhancement:
===================
Could add support for:
- CoralTraits API for coral species
- WoRMS API for invertebrate species
- AlgaeBase for macroalgae
"""
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings


class FishBaseService:
    """Service for interacting with FishBase API"""

    def __init__(self):
        """Initialize FishBase service with API base URL"""
        self.base_url = settings.FISHBASE_API_URL
        self.timeout = 10.0  # API timeout in seconds

    async def search_species(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for fish species by name.

        Args:
            query: Search term (scientific or common name)
            limit: Maximum number of results to return

        Returns:
            List of species matches with basic information

        Example:
            >>> await service.search_species("clownfish")
            [
                {
                    "SpecCode": 5606,
                    "Genus": "Amphiprion",
                    "Species": "ocellaris",
                    "SpeciesRefNo": 1602,
                    ...
                }
            ]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # FishBase API endpoint for species search
                # Note: Actual API might differ - adjust based on documentation
                response = await client.get(
                    f"{self.base_url}/species",
                    params={"Species": query, "limit": limit}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Error searching FishBase: {e}")
            return []

    async def get_species_by_id(self, species_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed species information by ID.

        Args:
            species_id: FishBase species code (SpecCode)

        Returns:
            Detailed species information or None if not found

        Example:
            >>> await service.get_species_by_id("5606")
            {
                "SpecCode": 5606,
                "Genus": "Amphiprion",
                "Species": "ocellaris",
                "FBname": "Clown anemonefish",
                "Length": 11.0,  # Max length in cm
                "Vulnerability": 22.5,
                ...
            }
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/species/{species_id}"
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching species from FishBase: {e}")
            return None

    async def get_common_names(self, species_id: str) -> List[Dict[str, Any]]:
        """
        Get all common names for a species.

        Species often have multiple common names across languages and regions.

        Args:
            species_id: FishBase species code

        Returns:
            List of common names with language and region

        Example:
            >>> await service.get_common_names("5606")
            [
                {"ComName": "Clownfish", "Language": "English", "Country": "USA"},
                {"ComName": "False clownfish", "Language": "English", "Country": "UK"},
                {"ComName": "Poisson-clown", "Language": "French", "Country": "France"},
                ...
            ]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/comnames",
                    params={"SpecCode": species_id}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching common names from FishBase: {e}")
            return []

    async def search_with_details(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search species and enrich with detailed information.

        Convenience method that combines search with details fetch.

        Args:
            query: Search term
            limit: Maximum results

        Returns:
            List of species with enriched details
        """
        species_list = await self.search_species(query, limit)
        enriched_results = []

        for species in species_list:
            if "SpecCode" in species:
                details = await self.get_species_by_id(str(species["SpecCode"]))
                if details:
                    enriched_results.append(details)

        return enriched_results


# Singleton instance
fishbase_service = FishBaseService()
