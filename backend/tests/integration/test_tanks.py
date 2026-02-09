"""
Integration tests for tanks API endpoints
"""
import pytest
from datetime import date


@pytest.mark.integration
class TestTanksAPI:
    """Test tanks CRUD operations"""

    def test_create_tank(self, authenticated_client):
        """Test creating a new tank"""
        response = authenticated_client.post(
            "/api/v1/tanks",
            json={
                "name": "Main Display Tank",
                "display_volume_liters": 200.0,
                "setup_date": str(date.today()),
                "description": "My main reef tank"
            }
        )

        assert response.status_code == 201  # POST creates return 201
        data = response.json()
        assert data["name"] == "Main Display Tank"
        assert data["display_volume_liters"] == 200.0
        assert "id" in data

    def test_list_tanks(self, authenticated_client, test_user, db_session):
        """Test listing user's tanks"""
        # Create some tanks
        from app.models.tank import Tank

        tank1 = Tank(user_id=test_user.id, name="Tank 1", display_volume_liters=100.0)
        tank2 = Tank(user_id=test_user.id, name="Tank 2", display_volume_liters=150.0)
        db_session.add_all([tank1, tank2])
        db_session.commit()

        response = authenticated_client.get("/api/v1/tanks")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] in ["Tank 1", "Tank 2"]

    def test_get_tank_by_id(self, authenticated_client, test_user, db_session):
        """Test getting a specific tank"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Test Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.get(f"/api/v1/tanks/{tank.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(tank.id)
        assert data["name"] == "Test Tank"

    def test_get_nonexistent_tank(self, authenticated_client):
        """Test getting a tank that doesn't exist"""
        import uuid
        fake_id = str(uuid.uuid4())

        response = authenticated_client.get(f"/api/v1/tanks/{fake_id}")

        assert response.status_code == 404

    def test_update_tank(self, authenticated_client, test_user, db_session):
        """Test updating a tank"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Old Name", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.put(
            f"/api/v1/tanks/{tank.id}",
            json={
                "name": "New Name",
                "display_volume_liters": 150.0
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Name"
        assert data["display_volume_liters"] == 150.0

    def test_delete_tank(self, authenticated_client, test_user, db_session):
        """Test deleting a tank"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="To Delete", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)
        tank_id = tank.id

        response = authenticated_client.delete(f"/api/v1/tanks/{tank_id}")

        assert response.status_code == 204  # DELETE returns 204 No Content

        # Verify tank is deleted
        response = authenticated_client.get(f"/api/v1/tanks/{tank_id}")
        assert response.status_code == 404

    def test_cannot_access_other_users_tank(self, client, db_session, fake):
        """Test that users cannot access other users' tanks"""
        from app.models.user import User
        from app.models.tank import Tank
        from app.core.security import get_password_hash, create_access_token

        # Create two users
        user1 = User(
            email=fake.email(),
            username=fake.user_name(),
            hashed_password=get_password_hash("password123")
        )
        user2 = User(
            email=fake.email(),
            username=fake.user_name(),
            hashed_password=get_password_hash("password123")
        )
        db_session.add_all([user1, user2])
        db_session.commit()
        db_session.refresh(user1)
        db_session.refresh(user2)

        # User1 creates a tank
        tank = Tank(user_id=user1.id, name="User1 Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        # User2 tries to access User1's tank
        user2_token = create_access_token(subject=user2.email)
        client.headers = {"Authorization": f"Bearer {user2_token}"}

        response = client.get(f"/api/v1/tanks/{tank.id}")
        assert response.status_code == 404  # Should not find it (or 401 if endpoint checks ownership)


@pytest.mark.integration
class TestTankEvents:
    """Tests for tank events CRUD operations"""

    def test_create_tank_event(self, authenticated_client, test_user, db_session):
        """Test creating a tank event"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.post(
            f"/api/v1/tanks/{tank.id}/events",
            json={
                "title": "Tank Setup",
                "description": "Initial setup complete",
                "event_date": str(date.today()),
                "event_type": "milestone"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Tank Setup"
        assert data["event_type"] == "milestone"
        assert data["tank_id"] == str(tank.id)

    def test_create_tank_event_invalid_tank(self, authenticated_client):
        """Test creating event for non-existent tank"""
        response = authenticated_client.post(
            "/api/v1/tanks/00000000-0000-0000-0000-000000000000/events",
            json={
                "title": "Test Event",
                "event_date": str(date.today())
            }
        )
        assert response.status_code == 404

    def test_list_tank_events(self, authenticated_client, test_user, db_session):
        """Test listing tank events"""
        from app.models.tank import Tank, TankEvent

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        event1 = TankEvent(
            tank_id=tank.id, user_id=test_user.id,
            title="Event 1", event_date=date(2026, 1, 1)
        )
        event2 = TankEvent(
            tank_id=tank.id, user_id=test_user.id,
            title="Event 2", event_date=date(2026, 2, 1)
        )
        db_session.add_all([event1, event2])
        db_session.commit()

        response = authenticated_client.get(f"/api/v1/tanks/{tank.id}/events")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        # Should be ordered by date desc
        assert data[0]["title"] == "Event 2"

    def test_list_tank_events_invalid_tank(self, authenticated_client):
        """Test listing events for non-existent tank"""
        response = authenticated_client.get(
            "/api/v1/tanks/00000000-0000-0000-0000-000000000000/events"
        )
        assert response.status_code == 404

    def test_update_tank_event(self, authenticated_client, test_user, db_session):
        """Test updating a tank event"""
        from app.models.tank import Tank, TankEvent

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        event = TankEvent(
            tank_id=tank.id, user_id=test_user.id,
            title="Original Title", event_date=date.today()
        )
        db_session.add(event)
        db_session.commit()
        db_session.refresh(event)

        response = authenticated_client.put(
            f"/api/v1/tanks/{tank.id}/events/{event.id}",
            json={"title": "Updated Title", "description": "Added details"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Added details"

    def test_update_tank_event_not_found(self, authenticated_client, test_user, db_session):
        """Test updating non-existent event"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.put(
            f"/api/v1/tanks/{tank.id}/events/00000000-0000-0000-0000-000000000000",
            json={"title": "Test"}
        )
        assert response.status_code == 404

    def test_delete_tank_event(self, authenticated_client, test_user, db_session):
        """Test deleting a tank event"""
        from app.models.tank import Tank, TankEvent

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        event = TankEvent(
            tank_id=tank.id, user_id=test_user.id,
            title="To Delete", event_date=date.today()
        )
        db_session.add(event)
        db_session.commit()
        db_session.refresh(event)

        response = authenticated_client.delete(
            f"/api/v1/tanks/{tank.id}/events/{event.id}"
        )
        assert response.status_code == 204

        # Verify deletion
        response = authenticated_client.get(f"/api/v1/tanks/{tank.id}/events")
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_delete_tank_event_not_found(self, authenticated_client, test_user, db_session):
        """Test deleting non-existent event"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Event Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.delete(
            f"/api/v1/tanks/{tank.id}/events/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404


@pytest.mark.integration
class TestTankImage:
    """Tests for tank image upload/download"""

    def test_upload_image_invalid_tank(self, authenticated_client):
        """Test uploading image to non-existent tank"""
        import io
        response = authenticated_client.post(
            "/api/v1/tanks/00000000-0000-0000-0000-000000000000/upload-image",
            files={"file": ("test.jpg", io.BytesIO(b"fake image data"), "image/jpeg")}
        )
        assert response.status_code == 404

    def test_upload_image_invalid_type(self, authenticated_client, test_user, db_session):
        """Test uploading non-image file"""
        from app.models.tank import Tank
        import io

        tank = Tank(user_id=test_user.id, name="Image Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.post(
            f"/api/v1/tanks/{tank.id}/upload-image",
            files={"file": ("test.pdf", io.BytesIO(b"fake pdf data"), "application/pdf")}
        )
        assert response.status_code == 400

    def test_get_image_no_image(self, authenticated_client, test_user, db_session):
        """Test getting image for tank with no image"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="No Image Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.get(f"/api/v1/tanks/{tank.id}/image")
        assert response.status_code == 404

    def test_get_image_invalid_tank(self, authenticated_client):
        """Test getting image for non-existent tank"""
        response = authenticated_client.get(
            "/api/v1/tanks/00000000-0000-0000-0000-000000000000/image"
        )
        assert response.status_code == 404
