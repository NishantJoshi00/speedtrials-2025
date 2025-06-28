'use client'

import dynamic from 'next/dynamic'

const SimpleMap = dynamic(() => import('./SimpleMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Georgia Water Systems Map</h1>
        <p className="text-gray-600 mt-2">
          Interactive map showing water quality data across Georgia counties
        </p>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Showing Georgia water systems by county with risk-based color coding
          </div>
        </div>
        
        <SimpleMap />
      </div>

      {/* Map Legend */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>No Violations</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>High Risk</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Circle size represents population served. Click markers for detailed county information.
        </p>
      </div>
    </div>
  )
}