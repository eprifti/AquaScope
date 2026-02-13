/**
 * Feeding Log Modal Component
 *
 * Modal that displays recent feeding log entries and allows creating
 * ad-hoc feeding log entries for a given tank.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FeedingLog, FeedingLogCreate } from '../../types'

interface FeedingLogModalProps {
  logs: FeedingLog[]
  isOpen: boolean
  onClose: () => void
  onCreateLog: (data: FeedingLogCreate) => Promise<void>
  tankId: string
}

type Tab = 'history' | 'add'

/**
 * Returns a human-readable relative time string for a given ISO date.
 */
function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function FeedingLogModal({
  logs,
  isOpen,
  onClose,
  onCreateLog,
  tankId,
}: FeedingLogModalProps) {
  const { t } = useTranslation('feeding')
  const [activeTab, setActiveTab] = useState<Tab>('history')

  // Form state
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState<string>('')
  const [quantityUnit, setQuantityUnit] = useState('g')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('history')
      setFoodName('')
      setQuantity('')
      setQuantityUnit('g')
      setNotes('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodName.trim()) return

    setIsSubmitting(true)
    try {
      const data: FeedingLogCreate = {
        tank_id: tankId,
        food_name: foodName.trim(),
        quantity: quantity ? parseFloat(quantity) : undefined,
        quantity_unit: quantity ? quantityUnit : undefined,
        notes: notes.trim() || undefined,
      }
      await onCreateLog(data)
      // Reset form and switch to history after success
      setFoodName('')
      setQuantity('')
      setQuantityUnit('g')
      setNotes('')
      setActiveTab('history')
    } catch (error) {
      console.error('Failed to create feeding log:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('log.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Close"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-ocean-600 border-b-2 border-ocean-600 bg-ocean-50/50 dark:bg-ocean-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {t('log.history')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-ocean-600 border-b-2 border-ocean-600 bg-ocean-50/50 dark:bg-ocean-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {t('log.addEntry')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'history' ? (
            /* ---- History Tab ---- */
            logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">{t('log.noLogs')}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {log.food_name}
                        </div>
                        {log.quantity != null && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {log.quantity}
                            {log.quantity_unit ? ` ${log.quantity_unit}` : ''}
                          </div>
                        )}
                        {log.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                            {log.notes}
                          </div>
                        )}
                      </div>
                      <div
                        className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0"
                        title={new Date(log.fed_at).toLocaleString()}
                      >
                        <span className="block text-right">
                          {t('log.fedAt')}: {relativeTime(log.fed_at)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            /* ---- Add Entry Tab ---- */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Food Name */}
              <div>
                <label
                  htmlFor="feedingFoodName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('log.foodName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="feedingFoodName"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="feedingQuantity"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('log.quantity')}
                  </label>
                  <input
                    type="number"
                    id="feedingQuantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={0}
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="feedingUnit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    &nbsp;
                  </label>
                  <select
                    id="feedingUnit"
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  >
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="drops">drops</option>
                    <option value="pinch">pinch</option>
                    <option value="cube">cube</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="feedingNotes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('log.notes')}
                </label>
                <textarea
                  id="feedingNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !foodName.trim()}
                  className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : t('log.submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
