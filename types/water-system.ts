// Core water system types that match our Supabase schema
export type RiskLevel = 'no_violations' | 'low_risk' | 'medium_risk' | 'high_risk';
export type ViolationStatus = 'Resolved' | 'Addressed' | 'Unaddressed' | 'Archived';
export type SystemType = 'CWS' | 'NTNCWS' | 'TNCWS';
export type SourceType = 'GW' | 'SW' | 'GWP' | 'SWP' | 'GU' | 'GUP';

export interface WaterSystem {
  pwsid: string;
  pws_name: string;
  primary_city: string | null;
  primary_county: string | null;
  population_served_count: number | null;
  pws_type_code: SystemType | null;
  primary_source_code: SourceType | null;
  phone_number: string | null;
  email_addr: string | null;
  admin_name: string | null;
  address_line1: string | null;
  city_name: string | null;
  state_code: string | null;
  zip_code: string | null;
  risk_level: RiskLevel;
  current_violations: number;
  total_violations: number;
  health_violations: number;
  is_active: boolean;
}

export interface WaterSystemViolation {
  violation_id: string;
  violation_code: string | null;
  violation_category_code: string | null;
  is_health_based_ind: boolean | null;
  contaminant_code: string | null;
  non_compl_per_begin_date: string | null;
  non_compl_per_end_date: string | null;
  violation_status: ViolationStatus | null;
  public_notification_tier: number | null;
  rule_code: string | null;
  rule_family_code: string | null;
}

export interface WaterSystemContact {
  admin_name: string | null;
  phone_number: string | null;
  email_addr: string | null;
  address_line1: string | null;
  city_name: string | null;
  state_code: string | null;
  zip_code: string | null;
}

export interface SearchResult {
  pwsid: string;
  pws_name: string;
  primary_city: string | null;
  primary_county: string | null;
  population_served_count: number | null;
  risk_level: RiskLevel;
  current_violations: number;
}

export interface QuickStats {
  totalSystems: number;
  systemsWithViolations: number;
  cleanSystems: number;
  lastUpdated: string;
}

export interface PopularLocation {
  name: string;
  type: 'city' | 'county';
  count: number;
}

export interface SystemTypeCount {
  type: string;
  code: SystemType;
  count: number;
}

export interface GeographicArea {
  pwsid: string;
  area_type_code: 'CN' | 'CT' | 'ZC' | 'TR' | 'IR';
  city_served: string | null;
  county_served: string | null;
  zip_code_served: string | null;
  state_served: string | null;
}

// Component prop interfaces
export interface SystemStatusBadgeProps {
  riskLevel: RiskLevel;
  currentViolations: number;
  healthViolations: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export interface SystemCardProps {
  system: WaterSystem;
  onClick?: (system: WaterSystem) => void;
  showDetails?: boolean;
}

export interface SystemDetailsProps {
  system: WaterSystem;
  violations: WaterSystemViolation[];
  onClose?: () => void;
}

export interface ViolationExplainerProps {
  violations: WaterSystemViolation[];
  systemName: string;
  expanded?: boolean;
  onToggle?: () => void;
}

export interface ContactInfoProps {
  contact: WaterSystemContact;
  emergencyMode?: boolean;
  systemName?: string;
}

export interface SmartSearchProps {
  onResults?: (results: SearchResult[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export interface PopularLocationsProps {
  onLocationSelect?: (location: string, type: 'city' | 'county') => void;
  cities: PopularLocation[];
  counties: PopularLocation[];
}

export interface SystemTypePickerProps {
  selectedTypes: SystemType[];
  onSelectionChange: (types: SystemType[]) => void;
  layout?: 'grid' | 'horizontal' | 'vertical';
}

export interface QuickStatsProps {
  stats: QuickStats;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

// Hook return types
export interface UseSystemTypeFilterReturn {
  selectedTypes: SystemType[];
  setSelectedTypes: (types: SystemType[]) => void;
  isTypeSelected: (type: SystemType) => boolean;
  toggleType: (type: SystemType) => void;
  selectAll: () => void;
  clearAll: () => void;
  hasFilters: boolean;
}

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  search: (term: string) => Promise<void>;
  clearResults: () => void;
}

// API response types
export interface SystemDetailsResponse {
  system: WaterSystem;
  violations: WaterSystemViolation[];
  geographic_areas: GeographicArea[];
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

// Error types
export interface WaterSystemError {
  code: string;
  message: string;
  details?: any;
}

// Utility types for risk assessment
export interface RiskAssessment {
  level: RiskLevel;
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ViolationSummary {
  total: number;
  health_based: number;
  current: number;
  resolved: number;
  categories: Record<string, number>;
}