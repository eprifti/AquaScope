/**
 * Species Traits Manager
 *
 * Admin UI for CRUD operations on the species compatibility database.
 * Used in the Admin page as a dedicated tab.
 */

import { useState, useEffect, useMemo } from 'react'
import { speciesTraitsApi } from '../../api'
import type { SpeciesTrait, SpeciesTraitCreate } from '../../types'

const CATEGORIES = ['fish', 'coral', 'invertebrate'] as const
const WATER_TYPES = ['saltwater', 'freshwater', 'both'] as const
const TEMPERAMENTS = ['peaceful', 'semi-aggressive', 'aggressive'] as const
const REEF_SAFE = ['yes', 'caution', 'no'] as const
const DIETS = ['herbivore', 'carnivore', 'omnivore', 'filter-feeder', 'corallivore'] as const
const SIZE_CLASSES = ['tiny', 'small', 'medium', 'large', 'xlarge'] as const
const MATCH_LEVELS = ['genus', 'family', 'species'] as const

const SIZE_LABELS: Record<string, string> = {
  tiny: '<5 cm',
  small: '5-10 cm',
  medium: '10-20 cm',
  large: '20-35 cm',
  xlarge: '>35 cm',
}

const CATEGORY_COLORS: Record<string, string> = {
  fish: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  coral: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  invertebrate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
}

const TEMPERAMENT_COLORS: Record<string, string> = {
  peaceful: 'text-green-600 dark:text-green-400',
  'semi-aggressive': 'text-amber-600 dark:text-amber-400',
  aggressive: 'text-red-600 dark:text-red-400',
}

const REEF_COLORS: Record<string, string> = {
  yes: 'text-green-600 dark:text-green-400',
  caution: 'text-amber-600 dark:text-amber-400',
  no: 'text-red-600 dark:text-red-400',
}

interface FormState {
  genusOrFamily: string
  matchLevel: string
  commonGroupName: string
  category: string
  waterType: string
  temperament: string
  reefSafe: string
  minTankSizeLiters: number
  diet: string
  sizeClass: string
  territorial: boolean
  maxGroupConflict: boolean
  predatorOf: string
}

const EMPTY_FORM: FormState = {
  genusOrFamily: '',
  matchLevel: 'genus',
  commonGroupName: '',
  category: 'fish',
  waterType: 'saltwater',
  temperament: 'peaceful',
  reefSafe: 'yes',
  minTankSizeLiters: 100,
  diet: 'omnivore',
  sizeClass: 'small',
  territorial: false,
  maxGroupConflict: false,
  predatorOf: '',
}

export default function SpeciesTraitsManager() {
  const [traits, setTraits] = useState<SpeciesTrait[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [waterTypeFilter, setWaterTypeFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadTraits()
  }, [])

  const loadTraits = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await speciesTraitsApi.list()
      setTraits(data)
    } catch (err) {
      console.error('Failed to load species traits:', err)
      setError('Failed to load species data')
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = traits
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        t =>
          t.genusOrFamily.toLowerCase().includes(q) ||
          t.commonGroupName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      )
    }
    if (categoryFilter) {
      result = result.filter(t => t.category === categoryFilter)
    }
    if (waterTypeFilter) {
      result = result.filter(t => t.waterType === waterTypeFilter || t.waterType === 'both')
    }
    return result
  }, [traits, search, categoryFilter, waterTypeFilter])

  const startEdit = (trait: SpeciesTrait) => {
    setEditingId(trait.id)
    setShowAddForm(false)
    setForm({
      genusOrFamily: trait.genusOrFamily,
      matchLevel: trait.matchLevel,
      commonGroupName: trait.commonGroupName,
      category: trait.category,
      waterType: trait.waterType,
      temperament: trait.temperament,
      reefSafe: trait.reefSafe,
      minTankSizeLiters: trait.minTankSizeLiters,
      diet: trait.diet,
      sizeClass: trait.sizeClass,
      territorial: trait.territorial,
      maxGroupConflict: trait.maxGroupConflict,
      predatorOf: trait.predatorOf.join(', '),
    })
  }

  const startAdd = () => {
    setEditingId(null)
    setShowAddForm(true)
    setForm(EMPTY_FORM)
  }

  const cancelForm = () => {
    setEditingId(null)
    setShowAddForm(false)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.genusOrFamily.trim() || !form.commonGroupName.trim()) {
      alert('Genus/Family and Common Name are required')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...form,
        predatorOf: form.predatorOf
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      }

      if (editingId) {
        await speciesTraitsApi.update(editingId, payload)
      } else {
        await speciesTraitsApi.create(payload as SpeciesTraitCreate)
      }
      cancelForm()
      await loadTraits()
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Failed to save species trait'
      alert(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (trait: SpeciesTrait) => {
    if (!confirm(`Are you sure you want to delete "${trait.commonGroupName} (${trait.genusOrFamily})"? This cannot be undone.`)) {
      return
    }
    try {
      await speciesTraitsApi.delete(trait.id)
      await loadTraits()
    } catch (err) {
      console.error('Failed to delete species trait:', err)
      alert('Failed to delete species trait')
    }
  }

  const renderForm = () => (
    <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
        {editingId ? 'Edit Species' : 'Add New Species'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Genus/Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Genus / Family *
          </label>
          <input
            type="text"
            value={form.genusOrFamily}
            onChange={e => setForm({ ...form, genusOrFamily: e.target.value })}
            placeholder="e.g. Amphiprion"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          />
        </div>

        {/* Common Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Common Name *
          </label>
          <input
            type="text"
            value={form.commonGroupName}
            onChange={e => setForm({ ...form, commonGroupName: e.target.value })}
            placeholder="e.g. Clownfish"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          />
        </div>

        {/* Match Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Match Level
          </label>
          <select
            value={form.matchLevel}
            onChange={e => setForm({ ...form, matchLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {MATCH_LEVELS.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {CATEGORIES.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Water Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Water Type
          </label>
          <select
            value={form.waterType}
            onChange={e => setForm({ ...form, waterType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {WATER_TYPES.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Temperament */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Temperament
          </label>
          <select
            value={form.temperament}
            onChange={e => setForm({ ...form, temperament: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {TEMPERAMENTS.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Reef Safe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reef Safe
          </label>
          <select
            value={form.reefSafe}
            onChange={e => setForm({ ...form, reefSafe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {REEF_SAFE.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Min Tank Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Tank Size (L)
          </label>
          <input
            type="number"
            min={1}
            value={form.minTankSizeLiters}
            onChange={e => setForm({ ...form, minTankSizeLiters: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          />
        </div>

        {/* Diet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Diet
          </label>
          <select
            value={form.diet}
            onChange={e => setForm({ ...form, diet: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {DIETS.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Size Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Size Class
          </label>
          <select
            value={form.sizeClass}
            onChange={e => setForm({ ...form, sizeClass: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          >
            {SIZE_CLASSES.map(v => (
              <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)} ({SIZE_LABELS[v]})</option>
            ))}
          </select>
        </div>

        {/* Territorial */}
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.territorial}
              onChange={e => setForm({ ...form, territorial: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-ocean-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Territorial</span>
          </label>
        </div>

        {/* Max Group Conflict */}
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.maxGroupConflict}
              onChange={e => setForm({ ...form, maxGroupConflict: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-ocean-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Group Conflict</span>
          </label>
        </div>

        {/* Predator Of */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Predator Of
          </label>
          <input
            type="text"
            value={form.predatorOf}
            onChange={e => setForm({ ...form, predatorOf: e.target.value })}
            placeholder="Comma-separated (e.g. small_shrimp, snails, small_fish)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prey categories this species hunts (used in predator-prey conflict checks)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-ocean-200 dark:border-ocean-800">
        <button
          onClick={cancelForm}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !form.genusOrFamily.trim() || !form.commonGroupName.trim()}
          className="px-4 py-2 text-sm bg-ocean-600 text-white rounded-md hover:bg-ocean-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading species database...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button onClick={loadTraits} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Species Database</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {traits.length} species in the compatibility database
          </p>
        </div>
        {!showAddForm && !editingId && (
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Species
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && renderForm()}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search species..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={waterTypeFilter}
          onChange={e => setWaterTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        >
          <option value="">All water types</option>
          <option value="saltwater">Saltwater</option>
          <option value="freshwater">Freshwater</option>
        </select>
      </div>

      {/* Species Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Genus / Family</th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Common Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Water</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Temperament</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reef</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tank (L)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(trait => (
                <tr key={trait.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${editingId === trait.id ? 'bg-ocean-50 dark:bg-ocean-900/20' : ''}`}>
                  <td className="px-4 py-3 break-words">
                    <div className="font-medium text-gray-900 dark:text-gray-100 italic break-words">{trait.genusOrFamily}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{trait.matchLevel}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 break-words">{trait.commonGroupName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${CATEGORY_COLORS[trait.category] || ''}`}>
                      {trait.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{trait.waterType}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm capitalize ${TEMPERAMENT_COLORS[trait.temperament] || ''}`}>
                      {trait.temperament}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm capitalize ${REEF_COLORS[trait.reefSafe] || ''}`}>
                      {trait.reefSafe}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{trait.minTankSizeLiters}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span title={SIZE_LABELS[trait.sizeClass]}>{trait.sizeClass}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(trait)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label={`Edit ${trait.commonGroupName}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(trait)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/70"
                        aria-label={`Delete ${trait.commonGroupName}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {search || categoryFilter || waterTypeFilter
                      ? 'No species found matching your filters'
                      : 'No species in the database yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
