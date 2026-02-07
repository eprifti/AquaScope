/**
 * Normal ranges for reef aquarium parameters
 */

export interface ParameterRange {
  name: string
  unit: string
  min: number
  max: number
  ideal?: number
  color: string
  description: string
}

/**
 * Round a number to specified decimal places to avoid floating point precision issues
 */
export function roundValue(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export const PARAMETER_RANGES: Record<string, ParameterRange> = {
  calcium: {
    name: 'Calcium',
    unit: 'ppm',
    min: 400,
    max: 450,
    ideal: 430,
    color: '#3b82f6', // blue
    description: 'Essential for SPS coral skeleton growth',
  },
  magnesium: {
    name: 'Magnesium',
    unit: 'ppm',
    min: 1250,
    max: 1450,
    ideal: 1350,
    color: '#8b5cf6', // purple
    description: 'Maintains alkalinity and calcium levels',
  },
  alkalinity_kh: {
    name: 'Alkalinity (KH)',
    unit: 'dKH',
    min: 7,
    max: 10,
    ideal: 8.5,
    color: '#10b981', // green
    description: 'pH buffer and coral calcification',
  },
  nitrate: {
    name: 'Nitrate (NO₃)',
    unit: 'ppm',
    min: 0,
    max: 10,
    ideal: 3,
    color: '#f59e0b', // amber
    description: 'Keep low for SPS corals (< 5 ppm)',
  },
  phosphate: {
    name: 'Phosphate (PO₄)',
    unit: 'ppm',
    min: 0.01,
    max: 0.08,
    ideal: 0.03,
    color: '#ef4444', // red
    description: 'Keep very low for SPS corals (< 0.05 ppm)',
  },
  salinity: {
    name: 'Salinity',
    unit: 'SG',
    min: 1.024,
    max: 1.027,
    ideal: 1.026,
    color: '#06b6d4', // cyan
    description: 'Specific gravity (density)',
  },
  temperature: {
    name: 'Temperature',
    unit: '°C',
    min: 24,
    max: 27,
    ideal: 25.5,
    color: '#f97316', // orange
    description: 'Stable temperature critical for SPS',
  },
  ph: {
    name: 'pH',
    unit: '',
    min: 8.0,
    max: 8.4,
    ideal: 8.2,
    color: '#ec4899', // pink
    description: 'Stable pH critical for SPS growth',
  },
  no3_po4_ratio: {
    name: 'NO₃/PO₄ Ratio',
    unit: '',
    min: 10,
    max: 150,
    ideal: 100,
    color: '#6366f1', // indigo
    description: 'Redfield ratio for nutrient balance',
  },
  mg_ca_ratio: {
    name: 'Mg/Ca Ratio',
    unit: '',
    min: 3.0,
    max: 3.5,
    ideal: 3.2,
    color: '#a855f7', // violet
    description: 'Magnesium to calcium ratio',
  },
}

export const PARAMETER_ORDER = [
  'temperature',
  'salinity',
  'ph',
  'alkalinity_kh',
  'calcium',
  'magnesium',
  'nitrate',
  'phosphate',
]

export const RATIO_ORDER = [
  'no3_po4_ratio',
  'mg_ca_ratio',
]

/**
 * Get status of a parameter value
 */
export function getParameterStatus(
  parameterType: string,
  value: number
): 'optimal' | 'warning' | 'critical' {
  const range = PARAMETER_RANGES[parameterType]
  if (!range) return 'optimal'

  // Check if value is within ideal range (middle 50% of range)
  const rangeSize = range.max - range.min
  const idealMin = range.min + rangeSize * 0.25
  const idealMax = range.max - rangeSize * 0.25

  if (value >= idealMin && value <= idealMax) {
    return 'optimal'
  }

  // Check if value is within acceptable range
  if (value >= range.min && value <= range.max) {
    return 'warning'
  }

  // Value is outside acceptable range
  return 'critical'
}

/**
 * Get color for parameter status
 */
export function getStatusColor(status: 'optimal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'optimal':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
  }
}
