/**
 * Tank Card Component
 *
 * Displays tank information in a card layout
 */

import { Tank } from '../../types'
import { formatDistanceToNow } from 'date-fns'

interface TankCardProps {
  tank: Tank
  onEdit: (tank: Tank) => void
  onDelete: (id: string) => void
}

export default function TankCard({ tank, onEdit, onDelete }: TankCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAge = (setupDate: string | null) => {
    if (!setupDate) return null
    const date = new Date(setupDate)
    return formatDistanceToNow(date, { addSuffix: false })
  }

  const age = getAge(tank.setup_date)

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{tank.name}</h3>
            {age && (
              <p className="text-sm text-gray-500 mt-1">
                Running for {age}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(tank)}
              className="p-2 text-ocean-600 hover:bg-ocean-50 rounded-md transition-colors"
              title="Edit tank"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(tank.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete tank"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Volume */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Volume</span>
          <span className="font-medium text-gray-900">
            {tank.volume_liters ? `${tank.volume_liters} L` : 'Not set'}
          </span>
        </div>

        {/* Setup Date */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Setup Date</span>
          <span className="font-medium text-gray-900">
            {formatDate(tank.setup_date)}
          </span>
        </div>

        {/* Created At */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Created</span>
          <span className="text-gray-600">
            {formatDistanceToNow(new Date(tank.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Footer - Quick Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-sm">
          <button className="text-ocean-600 hover:text-ocean-700 font-medium">
            View Parameters
          </button>
          <button className="text-ocean-600 hover:text-ocean-700 font-medium">
            Add Test
          </button>
        </div>
      </div>
    </div>
  )
}
