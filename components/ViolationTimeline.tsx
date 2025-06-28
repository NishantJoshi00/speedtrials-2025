'use client'

import { AlertTriangle, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface Violation {
  violation_id: string
  non_compl_per_begin_date: string | null
  non_compl_per_end_date: string | null
  violation_code: string | null
  violation_category_code: string | null
  is_health_based_ind: boolean | null
  contaminant_code: string | null
  violation_status: string | null
  public_notification_tier: number | null
}

interface ViolationTimelineProps {
  violations: Violation[]
  maxItems?: number
}

export function ViolationTimeline({ violations, maxItems = 20 }: ViolationTimelineProps) {
  // Sort violations by start date (most recent first)
  const sortedViolations = violations
    .filter(v => v.non_compl_per_begin_date) // Only show violations with dates
    .sort((a, b) => {
      const dateA = new Date(a.non_compl_per_begin_date!).getTime()
      const dateB = new Date(b.non_compl_per_begin_date!).getTime()
      return dateB - dateA // Most recent first
    })
    .slice(0, maxItems)

  if (sortedViolations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-base font-medium text-gray-900">No Violations Found</p>
        <p className="text-sm text-gray-600">This system has a clean compliance record.</p>
      </div>
    )
  }

  const getStatusIcon = (status: string | null, isHealthBased: boolean | null) => {
    const iconClass = "h-5 w-5"
    
    if (isHealthBased) {
      switch (status) {
        case 'Resolved':
          return <CheckCircle className={`${iconClass} text-green-600`} />
        case 'Addressed':
          return <AlertCircle className={`${iconClass} text-yellow-600`} />
        case 'Unaddressed':
          return <XCircle className={`${iconClass} text-red-600`} />
        default:
          return <AlertTriangle className={`${iconClass} text-red-500`} />
      }
    } else {
      switch (status) {
        case 'Resolved':
          return <CheckCircle className={`${iconClass} text-green-600`} />
        case 'Addressed':
          return <Clock className={`${iconClass} text-yellow-600`} />
        case 'Unaddressed':
          return <AlertTriangle className={`${iconClass} text-orange-600`} />
        default:
          return <AlertCircle className={`${iconClass} text-gray-500`} />
      }
    }
  }

  const getStatusColor = (status: string | null, isHealthBased: boolean | null) => {
    if (isHealthBased) {
      switch (status) {
        case 'Resolved':
          return 'border-green-200 bg-green-50'
        case 'Addressed':
          return 'border-yellow-200 bg-yellow-50'
        case 'Unaddressed':
          return 'border-red-200 bg-red-50'
        default:
          return 'border-red-200 bg-red-50'
      }
    } else {
      switch (status) {
        case 'Resolved':
          return 'border-green-200 bg-green-50'
        case 'Addressed':
          return 'border-yellow-200 bg-yellow-50'
        case 'Unaddressed':
          return 'border-orange-200 bg-orange-50'
        default:
          return 'border-gray-200 bg-gray-50'
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months !== 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-gray-600" />
        Violation Timeline
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({sortedViolations.length} of {violations.length} violations shown)
        </span>
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {sortedViolations.map((violation, index) => (
            <div key={violation.violation_id || index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-md">
                {getStatusIcon(violation.violation_status, violation.is_health_based_ind)}
              </div>
              
              {/* Content */}
              <div className="ml-4 flex-1">
                <div className={`p-4 rounded-sm border ${getStatusColor(violation.violation_status, violation.is_health_based_ind)}`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {violation.violation_category_code || 'Violation'}
                      </h4>
                      {violation.is_health_based_ind && (
                        <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Health-Based
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-sm font-medium ${
                      violation.violation_status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      violation.violation_status === 'Addressed' ? 'bg-yellow-100 text-yellow-800' :
                      violation.violation_status === 'Unaddressed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {violation.violation_status || 'Unknown Status'}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Started:</span>
                      <span className="ml-1">
                        {formatDate(violation.non_compl_per_begin_date!)}
                      </span>
                      {violation.non_compl_per_end_date && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Ended:</span>
                          <span className="ml-1">
                            {formatDate(violation.non_compl_per_end_date)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">
                        {calculateDuration(violation.non_compl_per_begin_date!, violation.non_compl_per_end_date)}
                        {!violation.non_compl_per_end_date && ' (ongoing)'}
                      </span>
                    </div>
                    
                    {violation.contaminant_code && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Contaminant:</span>
                        <span className="ml-1">{violation.contaminant_code}</span>
                      </div>
                    )}
                    
                    {violation.violation_code && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Violation Code:</span>
                        <span className="ml-1">{violation.violation_code}</span>
                      </div>
                    )}
                    
                    {violation.public_notification_tier && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Public Notice Tier:</span>
                        <span className="ml-1">{violation.public_notification_tier}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {violations.length > maxItems && (
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {maxItems} of {violations.length} total violations
          </p>
        </div>
      )}
    </div>
  )
}