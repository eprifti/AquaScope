# ReefLab Backend Architecture

## Overview

ReefLab backend is built with FastAPI, a modern Python web framework designed for building APIs with automatic documentation, type hints, and async support.

## Architecture Decisions

### Why FastAPI?

1. **Performance**: FastAPI is one of the fastest Python frameworks, comparable to Node.js and Go
2. **Type Safety**: Built on Pydantic for data validation and serialization
3. **Async Support**: Native async/await for concurrent operations
4. **Automatic Documentation**: OpenAPI (Swagger) docs generated automatically
5. **Easy to Learn**: Intuitive API design, great for rapid development

### Why PostgreSQL + InfluxDB?

**PostgreSQL** (Relational Database):
- User accounts, authentication data
- Tank information, notes, photos metadata
- Maintenance schedules, livestock inventory
- ACID compliance for transactional data
- Strong relationships between entities

**InfluxDB2** (Time-Series Database):
- Purpose-built for time-series data (parameter measurements)
- Efficient storage with compression
- Optimized queries for temporal data
- Native Grafana integration
- Tags for multi-dimensional filtering

**Why Not Just PostgreSQL?**
While PostgreSQL can store time-series data, InfluxDB offers:
- 10-100x better compression for time-series
- Faster queries for time-range operations
- Built-in downsampling and retention policies
- Better Grafana integration
- Specialized query language (Flux) for time-series

### Database Models

#### User Model
```python
- UUID primary key (security, prevents enumeration)
- Email (unique, indexed for fast login lookup)
- Hashed password (bcrypt, never plain text)
- Timestamps (audit trail)
```

**Design Choice**: UUID vs Auto-increment
- UUIDs are globally unique (no collision risk)
- Better for distributed systems
- Prevents user enumeration attacks
- Slightly larger storage (acceptable trade-off)

#### Tank Model
```python
- UUID primary key
- User foreign key (multi-tenancy)
- Name, volume, setup date
- One-to-many: User -> Tanks
```

**Design Choice**: Separate tank entity
- Users often have multiple tanks
- Parameters are tank-specific
- Allows tank-level analytics

#### Note, Photo, MaintenanceReminder, Livestock Models
```python
- All reference both User and Tank (denormalized)
- User FK: For multi-tenancy queries
- Tank FK: For tank-specific filtering
```

**Design Choice**: Denormalization
- Could query tank.user_id for ownership
- Direct user_id FK is faster (one less join)
- Disk space is cheap, query speed is valuable

### Authentication & Security

#### Password Hashing (bcrypt)
- **Never** store plain text passwords
- Bcrypt is slow (intentionally) - prevents brute force
- Automatic salt generation
- Configurable work factor (future-proof)

#### JWT Tokens
**Why JWT vs Sessions?**
- Stateless: No server-side session storage
- Scalable: Works across multiple backend instances
- API-friendly: Easy for mobile apps, SPA frontends
- Self-contained: Token includes user identity

**JWT Structure**:
```json
{
  "sub": "user@example.com",
  "exp": 1640995200
}
```

**Security Considerations**:
- Tokens expire (30 minutes default)
- Signature verification prevents tampering
- Secret key must be strong and private
- HTTPS required in production

#### OAuth2PasswordBearer
- Standard OAuth2 flow
- Authorization header: `Bearer <token>`
- FastAPI validates automatically

### API Design Principles

#### RESTful Endpoints
```
POST   /auth/register      - Create user
POST   /auth/login         - Authenticate
GET    /auth/me            - Current user
GET    /tanks              - List tanks
POST   /tanks              - Create tank
GET    /tanks/{id}         - Get tank
PUT    /tanks/{id}         - Update tank
DELETE /tanks/{id}         - Delete tank
```

#### Response Models (Pydantic)
- Validate input data
- Serialize output data
- Automatic API documentation
- Type safety

**Example**:
```python
@router.get("/tanks", response_model=List[TankResponse])
def get_tanks(current_user: User = Depends(get_current_user)):
    # FastAPI automatically:
    # 1. Validates current_user is authenticated
    # 2. Serializes response to TankResponse schema
    # 3. Generates OpenAPI docs
    pass
```

### Dependency Injection

FastAPI's dependency system provides:
1. **Database Sessions**: Automatic creation and cleanup
2. **Authentication**: Extract and validate JWT tokens
3. **Reusability**: Write once, use in many endpoints

**Example**:
```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # Decode token, query user, return
    pass

@router.get("/protected")
def protected_endpoint(user: User = Depends(get_current_user)):
    # user is automatically populated
    pass
```

### InfluxDB Integration

#### Data Model
```
Measurement: reef_parameters
Tags: user_id, tank_id, parameter_type
Field: value
Timestamp: auto or provided
```

**Why this structure?**
- Tags are indexed (fast filtering)
- Single field simplifies queries
- parameter_type tag allows filtering by type
- User/tank tags enable multi-tenancy

#### Query Examples

**Get all calcium readings for last 30 days**:
```flux
from(bucket: "reef_parameters")
  |> range(start: -30d)
  |> filter(fn: (r) => r["_measurement"] == "reef_parameters")
  |> filter(fn: (r) => r["user_id"] == "abc-123")
  |> filter(fn: (r) => r["parameter_type"] == "calcium")
```

**Get latest reading for each parameter**:
```flux
from(bucket: "reef_parameters")
  |> range(start: -1h)
  |> filter(fn: (r) => r["tank_id"] == "def-456")
  |> last()
```

### Database Migrations (Alembic)

#### Why Migrations?
1. **Version Control**: Track schema changes
2. **Collaboration**: Share schema changes with team
3. **Rollback**: Undo problematic changes
4. **Production Safety**: Review before applying

#### Workflow
```bash
# 1. Modify SQLAlchemy models
# 2. Generate migration
alembic revision --autogenerate -m "Add is_active to User"

# 3. Review migration file
# 4. Apply migration
alembic upgrade head

# 5. Rollback if needed
alembic downgrade -1
```

#### How Autogenerate Works
1. Alembic reads current database schema
2. Compares with SQLAlchemy models
3. Generates Python code to bridge gap
4. You review and apply

### Project Structure Rationale

```
app/
├── main.py              # Application entry point, middleware, routes
├── database.py          # SQLAlchemy setup, session management
├── core/
│   ├── config.py        # Environment variables, settings
│   └── security.py      # Password hashing, JWT creation
├── models/              # SQLAlchemy ORM models (database schema)
├── schemas/             # Pydantic models (API validation)
├── api/
│   ├── deps.py          # Reusable dependencies (auth, db)
│   └── v1/              # API version 1 endpoints
└── services/            # External integrations (InfluxDB, FishBase)
```

**Why this structure?**
- **Separation of Concerns**: Each layer has a clear purpose
- **Scalability**: Easy to add v2 API alongside v1
- **Testability**: Each component can be tested independently
- **Maintainability**: Know where to find things

### Error Handling

FastAPI provides automatic error handling:
- 422 Validation Error (Pydantic catches bad input)
- 401 Unauthorized (JWT validation fails)
- 404 Not Found (resource doesn't exist)
- 500 Internal Server Error (unhandled exceptions)

**Custom Errors**:
```python
raise HTTPException(
    status_code=400,
    detail="Email already registered"
)
```

### Testing Strategy

#### Unit Tests
- Test individual functions
- Mock database, external APIs
- Fast, isolated

#### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Verify request/response

#### Future: Pytest Fixtures
```python
@pytest.fixture
def test_db():
    # Create test database
    yield db
    # Clean up

def test_register(test_db):
    response = client.post("/auth/register", json={...})
    assert response.status_code == 201
```

## Performance Considerations

### Database Indexing
- UUID primary keys (indexed automatically)
- Foreign keys (indexed for joins)
- Email (unique, indexed for login)
- Timestamps (indexed for sorting)
- parameter_type, next_due (indexed for filtering)

### Query Optimization
- Use eager loading for relationships (avoid N+1)
- Pagination for large result sets
- Database connection pooling (SQLAlchemy)

### Caching (Future)
- Redis for frequently accessed data
- Cache user sessions
- Cache FishBase API results

## Security Best Practices

1. **Never commit `.env` files** (contains secrets)
2. **Use environment variables** for configuration
3. **Validate all input** (Pydantic handles this)
4. **Sanitize file uploads** (check extensions, size)
5. **Use HTTPS in production** (encrypt tokens)
6. **Rate limit login attempts** (prevent brute force)
7. **Keep dependencies updated** (security patches)

## Deployment Considerations

### Docker
- Multi-stage builds (smaller images)
- Health checks (restart on failure)
- Volume mounts (data persistence)
- Network isolation (security)

### Environment Variables
- Different `.env` for dev/staging/prod
- Never hardcode secrets
- Use strong random values for SECRET_KEY

### Database Backups
- Regular PostgreSQL dumps
- InfluxDB backup commands
- Store backups securely (S3, etc.)

## Future Enhancements

### Short Term
- Add remaining CRUD endpoints (tanks, notes, photos, etc.)
- Implement parameter submission endpoint
- Add photo upload with thumbnail generation
- Complete maintenance reminder scheduling

### Medium Term
- Email notifications
- Password reset flow
- Email verification
- Rate limiting
- API versioning (v2)

### Long Term
- WebSocket support (real-time updates)
- GraphQL API (flexible queries)
- Advanced analytics (ML for parameter predictions)
- Mobile push notifications
- Hardware integration (ReefPi, Neptune)

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [InfluxDB Documentation](https://docs.influxdata.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
