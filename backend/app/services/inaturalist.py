"""
iNaturalist Service

iNaturalist provides community-sourced species observations and photos.
API: https://api.inaturalist.org/v1/docs/

Rate Limit: 100 requests/minute per IP
"""
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings


class INaturalistService:
    """Service for interacting with iNaturalist API"""

    def __init__(self):
        """Initialize iNaturalist service with API base URL"""
        self.base_url = settings.INATURALIST_API_URL
        self.timeout = 10.0  # API timeout in seconds

    async def search_taxa(
        self,
        query: str,
        rank: str = "species",
        is_active: bool = True,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for taxa.

        Endpoint: GET /taxa?q={query}&rank={rank}&is_active={bool}&per_page={limit}

        Returns list with:
        - id: Taxon ID
        - name: Scientific name
        - preferred_common_name: Primary common name
        - default_photo: Primary photo with medium_url, square_url
        - observations_count: Popularity metric

        Args:
            query: Search term
            rank: Taxonomic rank (default: "species")
            is_active: Filter to active taxa only (default: True)
            limit: Maximum number of results

        Returns:
            List of matching taxa

        Example:
            >>> await service.search_taxa("Amphiprion ocellaris")
            [{"id": 47691, "name": "Amphiprion ocellaris", "default_photo": {...}}]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/taxa",
                    params={
                        "q": query,
                        "rank": rank,
                        "is_active": is_active,
                        "per_page": limit
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("results", [])
        except httpx.HTTPError as e:
            print(f"Error searching iNaturalist taxa: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in iNaturalist search: {e}")
            return []

    async def get_taxon(self, taxon_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed taxon information.

        Endpoint: GET /taxa/{id}

        Args:
            taxon_id: iNaturalist taxon ID

        Returns:
            Detailed taxon record or None if not found

        Example:
            >>> await service.get_taxon("47691")
            {"id": 47691, "name": "Amphiprion ocellaris", ...}
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/taxa/{taxon_id}")
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                return results[0] if results else None
        except httpx.HTTPError as e:
            print(f"Error fetching iNaturalist taxon: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error fetching taxon: {e}")
            return None

    async def get_taxon_photos(
        self,
        taxon_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get photos for a taxon from observations.

        Endpoint: GET /observations?taxon_id={id}&photos=true&per_page={limit}

        Args:
            taxon_id: iNaturalist taxon ID
            limit: Maximum number of photos to return

        Returns:
            List of photos with URLs and attribution

        Example:
            >>> await service.get_taxon_photos("47691")
            [{
                "url": "https://...",
                "medium_url": "https://...",
                "attribution": "John Doe",
                "license_code": "cc-by"
            }]
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/observations",
                    params={
                        "taxon_id": taxon_id,
                        "photos": "true",
                        "per_page": limit,
                        "order_by": "votes"  # Get highest quality photos first
                    }
                )
                response.raise_for_status()
                data = response.json()
                observations = data.get("results", [])

                # Extract photos with attribution
                photos = []
                for obs in observations:
                    if obs.get("photos"):
                        for photo in obs["photos"]:
                            url = photo.get("url")
                            photos.append({
                                "url": url,
                                "medium_url": url.replace("/square.", "/medium.") if url else None,
                                "attribution": photo.get("attribution"),
                                "license_code": photo.get("license_code")
                            })

                return photos[:limit]
        except httpx.HTTPError as e:
            print(f"Error fetching iNaturalist photos: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error fetching photos: {e}")
            return []

    async def search_species(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Unified search returning normalized results.

        Args:
            query: Search term
            limit: Maximum number of results

        Returns:
            List of species records

        Example:
            >>> await service.search_species("clownfish")
            [{"id": 47691, "name": "Amphiprion ocellaris", ...}]
        """
        try:
            return await self.search_taxa(query, rank="species", limit=limit)
        except Exception as e:
            print(f"Error in iNaturalist species search: {e}")
            return []


# Singleton instance
inaturalist_service = INaturalistService()
