"""ICP Test API Endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status as http_status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from typing import List, Optional
import tempfile
import shutil
from pathlib import Path
from datetime import date

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.icp_test import ICPTest
from app.models.tank import Tank
from app.schemas.icp_test import (
    ICPTestCreate,
    ICPTestUpdate,
    ICPTestResponse,
    ICPTestSummary
)
from app.services.ati_parser import parse_ati_pdf, validate_parsed_data, ATIParserError

router = APIRouter()


@router.post("/", response_model=ICPTestResponse, status_code=http_status.HTTP_201_CREATED)
def create_icp_test(
    test_data: ICPTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new ICP test record"""
    # Verify tank belongs to user
    tank = db.query(Tank).filter(
        Tank.id == test_data.tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    # Create ICP test
    db_test = ICPTest(
        **test_data.model_dump(exclude={'tank_id'}),
        tank_id=test_data.tank_id,
        user_id=current_user.id
    )

    db.add(db_test)
    db.commit()
    db.refresh(db_test)

    return db_test


@router.post("/upload", response_model=List[ICPTestResponse], status_code=http_status.HTTP_201_CREATED)
async def upload_icp_test_pdf(
    tank_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an ATI ICP test PDF and automatically extract data.

    The PDF will be parsed to extract element values, scores, and metadata.
    ATI PDFs may contain multiple water types (saltwater, RO water, etc.),
    and a separate test record will be created for each water type.
    The extracted data will be saved and the PDF will be stored.
    """
    # Verify tank belongs to user
    tank = db.query(Tank).filter(
        Tank.id == tank_id,
        Tank.user_id == current_user.id
    ).first()

    if not tank:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Tank not found"
        )

    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted"
        )

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        tmp_path = tmp_file.name

    try:
        # Parse PDF - returns list of tests (one per water type)
        parsed_tests = parse_ati_pdf(tmp_path)

        if not parsed_tests:
            raise ATIParserError("No test data could be extracted from PDF")

        # Create upload directory if it doesn't exist
        upload_dir = Path("uploads/icp_tests")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename based on first test
        first_test = parsed_tests[0]
        filename = f"{current_user.id}_{tank_id}_{first_test['test_date']}_{file.filename}"
        file_path = upload_dir / filename

        # Move PDF to permanent location
        shutil.move(tmp_path, str(file_path))

        # Create ICP test records for each water type
        db_tests = []
        for parsed_data in parsed_tests:
            validate_parsed_data(parsed_data)

            # Add PDF storage info and tank_id to each test
            parsed_data['pdf_filename'] = file.filename
            parsed_data['pdf_path'] = str(file_path)
            parsed_data['tank_id'] = tank_id

            # Create ICP test from parsed data
            db_test = ICPTest(
                **parsed_data,
                user_id=current_user.id
            )

            db.add(db_test)
            db_tests.append(db_test)

        db.commit()

        # Refresh all tests to get generated IDs
        for db_test in db_tests:
            db.refresh(db_test)

        return db_tests

    except ATIParserError as e:
        # Clean up temp file on parsing error
        Path(tmp_path).unlink(missing_ok=True)
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF: {str(e)}"
        )
    except Exception as e:
        # Clean up temp file on any error
        Path(tmp_path).unlink(missing_ok=True)
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process upload: {str(e)}"
        )


@router.get("/", response_model=List[ICPTestSummary])
def list_icp_tests(
    tank_id: Optional[UUID] = Query(None, description="Filter by tank ID"),
    lab_name: Optional[str] = Query(None, description="Filter by lab name"),
    from_date: Optional[date] = Query(None, description="Filter tests from this date"),
    to_date: Optional[date] = Query(None, description="Filter tests until this date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List ICP tests for current user with optional filters"""
    query = db.query(ICPTest).filter(ICPTest.user_id == current_user.id)

    if tank_id:
        query = query.filter(ICPTest.tank_id == tank_id)

    if lab_name:
        query = query.filter(ICPTest.lab_name.ilike(f"%{lab_name}%"))

    if from_date:
        query = query.filter(ICPTest.test_date >= from_date)

    if to_date:
        query = query.filter(ICPTest.test_date <= to_date)

    query = query.order_by(desc(ICPTest.test_date))
    tests = query.offset(skip).limit(limit).all()

    return tests


@router.get("/{test_id}", response_model=ICPTestResponse)
def get_icp_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific ICP test by ID"""
    test = db.query(ICPTest).filter(
        ICPTest.id == test_id,
        ICPTest.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="ICP test not found"
        )

    return test


@router.put("/{test_id}", response_model=ICPTestResponse)
def update_icp_test(
    test_id: UUID,
    test_data: ICPTestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an ICP test"""
    test = db.query(ICPTest).filter(
        ICPTest.id == test_id,
        ICPTest.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="ICP test not found"
        )

    # Update fields
    update_data = test_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(test, field, value)

    db.commit()
    db.refresh(test)

    return test


@router.delete("/{test_id}", status_code=http_status.HTTP_204_NO_CONTENT)
def delete_icp_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an ICP test"""
    test = db.query(ICPTest).filter(
        ICPTest.id == test_id,
        ICPTest.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="ICP test not found"
        )

    # Delete PDF file if it exists
    if test.pdf_path:
        pdf_file = Path(test.pdf_path)
        pdf_file.unlink(missing_ok=True)

    db.delete(test)
    db.commit()

    return None
