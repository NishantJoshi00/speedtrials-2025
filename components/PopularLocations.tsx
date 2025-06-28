'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Globe, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { getPopularLocations } from '@/lib/supabase';
// import type { PopularLocation } from '@/types/water-system';

interface PopularLocationsProps {
  onLocationSelect: (location: string, type: 'city' | 'county') => void;
  className?: string;
  maxItems?: number;
  showCities?: boolean;
  showCounties?: boolean;
}

interface LocationData {
  name: string;
  count: number;
  type: 'city' | 'county';
}

export default function PopularLocations({
  onLocationSelect,
  className = "",
  maxItems = 8,
  showCities = true,
  showCounties = true
}: PopularLocationsProps) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cities' | 'counties'>(
    showCities ? 'cities' : 'counties'
  );

  // Load popular locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { cities, counties } = await getPopularLocations(maxItems);
        
        const allLocations: LocationData[] = [
          ...(showCities ? cities.map(city => ({ ...city, type: 'city' as const })) : []),
          ...(showCounties ? counties.map(county => ({ ...county, type: 'county' as const })) : [])
        ];
        
        setLocations(allLocations);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load popular locations';
        setError(errorMessage);
        console.error('Error loading popular locations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, [maxItems, showCities, showCounties]);

  const handleLocationClick = (location: LocationData) => {
    onLocationSelect(location.name, location.type);
  };

  const handleKeyDown = (e: React.KeyboardEvent, location: LocationData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLocationClick(location);
    }
  };

  const getIcon = (type: 'city' | 'county') => {
    return type === 'city' ? 
      <MapPin className="w-4 h-4" aria-hidden="true" /> : 
      <Globe className="w-4 h-4" aria-hidden="true" />;
  };

  const getDisplayName = (name: string, type: 'city' | 'county') => {
    return type === 'county' && !name.toLowerCase().includes('county') 
      ? `${name} County` 
      : name;
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Popular Locations</h2>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Popular Locations</h2>
        </div>
        
        <div className="text-center py-4">
          <p className="text-danger-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary mt-2 text-xs"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const cities = locations.filter(loc => loc.type === 'city').slice(0, maxItems);
  const counties = locations.filter(loc => loc.type === 'county').slice(0, maxItems);
  
  const shouldShowTabs = showCities && showCounties && (cities.length > 0 && counties.length > 0);
  const displayLocations = shouldShowTabs 
    ? (activeTab === 'cities' ? cities : counties)
    : locations.slice(0, maxItems);

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-gray-900">Popular Locations</h2>
      </div>

      {shouldShowTabs && (
        <div className="flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'cities'}
            aria-controls="cities-panel"
            onClick={() => setActiveTab('cities')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'cities'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cities ({cities.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'counties'}
            aria-controls="counties-panel"
            onClick={() => setActiveTab('counties')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'counties'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Counties ({counties.length})
          </button>
        </div>
      )}

      <div
        id={shouldShowTabs ? `${activeTab}-panel` : 'locations-panel'}
        role={shouldShowTabs ? 'tabpanel' : undefined}
        className="space-y-2"
      >
        {displayLocations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No locations found</p>
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {displayLocations.map((location, index) => (
              <li key={`${location.type}-${location.name}`}>
                <button
                  onClick={() => handleLocationClick(location)}
                  onKeyDown={(e) => handleKeyDown(e, location)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors group"
                  aria-label={`Search for water systems in ${getDisplayName(location.name, location.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="text-gray-400 group-hover:text-primary-600 transition-colors">
                        {getIcon(location.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getDisplayName(location.name, location.type)}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Users className="w-3 h-3 text-gray-400" aria-hidden="true" />
                          <p className="text-xs text-gray-500">
                            {location.count} water system{location.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-primary-600 transition-colors">
                      #{index + 1}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Screen reader announcement for location selection */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Select a location to search for water systems in that area.
      </div>
    </div>
  );
}