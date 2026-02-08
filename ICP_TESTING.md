# ICP Test Integration - Testing Guide

## Overview

Complete ICP-OES water test integration with automatic ATI lab PDF parsing.

## Features Implemented

### Backend
- ✅ ICPTest database model (50+ element fields)
- ✅ Alembic migration for icp_tests table
- ✅ ATI PDF parser with automatic data extraction
- ✅ REST API endpoints at `/api/v1/icp-tests`
- ✅ PDF upload with multipart/form-data
- ✅ Element status tracking (NORMAL, CRITICALLY_LOW, etc.)
- ✅ Quality score storage (Major, Minor, Pollutants, Base)

### Frontend
- ✅ TypeScript types for ICP tests
- ✅ API client with upload support
- ✅ ICP Tests page with list and detail view
- ✅ Navigation link (🔬 ICP Tests)
- ✅ PDF upload interface
- ✅ Color-coded status indicators
- ✅ Responsive element display

## Testing Steps

### 1. Apply Database Migration

```bash
cd backend
alembic upgrade head
```

Expected output: Migration `k2l3m4n5o6p7` (add icp tests table) should apply successfully.

### 2. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

Verify:
- Server starts on http://localhost:8000
- API docs available at http://localhost:8000/docs
- Check `/api/v1/icp-tests` endpoints are listed

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Verify:
- Frontend starts on http://localhost:5173
- "ICP Tests" navigation link visible in sidebar (🔬)

### 4. Test PDF Upload

1. **Navigate to ICP Tests page**
   - Click "🔬 ICP Tests" in sidebar
   - Verify page loads without errors

2. **Upload Sample ATI PDF**
   - Select a tank from dropdown
   - Click "Upload ATI PDF"
   - Select: `data/2025-10-23-347998-ati.lab.results.pdf`
   - Wait for upload confirmation

3. **Verify Data Extraction**
   Expected parsed data from sample PDF:
   ```
   Test Date: 2025-10-23
   Lab: ATI Aquaristik
   Test ID: 347998

   Quality Scores:
   - Major Elements: 90/100
   - Minor Elements: 86/100
   - Pollutants: 100/100
   - Base Elements: 92/100

   Key Elements:
   - Salinity: 35.4 PSU (NORMAL)
   - KH: 9.47 °dKH (ABOVE_NORMAL)
   - Ca: 400.6 mg/l (NORMAL)
   - Mg: 1409.0 mg/l (NORMAL)
   - NO3: 3.0 mg/l (ABOVE_NORMAL)
   - PO4: 4.0 mg/l (ABOVE_NORMAL)
   - I: 20.55 µg/l (CRITICALLY_LOW)
   - F: 0.59 mg/l (CRITICALLY_LOW)
   ```

4. **Verify UI Display**
   - Test appears in history list
   - Quality scores shown with color indicators:
     - Green (90+): Major Elements
     - Yellow (86): Minor Elements
     - Green (100): Pollutants
   - Click test to view details
   - All element groups displayed correctly
   - Status badges color-coded appropriately:
     - Green: NORMAL
     - Orange: ABOVE_NORMAL/BELOW_NORMAL
     - Red: CRITICALLY_LOW/CRITICALLY_HIGH

### 5. Test API Endpoints Directly

Using the API documentation at http://localhost:8000/docs:

**POST /api/v1/icp-tests/upload**
- Upload the sample PDF
- Verify 201 Created response
- Check response includes all parsed elements

**GET /api/v1/icp-tests**
- List all tests
- Verify filtering by tank_id works
- Check pagination parameters

**GET /api/v1/icp-tests/{id}**
- Get specific test with full details
- Verify all 50+ element fields present

**DELETE /api/v1/icp-tests/{id}**
- Delete test
- Verify PDF file removed from uploads/icp_tests/

### 6. Test Edge Cases

1. **Invalid PDF**
   - Upload a non-PDF file
   - Verify error message: "Only PDF files are accepted"

2. **Non-ATI PDF**
   - Upload a random PDF
   - Verify error message about parsing failure

3. **No Tank Selected**
   - Try uploading without selecting tank
   - Verify upload button disabled

4. **Tank Filtering**
   - Create tests for multiple tanks
   - Use tank filter dropdown
   - Verify only tests for selected tank shown

## Database Schema

The `icp_tests` table includes:

**Metadata:**
- id, tank_id, user_id
- test_date, lab_name, test_id
- sample_date, received_date, evaluated_date

**Quality Scores (0-100):**
- score_major_elements
- score_minor_elements
- score_pollutants
- score_base_elements
- score_overall

**Elements (50+ fields):**
Each element has `value` and `status` fields:
- Base: salinity, kh
- Major (10): cl, na, mg, s, ca, k, br, sr, b, f
- Minor (18): li, si, i, ba, mo, ni, mn, as, be, cr, co, fe, cu, se, ag, v, zn, sn
- Nutrients: no3, p, po4
- Pollutants (10): al, sb, bi, pb, cd, la, tl, ti, w, hg

**Additional:**
- recommendations (JSON)
- dosing_instructions (JSON)
- pdf_filename, pdf_path
- notes (text)
- created_at, updated_at

## Parser Details

The ATI parser (`backend/app/services/ati_parser.py`) handles:

- **Date Formats:** MM/DD/YYYY, YYYY-MM-DD, DD.MM.YYYY
- **Status Values:** NORMAL, ABOVE_NORMAL, BELOW_NORMAL, CRITICALLY_LOW, CRITICALLY_HIGH
- **Undetected Elements:** Elements with "---" values (status recorded, no value)
- **Multi-word Status:** Converts "CRITICALLY LOW" to "CRITICALLY_LOW"
- **Layout Parsing:** ATI format with element symbols followed by values

## Troubleshooting

### PDF Parsing Fails

**Error:** "pdftotext not found"
```bash
# Install poppler
brew install poppler  # macOS
apt-get install poppler-utils  # Linux
```

**Error:** "Could not extract test date"
- Check PDF format matches ATI layout
- Verify date appears in expected format
- Try extracting date from filename

### Upload Fails

**Error:** "Tank not found"
- Verify tank exists and belongs to current user
- Check tank_id is valid UUID

**Error:** "Failed to parse PDF"
- Check PDF is ATI Aquaristik format
- Verify PDF is not password-protected
- Ensure PDF contains readable text (not scanned image)

### Database Migration Fails

**Error:** Revision already exists
```bash
# Check current revision
alembic current

# If needed, stamp to correct revision
alembic stamp head
```

## Sample Data

The sample ATI PDF is located at:
```
data/2025-10-23-347998-ati.lab.results.pdf
```

This test shows:
- Good major elements (score: 90)
- Good minor elements (score: 86)
- Excellent pollutant levels (score: 100)
- Some elements critically low (Iodine, Fluorine)
- Some nutrients above normal (NO3, PO4, P)

## Next Steps

After successful testing:

1. **Import Historical Tests**
   - Upload previous ICP test PDFs
   - Build trend analysis

2. **Add Comparison View**
   - Compare two tests side-by-side
   - Show element changes over time

3. **Dosing Calculator**
   - Use lab recommendations
   - Calculate supplement additions

4. **Alerts/Notifications**
   - Alert on critically low/high elements
   - Scheduled test reminders

5. **Other Lab Support**
   - Triton parser
   - Fauna Marin parser
   - Generic CSV import
