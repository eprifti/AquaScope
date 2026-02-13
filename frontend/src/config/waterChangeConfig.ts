/**
 * Water Change Calculator Configuration
 *
 * Salt mix presets, replacement water defaults, and calculation formulas
 * for predicting water parameter changes after water changes.
 */

// ============================================================================
// Types
// ============================================================================

export interface SaltMixPreset {
  id: string
  name: string
  parameters: Record<string, number>
}

export interface ReplacementWaterProfile {
  id: string
  name: string
  waterType: 'saltwater' | 'freshwater' | 'brackish'
  parameters: Record<string, number>
}

export interface WaterChangeImpactResult {
  parameterType: string
  currentValue: number
  projectedValue: number
  change: number
  direction: 'up' | 'down' | 'unchanged'
  towardIdeal: boolean
}

export interface WaterChangeTargetResult {
  requiredPercentage: number
  requiredLiters: number
  isFeasible: boolean
  recommendedChanges: number
  perChangePercentage: number
  perChangeLiters: number
}

// ============================================================================
// Salt Mix Presets (Saltwater)
// ============================================================================

export const SALT_MIX_PRESETS: SaltMixPreset[] = [
  {
    id: 'instant_ocean',
    name: 'Instant Ocean',
    parameters: {
      calcium: 400, magnesium: 1280, alkalinity_kh: 11.0,
      salinity: 1.026, ph: 8.2, temperature: 25.5,
      nitrate: 0, phosphate: 0, ammonia: 0, nitrite: 0,
    },
  },
  {
    id: 'red_sea_coral_pro',
    name: 'Red Sea Coral Pro',
    parameters: {
      calcium: 440, magnesium: 1340, alkalinity_kh: 12.2,
      salinity: 1.026, ph: 8.2, temperature: 25.5,
      nitrate: 0, phosphate: 0, ammonia: 0, nitrite: 0,
    },
  },
  {
    id: 'fritz_rpm',
    name: 'Fritz RPM',
    parameters: {
      calcium: 450, magnesium: 1360, alkalinity_kh: 8.0,
      salinity: 1.026, ph: 8.2, temperature: 25.5,
      nitrate: 0, phosphate: 0, ammonia: 0, nitrite: 0,
    },
  },
  {
    id: 'tropic_marin_pro',
    name: 'Tropic Marin Pro Reef',
    parameters: {
      calcium: 440, magnesium: 1320, alkalinity_kh: 7.5,
      salinity: 1.026, ph: 8.3, temperature: 25.5,
      nitrate: 0, phosphate: 0, ammonia: 0, nitrite: 0,
    },
  },
  {
    id: 'hw_reefer',
    name: 'HW Reefer Salt',
    parameters: {
      calcium: 420, magnesium: 1300, alkalinity_kh: 8.0,
      salinity: 1.026, ph: 8.2, temperature: 25.5,
      nitrate: 0, phosphate: 0, ammonia: 0, nitrite: 0,
    },
  },
]

// ============================================================================
// Freshwater Presets
// ============================================================================

export const FRESHWATER_PRESETS: ReplacementWaterProfile[] = [
  {
    id: 'ro_di',
    name: 'RO/DI Water',
    waterType: 'freshwater',
    parameters: {
      temperature: 25, ph: 7.0, gh: 0, alkalinity_kh: 0,
      ammonia: 0, nitrite: 0, nitrate: 0, phosphate: 0,
    },
  },
  {
    id: 'tap_water',
    name: 'Tap Water',
    waterType: 'freshwater',
    parameters: {
      temperature: 25, ph: 7.5, gh: 8, alkalinity_kh: 5,
      ammonia: 0, nitrite: 0, nitrate: 5, phosphate: 0.1,
    },
  },
]

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Projected value after a single water change.
 * Formula: after = current × (1 - WC%) + replacement × WC%
 */
export function calculateImpact(
  currentValue: number,
  replacementValue: number,
  waterChangePercent: number,
): number {
  const fraction = waterChangePercent / 100
  return currentValue * (1 - fraction) + replacementValue * fraction
}

/**
 * Projected value after N sequential water changes at the same %.
 * Formula: after_n = current × (1 - WC%)^n + replacement × (1 - (1 - WC%)^n)
 */
export function calculateMultiChangeImpact(
  currentValue: number,
  replacementValue: number,
  waterChangePercent: number,
  numberOfChanges: number,
): number {
  const fraction = waterChangePercent / 100
  const retention = Math.pow(1 - fraction, numberOfChanges)
  return currentValue * retention + replacementValue * (1 - retention)
}

/**
 * Required water change percentage to reach a target value.
 * Formula: WC% = (current - target) / (current - replacement)
 * Returns percentage (0-100), or Infinity if not achievable.
 */
export function calculateRequiredPercentage(
  currentValue: number,
  targetValue: number,
  replacementValue: number,
): number {
  const denominator = currentValue - replacementValue
  if (Math.abs(denominator) < 0.0001) {
    return Math.abs(currentValue - targetValue) < 0.0001 ? 0 : Infinity
  }
  const fraction = (currentValue - targetValue) / denominator
  return fraction * 100
}

/**
 * Whether the projected value is moving toward the ideal.
 */
function isMovingTowardIdeal(
  currentValue: number,
  projectedValue: number,
  idealValue: number | undefined,
): boolean {
  if (idealValue === undefined) return true
  return Math.abs(projectedValue - idealValue) <= Math.abs(currentValue - idealValue)
}

/**
 * Build full impact analysis for all active parameters.
 */
export function calculateFullImpact(
  latestParams: Record<string, { value: number }>,
  replacementParams: Record<string, number>,
  idealParams: Record<string, number | undefined>,
  waterChangePercent: number,
  parameterOrder: string[],
): WaterChangeImpactResult[] {
  return parameterOrder
    .filter(pt => latestParams[pt] !== undefined)
    .map(pt => {
      const current = latestParams[pt].value
      const replacement = replacementParams[pt] ?? current
      const projected = calculateImpact(current, replacement, waterChangePercent)
      const change = projected - current
      return {
        parameterType: pt,
        currentValue: current,
        projectedValue: projected,
        change,
        direction: change > 0.001 ? 'up' as const : change < -0.001 ? 'down' as const : 'unchanged' as const,
        towardIdeal: isMovingTowardIdeal(current, projected, idealParams[pt]),
      }
    })
}

/**
 * Calculate how much water change is needed for a target parameter value.
 */
export function calculateTarget(
  currentValue: number,
  targetValue: number,
  replacementValue: number,
  totalVolumeLiters: number,
): WaterChangeTargetResult {
  const percentage = calculateRequiredPercentage(currentValue, targetValue, replacementValue)

  if (!isFinite(percentage) || percentage < 0) {
    return {
      requiredPercentage: percentage,
      requiredLiters: 0,
      isFeasible: false,
      recommendedChanges: 0,
      perChangePercentage: 0,
      perChangeLiters: 0,
    }
  }

  const liters = (percentage / 100) * totalVolumeLiters
  const isFeasible = percentage <= 100
  const recommendedChanges = percentage > 50 ? Math.ceil(percentage / 25) : 1
  const perChangePercentage = recommendedChanges > 1
    ? Math.round((percentage / recommendedChanges) * 10) / 10
    : Math.round(percentage * 10) / 10
  const perChangeLiters = (perChangePercentage / 100) * totalVolumeLiters

  return {
    requiredPercentage: Math.round(percentage * 10) / 10,
    requiredLiters: Math.round(liters * 10) / 10,
    isFeasible,
    recommendedChanges,
    perChangePercentage,
    perChangeLiters: Math.round(perChangeLiters * 10) / 10,
  }
}

// ============================================================================
// LocalStorage Persistence
// ============================================================================

const STORAGE_KEY = 'aquascope_replacement_water'

export function saveReplacementProfile(waterType: string, params: Record<string, number>, presetId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ waterType, params, presetId }))
  } catch { /* ignore quota errors */ }
}

export function loadReplacementProfile(): { waterType: string; params: Record<string, number>; presetId: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Get the default replacement water parameters for a water type.
 */
export function getDefaultReplacementParams(waterType: string): { params: Record<string, number>; presetId: string } {
  if (waterType === 'saltwater' || waterType === 'brackish') {
    const preset = SALT_MIX_PRESETS[0]
    return { params: { ...preset.parameters }, presetId: preset.id }
  }
  const preset = FRESHWATER_PRESETS[0]
  return { params: { ...preset.parameters }, presetId: preset.id }
}
