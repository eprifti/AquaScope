/**
 * Feeding Schedule Form Component
 *
 * Modal form for creating and editing feeding schedules.
 * Follows the same pattern as ReminderForm from the maintenance module.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  FeedingSchedule,
  FeedingScheduleCreate,
  FeedingScheduleUpdate,
  Tank,
  Consumable,
} from '../../types'
import TankSelector from '../common/TankSelector'

interface FeedingScheduleFormProps {
  tanks: Tank[]
  consumables: Consumable[]
  onSubmit: (data: FeedingScheduleCreate | FeedingScheduleUpdate) => Promise<void>
  onCancel: () => void
  schedule?: FeedingSchedule
  defaultTankId?: string
}

const QUANTITY_UNITS = [
  { value: 'cube', label: 'Cube' },
  { value: 'pinch', label: 'Pinch' },
  { value: 'ml', label: 'mL' },
  { value: 'g', label: 'g' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'drop', label: 'Drop' },
  { value: 'piece', label: 'Piece' },
]

const FREQUENCY_PRESETS = [
  { hours: 12, label: 'Twice daily' },
  { hours: 24, label: 'Daily' },
  { hours: 48, label: 'Every 2 days' },
  { hours: 72, label: 'Every 3 days' },
]

export default function FeedingScheduleForm({
  tanks,
  consumables,
  onSubmit,
  onCancel,
  schedule,
  defaultTankId,
}: FeedingScheduleFormProps) {
  const { t } = useTranslation('feeding')

  const [tankId, setTankId] = useState('')
  const [foodName, setFoodName] = useState('')
  const [consumableId, setConsumableId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityUnit, setQuantityUnit] = useState('cube')
  const [frequencyHours, setFrequencyHours] = useState('24')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!schedule

  // Filter consumables to food type only
  const foodConsumables = consumables.filter(
    (c) => c.consumable_type === 'food'
  )

  // Populate form when editing
  useEffect(() => {
    if (schedule) {
      setTankId(schedule.tank_id)
      setFoodName(schedule.food_name)
      setConsumableId(schedule.consumable_id || '')
      setQuantity(schedule.quantity != null ? schedule.quantity.toString() : '')
      setQuantityUnit(schedule.quantity_unit || 'cube')
      setFrequencyHours(schedule.frequency_hours.toString())
      setNotes(schedule.notes || '')
    } else if (defaultTankId) {
      setTankId(defaultTankId)
    }
  }, [schedule, defaultTankId])

  // When a consumable is selected, auto-fill food name from it
  const handleConsumableChange = (id: string) => {
    setConsumableId(id)
    if (id) {
      const selected = foodConsumables.find((c) => c.id === id)
      if (selected && !foodName) {
        setFoodName(selected.name)
      }
    }
  }

  const handleFrequencyPreset = (hours: number) => {
    setFrequencyHours(hours.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEditing) {
        const data: FeedingScheduleUpdate = {
          food_name: foodName,
          quantity: quantity ? parseFloat(quantity) : null,
          quantity_unit: quantityUnit || null,
          frequency_hours: parseInt(frequencyHours),
          consumable_id: consumableId || null,
          notes: notes || null,
        }
        await onSubmit(data)
      } else {
        const data: FeedingScheduleCreate = {
          tank_id: tankId,
          food_name: foodName,
          quantity: quantity ? parseFloat(quantity) : null,
          quantity_unit: quantityUnit || null,
          frequency_hours: parseInt(frequencyHours),
          consumable_id: consumableId || null,
          notes: notes || null,
        }
        await onSubmit(data)

        // Reset form after successful creation
        setFoodName('')
        setConsumableId('')
        setQuantity('')
        setQuantityUnit('cube')
        setFrequencyHours('24')
        setNotes('')
      }
    } catch (error) {
      console.error('Error submitting feeding schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {isEditing ? t('form.editTitle') : t('form.title')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tank Selection */}
        <TankSelector
          tanks={tanks}
          value={tankId}
          onChange={setTankId}
          allLabel={t('form.selectTank', 'Select a tank')}
          label={`${t('form.tank', 'Tank')} *`}
          showAllOption={false}
          defaultTankId={defaultTankId}
        />

        {/* Food Name */}
        <div>
          <label
            htmlFor="foodName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('form.foodName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="foodName"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
            placeholder={t('form.foodNamePlaceholder', 'e.g., Mysis Shrimp')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          />
        </div>

        {/* Link to Consumable */}
        {foodConsumables.length > 0 && (
          <div>
            <label
              htmlFor="consumableId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('form.linkConsumable')}
            </label>
            <select
              id="consumableId"
              value={consumableId}
              onChange={(e) => handleConsumableChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              <option value="">{t('form.noConsumable', 'None')}</option>
              {foodConsumables.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.brand ? ` (${c.brand})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('form.quantity')}
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="any"
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
          </div>

          <div>
            <label
              htmlFor="quantityUnit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('form.unit')}
            </label>
            <select
              id="quantityUnit"
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              {QUANTITY_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('form.frequency')} <span className="text-red-500">*</span>
          </label>

          {/* Frequency Presets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {FREQUENCY_PRESETS.map((preset) => (
              <button
                key={preset.hours}
                type="button"
                onClick={() => handleFrequencyPreset(preset.hours)}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  parseInt(frequencyHours) === preset.hours
                    ? 'border-ocean-500 bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Frequency */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="frequencyHours"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              {t('form.every', 'Every')}
            </label>
            <input
              type="number"
              id="frequencyHours"
              value={frequencyHours}
              onChange={(e) => setFrequencyHours(e.target.value)}
              required
              min="1"
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('form.hours', 'hours')}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('form.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t(
              'form.notesPlaceholder',
              'e.g., Target-feed corals after broadcast feeding'
            )}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('form.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !tankId || !foodName}
            className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? t('form.saving', 'Saving...')
              : isEditing
                ? t('form.update', 'Update Schedule')
                : t('form.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
