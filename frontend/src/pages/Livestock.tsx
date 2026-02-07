/**
 * Livestock Page
 *
 * Track fish, corals, and invertebrates in your reef aquarium
 */

import { useState, useEffect } from 'react'
import { livestockApi, tanksApi } from '../api/client'
import type { Livestock as LivestockType, Tank } from '../types'
import LivestockCard from '../components/livestock/LivestockCard'
import LivestockForm from '../components/livestock/LivestockForm'

export default function Livestock() {
  const [livestock, setLivestock] = useState<LivestockType[]>([])
  const [tanks, setTanks] = useState<Tank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLivestock, setEditingLivestock] = useState<LivestockType | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'fish' | 'coral' | 'invertebrate'>('all')
  const [selectedTank, setSelectedTank] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [filterType, selectedTank])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (filterType !== 'all') params.type = filterType
      if (selectedTank !== 'all') params.tank_id = selectedTank

      const [livestockData, tanksData] = await Promise.all([
        livestockApi.list(params),
        tanksApi.list(),
      ])
      setLivestock(livestockData)
      setTanks(tanksData)
    } catch (error) {
      console.error('Failed to load livestock:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async (data: any) => {
    await livestockApi.create(data)
    setShowForm(false)
    loadData()
  }

  const handleUpdate = async (id: string, data: any) => {
    await livestockApi.update(id, data)
    setEditingLivestock(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this livestock from your tank?')) {
      return
    }
    try {
      await livestockApi.delete(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete livestock:', error)
      alert('Failed to delete livestock')
    }
  }

  const handleEdit = (item: LivestockType) => {
    setEditingLivestock(item)
    setShowForm(false)
  }

  const handleCancelEdit = () => {
    setEditingLivestock(null)
  }

  // Group livestock by type
  const fish = livestock.filter((l) => l.type === 'fish')
  const corals = livestock.filter((l) => l.type === 'coral')
  const invertebrates = livestock.filter((l) => l.type === 'invertebrate')

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
          <h1 className="text-3xl font-bold text-gray-900">Livestock Inventory</h1>
          <p className="text-gray-600 mt-1">
            Track fish, corals, and invertebrates in your reef
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingLivestock(null)
          }}
          className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700"
        >
          {showForm ? 'Cancel' : 'Add Livestock'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({livestock.length})
              </button>
              <button
                onClick={() => setFilterType('fish')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'fish'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🐠 Fish ({fish.length})
              </button>
              <button
                onClick={() => setFilterType('coral')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'coral'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🪸 Corals ({corals.length})
              </button>
              <button
                onClick={() => setFilterType('invertebrate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterType === 'invertebrate'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🦐 Inverts ({invertebrates.length})
              </button>
            </div>
          </div>

          {/* Tank Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Tank
            </label>
            <select
              value={selectedTank}
              onChange={(e) => setSelectedTank(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            >
              <option value="all">All Tanks</option>
              {tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Fish</p>
              <p className="text-2xl font-bold text-blue-900">{fish.length}</p>
            </div>
            <span className="text-4xl">🐠</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Corals</p>
              <p className="text-2xl font-bold text-purple-900">{corals.length}</p>
            </div>
            <span className="text-4xl">🪸</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Invertebrates</p>
              <p className="text-2xl font-bold text-orange-900">{invertebrates.length}</p>
            </div>
            <span className="text-4xl">🦐</span>
          </div>
        </div>
      </div>

      {/* Add Livestock Form */}
      {showForm && (
        <LivestockForm
          tanks={tanks}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Livestock Form */}
      {editingLivestock && (
        <LivestockForm
          tanks={tanks}
          livestock={editingLivestock}
          onSubmit={(data) => handleUpdate(editingLivestock.id, data)}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Livestock Lists */}
      {livestock.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No livestock yet</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your fish, corals, and invertebrates
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-ocean-600 text-white rounded-md hover:bg-ocean-700"
          >
            Add First Livestock
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fish */}
          {fish.length > 0 && (filterType === 'all' || filterType === 'fish') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🐠</span>
                Fish ({fish.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fish.map((item) => (
                  <LivestockCard
                    key={item.id}
                    livestock={item}
                    tanks={tanks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Corals */}
          {corals.length > 0 && (filterType === 'all' || filterType === 'coral') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🪸</span>
                Corals ({corals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {corals.map((item) => (
                  <LivestockCard
                    key={item.id}
                    livestock={item}
                    tanks={tanks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invertebrates */}
          {invertebrates.length > 0 && (filterType === 'all' || filterType === 'invertebrate') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🦐</span>
                Invertebrates ({invertebrates.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invertebrates.map((item) => (
                  <LivestockCard
                    key={item.id}
                    livestock={item}
                    tanks={tanks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
