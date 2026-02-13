# AquaScope Roadmap

Planned features and improvements for future releases.

---

## Finances Module

**Priority**: High
**Status**: Done

AquaScope already tracks purchase prices across Equipment, Consumables, and Livestock. A dedicated Finances module would aggregate this data and provide budgeting/cost analysis.

### Done

Fully implemented in v1.8.0 with spending analysis, category/tank breakdown, monthly charts, electricity costs, and budget management.

### Scope

- **Dashboard widget**: Total cost of ownership per tank, monthly spending trend
- **Dedicated Finances page** with:
  - Spending breakdown by category (equipment, consumables, livestock, maintenance)
  - Spending breakdown by tank
  - Monthly/yearly cost charts (bar chart + line trend)
  - Cost per consumable usage (cost-per-dose tracking)
  - Budget setting and alerts (e.g., "spending over $X this month")
  - Running total / cumulative cost over time
- **Data sources**: Pull from existing `purchase_price` fields in:
  - Equipment (one-time cost)
  - Consumables (recurring cost, linked to usage frequency)
  - Livestock (one-time cost)
  - ICP tests (lab fees)
- **Export**: CSV/PDF cost reports

### Backend

- New `/api/v1/finances/` endpoints:
  - `GET /summary` — aggregated totals by category and tank
  - `GET /monthly` — monthly breakdown with chart data
  - `GET /budget` — budget status and alerts
  - `POST /budget` — set monthly/yearly budget per tank or global
- New `budgets` table (optional): tank_id, period, amount, alert_threshold

### Frontend

- New `Finances.tsx` page with Recharts visualizations
- Dashboard summary card showing monthly spend

---

## Admin Module Toggles

**Priority**: High
**Status**: Done

Allow administrators to enable/disable modules per installation. Not all users need every module — a freshwater hobbyist with one tank may only want Parameters, Notes, and Photos.

### Implementation

- `app_settings` table (key-value store) with Alembic migration
- `GET /api/v1/admin/settings/modules` — any authenticated user can read
- `PUT /api/v1/admin/settings/modules` — admin only
- Admin page: "Modules" tab with toggle switches (core modules locked on)
- `useModuleSettings()` context provides `isEnabled(module)` app-wide
- Sidebar navigation filters items based on enabled modules
- Disabled modules: hidden from UI, data preserved, API still accessible

---

## Equipment Enhancements

**Priority**: Medium
**Status**: Partially Done

### Done

- Color-coded cards by condition (green/blue/yellow/orange/red)
- Condition filter dropdown
- Convert equipment to consumable (and vice versa)
- **Maintenance linking**: auto-create maintenance reminders when equipment condition degrades to needs_maintenance or failing; auto-deactivate when condition improves

### Planned

- **Warranty tracking**: warranty_end_date field, visual alert when expiring
- **Replacement history**: link old equipment to its replacement
- **Power consumption**: watts field per equipment, total power draw per tank

---

## Native App (Capacitor)

**Priority**: Medium
**Status**: In Progress (Phase 2)

Local-first mobile app using Capacitor + SQLite. One codebase, three deployment modes: Web (Docker), PWA, Native (App Store / Play Store).

### Remaining Work

- Complete local API implementations for all modules
- First-launch onboarding / Welcome screen
- Seed data from Excel for initial demo
- Camera integration for native photo capture
- App Store / Play Store submission
- Data export/import for portability between web and native

---

## Dashboard Improvements

**Priority**: Medium
**Status**: Done

### Done

Implemented in v1.9.0: sparklines, maturity badges, alert badges, tank images, and animated banners.

- Per-tank quick-glance cards with key parameters
- Alert badges for overdue maintenance, out-of-range parameters, low stock consumables
- Recent activity feed (photos, notes, parameter entries)
- Water change schedule calendar view

---

## Data Import/Export

**Priority**: Medium
**Status**: Partially Done

### Done

- Selective ZIP export/import
- CSV parameter export
- Excel/CSV import for historical data

### Planned

- ATI ICP PDF auto-parse (currently manual CSV)

---

## Species Database Integration

**Priority**: Low
**Status**: Partially Done

### Done

- WoRMS integration for marine species
- iNaturalist integration for photos and taxonomy
- FishBase integration for freshwater species
- Species search with cached results
- **Typeahead species lookup** — debounced search on the species name field in both create and edit modes
- Compatibility checker with 8-rule engine, heatmap matrix, and network graph
- Species traits knowledge base (data/species-traits.json) with admin CRUD API

### Planned

- Growth tracking with photo comparison

---

## Multi-User / Sharing

**Priority**: Low
**Status**: Partially Done

### Done

- Public tank profile page (shareable read-only links) — shipped in v1.9.0

### Planned

- Invite other users to view/edit a tank (read-only or collaborator)
- Community parameter benchmarks (anonymous aggregated data)

---

## Compatibility Checker Enhancements

**Priority**: Low
**Status**: Done (core), planned extensions

### Done

- 60+ species knowledge base with genus-level matching
- 8-rule compatibility engine (aggression, reef-safety, predator-prey, tank-size, etc.)
- Inline compatibility alert in livestock form (create + edit modes)
- Full tank compatibility modal with issues list
- Heatmap matrix visualization (CSS grid, color-coded, asymmetric aggressor/victim axes)
- Force-directed network graph visualization (SVG, directed edges, category-colored nodes)
- Species traits admin CRUD via API + admin UI with responsive table layout
- Shared JSON knowledge base (data/species-traits.json)
- Water type validation (frontend + backend)
- Typeahead species lookup in livestock form (debounced WoRMS/iNaturalist/FishBase search)

### Planned

- Community-contributed species traits submissions
- Per-species detailed compatibility profiles
- Compatibility score aggregation per tank

---

## Water Change Calculator — Correction Plan

**Priority**: High
**Status**: In Progress

Enhance the Water Change Calculator with a holistic correction mode that analyzes ALL parameters at once, recommends a safe multi-step schedule, and shows color-coded before/after comparisons.

### Scope

- **Color-coded Impact tab**: Current and After WC values show green/yellow/red based on parameter status
- **Correction Plan tab**: new third tab with:
  - Parameter status overview — all params with optimal/warning/critical badges
  - Smart algorithm to find the optimal WC% that improves the most parameters
  - Step-by-step schedule (e.g., "4 changes of 20% over 8 days") with configurable max % and spacing
  - Before/after comparison with status transition badges (critical → optimal)
  - Uncorrectable parameters flagged with link to Dosing Calculator
- **Stability-focused scheduling**: limits single changes to 25% (configurable), spaces them 2 days apart, caps at 6 steps (~2 weeks)

---

## Parameter Trend Predictions

**Priority**: Medium
**Status**: Planned

Using the 90-day parameter history, show simple linear trend lines on the Parameters page and dashboard. Example: "Ca dropping ~2 ppm/day, will hit 400 in 5 days". Helps aquarists anticipate problems before they happen.

### Scope

- Linear regression on the last 90 days of readings per parameter
- Trend direction indicator (rising, falling, stable) on dashboard sparklines
- Predicted value at a future date (e.g., 7 days, 14 days)
- Warning when a trend will cross min/max thresholds within the prediction window
- Visual trend line overlay on the parameter chart

---

## Parameter Alerting / Thresholds

**Priority**: Medium
**Status**: Planned

Set min/max ranges per parameter per tank and get alerts when a reading is out of range. The parameter presets infrastructure already exists — this adds the alert trigger logic and notification delivery.

### Scope

- Per-tank, per-parameter threshold configuration (min, max, warning zones)
- Dashboard badge alerts when parameters are out of range
- Push notifications (via service worker for PWA)
- Optional email notifications for critical thresholds
- Alert history log
- Snooze/acknowledge alerts to avoid repeated notifications

---

## Disease Identification & Treatment

**Priority**: Medium
**Status**: Planned

Track, identify, and treat fish and coral diseases with an integrated knowledge base linked to major aquatic disease databases.

### Scope

- **Disease database integration**:
  - Link to established databases (e.g., FishBase disease records, Coral Disease and Health Consortium, USGS fish pathology)
  - Local knowledge base of common freshwater and saltwater diseases with symptoms, photos, and causes
  - Search by symptom (white spots, fin rot, tissue necrosis, etc.) to narrow down diagnosis
- **Disease identification wizard**:
  - Step-by-step symptom selector: affected species, visual symptoms, behavioral changes, timeline
  - Ranked list of probable diseases with confidence level
  - Reference photos for visual comparison
  - Link to external resources for each disease
- **Treatment protocols**:
  - Pre-built treatment templates per disease (medication, dosage, duration, water change schedule)
  - Customizable protocols: add steps, set reminders, adjust dosage for tank volume
  - Link to Consumables module (medication inventory) and Dosing Calculator
  - Quarantine tank tracking (separate from main tank)
- **Treatment tracker**:
  - Active treatment log per tank with start/end dates
  - Daily checklist: dose administered, observation notes, photos
  - Parameter monitoring during treatment (some meds affect pH, bacteria, etc.)
  - Outcome recording: resolved, recurring, escalated
  - Treatment history per livestock item
- **Dashboard integration**:
  - Active treatment badge on tank cards
  - Alert when treatment step is due

### Backend

- New `diseases` table: id, name, common_names, symptoms, causes, water_types, severity, external_refs
- New `treatment_protocols` table: id, disease_id, name, steps (JSON), medications, duration_days
- New `treatments` table: id, tank_id, disease_id, protocol_id, status, started_at, ended_at, notes
- New `treatment_logs` table: id, treatment_id, date, step_number, notes, photo_url
- `GET /api/v1/diseases/search?symptoms=...` — symptom-based search
- `GET /api/v1/diseases/{id}` — disease detail with protocols
- CRUD on `/api/v1/treatments/` — active and historical treatments per tank
- CRUD on `/api/v1/treatments/{id}/logs` — daily treatment log entries

### Frontend

- New `Diseases.tsx` page with search/browse and identification wizard
- `TreatmentTracker` component embedded in tank detail or standalone
- Treatment timeline with daily log entries and photo documentation
- Integration with Consumables (medication stock) and Maintenance (reminders)

---

## Feeding Management

**Priority**: Medium
**Status**: Planned

Track feeding schedules, food inventory, and consumption per tank. Know what each tank eats, how often, how much is left, and when to reorder.

### Scope

- **Feeding schedule**:
  - Per-tank feeding plan: which foods, how much, how often (e.g., "Reef Frenzy 1 cube 2x/day", "Nori sheet every 3 days")
  - Multiple feeding entries per tank (different foods at different frequencies)
  - Visual weekly calendar showing feeding plan per tank
  - Autofeeder integration notes (portion size, schedule)
- **Feeding log**:
  - Quick-log feedings: tap to record "fed Tank X with Food Y"
  - Track actual vs. planned feedings (missed feedings highlighted)
  - Notes per feeding (appetite observation, refusal, etc.)
  - Batch feeding: record feeding multiple tanks at once
- **Food inventory**:
  - Link to existing Consumables module (food category items)
  - Track quantity remaining per food item (weight, portions, cubes)
  - Estimated depletion date based on feeding schedule and current stock
  - Low-stock alerts when food is running out
  - Reorder reminders with purchase links (from Consumables)
- **Nutrition overview**:
  - Per-tank nutrition summary: protein sources, variety score, feeding frequency
  - Feeding history chart (feedings per day/week over time)
  - Species dietary requirements cross-referenced with actual feeding plan
- **Dashboard integration**:
  - "Last fed" indicator per tank
  - Low food stock alerts
  - Upcoming feeding reminders

### Backend

- New `feeding_schedules` table: id, tank_id, consumable_id, food_name, quantity, quantity_unit, frequency_hours, notes
- New `feeding_logs` table: id, tank_id, schedule_id, fed_at, quantity, notes
- `GET /api/v1/feeding/schedules?tank_id=...` — feeding plans per tank
- `POST /api/v1/feeding/log` — quick-log a feeding event
- `GET /api/v1/feeding/logs?tank_id=...&from=...&to=...` — feeding history
- `GET /api/v1/feeding/inventory` — food stock status with depletion estimates
- Links to existing Consumables API for food items

### Frontend

- New `Feeding.tsx` page with schedule editor, log, and inventory view
- Quick-feed button on dashboard tank cards
- Weekly feeding calendar component
- Food inventory status with depletion countdown
- Integration with Consumables module for stock management
