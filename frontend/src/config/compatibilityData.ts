/**
 * Species Traits Database
 *
 * Loads species data from a shared JSON file and provides
 * typed lookup functions for the compatibility engine.
 *
 * The canonical data lives in data/species-traits.json at the repo root.
 * To add or edit species, modify that JSON file (or use the admin UI).
 */

import speciesData from '../../../data/species-traits.json'

export type Temperament = 'peaceful' | 'semi-aggressive' | 'aggressive'
export type ReefSafety = 'yes' | 'caution' | 'no'
export type Diet = 'herbivore' | 'carnivore' | 'omnivore' | 'filter-feeder' | 'corallivore'
export type SizeClass = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'

export interface SpeciesTraits {
  id: string
  genusOrFamily: string
  matchLevel: 'genus' | 'family' | 'species'
  commonGroupName: string
  category: 'fish' | 'coral' | 'invertebrate'
  waterType: 'saltwater' | 'freshwater' | 'both'
  temperament: Temperament
  reefSafe: ReefSafety
  minTankSizeLiters: number
  diet: Diet
  sizeClass: SizeClass
  territorial: boolean
  maxGroupConflict: boolean
  predatorOf: string[]
}

export const SPECIES_TRAITS_DB: SpeciesTraits[] = speciesData as SpeciesTraits[]

/** Sort for matching: species-level > genus > family (most specific first) */
const SORTED_TRAITS = [...SPECIES_TRAITS_DB].sort((a, b) => {
  const order = { species: 0, genus: 1, family: 2 }
  return order[a.matchLevel] - order[b.matchLevel]
})

/** Find traits for a species by its scientific name (prefix match) */
export function findTraitsForSpecies(speciesName: string): SpeciesTraits | null {
  if (!speciesName) return null
  const normalized = speciesName.trim().toLowerCase()
  for (const traits of SORTED_TRAITS) {
    if (normalized.startsWith(traits.genusOrFamily.toLowerCase())) {
      return traits
    }
  }
  return null
}

/** Get all species traits entries applicable to a water type */
export function getTraitsForWaterType(waterType: string): SpeciesTraits[] {
  return SPECIES_TRAITS_DB.filter(
    t => t.waterType === 'both' || t.waterType === waterType
  )
}

/** Size class labels */
const SIZE_LABELS: Record<SizeClass, string> = {
  tiny: '<5 cm',
  small: '5-10 cm',
  medium: '10-20 cm',
  large: '20-35 cm',
  xlarge: '>35 cm',
}

export function getSizeLabel(sizeClass: SizeClass): string {
  return SIZE_LABELS[sizeClass]
}

/** Numeric order for size comparison */
const SIZE_ORDER: Record<SizeClass, number> = {
  tiny: 0,
  small: 1,
  medium: 2,
  large: 3,
  xlarge: 4,
}

export function getSizeOrder(sizeClass: SizeClass): number {
  return SIZE_ORDER[sizeClass]
}
