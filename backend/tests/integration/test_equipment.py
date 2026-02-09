"""
Integration tests for Equipment endpoints
"""
import pytest
from datetime import date
from app.models.tank import Tank
from app.models.equipment import Equipment


@pytest.fixture
def test_tank(db_session, test_user):
    """Create a test tank for equipment tests"""
    tank = Tank(
        name="Equipment Test Tank",
        display_volume_liters=200,
        sump_volume_liters=50,
        user_id=test_user.id
    )
    db_session.add(tank)
    db_session.commit()
    db_session.refresh(tank)
    return tank


@pytest.fixture
def test_equipment(db_session, test_user, test_tank):
    """Create a test equipment item"""
    equip = Equipment(
        tank_id=test_tank.id,
        user_id=test_user.id,
        name="Return Pump",
        equipment_type="pump",
        manufacturer="Ecotech",
        model="Vectra M2",
        specs={"flow_rate": "1000 GPH", "power": "60W"},
        purchase_date=date.today(),
        purchase_price="$350",
        condition="new",
        status="active",
        notes="Installed on day 1"
    )
    db_session.add(equip)
    db_session.commit()
    db_session.refresh(equip)
    return equip


class TestCreateEquipment:
    """Tests for creating equipment"""

    def test_create_equipment_success(self, authenticated_client, test_tank):
        """Test successful equipment creation"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "Protein Skimmer",
                "equipment_type": "skimmer",
                "manufacturer": "Nyos",
                "model": "Quantum 160",
                "specs": {"air_draw": "600 L/h"},
                "purchase_date": str(date.today()),
                "purchase_price": "$450",
                "condition": "new",
                "status": "active",
                "notes": "Great skimmer"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Protein Skimmer"
        assert data["equipment_type"] == "skimmer"
        assert data["manufacturer"] == "Nyos"
        assert data["model"] == "Quantum 160"
        assert data["specs"] == {"air_draw": "600 L/h"}
        assert data["status"] == "active"
        assert "id" in data

    def test_create_equipment_minimal(self, authenticated_client, test_tank):
        """Test creating equipment with only required fields"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "Heater",
                "equipment_type": "heater"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Heater"
        assert data["status"] == "active"  # default
        assert data["manufacturer"] is None

    def test_create_equipment_invalid_tank(self, authenticated_client):
        """Test equipment creation with non-existent tank"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": "00000000-0000-0000-0000-000000000000",
                "name": "Heater",
                "equipment_type": "heater"
            }
        )
        assert response.status_code == 404

    def test_create_equipment_missing_fields(self, authenticated_client, test_tank):
        """Test equipment creation with missing required fields"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "Pump"
                # Missing equipment_type
            }
        )
        assert response.status_code == 422

    def test_create_equipment_unauthorized(self, client, test_tank):
        """Test equipment creation without authentication"""
        response = client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "Pump",
                "equipment_type": "pump"
            }
        )
        assert response.status_code == 401


class TestListEquipment:
    """Tests for listing equipment"""

    def test_list_all_equipment(self, authenticated_client, test_equipment):
        """Test listing all user equipment"""
        response = authenticated_client.get("/api/v1/equipment")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(e["name"] == "Return Pump" for e in data)

    def test_list_equipment_by_tank(self, authenticated_client, test_tank, test_equipment):
        """Test filtering equipment by tank"""
        response = authenticated_client.get(
            f"/api/v1/equipment?tank_id={test_tank.id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert all(e["tank_id"] == str(test_tank.id) for e in data)

    def test_list_equipment_invalid_tank(self, authenticated_client):
        """Test filtering by non-existent tank"""
        response = authenticated_client.get(
            "/api/v1/equipment?tank_id=00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404

    def test_list_equipment_by_type(self, authenticated_client, test_equipment):
        """Test filtering equipment by type"""
        response = authenticated_client.get("/api/v1/equipment?equipment_type=pump")
        assert response.status_code == 200
        data = response.json()
        assert all(e["equipment_type"] == "pump" for e in data)

    def test_list_equipment_by_status(self, authenticated_client, test_equipment):
        """Test filtering equipment by status"""
        response = authenticated_client.get("/api/v1/equipment?status=active")
        assert response.status_code == 200
        data = response.json()
        assert all(e["status"] == "active" for e in data)

    def test_list_equipment_combined_filters(self, authenticated_client, test_tank, test_equipment):
        """Test combining multiple filters"""
        response = authenticated_client.get(
            f"/api/v1/equipment?tank_id={test_tank.id}&equipment_type=pump&status=active"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1


class TestGetEquipment:
    """Tests for getting specific equipment"""

    def test_get_equipment_success(self, authenticated_client, test_equipment):
        """Test successful equipment retrieval"""
        response = authenticated_client.get(f"/api/v1/equipment/{test_equipment.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_equipment.id)
        assert data["name"] == "Return Pump"
        assert data["manufacturer"] == "Ecotech"

    def test_get_equipment_not_found(self, authenticated_client):
        """Test getting non-existent equipment"""
        response = authenticated_client.get(
            "/api/v1/equipment/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


class TestUpdateEquipment:
    """Tests for updating equipment"""

    def test_update_equipment_success(self, authenticated_client, test_equipment):
        """Test successful equipment update"""
        response = authenticated_client.put(
            f"/api/v1/equipment/{test_equipment.id}",
            json={
                "name": "Updated Pump",
                "condition": "used",
                "notes": "Running for 6 months"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Pump"
        assert data["condition"] == "used"
        assert data["notes"] == "Running for 6 months"
        assert data["manufacturer"] == "Ecotech"  # Unchanged

    def test_update_equipment_partial(self, authenticated_client, test_equipment):
        """Test partial equipment update"""
        response = authenticated_client.put(
            f"/api/v1/equipment/{test_equipment.id}",
            json={"status": "stock"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "stock"
        assert data["name"] == "Return Pump"  # Unchanged

    def test_update_equipment_not_found(self, authenticated_client):
        """Test updating non-existent equipment"""
        response = authenticated_client.put(
            "/api/v1/equipment/00000000-0000-0000-0000-000000000000",
            json={"name": "Test"}
        )
        assert response.status_code == 404


class TestDeleteEquipment:
    """Tests for deleting equipment"""

    def test_delete_equipment_success(self, authenticated_client, test_equipment):
        """Test successful equipment deletion"""
        equip_id = test_equipment.id
        response = authenticated_client.delete(f"/api/v1/equipment/{equip_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = authenticated_client.get(f"/api/v1/equipment/{equip_id}")
        assert get_response.status_code == 404

    def test_delete_equipment_not_found(self, authenticated_client):
        """Test deleting non-existent equipment"""
        response = authenticated_client.delete(
            "/api/v1/equipment/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404
