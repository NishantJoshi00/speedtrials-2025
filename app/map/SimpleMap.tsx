'use client'

import { useEffect, useRef, useState } from 'react'

export default function SimpleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    setStatus('Loading Leaflet...')

    // Load Leaflet CSS first
    const loadCSS = () => {
      return new Promise<void>((resolve) => {
        if (document.querySelector('link[href*="leaflet"]')) {
          resolve()
          return
        }
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.onload = () => resolve()
        document.head.appendChild(link)
      })
    }

    // Load Leaflet JS
    const loadJS = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.L) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          setStatus('Leaflet loaded, creating map...')
          resolve()
        }
        script.onerror = () => reject(new Error('Failed to load Leaflet'))
        document.head.appendChild(script)
      })
    }

    // Initialize map
    const initMap = () => {
      if (!mapRef.current || !window.L) return

      try {
        setStatus('Creating map...')
        
        // Clear any existing map
        mapRef.current.innerHTML = ''

        // Create map
        const map = window.L.map(mapRef.current).setView([32.75, -83.5], 7)

        // Add tiles
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)

        // Add test markers
        const atlanta = window.L.marker([33.7490, -84.3880]).addTo(map)
        atlanta.bindPopup('<b>Atlanta, GA</b><br>Test marker 1')

        const savannah = window.L.marker([32.0835, -81.0998]).addTo(map)
        savannah.bindPopup('<b>Savannah, GA</b><br>Test marker 2')

        const augusta = window.L.marker([33.4734, -82.0105]).addTo(map)
        augusta.bindPopup('<b>Augusta, GA</b><br>Test marker 3')

        setStatus('Map loaded successfully!')
        console.log('Simple map created with 3 markers')
      } catch (error) {
        setStatus('Error creating map: ' + error.message)
        console.error('Map creation failed:', error)
      }
    }

    // Load everything in sequence
    loadCSS()
      .then(() => loadJS())
      .then(() => {
        // Small delay to ensure everything is ready
        setTimeout(initMap, 100)
      })
      .catch((error) => {
        setStatus('Failed to load: ' + error.message)
        console.error('Leaflet loading failed:', error)
      })

  }, [])

  return (
    <div className="w-full h-full bg-gray-200">
      <div className="p-4 bg-gray-100 text-sm text-gray-600">
        Status: {status}
      </div>
      <div 
        ref={mapRef} 
        style={{ 
          height: '550px', 
          width: '100%',
          minHeight: '550px'
        }}
      />
    </div>
  )
}