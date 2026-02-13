# Livestock Compatibility Checker

## Overview

The Compatibility Checker helps aquarists verify whether their tank inhabitants are compatible before adding new livestock. It detects conflicts like aggression mismatches, reef-safety violations, predator-prey relationships, and tank size limitations.

The system uses a **traits-based architecture**: species data is stored in a shared JSON knowledge base, and an 8-rule engine computes all pairwise relationships at runtime — no need to manually define every A-vs-B conflict.

## Architecture

```
data/species-traits.json          <-- Single source of truth (60+ species)
        │
        ├─── Frontend (build-time import)
        │      └── compatibilityData.ts   <-- loads JSON, provides lookup functions
        │            └── compatibilityRules.ts  <-- 8-rule engine, derives all conflicts
        │                  ├── CompatibilityAlert.tsx   (inline form alert)
        │                  ├── CompatibilityChecker.tsx  (modal with 3 tabs)
        │                  ├── CompatibilityMatrix.tsx   (heatmap grid)
        │                  └── CompatibilityNetwork.tsx  (SVG network graph)
        │
        └─── Backend (runtime JSON load)
               └── species_traits_service.py  <-- CRUD API for admin editing
                     └── species_traits.py    <-- REST endpoints
```

**Key design decision**: Compatibility relations are **computed from traits**, not stored as explicit pairs. Adding a new species to the JSON automatically gets it checked against all 8 rules.

## Species Traits Knowledge Base

**File:** `data/species-traits.json` (shared between frontend and backend)

This is the single source of truth — a JSON array of 60+ species entries. It is:
- Imported at **build time** by the frontend via `compatibilityData.ts`
- Loaded at **runtime** by the backend via `species_traits_service.py`
- Editable through the **Admin > Species** tab in the UI (CRUD API at `/api/v1/species-traits`)

### Coverage

| Category | Count | Examples |
|----------|-------|---------|
| Saltwater fish | ~24 | Clownfish, Tangs, Angelfish, Lionfish, Mandarinfish, Wrasses, Damselfish, Gobies, Firefish, Rabbitfish, Triggerfish, Eels, Seahorses, Cardinalfish, Butterflyfish |
| Saltwater invertebrates | ~9 | Cleaner Shrimp, Banded Coral Shrimp, Sexy Shrimp, Emerald Crab, Turbo Snails, Nassarius Snails, Giant Clams, Sea Stars, Bubble Tip Anemone |
| Saltwater corals | ~8 | Acropora, Montipora, Euphyllia (Torch/Hammer), Galaxea, Elegance Coral, Zoanthids, Mushrooms, Leather Corals |
| Freshwater fish | ~17 | Betta, Tetras, Corydoras, Plecos, Discus, Angelfish, Oscars, Mbuna/Peacock/Tanganyika Cichlids, Guppies, Platies, Goldfish, Rasboras, Axolotl |
| Freshwater invertebrates | ~2 | Cherry Shrimp, Amano/Crystal Shrimp |

### Trait Fields

Each species entry contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (lowercase genus) |
| `genusOrFamily` | string | Scientific name prefix for matching (e.g., `Amphiprion`) |
| `matchLevel` | `'genus' \| 'family' \| 'species'` | How specific the match is |
| `commonGroupName` | string | Human-readable group name (e.g., `Clownfish`) |
| `category` | `'fish' \| 'coral' \| 'invertebrate'` | Organism type |
| `waterType` | `'saltwater' \| 'freshwater' \| 'both'` | Habitat |
| `temperament` | `'peaceful' \| 'semi-aggressive' \| 'aggressive'` | Behavioral disposition |
| `reefSafe` | `'yes' \| 'caution' \| 'no'` | Safe with corals/invertebrates |
| `minTankSizeLiters` | number | Minimum recommended tank volume |
| `diet` | `'herbivore' \| 'carnivore' \| 'omnivore' \| 'filter-feeder' \| 'corallivore'` | Feeding behavior |
| `sizeClass` | `'tiny' \| 'small' \| 'medium' \| 'large' \| 'xlarge'` | Adult size class |
| `territorial` | boolean | Defends territory |
| `maxGroupConflict` | boolean | Multiple individuals fight (e.g., tangs, bettas) |
| `predatorOf` | string[] | Tags for prey types: `small_fish`, `small_shrimp`, `small_crabs`, `snails` |

### How Species Matching Works

Species are matched by **scientific name prefix at the genus level**. When a user types `Amphiprion ocellaris`, the system matches it against the `Amphiprion` genus entry (Clownfish). The matching priority is: species-level > genus > family (most specific match wins).

## Compatibility Rules Engine

**File:** `frontend/src/config/compatibilityRules.ts`

The engine takes species traits and **derives** all compatibility relationships. There is no separate "relations" file — conflicts are computed by comparing trait fields between every pair.

### 8 Rules

| # | Rule ID | Trigger | Level | Example |
|---|---------|---------|-------|---------|
| 1 | `aggression_conflict` | Aggressive + peaceful species in same tank | `incompatible` | Damselfish + Mandarinfish |
| 2 | `reef_safety` | Non-reef-safe fish + corals in same tank | `incompatible` / `caution` | Butterflyfish (corallivore) + Acropora |
| 3 | `tank_too_small` | Species `minTankSizeLiters` > actual tank volume | `incompatible` | Blue Tang in a 200L tank (needs 400L) |
| 4 | `territorial_duplicates` | Multiple territorial same-genus specimens | `caution` | Two Zebrasoma tangs |
| 5 | `predator_prey` | `predatorOf` tag matches prey category+size | `incompatible` | Lionfish + Cleaner Shrimp |
| 6 | `size_disparity` | XLarge carnivore + tiny species (3+ size gap) | `caution` | Oscar + Neon Tetras |
| 7 | `water_type_conflict` | Freshwater species in saltwater tank (or vice versa) | `incompatible` | Betta in a reef tank |
| 8 | `specific_conflicts` | Hardcoded special cases | varies | Seahorse + any other fish, Betta males, Galaxea chemical warfare, Axolotl + fish |

### Specific Conflict Details

- **Seahorses** (`Hippocampus`) — Flagged with any non-seahorse fish. They need species-only or seahorse-compatible setups due to their slow feeding.
- **Betta males** — Multiple Betta entries trigger male aggression warning.
- **Axolotls** (`Ambystoma`) — Flagged with any non-axolotl fish. Axolotl gills are vulnerable to nipping; axolotls also eat small tankmates.
- **Coral chemical warfare** — Galaxea + Euphyllia/Catalaphyllia pairs trigger allelopathy warnings, based on Eric Borneman's research.
- **Corallivore conflicts** — Species with `diet: 'corallivore'` (e.g., Butterflyfish) flagged against any coral.

### Predator-Prey Tag Mapping

The `predatorOf` field uses string tags that map to prey characteristics:

| Tag | Matches |
|-----|---------|
| `small_fish` | Fish with sizeClass `tiny` or `small` |
| `small_shrimp` | Invertebrates with sizeClass `tiny` or `small` + shrimp-like genera |
| `small_crabs` | Invertebrates with sizeClass `tiny` or `small` + crab genera |
| `snails` | Invertebrate genera matching snail families (Turbo, Nassarius, etc.) |

## User Interface

### Three Integration Points

1. **Inline Alert (LivestockForm)** — When adding or editing livestock, a real-time compatibility check runs against existing tank inhabitants (debounced 300ms). Shows green/amber/red status directly in the form. Works in both create and edit modes.

2. **Typeahead Species Lookup (LivestockForm)** — The scientific name field doubles as a search input. Type 3+ characters and after a 500ms debounce, AquaScope searches WoRMS, iNaturalist, or FishBase (selectable via compact tabs below the input). Selecting a result auto-fills photo URL, taxonomy, and external IDs. In edit mode, this lets users correct a misidentified species by simply changing the name.

3. **Standalone Modal (Livestock page)** — The "Compatibility" button opens a full tank-wide report with **3 tabs**:

   | Tab | View | Description |
   |-----|------|-------------|
   | **Issues** | Text list | All detected issues grouped by severity (incompatible, caution, compatible) |
   | **Matrix** | Heatmap grid | Asymmetric CSS grid with species on both axes (row = aggressor, column = victim). Cells colored green/amber/red by worst issue. Click a cell to see specific conflicts. Dynamic cell sizing adapts to species count. |
   | **Network** | SVG graph | Force-directed layout with physics simulation (repulsion, attraction, gravity). Species as labeled circles with category colors (blue = fish, green = coral, orange = invertebrate). Red solid arrows = predator-prey (directed), red dashed arrows = incompatible, amber dashed arrows = caution. Hover highlights connections. |

   The modal auto-selects the first tank when opened from the "All tanks" view.

4. **Water Type Validation** — Backend enforces that livestock water type matches the tank water type when adding/updating entries.

### Engine Functions

```typescript
// For LivestockForm: check new species against existing inhabitants
checkNewSpeciesCompatibility(
  newSpeciesName: string,
  newSpeciesType: string,
  existingLivestock: LivestockEntry[],
  tankVolumeLiters: number,
  tankWaterType: string,
): CompatibilityReport

// For standalone modal: check all inhabitants against each other
checkAllCompatibility(
  livestock: LivestockEntry[],
  tankVolumeLiters: number,
  tankWaterType: string,
): CompatibilityReport

// For matrix/network: check a single pair
checkPair(a: ResolvedSpecies, b: ResolvedSpecies, ...): CompatibilityResult[]
```

Both return a `CompatibilityReport` with:
- `overallLevel`: `'compatible' | 'caution' | 'incompatible'`
- `results`: Array of individual issues with severity, rule ID, and i18n-ready description
- `unknownSpecies`: Species names not found in the database

## Species Traits Admin API

Admins can add, edit, and delete species entries through:

### REST Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/species-traits` | Any user | List all traits (supports `?category=`, `?water_type=`, `?search=` filters) |
| `GET` | `/api/v1/species-traits/{id}` | Any user | Get single trait |
| `POST` | `/api/v1/species-traits` | Admin | Create new species entry |
| `PUT` | `/api/v1/species-traits/{id}` | Admin | Update species entry |
| `DELETE` | `/api/v1/species-traits/{id}` | Admin | Delete species entry |

### Admin UI

The **Admin > Species** tab provides a full CRUD interface:
- Search bar with category and water type filters
- Table view with color-coded badges for temperament, reef safety, category
- Inline add/edit form with all trait fields
- Delete with confirmation

Changes are written directly to `data/species-traits.json` via the backend service. The frontend uses the build-time snapshot, so changes take effect after the next frontend build.

## Data Sources & Methodology

Species traits are compiled from established aquarium science and community references. **This is not AI-generated data** — every trait value maps to documented, verifiable sources.

### Primary References

| Source | What it provides | URL |
|--------|-----------------|-----|
| **FishBase** | Taxonomy, ecology, behavior, diet, habitat for all fish species | [fishbase.org](https://www.fishbase.se) |
| **WoRMS** | Authoritative taxonomy for all marine species including corals and invertebrates | [marinespecies.org](https://www.marinespecies.org) |
| **LiveAquaria** | Species care guides with temperament, reef safety, tank size, diet, and compatibility | [liveaquaria.com](https://www.liveaquaria.com) |
| **Reef2Reef** | Community-contributed species profiles and compatibility discussions | [reef2reef.com](https://www.reef2reef.com) |
| **ReefCentral** | Legacy forums with decades of keeper observations on species compatibility | [reefcentral.com](https://www.reefcentral.com) |
| **MASNA** | Husbandry guidelines and minimum tank size recommendations | [masna.org](https://masna.org) |
| **Eric Borneman, *Aquarium Corals*** | Definitive reference on coral allelopathy (chemical warfare) | ISBN: 978-1890087470 |
| **seahorse.org** | Seahorse-specific husbandry standards | [seahorse.org](https://www.seahorse.org) |
| **caudata.org** | Axolotl and amphibian husbandry | [caudata.org](https://www.caudata.org) |

### How Traits Are Assigned

| Trait | Methodology |
|-------|-------------|
| **Temperament** | Cross-referenced between FishBase ecology data, LiveAquaria care ratings, and Reef2Reef consensus. A species is `aggressive` if 2+ sources agree. |
| **Reef Safety** | LiveAquaria's 3-tier classification, validated against Reef2Reef keeper reports. |
| **Min Tank Size** | MASNA guidelines where available; otherwise LiveAquaria or Reef2Reef consensus. Sizes are conservative. |
| **Diet** | FishBase trophic ecology + LiveAquaria diet sections. `corallivore` = obligate coral feeders only. |
| **Size Class** | Based on FishBase maximum standard length: tiny (<5cm), small (5-10cm), medium (10-20cm), large (20-35cm), xlarge (>35cm). |
| **Territorial** | FishBase behavior notes + keeper consensus. |
| **Predator-Prey** | FishBase diet data + documented predation events from Reef2Reef/ReefCentral. |
| **Coral Allelopathy** | Eric Borneman's *Aquarium Corals* chapters on coral chemical warfare. |

### Limitations

- **Genus-level matching** — Individual species within a genus may differ (e.g., Centropyge loricula is more reef-safe than Centropyge bicolor). The database uses conservative genus-wide defaults.
- **~60 entries** — Covers the most common aquarium species but is not exhaustive. Uncommon species show "No data available."
- **Behavioral variance** — Individual fish personality varies. The checker provides probability-based guidance, not guarantees.

## File Structure

```
AquaScope/
├── data/
│   └── species-traits.json              # Shared knowledge base (60+ entries)
├── backend/app/
│   ├── api/v1/species_traits.py         # REST endpoints (CRUD)
│   ├── schemas/species_trait.py         # Pydantic schemas
│   └── services/species_traits_service.py  # JSON-based CRUD service
├── frontend/src/
│   ├── config/
│   │   ├── compatibilityData.ts         # Loads JSON, provides lookup functions
│   │   └── compatibilityRules.ts        # 8 rules + engine functions
│   ├── components/livestock/
│   │   ├── CompatibilityAlert.tsx        # Inline alert for LivestockForm
│   │   ├── CompatibilityChecker.tsx      # Modal with 3 tabs (Issues/Matrix/Network)
│   │   ├── CompatibilityMatrix.tsx       # CSS grid heatmap
│   │   └── CompatibilityNetwork.tsx      # SVG circular network graph
│   └── components/admin/
│       └── SpeciesTraitsManager.tsx      # Admin CRUD UI
└── frontend/public/locales/
    ├── en/compatibility.json             # English
    ├── fr/compatibility.json             # French
    ├── de/compatibility.json             # German
    ├── es/compatibility.json             # Spanish
    ├── it/compatibility.json             # Italian
    └── pt/compatibility.json             # Portuguese
```

## i18n

The feature uses the `compatibility` namespace registered in `i18n/config.ts`. All user-facing strings are translated into 6 languages. Rule descriptions use interpolation variables (e.g., `{{speciesA}}`, `{{speciesB}}`) populated by the rules engine.

## Contributing Species

### Via Admin UI (recommended)

1. Log in as admin
2. Go to **Admin > Species** tab
3. Click "Add Species" and fill in all trait fields
4. Save — the entry is written to `data/species-traits.json`

### Via JSON (manual)

1. Edit `data/species-traits.json`
2. Add a new entry following the trait fields schema above
3. Use the genus name in `genusOrFamily` (the first word of the scientific binomial name)
4. Cross-reference traits with FishBase + LiveAquaria + at least one community source
5. If the species has unique compatibility concerns, add a specific rule in `compatibilityRules.ts`

Example entry:
```json
{
  "id": "amphiprion",
  "genusOrFamily": "Amphiprion",
  "matchLevel": "genus",
  "commonGroupName": "Clownfish",
  "category": "fish",
  "waterType": "saltwater",
  "temperament": "semi-aggressive",
  "reefSafe": "yes",
  "minTankSizeLiters": 100,
  "diet": "omnivore",
  "sizeClass": "small",
  "territorial": true,
  "maxGroupConflict": false,
  "predatorOf": []
}
```
