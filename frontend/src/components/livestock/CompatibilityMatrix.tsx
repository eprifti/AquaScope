/**
 * Compatibility Matrix
 *
 * CSS grid heatmap showing pairwise compatibility between aquarium species
 * in a tank. Each cell is colored by the worst compatibility level between
 * the row and column species.
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { checkPair } from '../../config/compatibilityRules'
import type { CompatibilityResult, CompatibilityLevel } from '../../config/compatibilityRules'
import type { ResolvedSpecies } from '../../config/compatibilityRules'

interface CompatibilityMatrixProps {
  species: ResolvedSpecies[]
}

/** Determine the worst compatibility level from a list of results */
function worstLevel(results: CompatibilityResult[]): CompatibilityLevel {
  let worst: CompatibilityLevel = 'compatible'
  for (const r of results) {
    if (r.level === 'incompatible') return 'incompatible'
    if (r.level === 'caution') worst = 'caution'
  }
  return worst
}

/** Cell color classes indexed by compatibility level */
const CELL_STYLES: Record<CompatibilityLevel, string> = {
  compatible: 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-900 dark:text-emerald-200',
  caution: 'bg-amber-100 dark:bg-amber-800/30 text-amber-900 dark:text-amber-200',
  incompatible: 'bg-red-100 dark:bg-red-800/30 text-red-900 dark:text-red-200',
}

const CELL_HOVER_STYLES: Record<CompatibilityLevel, string> = {
  compatible: 'hover:bg-emerald-200 dark:hover:bg-emerald-700/40',
  caution: 'hover:bg-amber-200 dark:hover:bg-amber-700/40',
  incompatible: 'hover:bg-red-200 dark:hover:bg-red-700/40',
}

/** Legend dot colors */
const LEGEND_DOT: Record<CompatibilityLevel, string> = {
  compatible: 'bg-emerald-400 dark:bg-emerald-500',
  caution: 'bg-amber-400 dark:bg-amber-500',
  incompatible: 'bg-red-400 dark:bg-red-500',
}

export default function CompatibilityMatrix({ species }: CompatibilityMatrixProps) {
  const { t } = useTranslation('compatibility')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Compute asymmetric NxN matrix: cell [i][j] = issues where species[i] is the aggressor/source
  // Row = aggressor, Column = victim. This makes the matrix directional.
  const pairResults = useMemo(() => {
    const n = species.length
    const matrix: CompatibilityResult[][][] = []
    for (let i = 0; i < n; i++) {
      matrix[i] = []
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = []
        } else {
          // Get all pairwise results
          const allResults = checkPair(
            species[i].traits, species[i].name,
            species[j].traits, species[j].name,
          )
          // Filter: only keep results where species[i] is the aggressor (speciesA)
          matrix[i][j] = allResults.filter(r => r.speciesA === species[i].name)
        }
      }
    }
    return matrix
  }, [species])

  // Compute worst level for each cell
  const levelMatrix = useMemo(() => {
    return pairResults.map(row => row.map(results => worstLevel(results)))
  }, [pairResults])

  // Close tooltip when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(e.target as Node) &&
      gridRef.current &&
      !gridRef.current.contains(e.target as Node)
    ) {
      setSelectedCell(null)
    }
  }, [])

  useEffect(() => {
    if (selectedCell) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedCell, handleClickOutside])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCell(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const n = species.length

  // Fewer than 2 species: show a message
  if (n < 2) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        {t('matrix.needMoreSpecies', { defaultValue: 'Add at least 2 species to see the compatibility matrix.' })}
      </div>
    )
  }

  // Dynamic cell size: smaller when more species
  const cellSize = n <= 5 ? 64 : n <= 8 ? 54 : 44

  // Truncate long names
  const maxLabelLen = cellSize <= 40 ? 8 : cellSize <= 50 ? 10 : 14
  const truncate = (name: string) =>
    name.length > maxLabelLen ? name.slice(0, maxLabelLen - 1) + '\u2026' : name

  // Selected cell data
  const selectedResults = selectedCell
    ? pairResults[selectedCell.row][selectedCell.col]
    : []
  const selectedLevel = selectedCell
    ? levelMatrix[selectedCell.row][selectedCell.col]
    : null

  const handleCellClick = (row: number, col: number) => {
    if (row === col) return
    const results = pairResults[row][col]
    if (results.length === 0) return
    setSelectedCell(prev =>
      prev && prev.row === row && prev.col === col ? null : { row, col },
    )
  }

  // Grid template: header column + N data columns
  const gridTemplateColumns = `${cellSize + 20}px repeat(${n}, ${cellSize}px)`

  return (
    <div className="space-y-4">
      {/* Scrollable grid container */}
      <div className="overflow-x-auto pb-2" ref={gridRef}>
        <div
          className="inline-grid gap-0"
          style={{
            gridTemplateColumns,
            gridTemplateRows: `${cellSize + 20}px repeat(${n}, ${cellSize}px)`,
          }}
        >
          {/* Top-left corner cell with axis hint */}
          <div className="flex items-end justify-end pr-1 pb-1">
            <span className="text-[8px] text-gray-400 dark:text-gray-500 italic"
              title="Row threatens Column"
            >
              &#x2192; victim
            </span>
          </div>

          {/* Column headers */}
          {species.map((sp, j) => (
            <div
              key={`col-${j}`}
              className="flex items-end justify-center pb-1 overflow-hidden"
              title={sp.name}
            >
              <span
                className="text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap origin-bottom-left"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  maxHeight: `${cellSize + 16}px`,
                }}
              >
                {truncate(sp.name)}
              </span>
            </div>
          ))}

          {/* Data rows */}
          {species.map((rowSpecies, i) => (
            <>
              {/* Row header */}
              <div
                key={`row-${i}`}
                className="flex items-center justify-end pr-2 overflow-hidden"
                title={rowSpecies.name}
              >
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap truncate text-right">
                  {truncate(rowSpecies.name)}
                </span>
              </div>

              {/* Cells */}
              {species.map((_, j) => {
                const isDiagonal = i === j
                const level = levelMatrix[i]?.[j] ?? 'compatible'
                const results = pairResults[i]?.[j] ?? []
                const isSelected =
                  selectedCell?.row === i && selectedCell?.col === j
                const hasIssues = results.length > 0

                if (isDiagonal) {
                  return (
                    <div
                      key={`cell-${i}-${j}`}
                      className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                      style={{ width: cellSize, height: cellSize }}
                    >
                      <span
                        className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold"
                        style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          maxHeight: cellSize - 4,
                          overflow: 'hidden',
                        }}
                      >
                        {truncate(rowSpecies.name)}
                      </span>
                    </div>
                  )
                }

                return (
                  <div
                    key={`cell-${i}-${j}`}
                    role={hasIssues ? 'button' : undefined}
                    tabIndex={hasIssues ? 0 : undefined}
                    className={[
                      'border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors',
                      CELL_STYLES[level],
                      hasIssues ? `cursor-pointer ${CELL_HOVER_STYLES[level]}` : '',
                      isSelected ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 z-10' : '',
                    ].join(' ')}
                    style={{ width: cellSize, height: cellSize }}
                    onClick={() => handleCellClick(i, j)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCellClick(i, j)
                      }
                    }}
                    title={
                      hasIssues
                        ? t('matrix.clickForDetails', { defaultValue: 'Click for details' })
                        : t('severity.compatible', { defaultValue: 'Compatible' })
                    }
                  >
                    {level === 'incompatible' && (
                      <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {level === 'caution' && (
                      <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                      </svg>
                    )}
                    {level === 'compatible' && (
                      <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Tooltip/Popover for selected cell */}
      {selectedCell && selectedResults.length > 0 && (
        <div
          ref={tooltipRef}
          className={[
            'border rounded-lg p-4 shadow-lg animate-in fade-in duration-200',
            selectedLevel === 'incompatible'
              ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
          ].join(' ')}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className={[
              'text-sm font-semibold',
              selectedLevel === 'incompatible'
                ? 'text-red-700 dark:text-red-300'
                : 'text-amber-700 dark:text-amber-300',
            ].join(' ')}>
              {species[selectedCell.row].name} &rarr; {species[selectedCell.col].name}
            </h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 -mt-1 -mr-1"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="space-y-1.5">
            {selectedResults.map((result, idx) => (
              <li key={idx} className="flex items-start gap-2">
                {result.level === 'incompatible' ? (
                  <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                <span className={[
                  'text-xs',
                  result.level === 'incompatible'
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-amber-800 dark:text-amber-300',
                ].join(' ')}>
                  {t(result.descriptionKey, result.descriptionParams)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Color Legend + axis explanation */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {t('matrix.legend', { defaultValue: 'Legend:' })}
          </span>
          {(['compatible', 'caution', 'incompatible'] as CompatibilityLevel[]).map(level => (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`inline-block w-3 h-3 rounded-sm ${LEGEND_DOT[level]}`} />
              <span>{t(`severity.${level}` as const)}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 italic">
          {t('matrix.directionHint', { defaultValue: 'Row = aggressor/source, Column = affected species. The matrix is asymmetric.' })}
        </div>
      </div>
    </div>
  )
}
