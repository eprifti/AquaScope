/**
 * Feeding Page
 *
 * Manage feeding schedules and feeding log per tank.
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { feedingApi, tanksApi, consumablesApi } from '../api'
import type { FeedingSchedule, FeedingLog, Tank, Consumable } from '../types'
import { useAuth } from '../hooks/useAuth'
import TankSelector from '../components/common/TankSelector'
import FeedingScheduleCard from '../components/feeding/FeedingScheduleCard'
import FeedingScheduleForm from '../components/feeding/FeedingScheduleForm'
import FeedingLogModal from '../components/feeding/FeedingLogModal'

export default function Feeding() {
  const { t } = useTranslation('feeding')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([])
  const [logs, setLogs] = useState<FeedingLog[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [consumables, setConsumables] = useState<Consumable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<FeedingSchedule | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [selectedTank, setSelectedTank] = useState<string>(searchParams.get('tank') || '')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [schedulesData, tanksData, consumablesData] = await Promise.all([
        feedingApi.listSchedules({ active_only: false }),
        tanksApi.list(),
        consumablesApi.list(),
      ])
      setSchedules(schedulesData)
      setTanks(tanksData)
      setConsumables(consumablesData)

      // Load logs for selected tank or all
      const logsData = await feedingApi.listLogs(
        selectedTank ? { tank_id: selectedTank } : undefined
      )
      setLogs(logsData)
    } catch (error) {
      console.error('Failed to load feeding data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSchedule = async (data: any) => {
    await feedingApi.createSchedule(data)
    setShowForm(false)
    loadData()
  }

  const handleUpdateSchedule = async (id: string, data: any) => {
    await feedingApi.updateSchedule(id, data)
    setEditingSchedule(null)
    loadData()
  }

  const handleFeed = async (id: string) => {
    await feedingApi.markFed(id)
    loadData()
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm(t('confirmDelete', { defaultValue: 'Delete this feeding schedule?' }))) return
    try {
      await feedingApi.deleteSchedule(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  const handleCreateLog = async (data: any) => {
    await feedingApi.createLog(data)
    loadData()
  }

  const handleEdit = (schedule: FeedingSchedule) => {
    setEditingSchedule(schedule)
    setShowForm(false)
  }

  // Filter by selected tank
  const filtered = selectedTank
    ? schedules.filter(s => s.tank_id === selectedTank)
    : schedules

  // Categorize schedules
  const now = new Date()
  const activeSchedules = filtered.filter(s => s.is_active)
  const inactiveSchedules = filtered.filter(s => !s.is_active)
  const overdueSchedules = activeSchedules.filter(s => {
    if (!s.next_due) return false
    return new Date(s.next_due) < now
  })

  // Tank name lookup
  const tankNameMap: Record<string, string> = {}
  tanks.forEach(t => { tankNameMap[t.id] = t.name })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('title', { defaultValue: 'Feeding' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle', { defaultValue: 'Manage feeding schedules and track feedings' })}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {t('viewLog', { defaultValue: 'Log' })}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingSchedule(null)
            }}
            className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700"
          >
            {showForm ? tc('actions.cancel') : t('addSchedule', { defaultValue: 'Add Schedule' })}
          </button>
        </div>
      </div>

      {/* Tank Filter */}
      {tanks.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <TankSelector
            tanks={tanks}
            value={selectedTank}
            onChange={(val) => {
              setSelectedTank(val)
              // Reload logs for new tank
              feedingApi.listLogs(val ? { tank_id: val } : undefined).then(setLogs)
            }}
            allLabel={tc('allTanks', { defaultValue: 'All Tanks' })}
            label={t('filterByTank', { defaultValue: 'Filter by tank' })}
            defaultTankId={user?.default_tank_id || undefined}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t('overdue', { defaultValue: 'Overdue' })}
              </p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">{overdueSchedules.length}</p>
            </div>
            <span className="text-3xl">⏰</span>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {t('activeSchedules', { defaultValue: 'Active Schedules' })}
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">{activeSchedules.length}</p>
            </div>
            <span className="text-3xl">🍽️</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {t('recentFeedings', { defaultValue: 'Recent Feedings' })}
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{logs.length}</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </div>
      </div>

      {/* Create Schedule Form */}
      {showForm && (
        <FeedingScheduleForm
          tanks={tanks}
          consumables={consumables}
          onSubmit={handleCreateSchedule}
          onCancel={() => setShowForm(false)}
          defaultTankId={selectedTank || user?.default_tank_id || undefined}
        />
      )}

      {/* Edit Schedule Form */}
      {editingSchedule && (
        <FeedingScheduleForm
          tanks={tanks}
          consumables={consumables}
          schedule={editingSchedule}
          onSubmit={(data) => handleUpdateSchedule(editingSchedule.id, data)}
          onCancel={() => setEditingSchedule(null)}
        />
      )}

      {/* Schedule Cards */}
      {schedules.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('noSchedules', { defaultValue: 'No feeding schedules yet' })}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('noSchedulesDescription', { defaultValue: 'Create a feeding schedule to track what and when you feed your tank inhabitants.' })}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700"
          >
            {t('createFirst', { defaultValue: 'Create First Schedule' })}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Schedules */}
          {activeSchedules.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('activeSchedules', { defaultValue: 'Active Schedules' })} ({activeSchedules.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeSchedules.map((schedule) => (
                  <FeedingScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    tankName={tankNameMap[schedule.tank_id] || ''}
                    onFeed={handleFeed}
                    onEdit={handleEdit}
                    onDelete={handleDeleteSchedule}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Schedules */}
          {inactiveSchedules.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                {t('inactiveSchedules', { defaultValue: 'Inactive' })} ({inactiveSchedules.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inactiveSchedules.map((schedule) => (
                  <FeedingScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    tankName={tankNameMap[schedule.tank_id] || ''}
                    onFeed={handleFeed}
                    onEdit={handleEdit}
                    onDelete={handleDeleteSchedule}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feeding Log Modal */}
      <FeedingLogModal
        logs={logs}
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onCreateLog={handleCreateLog}
        tankId={selectedTank || tanks[0]?.id || ''}
      />
    </div>
  )
}
