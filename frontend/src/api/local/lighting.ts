/**
 * Local Lighting Schedules API
 */

import type {
  LightingSchedule, LightingScheduleCreate, LightingScheduleUpdate, LightingPreset,
} from '../../types'
import { db, generateId, now, getLocalUserId } from './helpers'

function rowToSchedule(row: any): LightingSchedule {
  return {
    id: row.id,
    tank_id: row.tank_id,
    user_id: row.user_id,
    name: row.name,
    description: row.description || null,
    channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels,
    schedule_data: typeof row.schedule_data === 'string' ? JSON.parse(row.schedule_data) : row.schedule_data,
    is_active: !!row.is_active,
    notes: row.notes || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export const lightingApi = {
  list: async (params?: { tank_id?: string }): Promise<LightingSchedule[]> => {
    const userId = getLocalUserId()
    const conditions = ['user_id = ?']
    const values: any[] = [userId]

    if (params?.tank_id) {
      conditions.push('tank_id = ?')
      values.push(params.tank_id)
    }

    const rows = await db.query(
      `SELECT * FROM lighting_schedules WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      values
    )
    return rows.map(rowToSchedule)
  },

  get: async (id: string): Promise<LightingSchedule> => {
    const row = await db.queryOne('SELECT * FROM lighting_schedules WHERE id = ?', [id])
    if (!row) throw new Error('Lighting schedule not found')
    return rowToSchedule(row)
  },

  create: async (data: LightingScheduleCreate): Promise<LightingSchedule> => {
    const id = generateId()
    const userId = getLocalUserId()
    const timestamp = now()

    await db.execute(
      `INSERT INTO lighting_schedules (id, tank_id, user_id, name, description, channels,
       schedule_data, is_active, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.tank_id, userId, data.name, data.description ?? null,
       JSON.stringify(data.channels), JSON.stringify(data.schedule_data),
       0, data.notes ?? null, timestamp, timestamp]
    )

    const row = await db.queryOne('SELECT * FROM lighting_schedules WHERE id = ?', [id])
    return rowToSchedule(row)
  },

  update: async (id: string, data: LightingScheduleUpdate): Promise<LightingSchedule> => {
    const sets: string[] = []
    const values: any[] = []

    if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
    if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description) }
    if (data.channels !== undefined) { sets.push('channels = ?'); values.push(JSON.stringify(data.channels)) }
    if (data.schedule_data !== undefined) { sets.push('schedule_data = ?'); values.push(JSON.stringify(data.schedule_data)) }
    if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes) }

    sets.push('updated_at = ?')
    values.push(now())
    values.push(id)

    await db.execute(`UPDATE lighting_schedules SET ${sets.join(', ')} WHERE id = ?`, values)

    const row = await db.queryOne('SELECT * FROM lighting_schedules WHERE id = ?', [id])
    return rowToSchedule(row)
  },

  delete: async (id: string): Promise<void> => {
    await db.execute('DELETE FROM lighting_schedules WHERE id = ?', [id])
  },

  activate: async (id: string): Promise<LightingSchedule> => {
    const row = await db.queryOne('SELECT * FROM lighting_schedules WHERE id = ?', [id])
    if (!row) throw new Error('Lighting schedule not found')

    // Deactivate all others for the same tank
    await db.execute(
      'UPDATE lighting_schedules SET is_active = 0 WHERE tank_id = ? AND id != ?',
      [row.tank_id, id]
    )
    // Activate this one
    await db.execute('UPDATE lighting_schedules SET is_active = 1, updated_at = ? WHERE id = ?', [now(), id])

    const updated = await db.queryOne('SELECT * FROM lighting_schedules WHERE id = ?', [id])
    return rowToSchedule(updated)
  },

  getPresets: async (): Promise<LightingPreset[]> => {
    // In local mode, presets are bundled. Return empty for now — presets live on backend.
    return []
  },
}
