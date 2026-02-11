"""
Integration tests for Finances API endpoints

Covers:
- GET /api/v1/finances/summary — spending aggregation
- GET /api/v1/finances/monthly — monthly breakdown
- Budget CRUD (create, list, update, delete)
- Budget status tracking
- Authentication enforcement
- Tank filtering
"""
import pytest
from datetime import date

from app.models.tank import Tank
from app.models.equipment import Equipment
from app.models.livestock import Livestock


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def test_tank(db_session, test_user):
    """Create a test tank for finance tests"""
    tank = Tank(
        name="Finance Test Tank",
        display_volume_liters=200,
        sump_volume_liters=50,
        user_id=test_user.id,
    )
    db_session.add(tank)
    db_session.commit()
    db_session.refresh(tank)
    return tank


@pytest.fixture
def test_equipment_with_price(db_session, test_user, test_tank):
    """Create equipment with a purchase price"""
    equip = Equipment(
        tank_id=test_tank.id,
        user_id=test_user.id,
        name="Return Pump",
        equipment_type="pump",
        purchase_price="€150.00",
        purchase_url="https://example.com/pump",
        status="active",
    )
    db_session.add(equip)
    db_session.commit()
    db_session.refresh(equip)
    return equip


@pytest.fixture
def test_livestock_with_price(db_session, test_user, test_tank):
    """Create livestock with a purchase price"""
    animal = Livestock(
        tank_id=test_tank.id,
        user_id=test_user.id,
        species_name="Amphiprion ocellaris",
        type="fish",
        quantity=2,
        purchase_price="€19.90",
        purchase_url="https://example.com/clownfish",
        status="alive",
        added_date=date.today(),
    )
    db_session.add(animal)
    db_session.commit()
    db_session.refresh(animal)
    return animal


# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestFinanceSummary:
    """GET /api/v1/finances/summary"""

    def test_summary_unauthenticated(self, client):
        """Unauthenticated request returns 401"""
        response = client.get("/api/v1/finances/summary")
        assert response.status_code == 401

    def test_summary_empty(self, authenticated_client, test_tank):
        """Summary with no items returns zero totals"""
        response = authenticated_client.get("/api/v1/finances/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_spent"] == 0
        assert data["total_equipment"] == 0
        assert data["total_livestock"] == 0

    def test_summary_with_data(self, authenticated_client, test_equipment_with_price, test_livestock_with_price):
        """Summary aggregates equipment + livestock prices"""
        response = authenticated_client.get("/api/v1/finances/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_equipment"] == pytest.approx(150.0, abs=0.01)
        assert data["total_livestock"] == pytest.approx(19.9, abs=0.01)
        assert data["total_spent"] == pytest.approx(169.9, abs=0.01)

    def test_summary_filtered_by_tank(self, authenticated_client, test_tank, test_equipment_with_price):
        """Summary can be filtered by tank_id"""
        response = authenticated_client.get(
            f"/api/v1/finances/summary?tank_id={test_tank.id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_equipment"] == pytest.approx(150.0, abs=0.01)


# ---------------------------------------------------------------------------
# MONTHLY
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestMonthlySpending:
    """GET /api/v1/finances/monthly"""

    def test_monthly_unauthenticated(self, client):
        response = client.get("/api/v1/finances/monthly")
        assert response.status_code == 401

    def test_monthly_empty(self, authenticated_client, test_tank):
        response = authenticated_client.get("/api/v1/finances/monthly")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ---------------------------------------------------------------------------
# BUDGET CRUD
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestBudgetCreate:
    """POST /api/v1/finances/budgets"""

    def test_create_budget_success(self, authenticated_client):
        """Create a budget with valid data"""
        response = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={
                "name": "Monthly Equipment",
                "amount": 200.0,
                "currency": "EUR",
                "period": "monthly",
                "category": "equipment",
            },
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["name"] == "Monthly Equipment"
        assert data["amount"] == 200.0
        assert data["currency"] == "EUR"
        assert data["period"] == "monthly"
        assert data["category"] == "equipment"
        assert data["is_active"] is True

    def test_create_budget_unauthenticated(self, client):
        response = client.post(
            "/api/v1/finances/budgets",
            json={"name": "Test", "amount": 100.0},
        )
        assert response.status_code == 401

    def test_create_budget_missing_name(self, authenticated_client):
        response = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"amount": 100.0},
        )
        assert response.status_code == 422

    def test_create_budget_default_currency_is_eur(self, authenticated_client):
        """Default currency should be EUR"""
        response = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"name": "Test Budget", "amount": 100.0},
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["currency"] == "EUR"

    def test_create_budget_with_tank(self, authenticated_client, test_tank):
        """Create a budget scoped to a specific tank"""
        response = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={
                "name": "Tank Budget",
                "amount": 500.0,
                "tank_id": str(test_tank.id),
            },
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["tank_id"] == str(test_tank.id)


@pytest.mark.integration
class TestBudgetList:
    """GET /api/v1/finances/budgets"""

    def test_list_budgets_empty(self, authenticated_client):
        response = authenticated_client.get("/api/v1/finances/budgets")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_budgets_after_create(self, authenticated_client):
        authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"name": "Budget 1", "amount": 100.0},
        )
        authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"name": "Budget 2", "amount": 200.0},
        )
        response = authenticated_client.get("/api/v1/finances/budgets")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2


@pytest.mark.integration
class TestBudgetUpdate:
    """PUT /api/v1/finances/budgets/{id}"""

    def test_update_budget(self, authenticated_client):
        create_resp = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"name": "Original", "amount": 100.0},
        )
        budget_id = create_resp.json()["id"]

        update_resp = authenticated_client.put(
            f"/api/v1/finances/budgets/{budget_id}",
            json={"name": "Updated", "amount": 250.0},
        )
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["name"] == "Updated"
        assert data["amount"] == 250.0


@pytest.mark.integration
class TestBudgetDelete:
    """DELETE /api/v1/finances/budgets/{id}"""

    def test_delete_budget(self, authenticated_client):
        create_resp = authenticated_client.post(
            "/api/v1/finances/budgets",
            json={"name": "To Delete", "amount": 100.0},
        )
        budget_id = create_resp.json()["id"]

        delete_resp = authenticated_client.delete(
            f"/api/v1/finances/budgets/{budget_id}"
        )
        assert delete_resp.status_code in (200, 204)

        # Verify it's gone
        list_resp = authenticated_client.get("/api/v1/finances/budgets")
        assert len(list_resp.json()) == 0


@pytest.mark.integration
class TestBudgetStatus:
    """GET /api/v1/finances/budgets/status"""

    def test_budget_status_with_spending(
        self, authenticated_client, test_equipment_with_price
    ):
        """Budget status should reflect spending against budget"""
        authenticated_client.post(
            "/api/v1/finances/budgets",
            json={
                "name": "Equipment Budget",
                "amount": 500.0,
                "period": "yearly",
                "category": "equipment",
            },
        )

        response = authenticated_client.get("/api/v1/finances/budgets/status")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["spent"] >= 0
        assert "remaining" in data[0]
        assert "percentage_used" in data[0]
        assert "is_over_budget" in data[0]


# ---------------------------------------------------------------------------
# PURCHASE URL FIELD
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestPurchaseUrl:
    """Test purchase_url field on equipment and livestock"""

    def test_equipment_purchase_url(self, authenticated_client, test_tank):
        """Equipment can be created with purchase_url"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "Test Pump",
                "equipment_type": "pump",
                "purchase_url": "https://amazon.com/pump/123",
            },
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["purchase_url"] == "https://amazon.com/pump/123"

    def test_livestock_purchase_url(self, authenticated_client, test_tank):
        """Livestock can be created with purchase_url"""
        response = authenticated_client.post(
            "/api/v1/livestock",
            json={
                "tank_id": str(test_tank.id),
                "species_name": "Amphiprion ocellaris",
                "type": "fish",
                "purchase_url": "https://fishstore.com/clown/42",
            },
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["purchase_url"] == "https://fishstore.com/clown/42"

    def test_equipment_purchase_url_optional(self, authenticated_client, test_tank):
        """purchase_url is optional"""
        response = authenticated_client.post(
            "/api/v1/equipment",
            json={
                "tank_id": str(test_tank.id),
                "name": "No URL Pump",
                "equipment_type": "pump",
            },
        )
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["purchase_url"] is None
