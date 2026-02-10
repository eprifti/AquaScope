/**
 * Timeline Utility Functions
 *
 * Pure functions to aggregate tank data from multiple sources
 * into a unified TimelineEntry array for the visual timeline.
 */

import type {
  Tank,
  TankEvent,
  Livestock,
  Equipment,
  Photo,
  ICPTestSummary,
  TimelineEntry,
  TimelineCategory,
} from '../types'

const EVENT_ICONS: Record<string, string> = {
  setup: '🏗️',
  water_change: '💧',
  rescape: '🪨',
  equipment_added: '⚙️',
  equipment_removed: '⚙️',
  livestock_added: '🐟',
  livestock_lost: '💔',
  cleaning: '🧹',
  upgrade: '⬆️',
  issue: '⚠️',
  crash: '💥',
  milestone: '🎉',
  other: '📝',
}

const EVENT_COLORS: Record<string, string> = {
  setup: 'ocean',
  water_change: 'ocean',
  rescape: 'amber',
  equipment_added: 'amber',
  equipment_removed: 'amber',
  livestock_added: 'green',
  livestock_lost: 'rose',
  cleaning: 'ocean',
  upgrade: 'blue',
  issue: 'amber',
  crash: 'rose',
  milestone: 'green',
  other: 'gray',
}

export function getEventIcon(eventType: string | null): string {
  return eventType ? EVENT_ICONS[eventType] || '📅' : '📅'
}

export function getEventColor(eventType: string | null): string {
  return eventType ? EVENT_COLORS[eventType] || 'ocean' : 'ocean'
}

export const CATEGORY_COLORS: Record<TimelineCategory, string> = {
  setup: '#0284c7',     // ocean-600
  event: '#0284c7',     // ocean-600
  livestock: '#16a34a', // green-600
  equipment: '#d97706', // amber-600
  photo: '#9333ea',     // purple-600
  icp_test: '#2563eb',  // blue-600
}

const CATEGORY_COLORS_ROSE = '#e11d48' // rose-600 for livestock losses

export function getCategoryColor(category: TimelineCategory, eventType?: string | null): string {
  if (category === 'livestock' && (eventType === 'livestock_lost' || eventType === 'removed')) {
    return CATEGORY_COLORS_ROSE
  }
  if (category === 'event' && eventType) {
    const c = EVENT_COLORS[eventType]
    const colorMap: Record<string, string> = {
      ocean: '#0284c7',
      amber: '#d97706',
      green: '#16a34a',
      rose: '#e11d48',
      blue: '#2563eb',
      gray: '#6b7280',
    }
    return colorMap[c] || CATEGORY_COLORS.event
  }
  return CATEGORY_COLORS[category]
}

/**
 * Merge all tank data sources into a sorted array of TimelineEntry.
 */
export function buildTimelineEntries(
  tank: Tank,
  events: TankEvent[],
  livestock: Livestock[],
  equipment: Equipment[],
  photos: Photo[],
  icpTests: ICPTestSummary[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  // Tank setup date
  if (tank.setup_date) {
    entries.push({
      id: `setup-${tank.id}`,
      date: tank.setup_date,
      category: 'setup',
      title: 'Tank Setup',
      subtitle: tank.name,
      icon: '🏗️',
      color: 'ocean',
      eventType: 'setup',
      sourceId: tank.id,
      metadata: { water_type: tank.water_type },
    })
  }

  // Manual TankEvent records
  for (const event of events) {
    entries.push({
      id: `event-${event.id}`,
      date: event.event_date,
      category: 'event',
      title: event.title,
      subtitle: event.description,
      icon: getEventIcon(event.event_type),
      color: getEventColor(event.event_type),
      eventType: event.event_type,
      sourceId: event.id,
      metadata: { event_type: event.event_type },
    })
  }

  // Livestock additions and removals
  for (const item of livestock) {
    if (item.added_date) {
      const typeIcon = item.type === 'coral' ? '🪸' : item.type === 'invertebrate' ? '🦐' : '🐟'
      entries.push({
        id: `livestock-add-${item.id}`,
        date: item.added_date,
        category: 'livestock',
        title: `Added ${item.common_name || item.species_name}`,
        subtitle: `${item.quantity}x ${item.type}`,
        icon: typeIcon,
        color: 'green',
        eventType: 'livestock_added',
        sourceId: item.id,
        metadata: { species: item.species_name, quantity: item.quantity, type: item.type },
      })
    }
    if (item.removed_date) {
      entries.push({
        id: `livestock-rm-${item.id}`,
        date: item.removed_date,
        category: 'livestock',
        title: `${item.status === 'dead' ? 'Lost' : 'Removed'} ${item.common_name || item.species_name}`,
        subtitle: `${item.quantity}x ${item.type}`,
        icon: '💔',
        color: 'rose',
        eventType: 'livestock_lost',
        sourceId: item.id,
        metadata: { species: item.species_name, status: item.status },
      })
    }
  }

  // Equipment
  for (const item of equipment) {
    if (item.purchase_date) {
      entries.push({
        id: `equipment-${item.id}`,
        date: item.purchase_date,
        category: 'equipment',
        title: item.name,
        subtitle: [item.manufacturer, item.model].filter(Boolean).join(' ') || item.equipment_type,
        icon: '⚙️',
        color: 'amber',
        eventType: 'equipment_added',
        sourceId: item.id,
        metadata: { equipment_type: item.equipment_type, status: item.status },
      })
    }
  }

  // Photos
  for (const photo of photos) {
    entries.push({
      id: `photo-${photo.id}`,
      date: photo.taken_at.split('T')[0],
      category: 'photo',
      title: 'Photo',
      subtitle: photo.description,
      icon: '📷',
      color: 'purple',
      eventType: null,
      sourceId: photo.id,
      metadata: { description: photo.description },
    })
  }

  // ICP Tests
  for (const test of icpTests) {
    entries.push({
      id: `icp-${test.id}`,
      date: test.test_date,
      category: 'icp_test',
      title: `ICP Test - ${test.lab_name}`,
      subtitle: test.score_overall ? `Score: ${test.score_overall}/100` : null,
      icon: '🔬',
      color: 'blue',
      eventType: null,
      sourceId: test.id,
      metadata: { lab_name: test.lab_name, score_overall: test.score_overall },
    })
  }

  // Sort chronologically (oldest first)
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return entries
}

/**
 * Group timeline entries that fall on the same date.
 * Returns a Map keyed by ISO date string.
 */
export function groupEntriesByDate(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const groups = new Map<string, TimelineEntry[]>()
  for (const entry of entries) {
    const dateKey = entry.date.split('T')[0]
    const group = groups.get(dateKey)
    if (group) {
      group.push(entry)
    } else {
      groups.set(dateKey, [entry])
    }
  }
  return groups
}
