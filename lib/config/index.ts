import type { AppConfig } from '@/types';

/**
 * Application configuration with environment-specific settings
 */
export const config: AppConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds
    retries: 3,
  },
  features: {
    enableDarkMode: true,
    enableNotifications: true,
    enableGeolocation: true,
    enableExport: true,
  },
  defaults: {
    pageSize: 20,
    refreshInterval: 300000, // 5 minutes
    mapZoom: 7,
    mapCenter: [32.1656, -82.9001], // Center of Georgia
  },
};

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const;

/**
 * Georgia-specific configuration
 */
export const georgiaConfig = {
  // Georgia state boundaries (approximate)
  bounds: {
    north: 35.0,
    south: 30.36,
    east: -80.84,
    west: -85.61,
  },
  // Major cities in Georgia
  cities: [
    { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
    { name: 'Augusta', lat: 33.4734, lng: -82.0105 },
    { name: 'Columbus', lat: 32.4609, lng: -84.9877 },
    { name: 'Savannah', lat: 32.0835, lng: -81.0998 },
    { name: 'Athens', lat: 33.9519, lng: -83.3576 },
    { name: 'Sandy Springs', lat: 33.9304, lng: -84.3733 },
    { name: 'Roswell', lat: 34.0232, lng: -84.3616 },
    { name: 'Johns Creek', lat: 34.0289, lng: -84.1986 },
    { name: 'Albany', lat: 31.5785, lng: -84.1557 },
    { name: 'Warner Robins', lat: 32.6130, lng: -83.6241 },
  ],
  // Georgia counties (159 total)
  counties: [
    'Appling', 'Atkinson', 'Bacon', 'Baker', 'Baldwin', 'Banks', 'Barrow', 'Bartow',
    'Ben Hill', 'Berrien', 'Bibb', 'Bleckley', 'Brantley', 'Brooks', 'Bryan', 'Bulloch',
    'Burke', 'Butts', 'Calhoun', 'Camden', 'Candler', 'Carroll', 'Catoosa', 'Charlton',
    'Chatham', 'Chattahoochee', 'Chattooga', 'Cherokee', 'Clarke', 'Clay', 'Clayton',
    'Clinch', 'Cobb', 'Coffee', 'Colquitt', 'Columbia', 'Cook', 'Coweta', 'Crawford',
    'Crisp', 'Dade', 'Dawson', 'Decatur', 'DeKalb', 'Dodge', 'Dooly', 'Dougherty',
    'Douglas', 'Early', 'Echols', 'Effingham', 'Elbert', 'Emanuel', 'Evans', 'Fannin',
    'Fayette', 'Floyd', 'Forsyth', 'Franklin', 'Fulton', 'Gilmer', 'Glascock', 'Glynn',
    'Gordon', 'Grady', 'Greene', 'Gwinnett', 'Habersham', 'Hall', 'Hancock', 'Haralson',
    'Harris', 'Hart', 'Heard', 'Henry', 'Houston', 'Irwin', 'Jackson', 'Jasper',
    'Jeff Davis', 'Jefferson', 'Jenkins', 'Johnson', 'Jones', 'Lamar', 'Lanier',
    'Laurens', 'Lee', 'Liberty', 'Lincoln', 'Long', 'Lowndes', 'Lumpkin', 'Macon',
    'Madison', 'Marion', 'McDuffie', 'McIntosh', 'Meriwether', 'Miller', 'Mitchell',
    'Monroe', 'Montgomery', 'Morgan', 'Murray', 'Muscogee', 'Newton', 'Oconee',
    'Oglethorpe', 'Paulding', 'Peach', 'Pickens', 'Pierce', 'Pike', 'Polk', 'Pulaski',
    'Putnam', 'Quitman', 'Rabun', 'Randolph', 'Richmond', 'Rockdale', 'Schley',
    'Screven', 'Seminole', 'Spalding', 'Stephens', 'Stewart', 'Sumter', 'Talbot',
    'Taliaferro', 'Tattnall', 'Taylor', 'Telfair', 'Terrell', 'Thomas', 'Tift',
    'Toombs', 'Towns', 'Treutlen', 'Troup', 'Turner', 'Twiggs', 'Union', 'Upson',
    'Walker', 'Walton', 'Ware', 'Warren', 'Washington', 'Wayne', 'Webster', 'Wheeler',
    'White', 'Whitfield', 'Wilcox', 'Wilkes', 'Wilkinson', 'Worth',
  ],
} as const;

/**
 * Water quality standards and thresholds
 */
export const waterQualityStandards = {
  // EPA Maximum Contaminant Levels (MCLs) for common contaminants
  mcl: {
    // Inorganic chemicals (mg/L)
    arsenic: 0.010,
    barium: 2.0,
    cadmium: 0.005,
    chromium: 0.1,
    copper: 1.3, // Action Level
    fluoride: 4.0,
    lead: 0.015, // Action Level
    mercury: 0.002,
    nitrate: 10.0,
    nitrite: 1.0,
    selenium: 0.05,
    
    // Organic chemicals (mg/L)
    benzene: 0.005,
    carbonTetrachloride: 0.005,
    trichloroethylene: 0.005,
    
    // Disinfection byproducts (mg/L)
    totalTrihalomethanes: 0.080,
    haloaceticAcids: 0.060,
    
    // Radionuclides (pCi/L)
    grossAlpha: 15,
    grossBeta: 4,
    radium226And228: 5,
    uranium: 30,
  },
  
  // Water quality rating thresholds
  qualityThresholds: {
    excellent: 0.9, // 90%+ compliance
    good: 0.8,      // 80-89% compliance
    fair: 0.7,      // 70-79% compliance
    poor: 0.6,      // 60-69% compliance
    critical: 0,    // <60% compliance
  },
  
  // Violation severity levels
  severityLevels: {
    critical: {
      healthRisk: 'immediate',
      publicNoticeRequired: true,
      enforcementAction: 'immediate',
    },
    serious: {
      healthRisk: 'acute',
      publicNoticeRequired: true,
      enforcementAction: 'within_30_days',
    },
    moderate: {
      healthRisk: 'chronic',
      publicNoticeRequired: true,
      enforcementAction: 'within_90_days',
    },
    minor: {
      healthRisk: 'minimal',
      publicNoticeRequired: false,
      enforcementAction: 'administrative',
    },
  },
} as const;

/**
 * Chart and visualization configuration
 */
export const chartConfig = {
  colors: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    water: {
      excellent: '#22c55e',
      good: '#84cc16',
      fair: '#eab308',
      poor: '#f97316',
      critical: '#ef4444',
    },
  },
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
      },
    },
  },
} as const;

/**
 * Accessibility configuration
 */
export const a11yConfig = {
  // Screen reader announcements
  announcements: {
    dataLoaded: 'Data has been loaded',
    dataError: 'Error loading data. Please try again.',
    filterApplied: 'Filters have been applied',
    sortChanged: 'Sort order has been changed',
  },
  
  // Focus management
  focus: {
    skipToMainDelay: 150,
    trapFocusDelay: 100,
  },
  
  // Color contrast ratios (WCAG AA)
  contrast: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0, // WCAG AAA
  },
} as const;

/**
 * Development and debugging configuration
 */
export const devConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  enableDebugMode: process.env.NEXT_PUBLIC_DEBUG === 'true',
  enablePerformanceMetrics: process.env.NEXT_PUBLIC_PERFORMANCE === 'true',
  
  // Mock data settings
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  mockDataDelay: 1000, // 1 second
  
  // Feature flags
  featureFlags: {
    enableBetaFeatures: process.env.NEXT_PUBLIC_BETA_FEATURES === 'true',
    enableExperimentalUI: process.env.NEXT_PUBLIC_EXPERIMENTAL_UI === 'true',
  },
} as const;

/**
 * Performance monitoring configuration
 */
export const performanceConfig = {
  // Core Web Vitals thresholds
  thresholds: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
    ttfb: 800, // Time to First Byte (ms)
  },
  
  // Performance budgets
  budgets: {
    bundle: 250000, // 250KB
    image: 500000,  // 500KB
    font: 100000,   // 100KB
  },
} as const;

/**
 * Export all configurations
 */
export const appConfig = {
  ...config,
  supabase: supabaseConfig,
  georgia: georgiaConfig,
  waterQuality: waterQualityStandards,
  charts: chartConfig,
  a11y: a11yConfig,
  dev: devConfig,
  performance: performanceConfig,
} as const;

export default appConfig;