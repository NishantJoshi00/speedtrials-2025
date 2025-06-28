// Core water quality data types based on EPA SDWIS schema

export interface WaterSystem {
  id: string;
  name: string;
  pwsid: string; // Public Water System ID
  type: WaterSystemType;
  population: number;
  counties: string[];
  primarySource: WaterSourceType;
  status: SystemStatus;
  lastInspection?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Violation {
  id: string;
  pwsid: string;
  systemName: string;
  violationType: ViolationType;
  contaminant: string;
  level?: number;
  maxLevel?: number;
  unit?: string;
  severity: ViolationSeverity;
  dateFound: Date;
  dateResolved?: Date;
  status: ViolationStatus;
  enforcement?: EnforcementAction[];
  description: string;
  healthEffects?: string;
  requiresPublicNotice: boolean;
  geography: {
    county: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface Facility {
  id: string;
  pwsid: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  location: {
    address: string;
    city: string;
    county: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  capacity?: number;
  installDate?: Date;
  lastServiceDate?: Date;
}

export interface TestResult {
  id: string;
  pwsid: string;
  facilityId?: string;
  contaminant: string;
  value: number;
  unit: string;
  sampleDate: Date;
  maxAllowedLevel?: number;
  isCompliant: boolean;
  testMethod?: string;
  laboratory?: string;
  sampleLocation?: string;
}

export interface EnforcementAction {
  id: string;
  violationId: string;
  type: EnforcementType;
  description: string;
  dateIssued: Date;
  dueDate?: Date;
  dateCompleted?: Date;
  penalty?: number;
  status: EnforcementStatus;
}

// Enums and Union Types

export type WaterSystemType = 
  | 'community'
  | 'non-transient-non-community'
  | 'transient-non-community';

export type WaterSourceType = 
  | 'ground_water'
  | 'surface_water'
  | 'ground_water_under_influence'
  | 'mixed';

export type SystemStatus = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'deactivated';

export type ViolationType = 
  | 'maximum_contaminant_level'
  | 'treatment_technique'
  | 'monitoring_reporting'
  | 'public_notification'
  | 'other';

export type ViolationSeverity = 
  | 'critical'
  | 'serious'
  | 'moderate'
  | 'minor';

export type ViolationStatus = 
  | 'open'
  | 'resolved'
  | 'under_review'
  | 'pending_enforcement';

export type FacilityType = 
  | 'intake'
  | 'treatment_plant'
  | 'distribution_system'
  | 'storage_tank'
  | 'well'
  | 'other';

export type FacilityStatus = 
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'decommissioned';

export type EnforcementType = 
  | 'notice_of_violation'
  | 'administrative_order'
  | 'civil_penalty'
  | 'criminal_referral'
  | 'emergency_order';

export type EnforcementStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'dismissed';

// Dashboard and UI specific types

export interface DashboardMetrics {
  totalSystems: number;
  activeSystems: number;
  totalViolations: number;
  activeViolations: number;
  complianceRate: number;
  criticalViolations: number;
  populationServed: number;
  lastUpdated: Date;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface GeographicData {
  county: string;
  systemCount: number;
  violationCount: number;
  populationServed: number;
  complianceRate: number;
  latitude: number;
  longitude: number;
}

export interface FilterOptions {
  counties?: string[];
  systemTypes?: WaterSystemType[];
  violationTypes?: ViolationType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  severities?: ViolationSeverity[];
  complianceStatus?: ('compliant' | 'non-compliant')[];
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: Date;
}

// Component prop types

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

// Accessibility types

export interface A11yAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  role?: string;
  tabIndex?: number;
}

// Form types

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Chart and visualization types

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  data: ChartDataPoint[];
  options: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    title?: string;
    showLegend?: boolean;
    showTooltip?: boolean;
    colors?: string[];
    height?: number;
    width?: number;
  };
}

export interface MapConfig {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  markers?: MapMarker[];
  layers?: MapLayer[];
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  content?: string;
  type: 'system' | 'violation' | 'facility';
  severity?: ViolationSeverity;
  popup?: boolean;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  data: GeoJSON.FeatureCollection;
  style?: Record<string, any>;
}

// Configuration and settings

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    enableDarkMode: boolean;
    enableNotifications: boolean;
    enableGeolocation: boolean;
    enableExport: boolean;
  };
  defaults: {
    pageSize: number;
    refreshInterval: number;
    mapZoom: number;
    mapCenter: [number, number];
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    critical: boolean;
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
}