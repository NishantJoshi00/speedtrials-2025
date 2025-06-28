import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our water system data
export interface WaterSystem {
  pwsid: string
  pws_name: string
  primary_city: string | null
  primary_county: string | null
  population_served_count: number | null
  pws_type_code: string | null
  primary_source_code: string | null
  phone_number: string | null
  email_addr: string | null
  admin_name: string | null
  risk_level: 'no_violations' | 'low_risk' | 'medium_risk' | 'high_risk'
  current_violations: number
  total_violations: number
  health_violations: number
  is_active: boolean
}

export interface WaterSystemViolation {
  violation_id: string
  violation_code: string | null
  violation_category_code: string | null
  is_health_based_ind: boolean | null
  contaminant_code: string | null
  non_compl_per_begin_date: string | null
  non_compl_per_end_date: string | null
  violation_status: string | null
  public_notification_tier: number | null
}

export interface SearchResult {
  pwsid: string
  pws_name: string
  primary_city: string | null
  primary_county: string | null
  population_served_count: number | null
  risk_level: string
  current_violations: number
}

export interface QuickStats {
  totalSystems: number
  systemsWithViolations: number
  cleanSystems: number
  lastUpdated: string
}

// Database functions
export async function searchWaterSystems(searchTerm: string): Promise<SearchResult[]> {
  try {
    // Check if search term looks like a system ID (starts with GA + numbers)
    const isSystemId = /^GA\d+/.test(searchTerm.toUpperCase())
    
    if (isSystemId) {
      // Direct search by PWSID
      const { data, error } = await supabase
        .from('water_systems_map_view')
        .select(`
          pwsid,
          pws_name,
          primary_city,
          primary_county,
          population_served_count,
          risk_level,
          current_violations
        `)
        .ilike('pwsid', `${searchTerm.toUpperCase()}%`)
        .eq('is_active', true)
        .limit(20)
      
      if (error) {
        console.error('System ID search error:', error)
        return []
      }
      
      return data || []
    } else {
      // Use the existing RPC function for text search
      const { data, error } = await supabase.rpc('search_water_systems', {
        search_term: searchTerm
      })
      
      if (error) {
        console.error('Search error:', error)
        return []
      }
      
      return data || []
    }
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

export async function searchWaterSystemsByType(systemTypeCode: string): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('water_systems_map_view')
      .select(`
        pwsid,
        pws_name,
        primary_city,
        primary_county,
        population_served_count,
        risk_level,
        current_violations
      `)
      .eq('pws_type_code', systemTypeCode)
      .eq('is_active', true)
      .limit(50)
    
    if (error) {
      console.error('System type search error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('System type search failed:', error)
    return []
  }
}

export async function getSystemDetails(pwsid: string) {
  try {
    // Get system details with risk level
    const { data: systemData, error: systemError } = await supabase
      .from('water_systems_map_view')
      .select(`
        pwsid,
        pws_name,
        pws_type_code,
        population_served_count,
        primary_source_code,
        phone_number,
        primary_city,
        primary_county,
        risk_level,
        current_violations,
        total_violations,
        health_violations
      `)
      .eq('pwsid', pwsid)
      .single()

    // Also get full system details for contact info
    const { data: fullSystemData } = await supabase
      .from('water_systems')
      .select(`
        owner_type_code,
        email_addr,
        admin_name,
        address_line1,
        city_name,
        state_code,
        zip_code
      `)
      .eq('pwsid', pwsid)
      .single()

    if (systemError) {
      console.error('System details error:', systemError)
      return null
    }

    // Get violations
    const { data: violationsData } = await supabase
      .from('violations')
      .select(`
        violation_id,
        non_compl_per_begin_date,
        non_compl_per_end_date,
        violation_code,
        violation_category_code,
        is_health_based_ind,
        contaminant_code,
        violation_status,
        public_notification_tier
      `)
      .eq('pwsid', pwsid)
      .order('non_compl_per_begin_date', { ascending: false })

    // Combine the data
    const combinedSystemData = {
      ...systemData,
      ...fullSystemData
    }

    return {
      system: combinedSystemData,
      violations: violationsData || []
    }
  } catch (error) {
    console.error('Failed to get system details:', error)
    return null
  }
}

export async function getQuickStats(): Promise<QuickStats> {
  try {
    // Get total systems count
    const { count: totalSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get systems with current violations (Unaddressed + Addressed)
    const { data: systemsWithCurrentViolations } = await supabase
      .from('violations')
      .select('pwsid', { count: 'exact' })
      .in('violation_status', ['Unaddressed', 'Addressed'])
      
    // Count unique systems with violations
    const uniqueSystemsWithViolations = new Set(
      systemsWithCurrentViolations?.map(v => v.pwsid) || []
    ).size

    return {
      totalSystems: totalSystems || 0,
      systemsWithViolations: uniqueSystemsWithViolations,
      cleanSystems: (totalSystems || 0) - uniqueSystemsWithViolations,
      lastUpdated: 'Today'
    }
  } catch (error) {
    console.error('Failed to get quick stats:', error)
    return {
      totalSystems: 0,
      systemsWithViolations: 0,
      cleanSystems: 0,
      lastUpdated: 'Unknown'
    }
  }
}

export async function getPopularLocations() {
  try {
    // Get popular cities
    const { data: cities } = await supabase
      .from('geographic_areas')
      .select('city_served, pwsid')
      .eq('area_type_code', 'CT')
      .not('city_served', 'is', null)
    
    // Get popular counties
    const { data: counties } = await supabase
      .from('geographic_areas')
      .select('county_served, pwsid')
      .eq('area_type_code', 'CN')
      .not('county_served', 'is', null)

    // Count occurrences
    const cityCount = cities?.reduce((acc: Record<string, number>, item) => {
      if (item.city_served) {
        acc[item.city_served] = (acc[item.city_served] || 0) + 1
      }
      return acc
    }, {}) || {}

    const countyCount = counties?.reduce((acc: Record<string, number>, item) => {
      if (item.county_served) {
        acc[item.county_served] = (acc[item.county_served] || 0) + 1
      }
      return acc
    }, {}) || {}

    // Get top 5 of each
    const topCities = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, type: 'city', count }))

    const topCounties = Object.entries(countyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, type: 'county', count }))

    return { cities: topCities, counties: topCounties }
  } catch (error) {
    console.error('Failed to get popular locations:', error)
    return { cities: [], counties: [] }
  }
}

export async function getSystemTypes() {
  try {
    const { data } = await supabase
      .from('water_systems')
      .select('pws_type_code, pwsid')
      .eq('is_active', true)

    const typeCounts = data?.reduce((acc: Record<string, number>, item) => {
      if (item.pws_type_code) {
        acc[item.pws_type_code] = (acc[item.pws_type_code] || 0) + 1
      }
      return acc
    }, {}) || {}

    // Map to friendly names
    const typeNames: Record<string, string> = {
      'CWS': 'Community Systems',
      'NTNCWS': 'School/Workplace Systems', 
      'TNCWS': 'Transient Systems'
    }

    return Object.entries(typeCounts).map(([code, count]) => ({
      type: typeNames[code] || code,
      code,
      count
    }))
  } catch (error) {
    console.error('Failed to get system types:', error)
    return []
  }
}

export async function getSystemsByViolationStatus(hasViolations: boolean): Promise<SearchResult[]> {
  try {
    let query = supabase
      .from('water_systems_map_view')
      .select(`
        pwsid,
        pws_name,
        primary_city,
        primary_county,
        population_served_count,
        risk_level,
        current_violations
      `)
      .eq('is_active', true)
      .not('primary_county', 'is', null)

    if (hasViolations) {
      query = query.gt('current_violations', 0)
    } else {
      query = query.eq('current_violations', 0)
    }

    const { data, error } = await query
      .order('population_served_count', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Systems by violation status error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to get systems by violation status:', error)
    return []
  }
}

// Get all water systems for map visualization  
export async function getWaterSystemsForMap() {
  try {
    console.log('Starting getWaterSystemsForMap query...')
    
    // Query the main water_systems table with calculated risk levels
    const { data, error } = await supabase
      .from('water_systems')
      .select(`
        pwsid,
        pws_name,
        primary_city,
        primary_county,
        population_served_count,
        pws_type_code,
        primary_source_code,
        phone_number,
        email_addr,
        admin_name,
        is_active
      `)
      .eq('is_active', true)
      .not('primary_county', 'is', null)
      .limit(1000)

    if (error) {
      console.error('Map systems query error:', error)
      return []
    }

    console.log('Query successful, got', data?.length, 'records')
    console.log('Sample data:', data?.[0])

    if (!data || data.length === 0) {
      console.log('No water systems data found')
      return []
    }

    // Get violation counts for each system
    const pwsids = data.map(s => s.pwsid)
    const { data: violationsData } = await supabase
      .from('violations')
      .select('pwsid, is_health_based_ind, violation_status')
      .in('pwsid', pwsids)

    // Calculate violation counts per system
    const violationCounts = (violationsData || []).reduce((acc: Record<string, any>, violation) => {
      const pwsid = violation.pwsid
      if (!acc[pwsid]) {
        acc[pwsid] = { current: 0, total: 0, health: 0 }
      }
      
      acc[pwsid].total += 1
      
      if (violation.violation_status === 'Unaddressed' || violation.violation_status === 'Addressed') {
        acc[pwsid].current += 1
      }
      
      if (violation.is_health_based_ind) {
        acc[pwsid].health += 1
      }
      
      return acc
    }, {})

    // Calculate risk levels and transform to expected interface
    const systems = data.map(system => {
      const violations = violationCounts[system.pwsid] || { current: 0, total: 0, health: 0 }
      
      // Calculate risk level based on violations
      let risk_level: 'no_violations' | 'low_risk' | 'medium_risk' | 'high_risk' = 'no_violations'
      
      if (violations.health > 0) {
        risk_level = 'high_risk'
      } else if (violations.current >= 3) {
        risk_level = 'medium_risk'
      } else if (violations.current > 0) {
        risk_level = 'low_risk'
      }

      return {
        pwsid: system.pwsid,
        pws_name: system.pws_name,
        primary_city: system.primary_city,
        primary_county: system.primary_county,
        population_served_count: system.population_served_count,
        pws_type_code: system.pws_type_code,
        primary_source_code: system.primary_source_code,
        phone_number: system.phone_number,
        email_addr: system.email_addr,
        admin_name: system.admin_name,
        risk_level,
        current_violations: violations.current,
        total_violations: violations.total,
        health_violations: violations.health,
        is_active: system.is_active
      }
    })

    console.log('Transformed systems:', systems.length)
    console.log('Sample transformed system:', systems[0])
    return systems
  } catch (error) {
    console.error('Failed to get systems for map:', error)
    return []
  }
}

// Get county statistics
export async function getCountyStats() {
  try {
    const { data, error } = await supabase
      .from('water_systems_map_view')
      .select(`
        primary_county,
        population_served_count,
        current_violations,
        total_violations,
        health_violations,
        risk_level
      `)
      .eq('is_active', true)
      .not('primary_county', 'is', null)

    if (error) {
      console.error('County stats query error:', error)
      return {}
    }

    // Group by county and calculate aggregations
    const countyStats = (data || []).reduce((acc: Record<string, any>, system) => {
      const county = system.primary_county
      if (!county) return acc

      if (!acc[county]) {
        acc[county] = {
          name: county,
          systemCount: 0,
          totalPopulation: 0,
          currentViolations: 0,
          totalViolations: 0,
          healthViolations: 0,
          riskLevels: { no_violations: 0, low_risk: 0, medium_risk: 0, high_risk: 0 }
        }
      }

      acc[county].systemCount += 1
      acc[county].totalPopulation += system.population_served_count || 0
      acc[county].currentViolations += system.current_violations || 0
      acc[county].totalViolations += system.total_violations || 0
      acc[county].healthViolations += system.health_violations || 0
      acc[county].riskLevels[system.risk_level] += 1

      return acc
    }, {})

    return countyStats
  } catch (error) {
    console.error('Failed to get county stats:', error)
    return {}
  }
}