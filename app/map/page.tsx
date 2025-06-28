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
            Test map with sample locations
          </div>
        </div>
        
        <SimpleMap />
      </div>

      {/* Test Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">Test Map</h3>
        <p className="text-sm text-blue-700">
          This is a simplified map to test basic functionality. You should see markers for Atlanta, Savannah, and Augusta.
        </p>
      </div>
    </div>
  )
}