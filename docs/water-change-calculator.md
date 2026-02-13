# Water Change Calculator

## Overview

The Water Change Calculator helps aquarists predict how water changes will affect their tank parameters, or calculate the exact water change needed to reach a target value. It uses the standard dilution formula and supports salt mix presets for saltwater tanks.

## How It Works

### Core Formula

```
after = current × (1 − WC%) + replacement × WC%
```

Where:
- `current` = current parameter value in the tank
- `replacement` = parameter value in the replacement water
- `WC%` = water change percentage (as a fraction, 0–1)

### Reverse Calculation

To find the required water change percentage for a target:

```
WC% = (current − target) / (current − replacement)
```

### Multiple Water Changes

For corrections requiring more than 50%, the calculator recommends splitting into multiple smaller changes:

```
after_n = current × (1 − WC%)^n + replacement × (1 − (1 − WC%)^n)
```

## User Interface

### Two Tabs

| Tab | Purpose |
|-----|---------|
| **Impact Preview** | Enter a water change %, see projected values for all parameters with color-coded direction arrows |
| **Target Parameter** | Select a parameter and target value, get the exact WC% and liters needed |

### Impact Tab

1. **Water Change Slider** — 0–100% with a range slider, number input, and real-time liter display
2. **Replacement Water Section** — Select a salt mix preset (saltwater) or RO/Tap water profile (freshwater), with individually editable parameter values
3. **Results Table** — Shows each parameter's current value, projected post-WC value, change magnitude with directional arrows (↑/↓), and color coding:
   - **Green** = moving toward ideal
   - **Red** = moving away from ideal
   - **Gray** = unchanged

### Target Tab

1. **Parameter Selector** — Dropdown of the tank's active parameters
2. **Current Value** — Auto-filled from latest reading (read-only)
3. **Target Value** — Pre-filled from ideal, editable
4. **Replacement Value** — From the saved profile, editable
5. **Result Card** — Shows required WC%, liters to change, and total system volume
6. **Split Recommendation** — Amber warning when WC > 50%, suggesting multiple smaller changes

## Salt Mix Presets

Saltwater tanks can select from popular salt mixes with pre-filled Ca/Mg/Alk/salinity values:

| Salt Mix | Ca (ppm) | Mg (ppm) | Alk (dKH) | Notes |
|----------|----------|----------|-----------|-------|
| Instant Ocean | 400 | 1280 | 11.0 | Balanced, widely available |
| Red Sea Coral Pro | 440 | 1340 | 12.2 | High Alk for SPS |
| Fritz RPM | 450 | 1360 | 8.0 | Low Alk, good for Alk-dosing setups |
| Tropic Marin Pro Reef | 440 | 1320 | 7.5 | Natural seawater levels |
| HW Reefer Salt | 420 | 1300 | 8.0 | Budget-friendly |

All presets assume mixing to 1.026 SG with 0 ppm nitrate/phosphate/ammonia/nitrite.

## Freshwater Presets

| Profile | pH | GH (dGH) | KH (dKH) | Notes |
|---------|-----|----------|-----------|-------|
| RO/DI Water | 7.0 | 0 | 0 | Pure water, all zeros |
| Tap Water | 7.5 | 8 | 5 | Typical dechlorinated tap (editable) |

## Access Points

1. **Navigation Sidebar** — "💧 Water Change Calc" link (always visible, not module-gated)
2. **Tank Sidebar** — Quick action button in tank detail view, pre-selects the current tank via `?tank=` URL parameter

## Profile Persistence

Replacement water parameters are saved to `localStorage` under the key `aquascope_replacement_water`. When switching between freshwater and saltwater tanks, the profile resets to the appropriate defaults.

## Architecture

```
frontend/src/
├── config/
│   └── waterChangeConfig.ts      # Salt mix presets, formulas, localStorage
├── pages/
│   └── WaterChangeCalculator.tsx  # Main page (2 tabs)
└── public/locales/
    ├── en/waterchange.json        # English
    ├── fr/waterchange.json        # French
    ├── de/waterchange.json        # German
    ├── es/waterchange.json        # Spanish
    ├── it/waterchange.json        # Italian
    └── pt/waterchange.json        # Portuguese
```

Purely frontend — no backend changes required. Uses existing APIs:
- `tanksApi.list()` for tank selection
- `parametersApi.latest(tankId)` for current readings
- `parameterRangesApi.getForTank(tankId)` for ideal values and active parameter list

## i18n

Uses the `waterchange` namespace registered in `i18n/config.ts`. All user-facing strings are translated into 6 languages. Interpolation variables include `{{value}}`, `{{total}}`, `{{count}}`, `{{percent}}`, `{{liters}}`.
