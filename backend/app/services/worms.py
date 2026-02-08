"""
WoRMS (World Register of Marine Species) Service

WoRMS is the authoritative taxonomic database for marine species.
API: https://www.marinespecies.org/rest/

Coverage: ALL marine organisms (fish, corals, invertebrates, algae, etc.)
"""
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings


class WoRMSService:
    """Service for interacting with WoRMS API"""

    def __init__(self):
        """Initialize WoRMS service with API base URL"""
        self.base_url = settings.WORMS_API_URL
        self.timeout = 10.0  # API timeout in seconds

    async def search_by_scientific_name(
        self,
        name: str,
        marine_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search by scientific name.

        Endpoint: GET /AphiaRecordsByName/{name}?marine_only={bool}

        Returns list of matching records with:
        - AphiaID: Unique identifier
        - scientificname: Full scientific name
        - authority: Taxonomic authority
        - status: accepted, synonym, unaccepted
        - rank: Species, Genus, Family, etc.

        Args:
            name: Scientific name to search for
            marine_only: Filter to marine species only (default: True)

        Returns:
            List of matching records

        Example:
            >>> await service.search_by_scientific_name("Amphiprion ocellaris")
            [{"AphiaID": 275775, "scientificname": "Amphiprion ocellaris", ...}]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/AphiaRecordsByName/{name}",
                    params={"marine_only": marine_only, "like": True}
                )
                if response.status_code == 204:
                    return []
                response.raise_for_status()
                result = response.json()
                return result if isinstance(result, list) else [] if result is None else [result]
        except httpx.HTTPError as e:
            print(f"Error searching WoRMS by scientific name: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in WoRMS search: {e}")
            return []

    async def search_by_common_name(self, name: str) -> List[Dict[str, Any]]:
        """
        Search by common/vernacular name.

        Endpoint: GET /AphiaRecordsByVernacular/{name}

        Args:
            name: Common/vernacular name to search for

        Returns:
            List of matching records

        Example:
            >>> await service.search_by_common_name("clownfish")
            [{"AphiaID": 275775, "scientificname": "Amphiprion ocellaris", ...}]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/AphiaRecordsByVernacular/{name}",
                    params={"like": True}
                )
                if response.status_code == 204:
                    return []
                response.raise_for_status()
                result = response.json()
                return result if isinstance(result, list) else [] if result is None else [result]
        except httpx.HTTPError as e:
            print(f"Error searching WoRMS by common name: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in WoRMS vernacular search: {e}")
            return []

    async def get_record_by_id(self, aphia_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed record by AphiaID.

        Endpoint: GET /AphiaRecordByAphiaID/{id}

        Args:
            aphia_id: WoRMS AphiaID

        Returns:
            Detailed species record or None if not found

        Example:
            >>> await service.get_record_by_id("275775")
            {"AphiaID": 275775, "scientificname": "Amphiprion ocellaris", ...}
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/AphiaRecordByAphiaID/{aphia_id}"
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching WoRMS record by ID: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error fetching WoRMS record: {e}")
            return None

    async def get_vernacular_names(self, aphia_id: str) -> List[Dict[str, Any]]:
        """
        Get all common names in multiple languages.

        Endpoint: GET /AphiaVernacularsByAphiaID/{id}

        Args:
            aphia_id: WoRMS AphiaID

        Returns:
            List of vernacular names with language info

        Example:
            >>> await service.get_vernacular_names("275775")
            [{"vernacular": "Clownfish", "language": "English", ...}]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/AphiaVernacularsByAphiaID/{aphia_id}"
                )
                response.raise_for_status()
                result = response.json()
                return result if isinstance(result, list) else [] if result is None else [result]
        except httpx.HTTPError as e:
            print(f"Error fetching WoRMS vernacular names: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error fetching vernacular names: {e}")
            return []

    async def search_species(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Unified search (tries scientific name first, then common name).

        Returns normalized results compatible with frontend.

        Args:
            query: Search term (scientific or common name)
            limit: Maximum number of results to return

        Returns:
            List of species records (prioritizes accepted names)

        Example:
            >>> await service.search_species("clownfish")
            [{"AphiaID": 275775, "scientificname": "Amphiprion ocellaris", ...}]
        """
        try:
            # Try scientific name first
            results = await self.search_by_scientific_name(query)

            # If no results, try common name
            if not results:
                results = await self.search_by_common_name(query)

            # Filter to accepted names and limit
            accepted = [r for r in results if r.get("status") == "accepted"][:limit]

            # If we have accepted names, return those; otherwise return all results limited
            return accepted if accepted else results[:limit]
        except Exception as e:
            print(f"Error in WoRMS unified search: {e}")
            return []


# Singleton instance
worms_service = WoRMSService()
