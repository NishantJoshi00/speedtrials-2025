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

// Georgia county coordinates (longitude, latitude) - all 159 counties
const COUNTY_COORDINATES: Record<string, [number, number]> = {
  'Appling': [-82.3179, 31.7274],
  'Atkinson': [-83.2085, 31.2166],
  'Bacon': [-82.4318, 31.5549],
  'Baker': [-84.4318, 31.3291],
  'Baldwin': [-83.2318, 33.0791],
  'Banks': [-83.4818, 34.3541],
  'Barrow': [-83.6818, 34.0041],
  'Bartow': [-84.8433, 34.2342],
  'Ben Hill': [-83.2807, 31.7582],
  'Berrien': [-83.2318, 31.2291],
  'Bibb': [-83.6324, 32.8407],
  'Bleckley': [-83.3568, 32.4458],
  'Brantley': [-81.9685, 31.2166],
  'Brooks': [-83.5418, 30.7899],
  'Bryan': [-81.3318, 32.1291],
  'Bulloch': [-81.7735, 32.4332],
  'Burke': [-82.0029, 33.1901],
  'Butts': [-83.9318, 33.2958],
  'Calhoun': [-84.6485, 31.5291],
  'Camden': [-81.6068, 30.8332],
  'Candler': [-82.1176, 32.4043],
  'Carroll': [-85.0766, 33.5801],
  'Catoosa': [-85.0985, 34.9041],
  'Charlton': [-82.1418, 30.8332],
  'Chatham': [-81.1320, 32.0835],
  'Chattahoochee': [-84.8485, 32.2749],
  'Chattooga': [-85.3485, 34.4958],
  'Cherokee': [-84.4803, 34.2366],
  'Clarke': [-83.3576, 33.9519],
  'Clay': [-84.9318, 31.5541],
  'Clayton': [-84.3733, 33.5404],
  'Clinch': [-82.7585, 30.8066],
  'Cobb': [-84.5144, 33.8823],
  'Coffee': [-82.9540, 31.5204],
  'Colquitt': [-83.7807, 30.8349],
  'Columbia': [-82.2029, 33.5362],
  'Cook': [-83.4196, 31.0582],
  'Coweta': [-84.7569, 33.3768],
  'Crawford': [-84.0318, 32.7374],
  'Crisp': [-83.8774, 31.9007],
  'Dade': [-85.4818, 34.8624],
  'Dawson': [-84.1235, 34.4208],
  'Decatur': [-84.5235, 30.8541],
  'DeKalb': [-84.2806, 33.7673],
  'Dodge': [-83.2085, 32.1791],
  'Dooly': [-83.7329, 32.0724],
  'Dougherty': [-84.1557, 31.4221],
  'Douglas': [-84.6615, 33.6323],
  'Early': [-85.1235, 31.2041],
  'Echols': [-83.1735, 30.7624],
  'Effingham': [-81.3985, 32.3958],
  'Elbert': [-82.8568, 34.1124],
  'Emanuel': [-82.1343, 32.6068],
  'Evans': [-81.9018, 32.1999],
  'Fannin': [-84.2985, 34.8791],
  'Fayette': [-84.4910, 33.4487],
  'Floyd': [-85.1819, 34.2598],
  'Forsyth': [-84.1557, 34.1593],
  'Franklin': [-83.2568, 34.5208],
  'Fulton': [-84.3963, 33.8034],
  'Gilmer': [-84.4818, 34.6624],
  'Glascock': [-82.6485, 33.2541],
  'Glynn': [-81.4932, 31.2666],
  'Gordon': [-84.8880, 34.5209],
  'Grady': [-84.2485, 30.8541],
  'Greene': [-83.1818, 33.5791],
  'Gwinnett': [-84.0063, 33.9567],
  'Habersham': [-83.5485, 34.6958],
  'Hall': [-83.8430, 34.3232],
  'Hancock': [-83.1485, 33.2791],
  'Haralson': [-85.1735, 33.7458],
  'Harris': [-84.9485, 32.7124],
  'Hart': [-82.9318, 34.3541],
  'Heard': [-85.0985, 33.3208],
  'Henry': [-84.1263, 33.4468],
  'Houston': [-83.6557, 32.4461],
  'Irwin': [-83.1718, 31.4349],
  'Jackson': [-83.5235, 34.1458],
  'Jasper': [-83.6485, 33.3291],
  'Jeff Davis': [-82.6068, 31.9299],
  'Jefferson': [-82.5585, 33.0041],
  'Jenkins': [-81.9568, 32.8458],
  'Johnson': [-82.6779, 32.6593],
  'Jones': [-83.5318, 33.0458],
  'Lamar': [-84.1318, 33.1041],
  'Lanier': [-83.0485, 30.9791],
  'Laurens': [-83.0196, 32.4668],
  'Lee': [-84.1296, 31.7196],
  'Liberty': [-81.4637, 31.8371],
  'Lincoln': [-82.4818, 33.7958],
  'Long': [-81.8235, 31.7124],
  'Lowndes': [-83.2479, 30.8327],
  'Lumpkin': [-83.9318, 34.4791],
  'Macon': [-84.0068, 32.3708],
  'Madison': [-83.2068, 34.1708],
  'Marion': [-84.4568, 32.4374],
  'McDuffie': [-82.4485, 33.4541],
  'McIntosh': [-81.4485, 31.5791],
  'Meriwether': [-84.8318, 33.0041],
  'Miller': [-84.7485, 31.1791],
  'Mitchell': [-84.2318, 31.1291],
  'Monroe': [-83.9818, 32.9708],
  'Montgomery': [-82.5735, 32.2624],
  'Morgan': [-83.3985, 33.6124],
  'Murray': [-84.7235, 34.7958],
  'Muscogee': [-84.9411, 32.4922],
  'Newton': [-83.8568, 33.5568],
  'Oconee': [-83.4485, 33.8458],
  'Oglethorpe': [-83.1068, 33.8958],
  'Paulding': [-84.8608, 33.9126],
  'Peach': [-83.7068, 32.5874],
  'Pickens': [-84.4735, 34.4791],
  'Pierce': [-82.0796, 31.2166],
  'Pike': [-84.3818, 33.0708],
  'Polk': [-85.1985, 33.9791],
  'Pulaski': [-83.4296, 32.3526],
  'Putnam': [-83.3735, 33.3291],
  'Quitman': [-85.0235, 31.8208],
  'Rabun': [-83.4068, 34.8791],
  'Randolph': [-84.7068, 31.4541],
  'Richmond': [-82.0105, 33.4734],
  'Rockdale': [-84.0068, 33.6541],
  'Schley': [-84.2596, 32.2791],
  'Screven': [-81.6179, 32.7166],
  'Seminole': [-84.8735, 30.8124],
  'Spalding': [-84.2985, 33.2624],
  'Stephens': [-83.4235, 34.5791],
  'Stewart': [-84.9318, 32.0041],
  'Sumter': [-84.1657, 31.9207],
  'Talbot': [-84.5485, 32.6791],
  'Taliaferro': [-82.8818, 33.5541],
  'Tattnall': [-82.0485, 32.0374],
  'Taylor': [-84.2735, 32.5541],
  'Telfair': [-82.8735, 31.8999],
  'Terrell': [-84.3235, 31.6374],
  'Thomas': [-83.9768, 30.8327],
  'Tift': [-83.5085, 31.4493],
  'Toombs': [-82.3796, 32.0791],
  'Towns': [-83.7735, 34.9291],
  'Treutlen': [-82.4918, 32.4666],
  'Troup': [-85.0155, 33.0151],
  'Turner': [-83.6485, 31.7124],
  'Twiggs': [-83.4485, 32.6374],
  'Union': [-83.9985, 34.8124],
  'Upson': [-84.1485, 33.0374],
  'Walker': [-85.3096, 34.7848],
  'Walton': [-83.7266, 33.7662],
  'Ware': [-82.4835, 31.2043],
  'Warren': [-82.6485, 33.4041],
  'Washington': [-82.7385, 32.9598],
  'Wayne': [-81.8879, 31.5666],
  'Webster': [-84.5068, 32.0541],
  'Wheeler': [-82.8568, 32.0458],
  'White': [-83.7568, 34.6624],
  'Whitfield': [-84.9633, 34.7698],
  'Wilcox': [-83.0607, 31.9971],
  'Wilkes': [-82.7318, 33.7958],
  'Wilkinson': [-83.1796, 32.7708],
  'Worth': [-83.8757, 31.5624]
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

    console.log('MapComponent: Initializing map...')

    // Create map centered on Georgia with tighter bounds
    const map = L.map(mapContainerRef.current, {
      center: [32.75, -83.5], // Georgia center
      zoom: 7,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 12
    })

    console.log('MapComponent: Map created:', !!map)

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

    console.log('MapComponent: Map initialized with markers group')

    // Add a test marker to ensure map is working
    const testMarker = L.marker([33.7490, -84.3880]).addTo(markersGroup)
    testMarker.bindPopup('Test marker - Atlanta')
    console.log('MapComponent: Test marker added')

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

    console.log('MapComponent: Received systems:', systems.length)
    console.log('MapComponent: Sample system:', systems[0])

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

    console.log('MapComponent: Grouped by counties:', Object.keys(systemsByCounty))
    console.log('MapComponent: Counties found:', Object.keys(systemsByCounty).length)

    // Create markers for each county
    Object.entries(systemsByCounty).forEach(([countyName, countySystems]) => {
      const coordinates = COUNTY_COORDINATES[countyName]
      if (!coordinates) {
        console.log('MapComponent: No coordinates for county:', countyName)
        return
      }

      const [lng, lat] = coordinates

      // Calculate aggregated data
      const totalPopulation = countySystems.reduce((sum, s) => sum + (s.population_served_count || 0), 0)
      const totalViolations = countySystems.reduce((sum, s) => sum + (s.current_violations || 0), 0)
      const worstRisk = getWorstRiskLevel(countySystems.map(s => s.risk_level))

      // Calculate marker size based on population
      const radius = Math.max(8, Math.min(30, Math.sqrt(totalPopulation / 1000)))

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
      className="w-full h-96 md:h-[600px] bg-gray-100"
      style={{ 
        minHeight: '400px',
        height: '600px',
        position: 'relative'
      }}
    />
  )
}