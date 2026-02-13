/**
 * Inline Compatibility Alert
 *
 * Shown in LivestockForm when adding new livestock.
 * Checks the new species against existing tank inhabitants.
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { livestockApi } from '../../api'
import { checkNewSpeciesCompatibility } from '../../config/compatibilityRules'
import { findTraitsForSpecies } from '../../config/compatibilityData'
import type { CompatibilityReport } from '../../config/compatibilityRules'
import type { Tank } from '../../types'

interface CompatibilityAlertProps {
  speciesName: string
  speciesType: 'fish' | 'coral' | 'invertebrate'
  tankId: string
  tanks: Tank[]
}

export default function CompatibilityAlert({
  speciesName,
  speciesType,
  tankId,
  tanks,
}: CompatibilityAlertProps) {
  const { t } = useTranslation('compatibility')
  const [report, setReport] = useState<CompatibilityReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasTraits, setHasTraits] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!speciesName || !tankId) {
      setReport(null)
      return
    }

    // Check if species is in database
    const traits = findTraitsForSpecies(speciesName)
    setHasTraits(!!traits)
    if (!traits) {
      setReport(null)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const tank = tanks.find(t => t.id === tankId)
        if (!tank) return

        const existing = await livestockApi.list({ tank_id: tankId })
        const result = checkNewSpeciesCompatibility(
          speciesName,
          speciesType,
          existing.map(l => ({
            species_name: l.species_name,
            common_name: l.common_name,
            type: l.type,
            quantity: l.quantity,
            status: l.status,
          })),
          tank.total_volume_liters,
          tank.water_type,
        )
        setReport(result)
      } catch {
        setReport(null)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [speciesName, speciesType, tankId, tanks])

  if (!speciesName || !tankId) return null

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-ocean-500 rounded-full animate-spin" />
          {t('inlineChecking')}
        </div>
      </div>
    )
  }

  if (!hasTraits) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">{t('inlineNoData')}</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  if (report.overallLevel === 'compatible') {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">{t('inlineCompatible')}</p>
        </div>
      </div>
    )
  }

  const isIncompatible = report.overallLevel === 'incompatible'
  const bgColor = isIncompatible
    ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
  const iconColor = isIncompatible ? 'text-red-500' : 'text-amber-500'
  const textColor = isIncompatible
    ? 'text-red-700 dark:text-red-300'
    : 'text-amber-700 dark:text-amber-300'
  const titleKey = isIncompatible ? 'overallIncompatible' : 'overallCaution'

  return (
    <div className={`border rounded-lg p-3 ${bgColor}`}>
      <div className="flex items-start gap-2">
        <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${textColor}`}>{t(titleKey)}</p>
          <ul className="mt-1 space-y-0.5">
            {report.results.map((result, idx) => (
              <li key={idx} className={`text-xs ${textColor} opacity-90`}>
                {t(result.descriptionKey, result.descriptionParams)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
