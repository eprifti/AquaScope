/**
 * Local Feeding API (stub)
 *
 * TODO: Full SQLite implementation for native app.
 * For now, returns empty data so the app builds in local mode.
 */

import type {
  FeedingSchedule,
  FeedingScheduleCreate,
  FeedingScheduleUpdate,
  FeedingLog,
  FeedingLogCreate,
  FeedingOverview,
} from '../../types'

export const feedingApi = {
  listSchedules: async (_params?: { tank_id?: string; active_only?: boolean }): Promise<FeedingSchedule[]> => [],
  getSchedule: async (_id: string): Promise<FeedingSchedule> => { throw new Error('Not implemented in local mode') },
  createSchedule: async (data: FeedingScheduleCreate): Promise<FeedingSchedule> => ({
    id: crypto.randomUUID(),
    tank_id: data.tank_id,
    user_id: '',
    consumable_id: data.consumable_id ?? null,
    food_name: data.food_name,
    quantity: data.quantity ?? null,
    quantity_unit: data.quantity_unit ?? null,
    frequency_hours: data.frequency_hours ?? 24,
    last_fed: null,
    next_due: data.next_due ?? null,
    is_active: true,
    notes: data.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  updateSchedule: async (_id: string, _data: FeedingScheduleUpdate): Promise<FeedingSchedule> => { throw new Error('Not implemented in local mode') },
  deleteSchedule: async (_id: string): Promise<void> => {},
  markFed: async (_id: string): Promise<FeedingLog> => { throw new Error('Not implemented in local mode') },
  listLogs: async (_params?: { tank_id?: string; limit?: number }): Promise<FeedingLog[]> => [],
  createLog: async (data: FeedingLogCreate): Promise<FeedingLog> => ({
    id: crypto.randomUUID(),
    tank_id: data.tank_id,
    user_id: '',
    schedule_id: data.schedule_id ?? null,
    food_name: data.food_name,
    quantity: data.quantity ?? null,
    quantity_unit: data.quantity_unit ?? null,
    fed_at: data.fed_at ?? new Date().toISOString(),
    notes: data.notes ?? null,
    created_at: new Date().toISOString(),
  }),
  getOverview: async (tankId: string): Promise<FeedingOverview> => ({
    tank_id: tankId,
    active_schedules: 0,
    last_fed: null,
    next_due: null,
    overdue_count: 0,
    recent_logs: [],
  }),
}
