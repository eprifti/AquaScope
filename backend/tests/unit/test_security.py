"""
Unit tests for security functions
"""
import pytest
from datetime import timedelta
from jose import jwt

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.core.config import settings


@pytest.mark.unit
class TestPasswordHashing:
    """Test password hashing and verification"""

    def test_password_hash_and_verify(self):
        """Test that password hashing and verification work correctly"""
        password = "testpassword123"
        hashed = get_password_hash(password)

        # Hash should not equal plain password
        assert hashed != password

        # Verification should succeed with correct password
        assert verify_password(password, hashed) is True

        # Verification should fail with incorrect password
        assert verify_password("wrongpassword", hashed) is False

    def test_same_password_different_hashes(self):
        """Test that same password generates different hashes"""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hashes should be different (due to salt)
        assert hash1 != hash2

        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


@pytest.mark.unit
class TestJWTTokens:
    """Test JWT token creation and validation"""

    def test_create_access_token(self):
        """Test access token creation"""
        user_id = "test-user-123"
        token = create_access_token(subject=user_id)

        assert token is not None
        assert isinstance(token, str)

        # Decode and verify token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        assert payload["sub"] == user_id
        assert "exp" in payload

    def test_create_access_token_with_expires_delta(self):
        """Test token creation with custom expiration"""
        user_id = "test-user-123"
        expires_delta = timedelta(minutes=15)
        token = create_access_token(subject=user_id, expires_delta=expires_delta)

        assert token is not None

        # Decode and verify
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        assert payload["sub"] == user_id

    def test_token_expiration(self):
        """Test that expired tokens can be detected"""
        user_id = "test-user-123"
        # Create token that expires immediately
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(subject=user_id, expires_delta=expires_delta)

        # Attempting to decode should raise an exception
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
