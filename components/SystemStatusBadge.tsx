import React from 'react'
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import type { SystemStatusBadgeProps, RiskLevel } from '@/types/water-system'

export default function SystemStatusBadge({ 
  riskLevel, 
  currentViolations, 
  healthViolations,
  size = 'md',
  showCount = true 
}: SystemStatusBadgeProps) {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'no_violations':
        return {
          text: 'Safe',
          bgColor: 'bg-safe-50',
          textColor: 'text-safe-700',
          borderColor: 'border-safe-200',
          icon: CheckCircle,
          description: 'No current violations'
        }
      case 'low_risk':
        return {
          text: 'Low Risk',
          bgColor: 'bg-warning-50',
          textColor: 'text-warning-700',
          borderColor: 'border-warning-200',
          icon: AlertCircle,
          description: 'Minor violations present'
        }
      case 'medium_risk':
        return {
          text: 'Medium Risk',
          bgColor: 'bg-warning-50',
          textColor: 'text-warning-800',
          borderColor: 'border-warning-300',
          icon: AlertTriangle,
          description: 'Multiple violations present'
        }
      case 'high_risk':
        return {
          text: 'High Risk',
          bgColor: 'bg-danger-50',
          textColor: 'text-danger-700',
          borderColor: 'border-danger-200',
          icon: XCircle,
          description: 'Health-based violations present'
        }
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
          description: 'Status unknown'
        }
    }
  }

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          text: 'text-xs'
        }
      case 'lg':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'h-4 w-4',
          text: 'text-sm'
        }
      default:
        return {
          container: 'px-2.5 py-1 text-xs',
          icon: 'h-3.5 w-3.5',
          text: 'text-xs'
        }
    }
  }

  const config = getRiskConfig(riskLevel)
  const sizeClasses = getSizeClasses(size)
  const Icon = config.icon

  // Screen reader text for accessibility
  const screenReaderText = `${config.text} status. ${config.description}. ${
    currentViolations > 0 
      ? `${currentViolations} current violation${currentViolations > 1 ? 's' : ''}` 
      : 'No current violations'
  }${
    healthViolations > 0 
      ? `, including ${healthViolations} health-based violation${healthViolations > 1 ? 's' : ''}` 
      : ''
  }.`

  return (
    <div className="inline-flex items-center space-x-2">
      <span
        className={`
          inline-flex items-center rounded border font-medium
          ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses.container}
        `}
        aria-label={screenReaderText}
        role="status"
      >
        <Icon className={`${sizeClasses.icon} mr-1`} aria-hidden="true" />
        <span className={sizeClasses.text}>{config.text}</span>
      </span>
      
      {showCount && currentViolations > 0 && (
        <span className={`${sizeClasses.text} text-gray-600`}>
          {currentViolations} issue{currentViolations > 1 ? 's' : ''}
          {healthViolations > 0 && (
            <span className="text-danger-600 font-medium ml-1">
              ({healthViolations} health-based)
            </span>
          )}
        </span>
      )}
    </div>
  )
}