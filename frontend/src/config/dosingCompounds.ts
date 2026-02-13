/**
 * Dosing Compounds Database
 *
 * Chemistry constants for common aquarium dosing compounds.
 * Used by the Dosing Calculator to compute how much to add.
 */

export type DosingForm = 'powder' | 'liquid'
export type WaterTypeApplicability = 'saltwater' | 'freshwater' | 'both'

export interface DosingCompound {
  id: string
  name: string
  formula: string
  parameterType: string
  /** How much this compound raises the parameter per gram per 100L of water */
  raisesPerGramPer100L: number
  /** Unit of the parameter being raised (dKH, ppm, dGH) */
  unit: string
  /** Unit of the dosing amount (g or mL) */
  dosingUnit: string
  form: DosingForm
  waterType: WaterTypeApplicability
  commonBrands: string[]
  /** Max safe correction in a single dose (parameter units) */
  maxSingleCorrection: number
  /** Short description key for i18n */
  descriptionKey: string
}

export const DOSING_COMPOUNDS: DosingCompound[] = [
  // === ALKALINITY ===
  {
    id: 'soda_ash',
    name: 'Soda Ash',
    formula: 'Na₂CO₃',
    parameterType: 'alkalinity_kh',
    raisesPerGramPer100L: 1.68,
    unit: 'dKH',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'both',
    commonBrands: ['BRS Soda Ash', 'Seachem Reef Builder (dry)'],
    maxSingleCorrection: 1.4,
    descriptionKey: 'compounds.soda_ash.description',
  },
  {
    id: 'baking_soda',
    name: 'Baking Soda',
    formula: 'NaHCO₃',
    parameterType: 'alkalinity_kh',
    raisesPerGramPer100L: 1.26,
    unit: 'dKH',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'both',
    commonBrands: ['Arm & Hammer', 'Any food-grade baking soda'],
    maxSingleCorrection: 1.4,
    descriptionKey: 'compounds.baking_soda.description',
  },
  // === CALCIUM ===
  {
    id: 'calcium_chloride',
    name: 'Calcium Chloride',
    formula: 'CaCl₂·2H₂O',
    parameterType: 'calcium',
    raisesPerGramPer100L: 14.7,
    unit: 'ppm',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'saltwater',
    commonBrands: ['BRS Calcium Chloride', 'Red Sea Foundation A (dry)'],
    maxSingleCorrection: 20,
    descriptionKey: 'compounds.calcium_chloride.description',
  },
  // === MAGNESIUM ===
  {
    id: 'magnesium_chloride',
    name: 'Magnesium Chloride',
    formula: 'MgCl₂·6H₂O',
    parameterType: 'magnesium',
    raisesPerGramPer100L: 4.7,
    unit: 'ppm',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'saltwater',
    commonBrands: ['BRS Magnesium Chloride', 'Red Sea Foundation C (part 1)'],
    maxSingleCorrection: 50,
    descriptionKey: 'compounds.magnesium_chloride.description',
  },
  {
    id: 'magnesium_sulfate',
    name: 'Magnesium Sulfate',
    formula: 'MgSO₄·7H₂O',
    parameterType: 'magnesium',
    raisesPerGramPer100L: 3.9,
    unit: 'ppm',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'saltwater',
    commonBrands: ['Epsom Salt', 'BRS Magnesium Sulfate'],
    maxSingleCorrection: 50,
    descriptionKey: 'compounds.magnesium_sulfate.description',
  },
  // === FRESHWATER GH ===
  {
    id: 'calcium_sulfate',
    name: 'Calcium Sulfate',
    formula: 'CaSO₄·2H₂O',
    parameterType: 'gh',
    raisesPerGramPer100L: 0.6,
    unit: 'dGH',
    dosingUnit: 'g',
    form: 'powder',
    waterType: 'freshwater',
    commonBrands: ['Seachem Equilibrium'],
    maxSingleCorrection: 3,
    descriptionKey: 'compounds.calcium_sulfate.description',
  },
]

/** Filter compounds applicable to a given water type */
export function getCompoundsForWaterType(waterType: string): DosingCompound[] {
  return DOSING_COMPOUNDS.filter(
    c => c.waterType === 'both' || c.waterType === waterType
  )
}

/** Filter compounds for a specific parameter and water type */
export function getCompoundsForParameter(parameterType: string, waterType: string): DosingCompound[] {
  return getCompoundsForWaterType(waterType).filter(
    c => c.parameterType === parameterType
  )
}

/** Which parameter types are dosable for a given water type */
export function getDosableParameterTypes(waterType: string): string[] {
  const compounds = getCompoundsForWaterType(waterType)
  return [...new Set(compounds.map(c => c.parameterType))]
}

/**
 * Calculate the amount of compound needed to raise a parameter.
 *
 * @returns Amount in grams (or mL) needed, rounded to 1 decimal
 */
export function calculateDose(
  compound: DosingCompound,
  currentValue: number,
  targetValue: number,
  tankVolumeLiters: number,
): number {
  const delta = targetValue - currentValue
  if (delta <= 0 || tankVolumeLiters <= 0) return 0
  const amount = (delta / compound.raisesPerGramPer100L) * (tankVolumeLiters / 100)
  return Math.round(amount * 10) / 10
}

/**
 * Check if a correction exceeds the safe single-dose threshold.
 * Returns the number of recommended doses to split across.
 */
export function getSafetyInfo(
  compound: DosingCompound,
  currentValue: number,
  targetValue: number,
): { isSafe: boolean; recommendedDoses: number } {
  const delta = targetValue - currentValue
  if (delta <= 0 || !compound.maxSingleCorrection) {
    return { isSafe: true, recommendedDoses: 1 }
  }
  const recommendedDoses = Math.ceil(delta / compound.maxSingleCorrection)
  return {
    isSafe: recommendedDoses <= 1,
    recommendedDoses,
  }
}
