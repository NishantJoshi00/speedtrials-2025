# Georgia Water Quality Dashboard Components

A collection of React/TypeScript components for building a public water system search and information dashboard.

## Features

- **Mobile-first design** with Tailwind CSS
- **Accessibility focused** (WCAG 2.1 compliant)
- **3-action rule** (max 3 clicks to any information)
- **Progressive enhancement** (works without JS)
- **TypeScript** with proper interfaces
- **Supabase integration** for data fetching

## Components

### 1. SmartSearch

Main search component with autocomplete functionality.

```tsx
import { SmartSearch } from '@/components';

function App() {
  const handleResults = (results, query) => {
    console.log('Search results:', results);
  };

  return (
    <SmartSearch
      onResults={handleResults}
      onLoading={(loading) => console.log('Loading:', loading)}
      onError={(error) => console.log('Error:', error)}
      placeholder="Search water systems..."
      filters={{ systemType: ['Community'] }}
    />
  );
}
```

**Props:**
- `onResults`: Callback for search results
- `onLoading`: Callback for loading state
- `onError`: Callback for error state
- `placeholder`: Input placeholder text
- `filters`: Search filters to apply
- `className`: Additional CSS classes

**Features:**
- Real-time autocomplete with 300ms debounce
- Keyboard navigation (arrow keys, enter, escape)
- Screen reader support
- Search suggestions for systems, cities, counties

### 2. PopularLocations

Displays clickable popular cities and counties.

```tsx
import { PopularLocations } from '@/components';

function App() {
  const handleLocationSelect = (location, type) => {
    console.log(`Selected ${type}: ${location}`);
  };

  return (
    <PopularLocations
      onLocationSelect={handleLocationSelect}
      maxItems={10}
      showCities={true}
      showCounties={true}
    />
  );
}
```

**Props:**
- `onLocationSelect`: Callback when location is clicked
- `maxItems`: Maximum number of locations to show
- `showCities`: Whether to show cities tab
- `showCounties`: Whether to show counties tab
- `className`: Additional CSS classes

**Features:**
- Tabbed interface for cities vs counties
- System count display for each location
- Loading and error states
- Keyboard navigation support

### 3. SystemTypePicker

Filter component for water system types.

```tsx
import { SystemTypePicker, useSystemTypeFilter } from '@/components';

function App() {
  const { selectedTypes, setSelectedTypes, updateFilters } = useSystemTypeFilter();

  return (
    <SystemTypePicker
      selectedTypes={selectedTypes}
      onSelectionChange={setSelectedTypes}
      layout="grid"
      showCounts={false}
    />
  );
}
```

**Props:**
- `selectedTypes`: Array of selected system types
- `onSelectionChange`: Callback when selection changes
- `layout`: Layout style ('grid', 'horizontal', 'vertical')
- `showCounts`: Whether to show system counts
- `disabled`: Whether component is disabled
- `className`: Additional CSS classes

**Features:**
- Visual icons for each system type
- Select all/deselect all functionality
- Keyboard navigation
- Screen reader announcements

### 4. RecentActivity

Shows recent water system violations and updates.

```tsx
import { RecentActivity } from '@/components';

function App() {
  const handleSystemSelect = (pwsid, systemName) => {
    // Navigate to system details
    router.push(`/systems/${pwsid}`);
  };

  return (
    <RecentActivity
      onSystemSelect={handleSystemSelect}
      maxItems={10}
      showRefresh={true}
      filterDays={30}
    />
  );
}
```

**Props:**
- `onSystemSelect`: Callback when system is clicked
- `maxItems`: Maximum number of items to show
- `showRefresh`: Whether to show refresh button
- `filterDays`: Number of days to look back
- `className`: Additional CSS classes

**Features:**
- Real-time loading from Supabase
- Categorized activity types (violation, enforcement, system update)
- Severity indicators
- Relative time formatting
- Manual refresh capability

### 5. QuickStats

Dashboard component showing key statistics.

```tsx
import { QuickStats } from '@/components';

function App() {
  return (
    <QuickStats
      layout="grid"
      showTrends={true}
      autoRefresh={true}
      refreshInterval={300}
    />
  );
}
```

**Props:**
- `layout`: Layout style ('grid', 'horizontal', 'vertical')
- `showTrends`: Whether to show trend indicators
- `autoRefresh`: Whether to auto-refresh data
- `refreshInterval`: Refresh interval in seconds
- `className`: Additional CSS classes

**Features:**
- Real-time statistics from Supabase
- Status indicators (good, warning, error)
- Trend visualization
- Auto-refresh capability
- Loading and error states

## Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js lucide-react clsx
```

### 2. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Schema

Ensure your Supabase database has these tables:

```sql
-- Water systems table
CREATE TABLE water_systems (
  pwsid TEXT PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_type TEXT,
  population_served INTEGER,
  city_served TEXT,
  county_served TEXT,
  compliance_status TEXT,
  is_active BOOLEAN DEFAULT true,
  last_update_date TIMESTAMPTZ
);

-- Violations table
CREATE TABLE violations (
  id TEXT PRIMARY KEY,
  pwsid TEXT REFERENCES water_systems(pwsid),
  violation_type TEXT,
  severity TEXT,
  compl_per_begin_date TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT false,
  description TEXT
);
```

### 4. Usage Example

```tsx
import React, { useState } from 'react';
import {
  SmartSearch,
  PopularLocations,
  SystemTypePicker,
  RecentActivity,
  QuickStats,
  useSystemTypeFilter
} from '@/components';

export default function Dashboard() {
  const [searchResults, setSearchResults] = useState([]);
  const systemTypeFilter = useSystemTypeFilter();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Overview */}
      <QuickStats className="mb-8" />
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <SmartSearch
            onResults={setSearchResults}
            onLoading={(loading) => console.log(loading)}
            onError={(error) => console.log(error)}
            filters={systemTypeFilter.updateFilters({})}
          />
          
          {/* Filters */}
          <SystemTypePicker
            selectedTypes={systemTypeFilter.selectedTypes}
            onSelectionChange={systemTypeFilter.setSelectedTypes}
          />
          
          {/* Results would go here */}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <PopularLocations
            onLocationSelect={(location, type) => {
              console.log('Location selected:', location, type);
            }}
          />
          
          <RecentActivity
            onSystemSelect={(pwsid, name) => {
              console.log('System selected:', pwsid, name);
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

## Accessibility Features

All components include:

- **Semantic HTML** with proper ARIA labels
- **Keyboard navigation** support
- **Screen reader** announcements
- **Focus management** and visible focus indicators
- **Color contrast** meeting WCAG standards
- **Skip links** for main navigation
- **Progressive enhancement** (works without JavaScript)

## Mobile Responsiveness

- **Mobile-first** design approach
- **Touch-friendly** interactive elements (44px minimum)
- **Responsive breakpoints** using Tailwind CSS
- **Collapsible filters** on mobile
- **Optimized layouts** for different screen sizes

## Performance

- **Debounced search** (300ms) to reduce API calls
- **Lazy loading** of autocomplete suggestions
- **Optimized queries** with proper indexing
- **Memoized components** where appropriate
- **Progressive loading** with skeleton states

## Testing

Components can be tested with:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartSearch } from '@/components';

test('search functionality', async () => {
  const onResults = jest.fn();
  
  render(
    <SmartSearch
      onResults={onResults}
      onLoading={() => {}}
      onError={() => {}}
    />
  );
  
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'Atlanta' } });
  
  await waitFor(() => {
    expect(onResults).toHaveBeenCalled();
  });
});
```

## Browser Support

- **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+)
- **Progressive enhancement** for older browsers
- **Polyfills** included for essential features
- **Graceful degradation** when JavaScript is disabled

## License

MIT License - see LICENSE file for details.