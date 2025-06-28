'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Info, AlertTriangle, CheckCircle, X, Locate, Filter } from 'lucide-react'
import { SystemStatusBadge } from '@/components'
import { searchWaterSystems, searchWaterSystemsByType, getQuickStats, getPopularLocations, getSystemTypes, getSystemsByViolationStatus } from '@/lib/supabase'
import type { SearchResult, QuickStats as QuickStatsType, PopularLocation, SystemTypeCount, RiskLevel } from '@/types/water-system'

// Mock data for development - replace with real API calls
const mockStats: QuickStatsType = {
  totalSystems: 1247,
  systemsWithViolations: 68,
  cleanSystems: 1179,
  lastUpdated: 'Today'
}

const mockPopularLocations: PopularLocation[] = [
  { name: 'Atlanta', type: 'city', count: 15 },
  { name: 'Savannah', type: 'city', count: 8 },
  { name: 'Augusta', type: 'city', count: 12 },
  { name: 'Columbus', type: 'city', count: 6 },
  { name: 'Athens', type: 'city', count: 4 },
]

const mockPopularCounties: PopularLocation[] = [
  { name: 'Fulton', type: 'county', count: 25 },
  { name: 'Gwinnett', type: 'county', count: 18 },
  { name: 'Cobb', type: 'county', count: 15 },
  { name: 'DeKalb', type: 'county', count: 20 },
  { name: 'Forsyth', type: 'county', count: 8 },
]

const mockSystemTypes: SystemTypeCount[] = [
  { type: 'Community Systems', code: 'CWS', count: 892 },
  { type: 'School/Workplace Systems', code: 'NTNCWS', count: 245 },
  { type: 'Transient Systems', code: 'TNCWS', count: 110 },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState<QuickStatsType>(mockStats)
  const [popularCities, setPopularCities] = useState<PopularLocation[]>(mockPopularLocations)
  const [popularCounties, setPopularCounties] = useState<PopularLocation[]>(mockPopularCounties)
  const [systemTypes, setSystemTypes] = useState<SystemTypeCount[]>(mockSystemTypes)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterViolationsOnly, setFilterViolationsOnly] = useState(false)
  const [statsFilter, setStatsFilter] = useState<'all' | 'clean' | 'violations'>('all')

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load real data if Supabase is available
        const [statsData, locationsData, typesData] = await Promise.all([
          getQuickStats().catch(() => mockStats),
          getPopularLocations().catch(() => ({ cities: mockPopularLocations, counties: mockPopularCounties })),
          getSystemTypes().catch(() => mockSystemTypes)
        ])

        setStats(statsData)
        setPopularCities(locationsData.cities)
        setPopularCounties(locationsData.counties)
        setSystemTypes(typesData)
      } catch (error) {
        console.warn('Using mock data due to error:', error)
      }
    }

    loadInitialData()
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchWaterSystems(query)
      setSearchResults(applyFilters(results))
    } catch (error) {
      console.error('Search failed:', error)
      // Fallback to mock data for demo - comprehensive sample
      const mockResults: SearchResult[] = [
        {
          pwsid: 'GA1030063',
          pws_name: 'SAVANNAH BAPTIST ASSEMBLY',
          primary_city: 'SAVANNAH',
          primary_county: 'CHATHAM',
          population_served_count: 0,
          risk_level: 'low_risk',
          current_violations: 1,
        },
        {
          pwsid: 'GA0290100',
          pws_name: 'SAVANNAH - GENESIS POINT',
          primary_city: 'SAVANNAH',
          primary_county: 'CHATHAM',
          population_served_count: 0,
          risk_level: 'no_violations',
          current_violations: 0,
        },
        {
          pwsid: 'GA0290101',
          pws_name: 'SAVANNAH-MAIN',
          primary_city: 'SAVANNAH',
          primary_county: 'CHATHAM',
          population_served_count: 168958,
          risk_level: 'low_risk',
          current_violations: 2,
        },
        {
          pwsid: 'GA0290102',
          pws_name: 'SAVANNAH-GEORGETOWN/GATEWAY',
          primary_city: 'SAVANNAH',
          primary_county: 'CHATHAM',
          population_served_count: 14589,
          risk_level: 'low_risk',
          current_violations: 1,
        },
        {
          pwsid: 'GA0010000',
          pws_name: 'Baxley Water System',
          primary_city: 'Baxley',
          primary_county: 'Appling',
          population_served_count: 5749,
          risk_level: 'no_violations',
          current_violations: 0,
        },
        {
          pwsid: 'GA0010001',
          pws_name: 'Surrency Water System',
          primary_city: 'Surrency',
          primary_county: 'Appling',
          population_served_count: 468,
          risk_level: 'low_risk',
          current_violations: 1,
        }
      ]
      const filteredMockResults = mockResults.filter(s => 
        s.pws_name.toLowerCase().includes(query.toLowerCase()) ||
        s.primary_city?.toLowerCase().includes(query.toLowerCase()) ||
        s.primary_county?.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(applyFilters(filteredMockResults))
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationClick = (locationName: string) => {
    setSearchQuery(locationName)
    handleSearch(locationName)
  }

  const handleSystemTypeClick = async (systemTypeCode: string) => {
    setSearchQuery(`${systemTypeCode} systems`)
    setIsSearching(true)
    try {
      // Search for systems by type code
      const results = await searchWaterSystemsByType(systemTypeCode)
      setSearchResults(applyFilters(results))
    } catch (error) {
      console.error('System type search failed:', error)
      // Fallback to mock data filtered by type
      const mockResults: SearchResult[] = [
        {
          pwsid: 'GA0010000',
          pws_name: 'Baxley Water System',
          primary_city: 'Baxley',
          primary_county: 'Appling',
          population_served_count: 5749,
          risk_level: 'no_violations',
          current_violations: 0,
        },
        {
          pwsid: 'GA0010001',
          pws_name: 'Surrency Water System',
          primary_city: 'Surrency',
          primary_county: 'Appling',
          population_served_count: 468,
          risk_level: 'low_risk',
          current_violations: 1,
        }
      ]
      setSearchResults(applyFilters(mockResults))
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setLocationError(null)
    setFilterViolationsOnly(false)
  }

  const applyFilters = (results: SearchResult[]) => {
    if (filterViolationsOnly) {
      return results.filter(system => system.current_violations > 0)
    }
    return results
  }

  const handleLocationSearch = async () => {
    if (!navigator.geolocation) {
      setLocationError('Location services not supported by your browser')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use reverse geocoding to get city/county from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const locationData = await response.json()
          
          const city = locationData.city || locationData.locality
          const county = locationData.principalSubdivision?.replace(' County', '')
          
          if (city) {
            setSearchQuery(city)
            handleSearch(city)
          } else if (county) {
            setSearchQuery(county)
            handleSearch(county)
          } else {
            setLocationError('Could not determine your location. Please search manually.')
          }
        } catch (error) {
          console.error('Geocoding failed:', error)
          setLocationError('Unable to determine your location. Please try searching manually.')
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services and try again.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An unknown error occurred while getting your location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const handleStatsCardClick = async (type: 'clean' | 'violations') => {
    console.log('Stats card clicked:', type)
    setIsSearching(true)
    setStatsFilter(type)
    setSearchQuery('') // Clear search query when filtering by stats
    
    try {
      console.log('Loading systems with violations:', type === 'violations')
      const results = await getSystemsByViolationStatus(type === 'violations')
      console.log('Results loaded:', results.length, 'systems')
      setSearchResults(results)
    } catch (error) {
      console.error('Failed to load systems by violation status:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearStatsFilter = () => {
    setStatsFilter('all')
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 ">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Georgia Water Quality
        </h2>
        <p className="text-sm text-gray-600 max-w-xl mx-auto">
          Search by city, county, or system ID to check your drinking water safety
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => handleStatsCardClick('clean')}
          className={`bg-brand-cream-50 rounded-md shadow-sm p-6 border border-brand-cream-300 hover:shadow-md transition-all text-left ${
            statsFilter === 'clean' ? 'ring-2 ring-green-500 border-green-500' : ''
          }`}
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.cleanSystems.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Systems with No Violations</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => handleStatsCardClick('violations')}
          className={`bg-brand-cream-50 rounded-md shadow-sm p-6 border border-brand-cream-300 hover:shadow-md transition-all text-left ${
            statsFilter === 'violations' ? 'ring-2 ring-orange-500 border-orange-500' : ''
          }`}
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.systemsWithViolations.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Systems with Current Issues</p>
            </div>
          </div>
        </button>
        
        <div className="bg-brand-cream-50 rounded-md shadow-sm p-6 border border-brand-cream-300">
          <div className="flex items-center">
            <Info className="h-8 w-8 text-primary-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.totalSystems.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Systems Monitored</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Display */}
      {statsFilter !== 'all' && (
        <div className="mb-6 flex items-center justify-between bg-brand-cream-100 border border-brand-cream-300 rounded-md p-4">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-800">
              Showing systems {statsFilter === 'clean' ? 'with no violations' : 'with current violations'}
            </span>
          </div>
          <button
            onClick={clearStatsFilter}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-md shadow-sm p-6 mb-8 border border-brand-cream-300">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Enter city, county, or system ID (e.g., GA0070000)..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-sm leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-brand-navy-500 focus:border-brand-navy-500 text-base touch-target"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
                setLocationError(null)
              }}
              aria-label="Search for water systems by city or county"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-safe-500 rounded-xl"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={handleLocationSearch}
            disabled={isLocating}
            className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-sm text-gray-600 hover:text-gray-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-safe-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Use my location to find water systems"
            title="Use my location"
          >
            <Locate className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-4 py-3 border border-gray-200 rounded-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-safe-500 transition-colors ${showFilters ? 'bg-gray-50 text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
            aria-label="Toggle search filters"
            title="Filters"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-sm border border-brand-cream-300">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Results</h4>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filterViolationsOnly}
                onChange={(e) => {
                  setFilterViolationsOnly(e.target.checked)
                  // Re-apply current search with new filter
                  if (searchQuery) {
                    handleSearch(searchQuery)
                  }
                }}
                className="h-4 w-4 text-warning-600 focus:ring-warning-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                🚨 Show only systems with current violations
              </span>
            </label>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-700">{locationError}</p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-safe-500 mr-2"></div>
              <span className="text-sm text-gray-600">Searching...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !isSearching && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold mb-3 text-gray-900">
              {statsFilter === 'clean' ? 'Systems with No Violations:' :
               statsFilter === 'violations' ? 'Systems with Current Violations:' :
               'Water Systems Found:'}
            </h3>
            <div className="space-y-3">
              {searchResults.map((system) => (
                <button 
                  key={system.pwsid} 
                  className="w-full border border-brand-cream-300 rounded-sm p-4 hover:bg-white cursor-pointer transition-colors text-left bg-white"
                  onClick={() => {
                    router.push(`/system/${system.pwsid}`)
                  }}
                  aria-label={`View details for ${system.pws_name} water system`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{system.pws_name}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="inline h-4 w-4 mr-1" aria-hidden="true" />
                        {system.primary_city}, {system.primary_county} County
                      </p>
                      <p className="text-sm text-gray-600">
                        Serves {system.population_served_count?.toLocaleString() || 'Unknown'} people
                      </p>
                    </div>
                    <div className="text-right">
                      <SystemStatusBadge 
                        riskLevel={system.risk_level as RiskLevel}
                        currentViolations={system.current_violations}
                        healthViolations={0} // This would come from the API
                        size="md"
                        showCount={true}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="mt-4 text-center text-gray-500">
            <p>No water systems found for "{searchQuery}"</p>
            <p className="text-sm mt-1">Try searching by city, county name, or system ID (e.g., GA0070000)</p>
          </div>
        )}
      </div>



      {/* Last Updated */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Data last updated: {stats.lastUpdated} | 
          Source: Georgia Environmental Protection Division
        </p>
      </div>

    </div>
  )
}
