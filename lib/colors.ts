/**
 * Centralized color management for Georgia Water Quality Dashboard
 * Based on the official logo colors and brand guidelines
 */

export const colors = {
  // Brand colors from logo
  brand: {
    cream: {
      bg: 'bg-brand-cream-200',      // Main background
      bgLight: 'bg-brand-cream-50',   // Header/footer background
      bgCard: 'bg-brand-cream-100',   // Card background alternative
      border: 'border-brand-cream-300',
      text: 'text-brand-cream-800',
    },
    navy: {
      bg: 'bg-brand-navy-500',
      text: 'text-brand-navy-500',
      textLight: 'text-brand-navy-600',
      textDark: 'text-brand-navy-800',
      border: 'border-brand-navy-500',
      hover: 'hover:text-brand-navy-800',
    }
  },
  
  // Primary colors (mapped to brand navy)
  primary: {
    bg: 'bg-primary-500',
    bgLight: 'bg-primary-50',
    text: 'text-primary-600',
    textDark: 'text-primary-800',
    textLight: 'text-primary-900',
    border: 'border-primary-200',
    borderDark: 'border-primary-500',
    hover: 'hover:text-primary-800',
    hoverBg: 'hover:bg-primary-700',
    focus: 'focus:ring-primary-500 focus:border-primary-500',
  },

  // Water safety status colors
  safe: {
    bg: 'bg-safe-50',
    text: 'text-safe-700',
    border: 'border-safe-200',
    icon: 'text-safe-500',
  },
  
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
    icon: 'text-warning-500',
  },
  
  danger: {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-200',
    icon: 'text-danger-500',
  },

  // UI colors
  card: {
    bg: 'bg-white',
    border: 'border-brand-cream-300',
    shadow: 'shadow-sm',
    hover: 'hover:shadow-md',
  },

  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
  }
} as const

export type ColorTheme = typeof colors

/**
 * Get consistent color classes for different component states
 */
export const getStatusColors = (riskLevel: string) => {
  switch (riskLevel) {
    case 'no_violations':
      return colors.safe
    case 'low_risk':
      return colors.safe
    case 'medium_risk':
      return colors.warning
    case 'high_risk':
      return colors.danger
    default:
      return colors.warning
  }
}

/**
 * Get consistent button color classes
 */
export const getButtonColors = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  switch (variant) {
    case 'primary':
      return `${colors.primary.bg} text-white ${colors.primary.hoverBg} ${colors.primary.focus}`
    case 'secondary':
      return `bg-gray-100 ${colors.text.primary} hover:bg-gray-200 ${colors.primary.focus}`
    case 'outline':
      return `bg-white ${colors.primary.text} ${colors.primary.border} hover:bg-gray-50 ${colors.primary.focus}`
    default:
      return `${colors.primary.bg} text-white ${colors.primary.hoverBg} ${colors.primary.focus}`
  }
}