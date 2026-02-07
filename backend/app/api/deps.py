"""
API Dependencies

FastAPI dependency injection for common operations.

What are Dependencies?
======================
FastAPI dependencies are reusable functions that:
1. Run before endpoint handlers
2. Can be injected into endpoints
3. Provide common functionality (auth, database, etc.)

Why use dependencies?
=====================
- DRY principle: Write auth logic once, use everywhere
- Security: Centralized authentication checking
- Type safety: FastAPI validates dependency results
- Testability: Easy to mock in tests

Key Dependencies:
=================
- get_db: Provides database session
- get_current_user: Validates JWT and returns authenticated user
- get_current_active_user: Ensures user account is active (future enhancement)

Usage Example:
==============
```python
@router.get("/tanks")
async def get_tanks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # current_user is automatically populated from JWT
    # db session is automatically provided
    tanks = db.query(Tank).filter(Tank.user_id == current_user.id).all()
    return tanks
```
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData
from app.core.config import settings

# OAuth2 password bearer for JWT token extraction
# tokenUrl points to our login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Process:
    1. Extract token from Authorization header (Bearer <token>)
    2. Decode JWT token using secret key
    3. Extract user email from token payload
    4. Query database for user
    5. Return User model

    Args:
        token: JWT token from Authorization header
        db: Database session

    Returns:
        User model of authenticated user

    Raises:
        HTTPException 401: If token is invalid, expired, or user not found

    Security Notes:
    ===============
    - Token signature is verified using SECRET_KEY
    - Token expiration is checked automatically by jose
    - User existence is verified in database
    - Multi-tenancy: Each request knows which user is making it
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    # Query user from database
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user account is active.

    Future Enhancement:
    ===================
    Add is_active field to User model for account suspension.
    For now, just passes through the current user.

    Args:
        current_user: User from get_current_user dependency

    Returns:
        Active user

    Raises:
        HTTPException 400: If user account is deactivated
    """
    # Future: Check user.is_active
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user has admin privileges.

    Process:
    1. Get current authenticated user
    2. Check if user has is_admin=True
    3. Raise 403 if not admin

    Args:
        current_user: User from get_current_user dependency

    Returns:
        Admin user

    Raises:
        HTTPException 403: If user is not an administrator

    Usage:
    ======
    ```python
    @router.get("/admin/users")
    async def list_all_users(
        admin: User = Depends(get_current_admin_user),
        db: Session = Depends(get_db)
    ):
        # Only admins can access this endpoint
        return db.query(User).all()
    ```
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
