// Export all components for easy importing
export { default as SystemStatusBadge } from './SystemStatusBadge'
export { default as SystemCard } from './SystemCard'
export { default as SystemDetails } from './SystemDetails'
export { default as ViolationExplainer } from './ViolationExplainer'
export { ViolationTimeline } from './ViolationTimeline'
export { default as ContactInfo } from './ContactInfo'
export { default as PopularLocations } from './PopularLocations'
export { default as SystemTypePicker } from './SystemTypePicker'
export { default as QuickStats } from './QuickStats'
export { default as RecentActivity } from './RecentActivity'

// Export types
export type {
  SystemStatusBadgeProps,
  SystemCardProps,
  SystemDetailsProps,
  ViolationExplainerProps,
  ContactInfoProps,
  PopularLocationsProps,
  SystemTypePickerProps,
  QuickStatsProps,
  WaterSystem,
  WaterSystemViolation,
  SearchResult,
  RiskLevel,
  ViolationStatus
} from '../types/water-system'