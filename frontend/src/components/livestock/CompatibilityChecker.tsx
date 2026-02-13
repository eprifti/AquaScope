/**
 * Compatibility Checker Modal
 *
 * Standalone modal that checks all current tank inhabitants
 * against each other for compatibility issues.
 * Includes three views: Issues list, Matrix heatmap, and Network diagram.
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { findTraitsForSpecies } from '../../config/compatibilityData'
import { checkAllCompatibility } from '../../config/compatibilityRules'
import type { CompatibilityReport, CompatibilityLevel, ResolvedSpecies } from '../../config/compatibilityRules'
import type { Livestock, Tank } from '../../types'
import CompatibilityMatrix from './CompatibilityMatrix'
import CompatibilityNetwork from './CompatibilityNetwork'

type TabId = 'issues' | 'matrix' | 'network'

interface CompatibilityCheckerProps {
  isOpen: boolean
  onClose: () => void
  livestock: Livestock[]
  tanks: Tank[]
  selectedTankId: string
}

const LEVEL_STYLES: Record<CompatibilityLevel, { bg: string; border: string; text: string; icon: string }> = {
  compatible: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-500',
  },
  caution: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-500',
  },
  incompatible: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-500',
  },
}

export default function CompatibilityChecker({
  isOpen,
  onClose,
  livestock,
  tanks,
  selectedTankId,
}: CompatibilityCheckerProps) {
  const { t } = useTranslation('compatibility')
  const [activeTankId, setActiveTankId] = useState(
    selectedTankId !== 'all' ? selectedTankId : (tanks.length > 0 ? tanks[0].id : '')
  )
  const [activeTab, setActiveTab] = useState<TabId>('issues')

  const activeTank = tanks.find(t => t.id === activeTankId)

  const tankLivestock = useMemo(() => {
    if (!activeTankId) return []
    return livestock.filter(
      l => l.tank_id === activeTankId && (l.status === 'alive' || !l.status) && !l.is_archived
    )
  }, [livestock, activeTankId])

  // Resolve species traits for matrix/network views
  const resolvedSpecies: ResolvedSpecies[] = useMemo(() => {
    const seen = new Set<string>()
    const result: ResolvedSpecies[] = []
    for (const l of tankLivestock) {
      const traits = findTraitsForSpecies(l.species_name)
      if (traits && !seen.has(traits.id)) {
        seen.add(traits.id)
        result.push({ traits, name: traits.commonGroupName })
      }
    }
    return result
  }, [tankLivestock])

  const report: CompatibilityReport | null = useMemo(() => {
    if (!activeTank || tankLivestock.length === 0) return null
    return checkAllCompatibility(
      tankLivestock.map(l => ({
        species_name: l.species_name,
        common_name: l.common_name,
        type: l.type,
        quantity: l.quantity,
        status: l.status,
      })),
      activeTank.total_volume_liters,
      activeTank.water_type,
    )
  }, [tankLivestock, activeTank])

  if (!isOpen) return null

  const overallStyle = report ? LEVEL_STYLES[report.overallLevel] : LEVEL_STYLES.compatible
  const incompatibleResults = report?.results.filter(r => r.level === 'incompatible') || []
  const cautionResults = report?.results.filter(r => r.level === 'caution') || []

  const tabs: { id: TabId; label: string; icon: JSX.Element }[] = [
    {
      id: 'issues',
      label: t('tabs.issues', { defaultValue: 'Issues' }),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'matrix',
      label: t('tabs.matrix', { defaultValue: 'Matrix' }),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'network',
      label: t('tabs.network', { defaultValue: 'Network' }),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tank Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('selectTank')}
            </label>
            <select
              value={activeTankId}
              onChange={e => setActiveTankId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">--</option>
              {tanks.map(tank => (
                <option key={tank.id} value={tank.id}>
                  {tank.name} ({tank.total_volume_liters}L — {tank.water_type})
                </option>
              ))}
            </select>
          </div>

          {activeTankId && tankLivestock.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              {t('noLivestock')}
            </div>
          )}

          {report && (
            <>
              {/* Overall Status */}
              <div className={`${overallStyle.bg} border ${overallStyle.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {report.overallLevel === 'compatible' ? (
                      <svg className={`w-6 h-6 ${overallStyle.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className={`w-6 h-6 ${overallStyle.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <div>
                      <p className={`font-semibold ${overallStyle.text}`}>
                        {t(`overall${report.overallLevel.charAt(0).toUpperCase() + report.overallLevel.slice(1)}` as any)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('speciesChecked', { count: tankLivestock.length })}
                        {report.results.length > 0 && ` — ${t('issuesFound', { count: report.results.length })}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${overallStyle.bg} ${overallStyle.text} border ${overallStyle.border}`}>
                    {t(`severity.${report.overallLevel}` as any)}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content: Issues */}
              {activeTab === 'issues' && (
                <div className="space-y-4">
                  {/* Incompatible Issues */}
                  {incompatibleResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        {t('severity.incompatible')}
                      </h3>
                      <div className="space-y-2">
                        {incompatibleResults.map((result, idx) => (
                          <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-md p-3">
                            <p className="text-sm text-red-800 dark:text-red-300">
                              {t(result.descriptionKey, result.descriptionParams)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caution Issues */}
                  {cautionResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {t('severity.caution')}
                      </h3>
                      <div className="space-y-2">
                        {cautionResults.map((result, idx) => (
                          <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-md p-3">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                              {t(result.descriptionKey, result.descriptionParams)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Issues */}
                  {report.results.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{t('noIssues')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Matrix */}
              {activeTab === 'matrix' && (
                <CompatibilityMatrix species={resolvedSpecies} />
              )}

              {/* Tab Content: Network */}
              {activeTab === 'network' && (
                <CompatibilityNetwork species={resolvedSpecies} />
              )}

              {/* Unknown Species (visible on all tabs) */}
              {report.unknownSpecies.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('notInDatabase')}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('notInDatabaseInfo')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.unknownSpecies.map((name, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs italic">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">{t('info.title')}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{t('info.description')}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2 font-medium italic">{t('info.disclaimer')}</p>

                {/* Sources */}
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">{t('info.sourcesTitle')}</h5>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{t('info.sources')}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a href="https://www.fishbase.se" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">FishBase.org</a>
                    <a href="https://www.marinespecies.org" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">WoRMS</a>
                    <a href="https://www.liveaquaria.com" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">LiveAquaria</a>
                    <a href="https://www.reef2reef.com" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">Reef2Reef</a>
                    <a href="https://www.reefcentral.com" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">ReefCentral</a>
                    <a href="https://masna.org" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100">MASNA</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          >
            {t('common:close', { defaultValue: 'Close' })}
          </button>
        </div>
      </div>
    </div>
  )
}
