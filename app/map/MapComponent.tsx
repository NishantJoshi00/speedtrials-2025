// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { WaterSystem, RiskLevel } from '@/types/water-system'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapComponentProps {
  systems: WaterSystem[]
  onSystemSelect: (system: WaterSystem) => void
}

// Georgia county coordinates (longitude, latitude) - comprehensive list
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
  'Houston': [-83.6557, 32.4461],
  'Bartow': [-84.8433, 34.2342],
  'Paulding': [-84.8608, 33.9126],
  'Carroll': [-85.0766, 33.5801],
  'Coweta': [-84.7569, 33.3768],
  'Coffee': [-82.9540, 31.5204],
  'Troup': [-85.0155, 33.0151],
  'Whitfield': [-84.9633, 34.7698],
  'Lowndes': [-83.2479, 30.8327],
  'Columbia': [-82.2029, 33.5362],
  'Newton': [-83.8568, 33.5568],
  'Fayette': [-84.4910, 33.4487],
  'Walton': [-83.7266, 33.7662],
  'Gordon': [-84.8880, 34.5209],
  'Thomas': [-83.9768, 30.8327],
  'Dougherty': [-84.1557, 31.4221],
  'Walker': [-85.3096, 34.7848],
  'Floyd': [-85.1819, 34.2598],
  'Liberty': [-81.4637, 31.8371],
  'Burke': [-82.0029, 33.1901],
  'Washington': [-82.7385, 32.9598],
  'Johnson': [-82.6779, 32.6593],
  'Emanuel': [-82.1343, 32.6068],
  'Candler': [-82.1176, 32.4043],
  'Glynn': [-81.4932, 31.2666],
  'Ware': [-82.4835, 31.2043],
  'Laurens': [-83.0196, 32.4668],
  'Worth': [-83.8757, 31.5624],
  'Lee': [-84.1296, 31.7196],
  'Crisp': [-83.8774, 31.9007],
  'Dooly': [-83.7329, 32.0724],
  'Pulaski': [-83.4296, 32.3526],
  'Wilcox': [-83.0607, 31.9971],
  'Ben Hill': [-83.2807, 31.7582],
  'Irwin': [-83.1718, 31.4349],
  'Tift': [-83.5085, 31.4493],
  'Cook': [-83.4196, 31.0582],
  'Colquitt': [-83.7807, 30.8349],
  'Brooks': [-83.5418, 30.7899],
  'Echols': [-83.1735, 30.7624],
  'Clinch': [-82.7585, 30.8066],
  'Charlton': [-82.1418, 30.8332],
  'Camden': [-81.6068, 30.8332],
  'Brantley': [-81.9685, 31.2166],
  'Wayne': [-81.8879, 31.5666],
  'Pierce': [-82.0796, 31.2166],
  'Atkinson': [-83.2085, 31.2166],
  'Bacon': [-82.4318, 31.5549],
  'Appling': [-82.3179, 31.7274],
  'Jeff Davis': [-82.6068, 31.9299],
  'Montgomery': [-82.5735, 32.2624],
  'Toombs': [-82.3796, 32.0791],
  'Tattnall': [-82.0485, 32.0374],
  'Evans': [-81.9018, 32.1999],
  'Bulloch': [-81.7735, 32.4332],
  'Screven': [-81.6179, 32.7166],
  'Jenkins': [-81.9568, 32.8458],
  'Jefferson': [-82.5585, 33.0041],
  'Washington': [-82.7385, 32.9598],
  'Johnson': [-82.6779, 32.6593],
  'Emanuel': [-82.1343, 32.6068],
  'Candler': [-82.1176, 32.4043],
  'Treutlen': [-82.4918, 32.4666],
  'Wheeler': [-82.8568, 32.0458],
  'Dodge': [-83.2085, 32.1791],
  'Telfair': [-82.8735, 31.8999],
  'Bleckley': [-83.3568, 32.4458],
  'Pulaski': [-83.4296, 32.3526],
  'Wilkinson': [-83.1796, 32.7708],
  'Baldwin': [-83.2318, 33.0791],
  'Jones': [-83.5318, 33.0458],
  'Bibb': [-83.6324, 32.8407],
  'Twiggs': [-83.4485, 32.6374],
  'Peach': [-83.7068, 32.5874],
  'Crawford': [-84.0318, 32.7374],
  'Taylor': [-84.2735, 32.5541],
  'Macon': [-84.0068, 32.3708],
  'Schley': [-84.2596, 32.2791],
  'Sumter': [-84.1657, 31.9207],
  'Webster': [-84.5068, 32.0541],
  'Marion': [-84.4568, 32.4374],
  'Muscogee': [-84.9877, 32.4609],
  'Chattahoochee': [-84.8485, 32.2749],
  'Stewart': [-84.9318, 32.0041],
  'Quitman': [-85.0235, 31.8208],
  'Clay': [-84.9318, 31.5541],
  'Randolph': [-84.7068, 31.4541],
  'Terrell': [-84.3235, 31.6374],
  'Lee': [-84.1296, 31.7196],
  'Dougherty': [-84.1557, 31.4221],
  'Worth': [-83.8757, 31.5624],
  'Turner': [-83.6485, 31.7124],
  'Crisp': [-83.8774, 31.9007],
  'Dooly': [-83.7329, 32.0724],
  'Houston': [-83.6557, 32.4461],
  'Peach': [-83.7068, 32.5874],
  'Monroe': [-83.9818, 32.9708],
  'Lamar': [-84.1318, 33.1041],
  'Pike': [-84.3818, 33.0708],
  'Meriwether': [-84.8318, 33.0041],
  'Troup': [-85.0155, 33.0151],
  'Harris': [-84.9485, 32.7124],
  'Talbot': [-84.5485, 32.6791],
  'Upson': [-84.1485, 33.0374],
  'Spalding': [-84.2985, 33.2624],
  'Fayette': [-84.4910, 33.4487],
  'Clayton': [-84.3733, 33.5404],
  'Henry': [-84.1263, 33.4468],
  'Butts': [-83.9318, 33.2958],
  'Jasper': [-83.6485, 33.3291],
  'Newton': [-83.8568, 33.5568],
  'Rockdale': [-84.0068, 33.6541],
  'DeKalb': [-84.2806, 33.7673],
  'Fulton': [-84.3963, 33.8034],
  'Douglas': [-84.6615, 33.6323],
  'Carroll': [-85.0766, 33.5801],
  'Heard': [-85.0985, 33.3208],
  'Coweta': [-84.7569, 33.3768],
  'Campbell': [-84.5485, 33.7124], // Historic county, now part of Fulton
  'Cobb': [-84.5144, 33.8823],
  'Paulding': [-84.8608, 33.9126],
  'Haralson': [-85.1735, 33.7458],
  'Polk': [-85.1985, 33.9791],
  'Floyd': [-85.1819, 34.2598],
  'Bartow': [-84.8433, 34.2342],
  'Cherokee': [-84.4803, 34.2366],
  'Forsyth': [-84.1557, 34.1593],
  'Gwinnett': [-84.0063, 33.9567],
  'Barrow': [-83.6818, 34.0041],
  'Jackson': [-83.5235, 34.1458],
  'Madison': [-83.2068, 34.1708],
  'Clarke': [-83.3576, 33.9519],
  'Oconee': [-83.4485, 33.8458],
  'Walton': [-83.7266, 33.7662],
  'Morgan': [-83.3985, 33.6124],
  'Greene': [-83.1818, 33.5791],
  'Oglethorpe': [-83.1068, 33.8958],
  'Elbert': [-82.8568, 34.1124],
  'Hart': [-82.9318, 34.3541],
  'Franklin': [-83.2568, 34.5208],
  'Stephens': [-83.4235, 34.5791],
  'Habersham': [-83.5485, 34.6958],
  'White': [-83.7568, 34.6624],
  'Lumpkin': [-83.9318, 34.4791],
  'Dawson': [-84.1235, 34.4208],
  'Hall': [-83.8430, 34.3232],
  'Banks': [-83.4818, 34.3541],
  'Rabun': [-83.4068, 34.8791],
  'Towns': [-83.7735, 34.9291],
  'Union': [-83.9985, 34.8124],
  'Fannin': [-84.2985, 34.8791],
  'Gilmer': [-84.4818, 34.6624],
  'Pickens': [-84.4735, 34.4791],
  'Gordon': [-84.8880, 34.5209],
  'Murray': [-84.7235, 34.7958],
  'Whitfield': [-84.9633, 34.7698],
  'Catoosa': [-85.0985, 34.9041],
  'Walker': [-85.3096, 34.7848],
  'Dade': [-85.4818, 34.8624],
  'Chattooga': [-85.3485, 34.4958]
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

function getWorstRiskLevel(riskLevels: RiskLevel[]): RiskLevel {
  const priority = { 'high_risk': 4, 'medium_risk': 3, 'low_risk': 2, 'no_violations': 1 }
  return riskLevels.reduce((worst, current) => 
    priority[current] > priority[worst] ? current : worst
  )
}

export default function MapComponent({ systems, onSystemSelect }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const georgiaLayerRef = useRef<L.GeoJSON | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Create map centered on Georgia with tighter bounds
    const map = L.map(mapContainerRef.current, {
      center: [32.75, -83.5], // Georgia center
      zoom: 7,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 12
    })

    // Add CartoDB Positron tiles with administrative boundaries visible
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)

    // Set map bounds to focus on Georgia without custom polygon
    const georgiaBounds = L.latLngBounds(
      [30.3, -85.7], // Southwest corner
      [35.1, -80.8]  // Northeast corner
    )
    
    map.fitBounds(georgiaBounds, {
      padding: [20, 20]
    })

    // Create marker layer group
    const markersGroup = L.layerGroup().addTo(map)
    markersRef.current = markersGroup
    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when systems change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    console.log('MapComponent: Updating markers, systems count:', systems.length)

    // Clear existing markers
    markersRef.current.clearLayers()

    if (systems.length === 0) {
      console.log('MapComponent: No systems to display')
      return
    }

    // Group systems by county
    const systemsByCounty = systems.reduce((acc: Record<string, WaterSystem[]>, system) => {
      const county = system.primary_county
      if (!county) {
        console.log('MapComponent: System without county:', system.pwsid)
        return acc
      }
      
      // Normalize county name (remove " County" if present and trim)
      const normalizedCounty = county.replace(/ County$/i, '').trim()
      
      if (!acc[normalizedCounty]) {
        acc[normalizedCounty] = []
      }
      acc[normalizedCounty].push(system)
      return acc
    }, {})

    console.log('MapComponent: Counties with systems:', Object.keys(systemsByCounty).length)
    console.log('MapComponent: County names found:', Object.keys(systemsByCounty))
    console.log('MapComponent: Available coordinates for:', Object.keys(COUNTY_COORDINATES).slice(0, 10))

    // Create markers for each county
    Object.entries(systemsByCounty).forEach(([countyName, countySystems]) => {
      const coordinates = COUNTY_COORDINATES[countyName]
      if (!coordinates) {
        console.log('MapComponent: No coordinates for county:', countyName, '- available keys include:', Object.keys(COUNTY_COORDINATES).filter(k => k.toLowerCase().includes(countyName.toLowerCase())))
        return
      }

      const [lng, lat] = coordinates
      console.log(`MapComponent: Creating marker for ${countyName} at [${lat}, ${lng}] with ${countySystems.length} systems`)

      // Calculate aggregated data
      const totalPopulation = countySystems.reduce((sum, s) => sum + (s.population_served_count || 0), 0)
      const totalViolations = countySystems.reduce((sum, s) => sum + (s.current_violations || 0), 0)
      const worstRisk = getWorstRiskLevel(countySystems.map(s => s.risk_level))

      // Calculate marker size based on population
      const radius = Math.max(8, Math.min(30, Math.sqrt(totalPopulation / 1000)))

      console.log(`MapComponent: ${countyName} - Population: ${totalPopulation}, Violations: ${totalViolations}, Risk: ${worstRisk}, Radius: ${radius}`)

      // Create custom circle marker
      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: getRiskColor(worstRisk),
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-64">
          <h4 class="font-semibold text-gray-900 mb-2">${countyName} County</h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Systems:</span>
              <span class="font-medium">${countySystems.length}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Population:</span>
              <span class="font-medium">${totalPopulation.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Current Violations:</span>
              <span class="font-medium text-orange-600">${totalViolations}</span>
            </div>
            <div class="mt-2">
              <span class="inline-block px-2 py-1 text-xs rounded-full" 
                    style="background-color: ${getRiskColor(worstRisk)}20; color: ${getRiskColor(worstRisk)}">
                ${worstRisk.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <button 
            onclick="window.selectCountyFromMap('${countyName}')" 
            class="mt-3 w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Add click handler for county selection
      marker.on('click', () => {
        // Create aggregated county system for selection
        const countySystem: WaterSystem = {
          pwsid: `county-${countyName}`,
          pws_name: `${countyName} County - ${countySystems.length} Systems`,
          primary_city: null,
          primary_county: countyName,
          population_served_count: totalPopulation,
          pws_type_code: null,
          primary_source_code: null,
          phone_number: null,
          risk_level: worstRisk,
          current_violations: totalViolations,
          total_violations: countySystems.reduce((sum, s) => sum + (s.total_violations || 0), 0),
          health_violations: countySystems.reduce((sum, s) => sum + (s.health_violations || 0), 0),
          is_active: true
        }
        onSystemSelect(countySystem)
      })

      // Add system count label for larger markers
      if (radius > 12) {
        const labelIcon = L.divIcon({
          className: 'county-label',
          html: `<div style="
            color: white; 
            font-weight: bold; 
            font-size: ${Math.max(10, radius * 0.4)}px;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            pointer-events: none;
          ">${countySystems.length}</div>`,
          iconSize: [radius * 2, radius * 2],
          iconAnchor: [radius, radius]
        })

        L.marker([lat, lng], { icon: labelIcon }).addTo(markersRef.current!)
      }

      marker.addTo(markersRef.current!)
    })

    console.log('MapComponent: Added', Object.keys(systemsByCounty).length, 'county markers to map')

    // If no markers were added, show a message
    if (Object.keys(systemsByCounty).length === 0) {
      console.log('MapComponent: No county markers added - no matching counties found')
    }

    // Global function for popup button clicks
    ;(window as any).selectCountyFromMap = (countyName: string) => {
      const countySystems = systemsByCounty[countyName]
      if (countySystems && countySystems.length > 0) {
        const totalPopulation = countySystems.reduce((sum, s) => sum + (s.population_served_count || 0), 0)
        const totalViolations = countySystems.reduce((sum, s) => sum + (s.current_violations || 0), 0)
        const worstRisk = getWorstRiskLevel(countySystems.map(s => s.risk_level))

        const countySystem: WaterSystem = {
          pwsid: `county-${countyName}`,
          pws_name: `${countyName} County - ${countySystems.length} Systems`,
          primary_city: null,
          primary_county: countyName,
          population_served_count: totalPopulation,
          pws_type_code: null,
          primary_source_code: null,
          phone_number: null,
          risk_level: worstRisk,
          current_violations: totalViolations,
          total_violations: countySystems.reduce((sum, s) => sum + (s.total_violations || 0), 0),
          health_violations: countySystems.reduce((sum, s) => sum + (s.health_violations || 0), 0),
          is_active: true
        }
        onSystemSelect(countySystem)
      }
    }

  }, [systems, onSystemSelect])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-96 md:h-[600px]"
      style={{ minHeight: '400px' }}
    />
  )
}