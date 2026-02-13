/**
 * Compatibility Rules Engine
 *
 * Pure functions that evaluate compatibility between aquarium species
 * based on traits from the species database.
 */

import {
  findTraitsForSpecies,
  getSizeOrder,
} from './compatibilityData'
import type { SpeciesTraits } from './compatibilityData'

export type CompatibilityLevel = 'compatible' | 'caution' | 'incompatible'

export interface CompatibilityResult {
  level: CompatibilityLevel
  ruleId: string
  descriptionKey: string
  descriptionParams: Record<string, string>
  speciesA: string
  speciesB?: string
}

export interface CompatibilityReport {
  overallLevel: CompatibilityLevel
  results: CompatibilityResult[]
  unknownSpecies: string[]
}

export interface ResolvedSpecies {
  traits: SpeciesTraits
  name: string
}

interface LivestockEntry {
  species_name: string
  common_name?: string | null
  type: string
  quantity: number
  status?: string
}

// ── Helpers ──

function displayName(entry: LivestockEntry): string {
  return entry.common_name || entry.species_name
}

function worstLevel(a: CompatibilityLevel, b: CompatibilityLevel): CompatibilityLevel {
  if (a === 'incompatible' || b === 'incompatible') return 'incompatible'
  if (a === 'caution' || b === 'caution') return 'caution'
  return 'compatible'
}

/** Check if a traits entry matches a predatorOf tag */
function matchesPredatorTag(tag: string, prey: SpeciesTraits): boolean {
  const size = getSizeOrder(prey.sizeClass)
  switch (tag) {
    case 'small_fish':
      return prey.category === 'fish' && size <= 1
    case 'small_shrimp':
      return prey.category === 'invertebrate' && size <= 1
    case 'small_crabs':
      return prey.category === 'invertebrate' && size <= 1
    case 'snails':
      return prey.category === 'invertebrate' && size <= 1
    default:
      return false
  }
}

// ── Individual Rules ──

function checkAggressionConflict(
  traitsA: SpeciesTraits, nameA: string,
  traitsB: SpeciesTraits, nameB: string,
): CompatibilityResult | null {
  if (traitsA.category !== 'fish' && traitsB.category !== 'fish') return null

  const tempA = traitsA.temperament
  const tempB = traitsB.temperament

  if (tempA === 'aggressive' && tempB === 'peaceful') {
    return {
      level: 'incompatible',
      ruleId: 'aggression_conflict',
      descriptionKey: 'rules.aggression_conflict',
      descriptionParams: { speciesA: nameA, tempA, speciesB: nameB, tempB },
      speciesA: nameA,
      speciesB: nameB,
    }
  }
  if (tempB === 'aggressive' && tempA === 'peaceful') {
    return {
      level: 'incompatible',
      ruleId: 'aggression_conflict',
      descriptionKey: 'rules.aggression_conflict',
      descriptionParams: { speciesA: nameB, tempA: tempB, speciesB: nameA, tempB: tempA },
      speciesA: nameB,
      speciesB: nameA,
    }
  }
  if (tempA === 'aggressive' && tempB === 'semi-aggressive') {
    return {
      level: 'caution',
      ruleId: 'aggression_conflict',
      descriptionKey: 'rules.aggression_conflict',
      descriptionParams: { speciesA: nameA, tempA, speciesB: nameB, tempB },
      speciesA: nameA,
      speciesB: nameB,
    }
  }
  if (tempB === 'aggressive' && tempA === 'semi-aggressive') {
    return {
      level: 'caution',
      ruleId: 'aggression_conflict',
      descriptionKey: 'rules.aggression_conflict',
      descriptionParams: { speciesA: nameB, tempA: tempB, speciesB: nameA, tempB: tempA },
      speciesA: nameB,
      speciesB: nameA,
    }
  }
  return null
}

function checkReefSafety(
  fishTraits: SpeciesTraits, fishName: string,
  coralTraits: SpeciesTraits, coralName: string,
): CompatibilityResult | null {
  if (fishTraits.category === 'coral' || coralTraits.category !== 'coral') return null

  if (fishTraits.diet === 'corallivore') {
    return {
      level: 'incompatible',
      ruleId: 'corallivore_conflict',
      descriptionKey: 'rules.corallivore_conflict',
      descriptionParams: { speciesA: fishName, speciesB: coralName },
      speciesA: fishName,
      speciesB: coralName,
    }
  }
  if (fishTraits.reefSafe === 'no') {
    return {
      level: 'incompatible',
      ruleId: 'reef_safety',
      descriptionKey: 'rules.reef_safety',
      descriptionParams: { speciesA: fishName, speciesB: coralName },
      speciesA: fishName,
      speciesB: coralName,
    }
  }
  if (fishTraits.reefSafe === 'caution') {
    return {
      level: 'caution',
      ruleId: 'reef_safety_caution',
      descriptionKey: 'rules.reef_safety_caution',
      descriptionParams: { speciesA: fishName, speciesB: coralName },
      speciesA: fishName,
      speciesB: coralName,
    }
  }
  return null
}

function checkTankSize(
  traits: SpeciesTraits, name: string,
  tankVolumeLiters: number,
): CompatibilityResult | null {
  if (tankVolumeLiters <= 0) return null
  if (traits.minTankSizeLiters > tankVolumeLiters) {
    return {
      level: 'incompatible',
      ruleId: 'tank_too_small',
      descriptionKey: 'rules.tank_too_small',
      descriptionParams: {
        species: name,
        required: String(traits.minTankSizeLiters),
        actual: String(tankVolumeLiters),
      },
      speciesA: name,
    }
  }
  return null
}

function checkPredatorPrey(
  traitsA: SpeciesTraits, nameA: string,
  traitsB: SpeciesTraits, nameB: string,
): CompatibilityResult | null {
  for (const tag of traitsA.predatorOf) {
    if (matchesPredatorTag(tag, traitsB)) {
      return {
        level: 'incompatible',
        ruleId: 'predator_prey',
        descriptionKey: 'rules.predator_prey',
        descriptionParams: { predator: nameA, prey: nameB },
        speciesA: nameA,
        speciesB: nameB,
      }
    }
  }
  for (const tag of traitsB.predatorOf) {
    if (matchesPredatorTag(tag, traitsA)) {
      return {
        level: 'incompatible',
        ruleId: 'predator_prey',
        descriptionKey: 'rules.predator_prey',
        descriptionParams: { predator: nameB, prey: nameA },
        speciesA: nameB,
        speciesB: nameA,
      }
    }
  }
  return null
}

function checkSizeDisparity(
  traitsA: SpeciesTraits, nameA: string,
  traitsB: SpeciesTraits, nameB: string,
): CompatibilityResult | null {
  const sizeA = getSizeOrder(traitsA.sizeClass)
  const sizeB = getSizeOrder(traitsB.sizeClass)
  const diff = Math.abs(sizeA - sizeB)

  if (diff >= 3) {
    const [large, small] = sizeA > sizeB ? [nameA, nameB] : [nameB, nameA]
    const largerTraits = sizeA > sizeB ? traitsA : traitsB
    if (largerTraits.diet === 'carnivore' || largerTraits.diet === 'omnivore') {
      return {
        level: 'caution',
        ruleId: 'size_disparity',
        descriptionKey: 'rules.size_disparity',
        descriptionParams: { large, small },
        speciesA: large,
        speciesB: small,
      }
    }
  }
  return null
}

function checkWaterTypeConflict(
  traits: SpeciesTraits, name: string,
  tankWaterType: string,
): CompatibilityResult | null {
  if (traits.waterType !== 'both' && traits.waterType !== tankWaterType) {
    return {
      level: 'incompatible',
      ruleId: 'water_type_conflict',
      descriptionKey: 'rules.water_type_conflict',
      descriptionParams: {
        species: name,
        speciesWater: traits.waterType,
        tankWater: tankWaterType,
      },
      speciesA: name,
    }
  }
  return null
}

/** Known specific conflicts by traits ID */
const SPECIFIC_CONFLICTS: Array<{
  idA: string
  condition: (traitsB: SpeciesTraits) => boolean
  level: CompatibilityLevel
  descriptionKey: string
}> = [
  {
    idA: 'hippocampus',
    condition: (b) => b.category === 'fish' && b.temperament !== 'peaceful',
    level: 'incompatible',
    descriptionKey: 'rules.specific_seahorse',
  },
  {
    idA: 'ambystoma',
    condition: (b) => b.category === 'fish' && b.id !== 'ambystoma',
    level: 'caution',
    descriptionKey: 'rules.specific_axolotl',
  },
  {
    idA: 'galaxea',
    condition: (b) => b.category === 'coral' && b.id !== 'galaxea',
    level: 'caution',
    descriptionKey: 'rules.specific_coral_war',
  },
  {
    idA: 'catalaphyllia',
    condition: (b) => b.category === 'coral' && b.id !== 'catalaphyllia',
    level: 'caution',
    descriptionKey: 'rules.specific_coral_war',
  },
]

function checkSpecificConflicts(
  traitsA: SpeciesTraits, nameA: string,
  traitsB: SpeciesTraits, nameB: string,
): CompatibilityResult | null {
  for (const conflict of SPECIFIC_CONFLICTS) {
    if (traitsA.id === conflict.idA && conflict.condition(traitsB)) {
      return {
        level: conflict.level,
        ruleId: 'specific_conflict',
        descriptionKey: conflict.descriptionKey,
        descriptionParams: { speciesA: nameA, speciesB: nameB, other: nameB },
        speciesA: nameA,
        speciesB: nameB,
      }
    }
    if (traitsB.id === conflict.idA && conflict.condition(traitsA)) {
      return {
        level: conflict.level,
        ruleId: 'specific_conflict',
        descriptionKey: conflict.descriptionKey,
        descriptionParams: { speciesA: nameB, speciesB: nameA, other: nameA },
        speciesA: nameB,
        speciesB: nameA,
      }
    }
  }
  return null
}

function checkTerritorialDuplicates(
  inhabitants: Array<{ traits: SpeciesTraits; name: string; quantity: number }>,
): CompatibilityResult[] {
  const results: CompatibilityResult[] = []
  const grouped = new Map<string, { traits: SpeciesTraits; name: string; total: number }>()

  for (const item of inhabitants) {
    const existing = grouped.get(item.traits.id)
    if (existing) {
      existing.total += item.quantity
    } else {
      grouped.set(item.traits.id, { traits: item.traits, name: item.name, total: item.quantity })
    }
  }

  for (const [, group] of grouped) {
    if (group.traits.territorial && group.traits.maxGroupConflict && group.total > 1) {
      // Special case for bettas
      if (group.traits.id === 'betta') {
        results.push({
          level: 'incompatible',
          ruleId: 'specific_betta_male',
          descriptionKey: 'rules.specific_betta_male',
          descriptionParams: {},
          speciesA: group.name,
        })
      } else {
        results.push({
          level: 'caution',
          ruleId: 'territorial_duplicates',
          descriptionKey: 'rules.territorial_duplicates',
          descriptionParams: { species: group.name },
          speciesA: group.name,
        })
      }
    }
  }

  return results
}

// ── Pairwise check (all rules between two species) ──

export function checkPair(
  traitsA: SpeciesTraits, nameA: string,
  traitsB: SpeciesTraits, nameB: string,
): CompatibilityResult[] {
  const results: CompatibilityResult[] = []

  const aggression = checkAggressionConflict(traitsA, nameA, traitsB, nameB)
  if (aggression) results.push(aggression)

  // Reef safety: check both directions (fish vs coral, invert vs coral)
  const reefAB = checkReefSafety(traitsA, nameA, traitsB, nameB)
  if (reefAB) results.push(reefAB)
  const reefBA = checkReefSafety(traitsB, nameB, traitsA, nameA)
  if (reefBA) results.push(reefBA)

  const predator = checkPredatorPrey(traitsA, nameA, traitsB, nameB)
  if (predator) results.push(predator)

  const size = checkSizeDisparity(traitsA, nameA, traitsB, nameB)
  if (size) results.push(size)

  const specific = checkSpecificConflicts(traitsA, nameA, traitsB, nameB)
  if (specific) results.push(specific)

  return results
}

// ── Main Engine Functions ──

/**
 * Check a new species against all existing tank inhabitants.
 * Used by LivestockForm inline warnings.
 */
export function checkNewSpeciesCompatibility(
  newSpeciesName: string,
  _newSpeciesType: string,
  existingLivestock: LivestockEntry[],
  tankVolumeLiters: number,
  tankWaterType: string,
): CompatibilityReport {
  const results: CompatibilityResult[] = []
  const unknownSpecies: string[] = []

  const newTraits = findTraitsForSpecies(newSpeciesName)
  if (!newTraits) {
    unknownSpecies.push(newSpeciesName)
    return { overallLevel: 'compatible', results, unknownSpecies }
  }

  const newName = newTraits.commonGroupName

  // Check water type
  const waterResult = checkWaterTypeConflict(newTraits, newName, tankWaterType)
  if (waterResult) results.push(waterResult)

  // Check tank size
  const sizeResult = checkTankSize(newTraits, newName, tankVolumeLiters)
  if (sizeResult) results.push(sizeResult)

  // Build list of existing inhabitants with traits
  const existing: Array<{ traits: SpeciesTraits; name: string; quantity: number }> = []
  const alive = existingLivestock.filter(l => !l.status || l.status === 'alive')

  for (const item of alive) {
    const traits = findTraitsForSpecies(item.species_name)
    if (traits) {
      existing.push({ traits, name: displayName(item), quantity: item.quantity })
    }
  }

  // Check pairwise against each existing inhabitant
  for (const item of existing) {
    const pairResults = checkPair(newTraits, newName, item.traits, item.name)
    results.push(...pairResults)
  }

  // Check territorial duplicates (including new species)
  const allInhabitants = [
    ...existing,
    { traits: newTraits, name: newName, quantity: 1 },
  ]
  const territorialResults = checkTerritorialDuplicates(allInhabitants)
  results.push(...territorialResults)

  // Deduplicate by ruleId + speciesA + speciesB
  const seen = new Set<string>()
  const deduped = results.filter(r => {
    const key = `${r.ruleId}:${r.speciesA}:${r.speciesB || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const overallLevel = deduped.reduce<CompatibilityLevel>(
    (worst, r) => worstLevel(worst, r.level),
    'compatible',
  )

  return { overallLevel, results: deduped, unknownSpecies }
}

/**
 * Check all current tank inhabitants against each other.
 * Used by the standalone checker modal.
 */
export function checkAllCompatibility(
  livestock: LivestockEntry[],
  tankVolumeLiters: number,
  tankWaterType: string,
): CompatibilityReport {
  const results: CompatibilityResult[] = []
  const unknownSpecies: string[] = []

  const alive = livestock.filter(l => !l.status || l.status === 'alive')

  // Resolve traits for all
  const resolved: Array<{ traits: SpeciesTraits; name: string; quantity: number }> = []
  for (const item of alive) {
    const traits = findTraitsForSpecies(item.species_name)
    if (traits) {
      resolved.push({ traits, name: displayName(item), quantity: item.quantity })
    } else {
      unknownSpecies.push(item.common_name || item.species_name)
    }
  }

  // Per-species checks (water type, tank size)
  for (const item of resolved) {
    const waterResult = checkWaterTypeConflict(item.traits, item.name, tankWaterType)
    if (waterResult) results.push(waterResult)

    const sizeResult = checkTankSize(item.traits, item.name, tankVolumeLiters)
    if (sizeResult) results.push(sizeResult)
  }

  // Pairwise checks
  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const pairResults = checkPair(
        resolved[i].traits, resolved[i].name,
        resolved[j].traits, resolved[j].name,
      )
      results.push(...pairResults)
    }
  }

  // Territorial duplicates
  const territorialResults = checkTerritorialDuplicates(resolved)
  results.push(...territorialResults)

  // Deduplicate
  const seen = new Set<string>()
  const deduped = results.filter(r => {
    const key = `${r.ruleId}:${r.speciesA}:${r.speciesB || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const overallLevel = deduped.reduce<CompatibilityLevel>(
    (worst, r) => worstLevel(worst, r.level),
    'compatible',
  )

  return { overallLevel, results: deduped, unknownSpecies }
}
