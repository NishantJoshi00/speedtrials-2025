// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Filter, Info, AlertTriangle, CheckCircle, X, Layers } from 'lucide-react'
import { SystemStatusBadge } from '@/components'
import { getWaterSystemsForMap, getCountyStats } from '@/lib/supabase'
import type { WaterSystem, RiskLevel } from '@/types/water-system'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 md:h-[600px] bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})

interface MapData {
  systems: WaterSystem[]
  countyStats: Record<string, any>
}

interface FilterState {
  riskLevels: RiskLevel[]
  showViolationsOnly: boolean
  minPopulation: number
  systemTypes: string[]
}

const defaultFilters: FilterState = {
  riskLevels: ['no_violations', 'low_risk', 'medium_risk', 'high_risk'],
  showViolationsOnly: false,
  minPopulation: 0,
  systemTypes: []
}

export default function MapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(null)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadMapData()
  }, [])

  const loadMapData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Map page: Starting to load data...')
      
      const [systems, countyStats] = await Promise.all([
        getWaterSystemsForMap(),
        getCountyStats()
      ])

      console.log('Map page: Loaded systems:', systems.length)
      console.log('Map page: Sample system:', systems[0])
      console.log('Map page: All systems:', systems.slice(0, 3))

      setMapData({
        systems,
        countyStats
      })

    } catch (err) {
      console.error('Failed to load map data:', err)
      console.error('Error details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (systems: WaterSystem[]): WaterSystem[] => {
    return systems.filter(system => {
      // Risk level filter
      if (!filters.riskLevels.includes(system.risk_level)) return false
      
      // Violations only filter
      if (filters.showViolationsOnly && system.current_violations === 0) return false
      
      // Minimum population filter
      if ((system.population_served_count || 0) < filters.minPopulation) return false
      
      // System type filter
      if (filters.systemTypes.length > 0 && !filters.systemTypes.includes(system.pws_type_code || '')) return false
      
      return true
    })
  }

  const filteredSystems = mapData ? applyFilters(mapData.systems) : []

  // Debug log for filtered systems
  console.log('Map page: Filtered systems count:', filteredSystems.length)
  console.log('Map page: Filter state:', filters)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Georgia water systems map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Error Loading Map</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadMapData}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Georgia Water Systems Map</h1>
            <p className="text-gray-600 mt-2">
              Interactive map showing water quality data across Georgia counties
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              title="Toggle filters"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Map Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Risk Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Levels
              </label>
              <div className="space-y-2">
                {(['no_violations', 'low_risk', 'medium_risk', 'high_risk'] as RiskLevel[]).map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.riskLevels.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            riskLevels: [...prev.riskLevels, level]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            riskLevels: prev.riskLevels.filter(l => l !== level)
                          }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {level.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Violations Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Only
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showViolationsOnly}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    showViolationsOnly: e.target.checked
                  }))}
                  className="h-4 w-4 text-red-600 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Systems with violations
                </span>
              </label>
            </div>

            {/* Minimum Population */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Population
              </label>
              <select
                value={filters.minPopulation}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minPopulation: parseInt(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 text-sm"
              >
                <option value={0}>Any size</option>
                <option value={100}>100+</option>
                <option value={1000}>1,000+</option>
                <option value={10000}>10,000+</option>
                <option value={50000}>50,000+</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters(defaultFilters)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Map Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Showing {filteredSystems.length} water systems
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>No Violations</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>High Risk</span>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <MapComponent 
          systems={filteredSystems}
          onSystemSelect={setSelectedSystem}
        />
      </div>

      {/* System Details Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedSystem.pws_name}</h2>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <SystemStatusBadge 
                    riskLevel={selectedSystem.risk_level}
                    currentViolations={selectedSystem.current_violations}
                    healthViolations={selectedSystem.health_violations}
                    size="lg"
                    showCount={true}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <p className="text-sm text-gray-900">{selectedSystem.primary_county} County</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">People Served:</span>
                    <p className="text-sm text-gray-900">{selectedSystem.population_served_count?.toLocaleString() || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Current Violations:</span>
                    <p className="text-sm text-gray-900">{selectedSystem.current_violations}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total Violations:</span>
                    <p className="text-sm text-gray-900">{selectedSystem.total_violations}</p>
                  </div>
                </div>
                
                {selectedSystem.current_violations > 0 && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h3 className="font-medium text-orange-800 mb-2">Current Issues:</h3>
                    <p className="text-sm text-orange-700">
                      This {selectedSystem.pwsid.startsWith('county-') ? 'county has' : 'system has'} {selectedSystem.current_violations} current violation{selectedSystem.current_violations > 1 ? 's' : ''}. 
                      Contact the system operator or Georgia Environmental Protection Division for more details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Layers className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Systems Displayed</p>
              <p className="text-lg font-semibold">{filteredSystems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">No Violations</p>
              <p className="text-lg font-semibold">
                {filteredSystems.filter(s => s.risk_level === 'no_violations').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">With Issues</p>
              <p className="text-lg font-semibold">
                {filteredSystems.filter(s => s.current_violations > 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Population</p>
              <p className="text-lg font-semibold">
                {(filteredSystems.reduce((sum, s) => sum + (s.population_served_count || 0), 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}