/**
 * Tank Form Component
 *
 * Form for creating and editing tanks with water type and subtype selection
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tank, TankCreate } from '../../types'
import { WATER_TYPES, AQUARIUM_SUBTYPES } from '../../config/parameterRanges'
import { useRegionalSettings } from '../../hooks/useRegionalSettings'

interface TankFormProps {
  tank?: Tank
  onSubmit: (data: TankCreate) => void
  onCancel: () => void
}

export default function TankForm({ tank, onSubmit, onCancel }: TankFormProps) {
  const { t } = useTranslation('tanks')
  const { t: tc } = useTranslation('common')
  const { volumeLabel, litersToDisplay, displayToLiters } = useRegionalSettings()
  const [name, setName] = useState('')
  const [waterType, setWaterType] = useState('saltwater')
  const [aquariumSubtype, setAquariumSubtype] = useState('')
  const [displayVolume, setDisplayVolume] = useState('')
  const [sumpVolume, setSumpVolume] = useState('')
  const [description, setDescription] = useState('')
  const [setupDate, setSetupDate] = useState('')
  const [electricityCost, setElectricityCost] = useState('')
  const [hasRefugium, setHasRefugium] = useState(false)
  const [refugiumType, setRefugiumType] = useState('')
  const [refugiumVolume, setRefugiumVolume] = useState('')
  const [refugiumAlgae, setRefugiumAlgae] = useState('')
  const [refugiumLightingHours, setRefugiumLightingHours] = useState('')
  const [refugiumNotes, setRefugiumNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (tank) {
      setName(tank.name)
      setWaterType(tank.water_type || 'saltwater')
      setAquariumSubtype(tank.aquarium_subtype || '')
      setDisplayVolume(tank.display_volume_liters != null ? litersToDisplay(tank.display_volume_liters).toString() : '')
      setSumpVolume(tank.sump_volume_liters != null ? litersToDisplay(tank.sump_volume_liters).toString() : '')
      setDescription(tank.description || '')
      setSetupDate(tank.setup_date || '')
      setElectricityCost(tank.electricity_cost_per_day?.toString() || '')
      setHasRefugium(tank.has_refugium || false)
      setRefugiumType(tank.refugium_type || '')
      setRefugiumVolume(tank.refugium_volume_liters != null ? litersToDisplay(tank.refugium_volume_liters).toString() : '')
      setRefugiumAlgae(tank.refugium_algae || '')
      setRefugiumLightingHours(tank.refugium_lighting_hours?.toString() || '')
      setRefugiumNotes(tank.refugium_notes || '')
    }
  }, [tank])

  const getTotalVolume = () => {
    const display = parseFloat(displayVolume) || 0
    const sump = parseFloat(sumpVolume) || 0
    return display + sump
  }

  const handleWaterTypeChange = (newType: string) => {
    setWaterType(newType)
    setAquariumSubtype('') // Reset subtype when water type changes
  }

  const subtypeOptions = AQUARIUM_SUBTYPES[waterType] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data: TankCreate = {
        name,
        water_type: waterType,
        aquarium_subtype: aquariumSubtype || null,
        display_volume_liters: displayVolume ? displayToLiters(parseFloat(displayVolume)) : null,
        sump_volume_liters: sumpVolume ? displayToLiters(parseFloat(sumpVolume)) : null,
        description: description || null,
        setup_date: setupDate || null,
        electricity_cost_per_day: electricityCost ? parseFloat(electricityCost) : null,
        has_refugium: hasRefugium,
        refugium_type: hasRefugium && refugiumType ? refugiumType : null,
        refugium_volume_liters: hasRefugium && refugiumVolume ? displayToLiters(parseFloat(refugiumVolume)) : null,
        refugium_algae: hasRefugium && refugiumAlgae ? refugiumAlgae : null,
        refugium_lighting_hours: hasRefugium && refugiumLightingHours ? parseFloat(refugiumLightingHours) : null,
        refugium_notes: hasRefugium && refugiumNotes ? refugiumNotes : null,
      }

      await onSubmit(data)

      // Reset form if creating new tank
      if (!tank) {
        setName('')
        setWaterType('saltwater')
        setAquariumSubtype('')
        setDisplayVolume('')
        setSumpVolume('')
        setDescription('')
        setSetupDate('')
        setElectricityCost('')
        setHasRefugium(false)
        setRefugiumType('')
        setRefugiumVolume('')
        setRefugiumAlgae('')
        setRefugiumLightingHours('')
        setRefugiumNotes('')
      }
    } catch (error) {
      console.error('Error submitting tank:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {tank ? t('editTank') : t('createTank')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tank Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('fields.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Main Display Tank"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Water Type & Subtype */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('fields.aquariumType')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Water Type */}
              <div>
                <label
                  htmlFor="waterType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('fields.waterType')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="waterType"
                  value={waterType}
                  onChange={(e) => handleWaterTypeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  {WATER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`waterType.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aquarium Subtype */}
              <div>
                <label
                  htmlFor="aquariumSubtype"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('fields.aquariumSubtype')}
                </label>
                <select
                  id="aquariumSubtype"
                  value={aquariumSubtype}
                  onChange={(e) => setAquariumSubtype(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">{t('fields.selectSubtype')}</option>
                  {subtypeOptions.map((sub) => (
                    <option key={sub.key} value={sub.key}>
                      {t(`subtype.${sub.key}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('parameterRanges.rangesNote')}
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('fields.description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g., Mixed reef with SPS and LPS corals, heavy feeding schedule..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Volume Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('fields.systemVolume')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Volume */}
              <div>
                <label
                  htmlFor="displayVolume"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('fields.displayVolume')} ({volumeLabel})
                </label>
                <input
                  type="number"
                  id="displayVolume"
                  value={displayVolume}
                  onChange={(e) => setDisplayVolume(e.target.value)}
                  step="0.1"
                  min="0"
                  placeholder={volumeLabel === 'L' ? 'e.g., 400' : 'e.g., 100'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Sump Volume */}
              <div>
                <label
                  htmlFor="sumpVolume"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('fields.sumpVolume')} ({volumeLabel})
                </label>
                <input
                  type="number"
                  id="sumpVolume"
                  value={sumpVolume}
                  onChange={(e) => setSumpVolume(e.target.value)}
                  step="0.1"
                  min="0"
                  placeholder={volumeLabel === 'L' ? 'e.g., 100' : 'e.g., 25'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Total Volume Display */}
            {(displayVolume || sumpVolume) && (
              <div className="bg-ocean-50 border border-ocean-200 rounded-md p-3">
                <p className="text-sm text-ocean-900">
                  <span className="font-medium">{t('fields.totalSystem')}:</span>{' '}
                  <span className="text-lg font-semibold">{getTotalVolume().toFixed(1)} {volumeLabel}</span>
                </p>
              </div>
            )}
          </div>

          {/* Refugium Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('fields.refugium')}</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRefugium}
                  onChange={(e) => setHasRefugium(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ocean-300 dark:peer-focus:ring-ocean-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-500 peer-checked:bg-ocean-600" />
              </label>
            </div>

            {hasRefugium && (
              <div className="space-y-4 pl-0 border-l-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Refugium Type */}
                  <div>
                    <label htmlFor="refugiumType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.refugiumType')}
                    </label>
                    <select
                      id="refugiumType"
                      value={refugiumType}
                      onChange={(e) => setRefugiumType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">{t('fields.selectRefugiumType')}</option>
                      <option value="macro_algae">{t('refugiumTypes.macro_algae')}</option>
                      <option value="deep_sand_bed">{t('refugiumTypes.deep_sand_bed')}</option>
                      <option value="live_rock">{t('refugiumTypes.live_rock')}</option>
                      <option value="mud">{t('refugiumTypes.mud')}</option>
                      <option value="mixed">{t('refugiumTypes.mixed')}</option>
                    </select>
                  </div>

                  {/* Refugium Volume */}
                  <div>
                    <label htmlFor="refugiumVolume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.refugiumVolume')} ({volumeLabel})
                    </label>
                    <input
                      type="number"
                      id="refugiumVolume"
                      value={refugiumVolume}
                      onChange={(e) => setRefugiumVolume(e.target.value)}
                      step="0.1"
                      min="0"
                      placeholder={volumeLabel === 'L' ? 'e.g., 50' : 'e.g., 13'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Algae Species */}
                  <div>
                    <label htmlFor="refugiumAlgae" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.refugiumAlgae')}
                    </label>
                    <input
                      type="text"
                      id="refugiumAlgae"
                      value={refugiumAlgae}
                      onChange={(e) => setRefugiumAlgae(e.target.value)}
                      placeholder="e.g., Chaetomorpha, Caulerpa"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  {/* Lighting Hours */}
                  <div>
                    <label htmlFor="refugiumLightingHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fields.refugiumLightingHours')}
                    </label>
                    <input
                      type="number"
                      id="refugiumLightingHours"
                      value={refugiumLightingHours}
                      onChange={(e) => setRefugiumLightingHours(e.target.value)}
                      step="0.5"
                      min="0"
                      max="24"
                      placeholder="e.g., 12"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Refugium Notes */}
                <div>
                  <label htmlFor="refugiumNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('fields.refugiumNotes')}
                  </label>
                  <textarea
                    id="refugiumNotes"
                    value={refugiumNotes}
                    onChange={(e) => setRefugiumNotes(e.target.value)}
                    rows={2}
                    placeholder={t('fields.refugiumNotesPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Setup Date & Electricity Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="setupDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('fields.setupDate')}
              </label>
              <input
                type="date"
                id="setupDate"
                value={setupDate}
                onChange={(e) => setSetupDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('fields.setupDateHint')}
              </p>
            </div>

            <div>
              <label
                htmlFor="electricityCost"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('fields.electricityCost')}
              </label>
              <input
                type="number"
                id="electricityCost"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                step="0.01"
                min="0"
                placeholder="e.g., 1.00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('fields.electricityCostHint')}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tc('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('saving') : tank ? t('updateTank') : t('createTank')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
