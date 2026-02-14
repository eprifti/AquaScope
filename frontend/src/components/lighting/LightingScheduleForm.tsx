/**
 * Lighting Schedule Form Component
 *
 * Form for creating and editing LED lighting schedules with channel definitions,
 * a 24-hour intensity grid, preset loading, and a live chart preview.
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Tank,
  LightingSchedule,
  LightingScheduleCreate,
  LightingScheduleUpdate,
  LightingPreset,
  LightingChannelDef,
} from '../../types'
import TankSelector from '../common/TankSelector'
import LightingChart from './LightingChart'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LightingScheduleFormProps {
  tanks: Tank[]
  schedule?: LightingSchedule | null
  presets?: LightingPreset[]
  onSubmit: (data: LightingScheduleCreate | LightingScheduleUpdate) => void
  onCancel: () => void
  defaultTankId?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HOURS = Array.from({ length: 24 }, (_, i) => i)

/** Build an empty schedule_data object keyed by hour string, all values 0. */
function emptyScheduleData(channelCount: number): Record<string, number[]> {
  const data: Record<string, number[]> = {}
  for (let h = 0; h < 24; h++) {
    data[String(h)] = new Array(channelCount).fill(0)
  }
  return data
}

/** Default channel when creating a brand-new schedule. */
const DEFAULT_CHANNEL: LightingChannelDef = { name: 'White', color: '#ffffff' }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LightingScheduleForm({
  tanks,
  schedule,
  presets = [],
  onSubmit,
  onCancel,
  defaultTankId,
}: LightingScheduleFormProps) {
  const { t } = useTranslation('lighting')
  const { t: tc } = useTranslation('common')

  const isEditing = !!schedule

  // -- Basic fields ----------------------------------------------------------
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tankId, setTankId] = useState('')
  const [notes, setNotes] = useState('')

  // -- Channels & schedule data ----------------------------------------------
  const [channels, setChannels] = useState<LightingChannelDef[]>([{ ...DEFAULT_CHANNEL }])
  const [scheduleData, setScheduleData] = useState<Record<string, number[]>>(
    emptyScheduleData(1),
  )

  // -- UI state --------------------------------------------------------------
  const [selectedPreset, setSelectedPreset] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // -- Pre-populate when editing ---------------------------------------------
  useEffect(() => {
    if (schedule) {
      setName(schedule.name)
      setDescription(schedule.description ?? '')
      setTankId(schedule.tank_id)
      setNotes(schedule.notes ?? '')
      const chs = schedule.channels.length > 0 ? schedule.channels : [{ ...DEFAULT_CHANNEL }]
      setChannels(chs)
      setScheduleData(
        Object.keys(schedule.schedule_data).length > 0
          ? schedule.schedule_data
          : emptyScheduleData(chs.length),
      )
    } else if (defaultTankId) {
      setTankId(defaultTankId)
    }
  }, [schedule, defaultTankId])

  // -- Preset loading --------------------------------------------------------
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    if (!presetId) return

    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return

    setChannels([...preset.channels])
    // Deep-copy the schedule data arrays so mutations are safe.
    const copied: Record<string, number[]> = {}
    for (const [key, arr] of Object.entries(preset.schedule_data)) {
      copied[key] = [...arr]
    }
    setScheduleData(copied)
  }

  // -- Channel management ----------------------------------------------------
  const addChannel = () => {
    const newCh: LightingChannelDef = {
      name: `Channel ${channels.length + 1}`,
      color: '#0088ff',
    }
    setChannels((prev) => [...prev, newCh])
    // Append a 0 to each hour's array
    setScheduleData((prev) => {
      const next: Record<string, number[]> = {}
      for (const [hour, arr] of Object.entries(prev)) {
        next[hour] = [...arr, 0]
      }
      return next
    })
  }

  const removeChannel = (index: number) => {
    if (channels.length <= 1) return
    setChannels((prev) => prev.filter((_, i) => i !== index))
    // Remove the channel index from each hour's array
    setScheduleData((prev) => {
      const next: Record<string, number[]> = {}
      for (const [hour, arr] of Object.entries(prev)) {
        next[hour] = arr.filter((_, i) => i !== index)
      }
      return next
    })
  }

  const updateChannelName = (index: number, newName: string) => {
    setChannels((prev) => prev.map((ch, i) => (i === index ? { ...ch, name: newName } : ch)))
    // No schedule data changes needed — channel names aren't keys in hour-keyed format
  }

  const updateChannelColor = (index: number, color: string) => {
    const updated = channels.map((ch, i) => (i === index ? { ...ch, color } : ch))
    setChannels(updated)
  }

  // -- Schedule grid ---------------------------------------------------------
  const updateIntensity = (hour: number, chIdx: number, value: number) => {
    const clamped = Math.max(0, Math.min(100, value))
    setScheduleData((prev) => {
      const hourKey = String(hour)
      const arr = prev[hourKey] ? [...prev[hourKey]] : new Array(channels.length).fill(0)
      arr[chIdx] = clamped
      return { ...prev, [hourKey]: arr }
    })
  }

  // -- Derived chart data for LightingChart preview --------------------------
  const chartData = useMemo(() => ({ channels, schedule_data: scheduleData }), [channels, scheduleData])

  // -- Form submission -------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEditing) {
        const data: LightingScheduleUpdate = {
          name,
          description: description || null,
          channels,
          schedule_data: scheduleData,
          notes: notes || null,
        }
        await onSubmit(data)
      } else {
        const data: LightingScheduleCreate = {
          tank_id: tankId,
          name,
          description: description || null,
          channels,
          schedule_data: scheduleData,
          notes: notes || null,
        }
        await onSubmit(data)
      }
    } catch (error) {
      console.error('Error submitting lighting schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {isEditing ? t('editSchedule') : t('createSchedule')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ------------------------------------------------------------ */}
          {/* Name */}
          {/* ------------------------------------------------------------ */}
          <div>
            <label
              htmlFor="scheduleName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('fields.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="scheduleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Reef Daily Schedule"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Description */}
          {/* ------------------------------------------------------------ */}
          <div>
            <label
              htmlFor="scheduleDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('fields.description')}
            </label>
            <textarea
              id="scheduleDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g., Optimized for SPS coral growth with gentle sunrise/sunset ramps"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Tank Selector */}
          {/* ------------------------------------------------------------ */}
          <TankSelector
            tanks={tanks}
            value={tankId}
            onChange={setTankId}
            allLabel={tc('common.noData')}
            label={`${t('fields.tank')} *`}
            showAllOption={false}
            defaultTankId={defaultTankId}
          />

          {/* ------------------------------------------------------------ */}
          {/* Notes */}
          {/* ------------------------------------------------------------ */}
          <div>
            <label
              htmlFor="scheduleNotes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('fields.notes')}
            </label>
            <textarea
              id="scheduleNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Acclimation period — gradually increase over 2 weeks"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Load from Preset */}
          {/* ------------------------------------------------------------ */}
          {presets.length > 0 && (
            <div>
              <label
                htmlFor="presetSelect"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('presets.loadPreset')}
              </label>
              <select
                id="presetSelect"
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('presets.selectPreset')}</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(`presets.${p.id}`, p.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* LED Channels */}
          {/* ------------------------------------------------------------ */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              {t('fields.channels')}
            </h3>

            <div className="space-y-3">
              {channels.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600"
                >
                  {/* Channel name */}
                  <div className="flex-1">
                    <label className="sr-only">{t('fields.channelName')}</label>
                    <input
                      type="text"
                      value={ch.name}
                      onChange={(e) => updateChannelName(idx, e.target.value)}
                      placeholder={t('fields.channelName')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 text-sm"
                    />
                  </div>

                  {/* Color picker */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.channelColor')}
                    </label>
                    <input
                      type="color"
                      value={ch.color}
                      onChange={(e) => updateChannelColor(idx, e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5"
                    />
                  </div>

                  {/* Remove button */}
                  {channels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChannel(idx)}
                      className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 transition-colors"
                    >
                      {t('fields.removeChannel')}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addChannel}
              className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-ocean-700 dark:text-ocean-300 bg-ocean-50 dark:bg-ocean-900/30 border border-ocean-200 dark:border-ocean-800 rounded-md hover:bg-ocean-100 dark:hover:bg-ocean-900/50 transition-colors"
            >
              + {t('fields.addChannel')}
            </button>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Schedule Grid */}
          {/* ------------------------------------------------------------ */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              {t('fields.schedule')}
            </h3>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded-md">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                      {t('fields.hour')}
                    </th>
                    {channels.map((ch, idx) => (
                      <th
                        key={idx}
                        className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                        style={{ color: ch.color !== '#ffffff' && ch.color !== '#FFFFFF' ? ch.color : undefined }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500 flex-shrink-0"
                            style={{ backgroundColor: ch.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                            {ch.name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour) => (
                    <tr
                      key={hour}
                      className={
                        hour % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-750 dark:bg-gray-800/50'
                      }
                    >
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400 font-mono text-xs border-r border-gray-200 dark:border-gray-600 whitespace-nowrap">
                        {String(hour).padStart(2, '0')}:00
                      </td>
                      {channels.map((_ch, chIdx) => {
                        const value = scheduleData[String(hour)]?.[chIdx] ?? 0
                        return (
                          <td
                            key={chIdx}
                            className="px-1 py-1 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-600"
                          >
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={value}
                              onChange={(e) =>
                                updateIntensity(hour, chIdx, parseInt(e.target.value) || 0)
                              }
                              className="w-16 px-1.5 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-ocean-500 focus:border-ocean-500"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('chart.yAxis')} (0-100)
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Chart Preview */}
          {/* ------------------------------------------------------------ */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              {t('chart.title')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 p-4">
              <LightingChart channels={chartData.channels} scheduleData={chartData.schedule_data} />
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Form Actions */}
          {/* ------------------------------------------------------------ */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              disabled={isSubmitting || !name || !tankId}
              className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? tc('common.loading')
                : t('actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
