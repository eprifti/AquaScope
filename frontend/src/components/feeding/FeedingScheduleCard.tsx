/**
 * Feeding Schedule Card Component
 *
 * Compact card for feeding schedules with a prominent "Feed Now" button.
 * Follows the pattern of ReminderCard from maintenance.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FeedingSchedule } from '../../types'

interface FeedingScheduleCardProps {
  schedule: FeedingSchedule
  tankName: string
  onFeed: (id: string) => Promise<void>
  onEdit: (schedule: FeedingSchedule) => void
  onDelete: (id: string) => void
}

/**
 * Returns a human-readable relative time string (e.g., "2 hours ago", "in 3 days").
 * No external library needed.
 */
function relativeTime(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now()
  const target = new Date(dateStr).getTime()
  const diffMs = target - now
  const absDiffMs = Math.abs(diffMs)
  const isPast = diffMs < 0

  const minutes = Math.floor(absDiffMs / (1000 * 60))
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60))
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))

  let label: string
  if (minutes < 1) {
    label = t('card.justNow', { defaultValue: 'just now' })
    return label
  } else if (minutes < 60) {
    label = `${minutes}m`
  } else if (hours < 48) {
    label = `${hours}${t('card.hours', { defaultValue: 'h' })}`
  } else {
    label = `${days}${t('card.days', { defaultValue: 'd' })}`
  }

  return isPast ? `${label} ago` : `in ${label}`
}

type ScheduleStatus = 'overdue' | 'dueSoon' | 'fedRecently' | 'scheduled'

function getStatus(schedule: FeedingSchedule): ScheduleStatus {
  const now = Date.now()

  if (schedule.next_due) {
    const nextDue = new Date(schedule.next_due).getTime()
    const diffMs = nextDue - now
    const twoHoursMs = 2 * 60 * 60 * 1000

    if (diffMs < 0) return 'overdue'
    if (diffMs <= twoHoursMs) return 'dueSoon'
  }

  if (schedule.last_fed) {
    const lastFed = new Date(schedule.last_fed).getTime()
    const sinceFedMs = now - lastFed
    const oneHourMs = 60 * 60 * 1000

    if (sinceFedMs < oneHourMs) return 'fedRecently'
  }

  return 'scheduled'
}

function getFrequencyDisplay(hours: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const every = t('card.every', { defaultValue: 'Every' })
  const h = t('card.hours', { defaultValue: 'h' })
  const d = t('card.days', { defaultValue: 'd' })

  if (hours < 24) {
    return `${every} ${hours}${h}`
  }

  const days = hours / 24
  if (Number.isInteger(days)) {
    return `${every} ${days}${d}`
  }

  return `${every} ${hours}${h}`
}

const STATUS_CONFIG: Record<ScheduleStatus, {
  borderColor: string
  badgeClasses: string
  badgeKey: string
}> = {
  overdue: {
    borderColor: 'border-red-500 dark:border-red-600',
    badgeClasses: 'text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900/50',
    badgeKey: 'card.overdue',
  },
  dueSoon: {
    borderColor: 'border-yellow-500 dark:border-yellow-600',
    badgeClasses: 'text-yellow-600 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-900/50',
    badgeKey: 'card.dueSoon',
  },
  fedRecently: {
    borderColor: 'border-green-500 dark:border-green-600',
    badgeClasses: 'text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-900/50',
    badgeKey: 'card.fedRecently',
  },
  scheduled: {
    borderColor: 'border-gray-400 dark:border-gray-500',
    badgeClasses: 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600',
    badgeKey: 'card.scheduled',
  },
}

export default function FeedingScheduleCard({
  schedule,
  tankName,
  onFeed,
  onEdit,
  onDelete,
}: FeedingScheduleCardProps) {
  const { t } = useTranslation('feeding')
  const { t: tc } = useTranslation('common')
  const [feeding, setFeeding] = useState(false)

  const status = getStatus(schedule)
  const config = STATUS_CONFIG[status]

  const handleFeed = async () => {
    setFeeding(true)
    try {
      await onFeed(schedule.id)
    } finally {
      setFeeding(false)
    }
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${config.borderColor} ${
        !schedule.is_active ? 'opacity-60' : ''
      }`}
    >
      {/* Header: food name, tank name, badge, action buttons */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight truncate">
            {schedule.food_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {tankName}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-0.5 flex-shrink-0">
          <button
            onClick={() => onEdit(schedule)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title={tc('actions.edit')}
            aria-label={tc('actions.edit')}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title={tc('actions.delete')}
            aria-label={tc('actions.delete')}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status badge + quantity + frequency */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${config.badgeClasses}`}>
          {t(config.badgeKey, { defaultValue: status })}
        </span>

        {schedule.quantity != null && schedule.quantity_unit && (
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {schedule.quantity} {schedule.quantity_unit}
          </span>
        )}

        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getFrequencyDisplay(schedule.frequency_hours, t)}
        </span>

        {schedule.consumable_id && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
            </svg>
            {t('card.linked', { defaultValue: 'Linked' })}
          </span>
        )}
      </div>

      {/* Time info: last fed + next due */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-0.5">
          <span className="text-gray-400">✅</span>
          <span>
            {t('card.lastFed', { defaultValue: 'Last fed' })}:{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {schedule.last_fed
                ? relativeTime(schedule.last_fed, t)
                : t('card.never', { defaultValue: 'Never' })}
            </span>
          </span>
        </span>

        {schedule.next_due && (
          <span className="inline-flex items-center gap-0.5">
            <span className="text-gray-400">📅</span>
            <span>
              {t('card.nextDue', { defaultValue: 'Next due' })}:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {relativeTime(schedule.next_due, t)}
              </span>
            </span>
          </span>
        )}
      </div>

      {/* Notes */}
      {schedule.notes && (
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 italic">
          {schedule.notes}
        </p>
      )}

      {/* Feed Now button */}
      {schedule.is_active && (
        <button
          onClick={handleFeed}
          disabled={feeding}
          className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {feeding
            ? '...'
            : t('card.feedNow', { defaultValue: 'Feed Now' })}
        </button>
      )}
    </div>
  )
}
