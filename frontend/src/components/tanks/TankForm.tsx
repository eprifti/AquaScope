/**
 * Tank Form Component
 *
 * Form for creating and editing tanks
 */

import { useState, useEffect } from 'react'
import { Tank, TankCreate } from '../../types'

interface TankFormProps {
  tank?: Tank
  onSubmit: (data: TankCreate) => void
  onCancel: () => void
}

export default function TankForm({ tank, onSubmit, onCancel }: TankFormProps) {
  const [name, setName] = useState('')
  const [volumeLiters, setVolumeLiters] = useState('')
  const [setupDate, setSetupDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (tank) {
      setName(tank.name)
      setVolumeLiters(tank.volume_liters?.toString() || '')
      setSetupDate(tank.setup_date || '')
    }
  }, [tank])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data: TankCreate = {
        name,
        volume_liters: volumeLiters ? parseFloat(volumeLiters) : null,
        setup_date: setupDate || null,
      }

      await onSubmit(data)

      // Reset form if creating new tank
      if (!tank) {
        setName('')
        setVolumeLiters('')
        setSetupDate('')
      }
    } catch (error) {
      console.error('Error submitting tank:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {tank ? 'Edit Tank' : 'Create New Tank'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tank Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Main Display Tank"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          {/* Volume */}
          <div>
            <label
              htmlFor="volume"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Volume (Liters)
            </label>
            <input
              type="number"
              id="volume"
              value={volumeLiters}
              onChange={(e) => setVolumeLiters(e.target.value)}
              step="0.1"
              min="0"
              placeholder="e.g., 500"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Total system volume including sump
            </p>
          </div>

          {/* Setup Date */}
          <div>
            <label
              htmlFor="setupDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Setup Date
            </label>
            <input
              type="date"
              id="setupDate"
              value={setupDate}
              onChange={(e) => setSetupDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              When did you set up this tank?
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : tank ? 'Update Tank' : 'Create Tank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
