// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Mail, User, Building, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { SystemStatusBadge, ViolationTimeline } from '@/components'
import { getSystemDetails } from '@/lib/supabase'
import type { RiskLevel } from '@/types/water-system'

interface SystemDetailsData {
  system: {
    pwsid: string
    pws_name: string
    pws_type_code: string | null
    owner_type_code: string | null
    population_served_count: number | null
    primary_source_code: string | null
    phone_number: string | null
    email_addr: string | null
    admin_name: string | null
    address_line1: string | null
    city_name: string | null
    state_code: string | null
    zip_code: string | null
    primary_city: string | null
    primary_county: string | null
    risk_level: string
    current_violations: number
    total_violations: number
    health_violations: number
  }
  violations: Array<{
    violation_id: string
    non_compl_per_begin_date: string | null
    non_compl_per_end_date: string | null
    violation_code: string | null
    violation_category_code: string | null
    is_health_based_ind: boolean | null
    contaminant_code: string | null
    violation_status: string | null
    public_notification_tier: number | null
  }>
}

export default function SystemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const pwsid = params.pwsid as string
  
  const [systemData, setSystemData] = useState<SystemDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSystemDetails() {
      if (!pwsid) return
      
      setLoading(true)
      setError(null)
      
      try {
        const data = await getSystemDetails(pwsid)
        if (data) {
          setSystemData(data)
        } else {
          setError('System not found')
        }
      } catch (err) {
        console.error('Failed to load system details:', err)
        setError('Failed to load system details')
      } finally {
        setLoading(false)
      }
    }

    loadSystemDetails()
  }, [pwsid])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200  rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200  rounded mb-6"></div>
          <div className="h-96 bg-gray-200  rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !systemData) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 min-h-screen">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-primary-600  hover:text-primary-800  mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900  mb-2">System Not Found</h1>
          <p className="text-gray-600 ">{error || 'The requested water system could not be found or is no longer active.'}</p>
        </div>
      </div>
    )
  }

  const { system, violations } = systemData
  
  // Use data from the database (consistent with search results)
  const primaryCity = system.primary_city || system.city_name
  const primaryCounty = system.primary_county
  const riskLevel = system.risk_level as RiskLevel
  const currentViolations = system.current_violations
  const healthViolations = system.health_violations

  const getSystemTypeLabel = (code: string | null) => {
    switch (code) {
      case 'CWS': return 'Community Water System'
      case 'NTNCWS': return 'Non-Transient Non-Community Water System'
      case 'TNCWS': return 'Transient Non-Community Water System'
      default: return code || 'Unknown'
    }
  }

  const getSourceTypeLabel = (code: string | null) => {
    switch (code) {
      case 'GW': return 'Groundwater'
      case 'SW': return 'Surface Water'
      case 'GWP': return 'Groundwater (Purchased)'
      case 'SWP': return 'Surface Water (Purchased)'
      default: return code || 'Unknown'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 min-h-screen">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-primary-600  hover:text-primary-800  mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </button>

      {/* Header */}
      <div className="bg-white rounded-md shadow-sm p-6 mb-6 border border-brand-cream-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{system.pws_name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{primaryCity}, {primaryCounty} County</span>
              <span className="mx-2">•</span>
              <span>System ID: {system.pwsid}</span>
            </div>
          </div>
          <div className="lg:ml-6">
            <SystemStatusBadge 
              riskLevel={riskLevel}
              currentViolations={currentViolations}
              healthViolations={healthViolations}
              size="lg"
              showCount={true}
            />
          </div>
        </div>

        {/* Risk Level Explanation */}
        <div className="mt-4 p-4 bg-brand-cream-100 rounded-sm border border-brand-cream-200">
          <div className="text-sm text-gray-600">
            {riskLevel === 'no_violations' && (
              <p><strong>Safe:</strong> This system has no current violations and meets all federal drinking water standards.</p>
            )}
            {riskLevel === 'low_risk' && (
              <p><strong>Low Risk:</strong> This system has resolved past violations but currently meets all safety standards. The water is safe to drink.</p>
            )}
            {riskLevel === 'medium_risk' && (
              <p><strong>Medium Risk:</strong> This system has current non-health-based violations (like reporting or monitoring issues). The water is generally safe but requires attention.</p>
            )}
            {riskLevel === 'high_risk' && (
              <p><strong>High Risk:</strong> This system has health-based violations that may affect water safety. Follow public notices and contact your water system.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-md shadow-sm p-6 border border-brand-cream-200 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-gray-600" />
              System Information
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <p className="text-sm text-gray-900">{getSystemTypeLabel(system.pws_type_code)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Water Source:</span>
                <p className="text-sm text-gray-900">{getSourceTypeLabel(system.primary_source_code)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">People Served:</span>
                <p className="text-sm text-gray-900">{system.population_served_count?.toLocaleString() || 'Unknown'}</p>
              </div>
              {system.owner_type_code && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Owner Type:</span>
                  <p className="text-sm text-gray-900">{system.owner_type_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-md shadow-sm p-6 border border-brand-cream-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-600" />
              Contact Information
            </h2>
            <div className="space-y-4">
              {system.admin_name && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Administrator:</span>
                  <p className="text-sm text-gray-900">{system.admin_name}</p>
                </div>
              )}
              {system.phone_number && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <p className="text-sm text-gray-900">
                    <a href={`tel:${system.phone_number}`} className="text-primary-600 hover:text-primary-800 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {system.phone_number}
                    </a>
                  </p>
                </div>
              )}
              {system.email_addr && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-sm text-gray-900">
                    <a href={`mailto:${system.email_addr}`} className="text-primary-600 hover:text-primary-800 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {system.email_addr}
                    </a>
                  </p>
                </div>
              )}
              {system.address_line1 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <p className="text-sm text-gray-900">
                    {system.address_line1}<br/>
                    {system.city_name}, {system.state_code} {system.zip_code}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Violations Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-md shadow-sm p-6 border border-brand-cream-200">
            <ViolationTimeline violations={violations} maxItems={20} />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-primary-50 rounded-sm p-6 border border-primary-100">
        <h3 className="text-base font-semibold text-primary-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Need More Information?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-primary-900 mb-2">Contact Your Water System</h4>
            <p className="text-sm text-primary-800">
              For detailed water quality reports and specific questions about your water, contact the system directly using the information above.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-primary-900 mb-2">Report Concerns</h4>
            <p className="text-sm text-primary-800">
              For water quality concerns or violations, contact Georgia Environmental Protection Division at{' '}
              <a 
                href="tel:404-656-4713" 
                className="font-medium underline hover:text-primary-900"
              >
                (404) 656-4713
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}