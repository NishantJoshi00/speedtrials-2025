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
          bgColor: 'bg-safe-500',
          textColor: 'text-white',
          icon: CheckCircle,
          description: 'No current violations'
        }
      case 'low_risk':
        return {
          text: 'Low Risk',
          bgColor: 'bg-warning-500',
          textColor: 'text-white',
          icon: AlertCircle,
          description: 'Minor violations present'
        }
      case 'medium_risk':
        return {
          text: 'Medium Risk',
          bgColor: 'bg-warning-600',
          textColor: 'text-white',
          icon: AlertTriangle,
          description: 'Multiple violations present'
        }
      case 'high_risk':
        return {
          text: 'High Risk',
          bgColor: 'bg-danger-500',
          textColor: 'text-white',
          icon: XCircle,
          description: 'Health-based violations present'
        }
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
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
          container: 'px-4 py-2 text-lg',
          icon: 'h-6 w-6',
          text: 'text-lg'
        }
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'h-4 w-4',
          text: 'text-sm'
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
    <div className="inline-flex items-center space-x-1">
      <span
        className={`
          inline-flex items-center rounded-full font-medium
          ${config.bgColor} ${config.textColor} ${sizeClasses.container}
        `}
        aria-label={screenReaderText}
        role="status"
      >
        <Icon className={`${sizeClasses.icon} mr-1.5`} aria-hidden="true" />
        <span className={sizeClasses.text}>{config.text}</span>
      </span>
      
      {showCount && currentViolations > 0 && (
        <span className={`${sizeClasses.text} text-gray-600 ml-2`}>
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