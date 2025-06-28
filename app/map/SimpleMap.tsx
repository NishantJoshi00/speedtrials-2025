'use client'

import { useEffect, useRef, useState } from 'react'
import { getWaterSystemsForMap } from '@/lib/supabase'
import type { WaterSystem, RiskLevel } from '@/types/water-system'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Georgia county coordinates for water systems
const COUNTY_COORDINATES: Record<string, [number, number]> = {
  'Fulton': [-84.3963, 33.8034],
  'Gwinnett': [-84.0063, 33.9567],
  'Cobb': [-84.5144, 33.8823],
  'DeKalb': [-84.2806, 33.7673],
  'Chatham': [-81.1320, 32.0835],
  'Clayton': [-84.3733, 33.5404],
  'Cherokee': [-84.4803, 34.2366],
  'Forsyth': [-84.1557, 34.1593],
  'Richmond': [-82.0105, 33.4734],
  'Henry': [-84.1263, 33.4468],
  'Muscogee': [-84.9411, 32.4922],
  'Bibb': [-83.6324, 32.8407],
  'Douglas': [-84.6615, 33.6323],
  'Hall': [-83.8430, 34.3232],
  'Clarke': [-83.3576, 33.9519],
  'Houston': [-83.6557, 32.4461]
}

function getRiskColor(riskLevel: RiskLevel): string {
  const colors = {
    'no_violations': '#10b981', // green
    'low_risk': '#f59e0b',      // yellow
    'medium_risk': '#f97316',   // orange
    'high_risk': '#ef4444'      // red
  }
  return colors[riskLevel]
}

export default function SimpleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [status, setStatus] = useState('Loading...')
  const [waterSystems, setWaterSystems] = useState<WaterSystem[]>([])

  // Load water systems data
  useEffect(() => {
    const loadData = async () => {
      try {
        setStatus('Loading water systems data...')
        const systems = await getWaterSystemsForMap()
        setWaterSystems(systems)
        setStatus('Water data loaded. Initializing map...')
      } catch (error) {
        console.error('Failed to load water systems:', error)
        setStatus('Failed to load water data, using mock data...')
        // Use mock data if real data fails
        setWaterSystems([
          {
            pwsid: 'GA1234567',
            pws_name: 'Atlanta Water Department',
            primary_city: null,
            primary_county: 'Fulton',
            population_served_count: 500000,
            pws_type_code: 'CWS',
            primary_source_code: 'GW',
            phone_number: null,
            email_addr: null,
            admin_name: null,
            risk_level: 'low_risk' as RiskLevel,
            current_violations: 1,
            total_violations: 5,
            health_violations: 0,
            is_active: true
          }
        ])
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    console.log('Map effect triggered with:', {
      isWindow: typeof window !== 'undefined',
      hasMapRef: !!mapRef.current,
      waterSystemsLength: waterSystems.length,
      hasLeaflet: !!L
    })

    if (typeof window === 'undefined') {
      console.log('Skipping: running on server side')
      return
    }
    
    if (!mapRef.current) {
      console.log('Skipping: no map ref')
      return
    }
    
    if (waterSystems.length === 0) {
      console.log('Skipping: no water systems data')
      return
    }

    console.log('All conditions met, starting map initialization...')
    setStatus('Initializing map with Leaflet...')

    // Cleanup function
    const cleanup = () => {
      console.log('Cleanup called')
      if (mapInstanceRef.current) {
        console.log('Removing existing map instance')
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }

    // Since we're importing Leaflet directly, skip the dynamic loading
    console.log('Leaflet is already imported, proceeding directly to map initialization')
    setStatus('Leaflet ready, creating map...')

    // Initialize map
    const initMap = () => {
      console.log('initMap called')
      console.log('Checking requirements:', {
        mapRef: !!mapRef.current,
        leaflet: !!L,
        windowL: !!(window as any).L
      })

      if (!mapRef.current) {
        console.error('Missing map container')
        setStatus('Error: Missing map container')
        return
      }

      if (!L) {
        console.error('Missing Leaflet library')
        setStatus('Error: Missing Leaflet library')
        return
      }

      try {
        console.log('Starting map initialization...')
        setStatus('Creating map...')
        
        // Clean up any existing map first
        cleanup()
        
        // Clear container
        console.log('Clearing map container')
        mapRef.current.innerHTML = ''
        
        // Remove any existing _leaflet_id to avoid "already initialized" error
        if ((mapRef.current as any)._leaflet_id) {
          console.log('Removing existing leaflet ID')
          delete (mapRef.current as any)._leaflet_id
        }

        console.log('Map container dimensions:', {
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight,
          display: getComputedStyle(mapRef.current).display
        })

        console.log('Creating Leaflet map...')
        // Create map using imported L, not window.L
        const map = L.map(mapRef.current).setView([32.75, -83.5], 7)
        mapInstanceRef.current = map
        console.log('Map created successfully:', !!map)

        console.log('Adding tiles to map...')
        // Add tiles using imported L
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)
        console.log('Tiles added successfully')

        console.log('Processing water systems data...')
        console.log('Water systems count:', waterSystems.length)
        
        // Group systems by county and add markers
        const systemsByCounty = waterSystems.reduce((acc: Record<string, WaterSystem[]>, system) => {
          const county = system.primary_county?.replace(/ County$/i, '').trim()
          if (!county) return acc
          
          if (!acc[county]) {
            acc[county] = []
          }
          acc[county].push(system)
          return acc
        }, {})

        console.log('Systems grouped by county:', Object.keys(systemsByCounty))
        console.log('Counties found:', Object.keys(systemsByCounty).length)

        let markersAdded = 0
        Object.entries(systemsByCounty).forEach(([countyName, countySystems]) => {
          console.log(`Processing county: ${countyName} with ${countySystems.length} systems`)
          const coordinates = COUNTY_COORDINATES[countyName]
          if (!coordinates) {
            console.log(`No coordinates found for county: ${countyName}`)
            return
          }

          const [lng, lat] = coordinates
          console.log(`County ${countyName} coordinates: [${lat}, ${lng}]`)
          
          // Calculate aggregated data for the county
          const totalPopulation = countySystems.reduce((sum, s) => sum + (s.population_served_count || 0), 0)
          const totalViolations = countySystems.reduce((sum, s) => sum + (s.current_violations || 0), 0)
          const worstRisk = countySystems.reduce((worst, current) => {
            const priority = { 'high_risk': 4, 'medium_risk': 3, 'low_risk': 2, 'no_violations': 1 }
            return priority[current.risk_level] > priority[worst] ? current.risk_level : worst
          }, 'no_violations' as RiskLevel)

          console.log(`County ${countyName} stats:`, { totalPopulation, totalViolations, worstRisk })

          // Create colored circle marker based on risk level
          console.log(`Creating marker for ${countyName}...`)
          const marker = L.circleMarker([lat, lng], {
            radius: Math.max(8, Math.min(25, Math.sqrt(totalPopulation / 1000))),
            fillColor: getRiskColor(worstRisk),
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map)
          console.log(`Marker created for ${countyName}`)

          // Create popup with county water system info
          const popupContent = `
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${countyName} County</h4>
              <div style="font-size: 14px;">
                <div><strong>Water Systems:</strong> ${countySystems.length}</div>
                <div><strong>Population Served:</strong> ${totalPopulation.toLocaleString()}</div>
                <div><strong>Current Violations:</strong> ${totalViolations}</div>
                <div style="margin-top: 8px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: white; background-color: ${getRiskColor(worstRisk)};">
                    ${worstRisk.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          `
          marker.bindPopup(popupContent)
          markersAdded++
        })

        setStatus(`Map loaded with ${markersAdded} county markers showing water system data`)
        console.log(`Map created with ${markersAdded} water system county markers`)
      } catch (error) {
        setStatus('Error creating map: ' + error.message)
        console.error('Map creation failed:', error)
      }
    }

    // Call map initialization directly since Leaflet is imported
    console.log('Calling initMap directly...')
    setTimeout(() => {
      console.log('Timeout reached, calling initMap')
      initMap()
    }, 100)

    // Cleanup on unmount
    return cleanup
  }, [waterSystems])

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