"""
Integration tests for notes API endpoints
"""
import pytest


@pytest.mark.integration
class TestNotesAPI:
    """Test notes CRUD operations"""

    def test_create_note(self, authenticated_client, test_user, db_session):
        """Test creating a new note"""
        from app.models.tank import Tank

        tank = Tank(user_id=test_user.id, name="Test Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()
        db_session.refresh(tank)

        response = authenticated_client.post(
            "/api/v1/notes",
            json={
                "tank_id": str(tank.id),
                "content": "Added new coral today"
            }
        )

        assert response.status_code == 201  # POST creates return 201
        data = response.json()
        assert data["content"] == "Added new coral today"
        assert data["tank_id"] == str(tank.id)
        assert "id" in data

    def test_list_notes(self, authenticated_client, test_user, db_session):
        """Test listing notes"""
        from app.models.tank import Tank
        from app.models.note import Note

        tank = Tank(user_id=test_user.id, name="Test Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()

        note1 = Note(user_id=test_user.id, tank_id=tank.id, content="Note 1")
        note2 = Note(user_id=test_user.id, tank_id=tank.id, content="Note 2")
        db_session.add_all([note1, note2])
        db_session.commit()

        response = authenticated_client.get("/api/v1/notes")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_list_notes_by_tank(self, authenticated_client, test_user, db_session):
        """Test filtering notes by tank"""
        from app.models.tank import Tank
        from app.models.note import Note

        tank1 = Tank(user_id=test_user.id, name="Tank 1", display_volume_liters=100.0)
        tank2 = Tank(user_id=test_user.id, name="Tank 2", display_volume_liters=100.0)
        db_session.add_all([tank1, tank2])
        db_session.commit()

        note1 = Note(user_id=test_user.id, tank_id=tank1.id, content="Tank 1 Note")
        note2 = Note(user_id=test_user.id, tank_id=tank2.id, content="Tank 2 Note")
        db_session.add_all([note1, note2])
        db_session.commit()

        response = authenticated_client.get(f"/api/v1/notes?tank_id={tank1.id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["content"] == "Tank 1 Note"

    def test_update_note(self, authenticated_client, test_user, db_session):
        """Test updating a note"""
        from app.models.tank import Tank
        from app.models.note import Note

        tank = Tank(user_id=test_user.id, name="Test Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()

        note = Note(user_id=test_user.id, tank_id=tank.id, content="Original")
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        response = authenticated_client.put(
            f"/api/v1/notes/{note.id}",
            json={"content": "Updated content"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Updated content"

    def test_delete_note(self, authenticated_client, test_user, db_session):
        """Test deleting a note"""
        from app.models.tank import Tank
        from app.models.note import Note

        tank = Tank(user_id=test_user.id, name="Test Tank", display_volume_liters=100.0)
        db_session.add(tank)
        db_session.commit()

        note = Note(user_id=test_user.id, tank_id=tank.id, content="To delete")
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)
        note_id = note.id

        response = authenticated_client.delete(f"/api/v1/notes/{note_id}")

        assert response.status_code == 204  # DELETE returns 204 No Content

        # Verify deletion
        response = authenticated_client.get(f"/api/v1/notes")
        data = response.json()
        note_ids = [n["id"] for n in data]
        assert str(note_id) not in note_ids


@pytest.mark.integration
class TestNotesErrorPaths:
    """Tests for notes error handling paths"""

    def test_create_note_invalid_tank(self, authenticated_client):
        """Test creating note with non-existent tank"""
        response = authenticated_client.post(
            "/api/v1/notes",
            json={
                "tank_id": "00000000-0000-0000-0000-000000000000",
                "content": "This should fail"
            }
        )
        assert response.status_code == 404

    def test_list_notes_invalid_tank(self, authenticated_client):
        """Test filtering notes by non-existent tank"""
        response = authenticated_client.get(
            "/api/v1/notes?tank_id=00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404

    def test_get_note_not_found(self, authenticated_client):
        """Test getting non-existent note"""
        response = authenticated_client.get(
            "/api/v1/notes/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404

    def test_update_note_not_found(self, authenticated_client):
        """Test updating non-existent note"""
        response = authenticated_client.put(
            "/api/v1/notes/00000000-0000-0000-0000-000000000000",
            json={"content": "This should fail"}
        )
        assert response.status_code == 404

    def test_delete_note_not_found(self, authenticated_client):
        """Test deleting non-existent note"""
        response = authenticated_client.delete(
            "/api/v1/notes/00000000-0000-0000-0000-000000000000"
        )
        assert response.status_code == 404
