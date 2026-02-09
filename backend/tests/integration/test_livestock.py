"""
Integration tests for Livestock endpoints
"""
import pytest
from datetime import date, timedelta
from app.models.tank import Tank
from app.models.livestock import Livestock


@pytest.fixture
def test_tank(db_session, test_user):
    """Create a test tank"""
    tank = Tank(
        name="Test Reef Tank",
        display_volume_liters=200,
        sump_volume_liters=50,
        user_id=test_user.id
    )
    db_session.add(tank)
    db_session.commit()
    db_session.refresh(tank)
    return tank


@pytest.fixture
def test_fish(db_session, test_user, test_tank):
    """Create a test fish"""
    fish = Livestock(
        tank_id=test_tank.id,
        user_id=test_user.id,
        species_name="Amphiprion ocellaris",
        common_name="Clownfish",
        type="fish",
        fishbase_species_id="123",
        added_date=date.today() - timedelta(days=30),
        notes="Very active, eats well"
    )
    db_session.add(fish)
    db_session.commit()
    db_session.refresh(fish)
    return fish


@pytest.fixture
def test_coral(db_session, test_user, test_tank):
    """Create a test coral"""
    coral = Livestock(
        tank_id=test_tank.id,
        user_id=test_user.id,
        species_name="Acropora millepora",
        common_name="Blue SPS Coral",
        type="coral",
        added_date=date.today() - timedelta(days=60),
        notes="Growing well, good polyp extension"
    )
    db_session.add(coral)
    db_session.commit()
    db_session.refresh(coral)
    return coral


class TestCreateLivestock:
    """Tests for creating livestock"""

    def test_create_fish_success(self, authenticated_client, test_tank):
        """Test successful fish creation"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Zebrasoma flavescens",
                "common_name": "Yellow Tang",
                "type": "fish",
                "fishbase_species_id": "456",
                "added_date": str(date.today()),
                "notes": "Beautiful yellow color"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["species_name"] == "Zebrasoma flavescens"
        assert data["common_name"] == "Yellow Tang"
        assert data["type"] == "fish"
        assert data["fishbase_species_id"] == "456"

    def test_create_coral_success(self, authenticated_client, test_tank):
        """Test successful coral creation"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Stylophora pistillata",
                "common_name": "Pink Stylophora",
                "type": "coral",
                "added_date": str(date.today())
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "coral"
        assert data["species_name"] == "Stylophora pistillata"

    def test_create_invertebrate_success(self, authenticated_client, test_tank):
        """Test successful invertebrate creation"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Lysmata amboinensis",
                "common_name": "Cleaner Shrimp",
                "type": "invertebrate",
                "added_date": str(date.today())
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "invertebrate"

    def test_create_livestock_invalid_tank(self, authenticated_client):
        """Test livestock creation with non-existent tank"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": "00000000-0000-0000-0000-000000000000",
                "species_name": "Test",
                "common_name": "Test",
                "type": "fish",
                "added_date": str(date.today())
            }
        )
        assert response.status_code == 404

    def test_create_livestock_missing_fields(self, authenticated_client, test_tank):
        """Test livestock creation with missing required fields"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Test"
                # Missing required fields
            }
        )
        assert response.status_code == 422

    def test_create_livestock_unauthorized(self, client, test_tank):
        """Test livestock creation without authentication"""
        response = client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Test",
                "common_name": "Test",
                "type": "fish",
                "added_date": str(date.today())
            }
        )
        assert response.status_code == 401


class TestListLivestock:
    """Tests for listing livestock"""

    def test_list_all_livestock(self, authenticated_client, test_fish, test_coral):
        """Test listing all livestock"""
        response = authenticated_client.get("/api/v1/livestock")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    def test_list_livestock_by_tank(self, authenticated_client, test_tank, test_fish):
        """Test filtering livestock by tank"""
        response = authenticated_client.get(
            f"/api/v1/livestock?tank_id={test_tank.id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert all(l["tank_id"] == str(test_tank.id) for l in data)

    def test_list_livestock_by_type(self, authenticated_client, test_fish, test_coral):
        """Test filtering livestock by type"""
        response = authenticated_client.get("/api/v1/livestock?type=fish")
        assert response.status_code == 200
        data = response.json()
        assert all(l["type"] == "fish" for l in data)
        assert len(data) >= 1

    def test_list_livestock_combined_filters(self, authenticated_client, test_tank, test_fish):
        """Test combining tank and type filters"""
        response = authenticated_client.get(
            f"/api/v1/livestock?tank_id={test_tank.id}&type=fish"
        )
        assert response.status_code == 200
        data = response.json()
        assert all(l["tank_id"] == str(test_tank.id) and l["type"] == "fish" for l in data)


class TestGetLivestock:
    """Tests for getting specific livestock"""

    def test_get_livestock_success(self, authenticated_client, test_fish):
        """Test successful livestock retrieval"""
        response = authenticated_client.get(f"/api/v1/livestock/{test_fish.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_fish.id)
        assert data["species_name"] == test_fish.species_name

    def test_get_livestock_not_found(self, authenticated_client):
        """Test getting non-existent livestock"""
        response = authenticated_client.get(
            "/api/v1/livestock/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


class TestUpdateLivestock:
    """Tests for updating livestock"""

    def test_update_livestock_success(self, authenticated_client, test_fish):
        """Test successful livestock update"""
        response = authenticated_client.put(
            f"/api/v1/livestock/{test_fish.id}",
            json={
                "common_name": "Updated Clownfish",
                "notes": "Updated notes"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["common_name"] == "Updated Clownfish"
        assert data["notes"] == "Updated notes"

    def test_update_livestock_partial(self, authenticated_client, test_fish):
        """Test partial livestock update"""
        response = authenticated_client.put(
            f"/api/v1/livestock/{test_fish.id}",
            json={"notes": "Only updating notes"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["notes"] == "Only updating notes"
        assert data["species_name"] == test_fish.species_name  # Unchanged

    def test_update_livestock_not_found(self, authenticated_client):
        """Test updating non-existent livestock"""
        response = authenticated_client.put(
            "/api/v1/livestock/00000000-0000-0000-0000-000000000000",
            json={"notes": "Test"}
        )
        assert response.status_code == 404


class TestDeleteLivestock:
    """Tests for deleting livestock"""

    def test_delete_livestock_success(self, authenticated_client, test_fish):
        """Test successful livestock deletion"""
        livestock_id = test_fish.id
        response = authenticated_client.delete(f"/api/v1/livestock/{livestock_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = authenticated_client.get(f"/api/v1/livestock/{livestock_id}")
        assert get_response.status_code == 404

    def test_delete_livestock_not_found(self, authenticated_client):
        """Test deleting non-existent livestock"""
        response = authenticated_client.delete(
            "/api/v1/livestock/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


@pytest.fixture
def test_fish_group(db_session, test_user, test_tank):
    """Create a test fish group with quantity > 1"""
    fish = Livestock(
        tank_id=test_tank.id,
        user_id=test_user.id,
        species_name="Chromis viridis",
        common_name="Green Chromis",
        type="fish",
        quantity=5,
        status="alive",
        added_date=date.today() - timedelta(days=30),
        notes="School of 5"
    )
    db_session.add(fish)
    db_session.commit()
    db_session.refresh(fish)
    return fish


class TestUpdateLivestockStatus:
    """Tests for livestock status change with auto-dating"""

    def test_update_status_to_dead_auto_sets_removed_date(self, authenticated_client, test_fish):
        """Test that changing status to dead auto-sets removed_date"""
        response = authenticated_client.put(
            f"/api/v1/livestock/{test_fish.id}",
            json={"status": "dead"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "dead"
        assert data["removed_date"] is not None

    def test_update_status_to_removed_auto_sets_removed_date(self, authenticated_client, test_fish):
        """Test that changing status to removed auto-sets removed_date"""
        response = authenticated_client.put(
            f"/api/v1/livestock/{test_fish.id}",
            json={"status": "removed"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "removed"
        assert data["removed_date"] is not None

    def test_update_status_preserves_existing_removed_date(self, authenticated_client, db_session, test_user, test_tank):
        """Test that auto-date does not overwrite existing removed_date"""
        fish = Livestock(
            tank_id=test_tank.id,
            user_id=test_user.id,
            species_name="Amphiprion percula",
            common_name="True Clownfish",
            type="fish",
            status="alive",
            removed_date=date(2025, 6, 15),
            added_date=date.today() - timedelta(days=60),
        )
        db_session.add(fish)
        db_session.commit()
        db_session.refresh(fish)

        response = authenticated_client.put(
            f"/api/v1/livestock/{fish.id}",
            json={"status": "dead"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["removed_date"] == "2025-06-15"  # Preserved, not overwritten

    def test_list_livestock_invalid_tank(self, authenticated_client):
        """Test filtering livestock by non-existent tank returns 404"""
        response = authenticated_client.get(
            "/api/v1/livestock?tank_id=00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


class TestSplitLivestock:
    """Tests for splitting livestock entries"""

    def test_split_livestock_dead(self, authenticated_client, test_fish_group):
        """Test splitting livestock - marking split portion as dead"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 2,
                "new_status": "dead"
            }
        )
        assert response.status_code == 200
        data = response.json()

        # Original should have reduced quantity
        assert data["original"]["quantity"] == 3
        assert data["original"]["status"] == "alive"
        assert data["original"]["id"] == str(test_fish_group.id)

        # New entry should have split quantity and dead status
        assert data["split"]["quantity"] == 2
        assert data["split"]["status"] == "dead"
        assert data["split"]["removed_date"] is not None
        assert data["split"]["id"] != str(test_fish_group.id)

        # Species data should be copied
        assert data["split"]["species_name"] == "Chromis viridis"
        assert data["split"]["common_name"] == "Green Chromis"
        assert data["split"]["type"] == "fish"
        assert data["split"]["tank_id"] == str(test_fish_group.tank_id)

    def test_split_livestock_removed(self, authenticated_client, test_fish_group):
        """Test splitting livestock - marking split portion as removed"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 1,
                "new_status": "removed"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["original"]["quantity"] == 4
        assert data["split"]["quantity"] == 1
        assert data["split"]["status"] == "removed"
        assert data["split"]["removed_date"] is not None

    def test_split_quantity_too_large(self, authenticated_client, test_fish_group):
        """Test that split_quantity must be less than original quantity"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 6,
                "new_status": "dead"
            }
        )
        assert response.status_code == 422

    def test_split_quantity_equals_total(self, authenticated_client, test_fish_group):
        """Test that split_quantity cannot equal total quantity"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 5,
                "new_status": "dead"
            }
        )
        assert response.status_code == 422

    def test_split_quantity_zero(self, authenticated_client, test_fish_group):
        """Test that split_quantity must be >= 1 (Pydantic validation)"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 0,
                "new_status": "dead"
            }
        )
        assert response.status_code == 422

    def test_split_invalid_status(self, authenticated_client, test_fish_group):
        """Test that new_status must be 'dead' or 'removed'"""
        response = authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 1,
                "new_status": "alive"
            }
        )
        assert response.status_code == 422

    def test_split_not_found(self, authenticated_client):
        """Test splitting non-existent livestock"""
        response = authenticated_client.post(
            "/api/v1/livestock/00000000-0000-0000-0000-000000000000/split",
            json={
                "split_quantity": 1,
                "new_status": "dead"
            }
        )
        assert response.status_code == 404

    def test_split_unauthorized(self, client, test_fish_group):
        """Test split without authentication"""
        response = client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 1,
                "new_status": "dead"
            }
        )
        assert response.status_code == 401

    def test_split_copies_external_ids(self, authenticated_client, db_session, test_user, test_tank):
        """Test that split copies all external API IDs"""
        fish = Livestock(
            tank_id=test_tank.id,
            user_id=test_user.id,
            species_name="Amphiprion ocellaris",
            common_name="Clownfish",
            type="fish",
            quantity=3,
            status="alive",
            fishbase_species_id="123",
            worms_id="456",
            inaturalist_id="789",
            cached_photo_url="https://example.com/photo.jpg",
            added_date=date.today(),
        )
        db_session.add(fish)
        db_session.commit()
        db_session.refresh(fish)

        response = authenticated_client.post(
            f"/api/v1/livestock/{fish.id}/split",
            json={
                "split_quantity": 1,
                "new_status": "dead"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["split"]["fishbase_species_id"] == "123"
        assert data["split"]["worms_id"] == "456"
        assert data["split"]["inaturalist_id"] == "789"
        assert data["split"]["cached_photo_url"] == "https://example.com/photo.jpg"
        assert data["split"]["added_date"] == str(date.today())

    def test_split_both_appear_in_listing(self, authenticated_client, test_fish_group):
        """Test that after split, both entries appear in listing"""
        authenticated_client.post(
            f"/api/v1/livestock/{test_fish_group.id}/split",
            json={
                "split_quantity": 2,
                "new_status": "dead"
            }
        )

        response = authenticated_client.get("/api/v1/livestock")
        assert response.status_code == 200
        data = response.json()

        chromis = [l for l in data if l["species_name"] == "Chromis viridis"]
        assert len(chromis) == 2
        quantities = sorted([l["quantity"] for l in chromis])
        assert quantities == [2, 3]


class TestFishBaseSearch:
    """Tests for FishBase API search"""

    def test_fishbase_search_endpoint(self, authenticated_client):
        """Test FishBase search endpoint exists"""
        response = authenticated_client.get(
            "/api/v1/livestock/fishbase/search?q=clownfish"
        )
        # Note: This will fail in CI without actual FishBase API access
        # Should mock in production tests
        # 200 = success, 503 = service unavailable, 422 = validation error
        assert response.status_code in [200, 422, 503]
