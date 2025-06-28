'use client';

import React, { useState } from 'react';
import { Filter, Building2, GraduationCap, Factory, Home, Bus, Check } from 'lucide-react';
import type { WaterSystem, SearchFilters } from '@/types/water-system';

interface SystemTypePickerProps {
  selectedTypes: WaterSystem['system_type'][];
  onSelectionChange: (types: WaterSystem['system_type'][]) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showCounts?: boolean;
  disabled?: boolean;
}

interface SystemTypeOption {
  value: WaterSystem['system_type'];
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  selectedColor: string;
}

const SYSTEM_TYPES: SystemTypeOption[] = [
  {
    value: 'Community',
    label: 'Community',
    description: 'Serves residential communities and general public',
    icon: <Home className="w-5 h-5" aria-hidden="true" />,
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-300',
    selectedColor: 'bg-blue-50 border-blue-500 text-blue-900'
  },
  {
    value: 'School',
    label: 'School',
    description: 'Serves educational institutions and schools',
    icon: <GraduationCap className="w-5 h-5" aria-hidden="true" />,
    color: 'text-green-600',
    hoverColor: 'hover:bg-green-50 hover:border-green-300',
    selectedColor: 'bg-green-50 border-green-500 text-green-900'
  },
  {
    value: 'Large',
    label: 'Large',
    description: 'Large-scale water systems serving many customers',
    icon: <Factory className="w-5 h-5" aria-hidden="true" />,
    color: 'text-purple-600',
    hoverColor: 'hover:bg-purple-50 hover:border-purple-300',
    selectedColor: 'bg-purple-50 border-purple-500 text-purple-900'
  },
  {
    value: 'NTNC',
    label: 'Non-Transient',
    description: 'Non-transient non-community systems (workplaces, etc.)',
    icon: <Building2 className="w-5 h-5" aria-hidden="true" />,
    color: 'text-orange-600',
    hoverColor: 'hover:bg-orange-50 hover:border-orange-300',
    selectedColor: 'bg-orange-50 border-orange-500 text-orange-900'
  },
  {
    value: 'Transient',
    label: 'Transient',
    description: 'Transient systems (rest stops, campgrounds, etc.)',
    icon: <Bus className="w-5 h-5" aria-hidden="true" />,
    color: 'text-gray-600',
    hoverColor: 'hover:bg-gray-50 hover:border-gray-300',
    selectedColor: 'bg-gray-50 border-gray-500 text-gray-900'
  }
];

export default function SystemTypePicker({
  selectedTypes,
  onSelectionChange,
  className = "",
  layout = 'grid',
  showCounts = false,
  disabled = false
}: SystemTypePickerProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleTypeToggle = (type: WaterSystem['system_type']) => {
    if (disabled) return;

    const newSelection = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    onSelectionChange(newSelection);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: WaterSystem['system_type'], index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTypeToggle(type);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = index < SYSTEM_TYPES.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : SYSTEM_TYPES.length - 1;
        setFocusedIndex(prevIndex);
        break;
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    if (selectedTypes.length === SYSTEM_TYPES.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(SYSTEM_TYPES.map(type => type.value));
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-2';
      case 'vertical':
        return 'space-y-2';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2';
    }
  };

  const isSelected = (type: WaterSystem['system_type']) => selectedTypes.includes(type);
  const allSelected = selectedTypes.length === SYSTEM_TYPES.length;
  const noneSelected = selectedTypes.length === 0;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900">
            System Types
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:underline"
            aria-label={allSelected ? 'Deselect all system types' : 'Select all system types'}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedTypes.length > 0 && (
            <span className="text-sm text-gray-500">
              ({selectedTypes.length} selected)
            </span>
          )}
        </div>
      </div>

      <fieldset className={getLayoutClasses()} disabled={disabled}>
        <legend className="sr-only">Choose water system types to filter by</legend>
        
        {SYSTEM_TYPES.map((systemType, index) => {
          const selected = isSelected(systemType.value);
          const focused = focusedIndex === index;
          
          return (
            <label
              key={systemType.value}
              className={`
                relative block p-4 border rounded-lg cursor-pointer transition-all duration-200
                ${selected 
                  ? systemType.selectedColor 
                  : `border-gray-200 ${systemType.hoverColor} hover:shadow-sm`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${focused ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
              `}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleTypeToggle(systemType.value)}
                onKeyDown={(e) => handleKeyDown(e, systemType.value, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                disabled={disabled}
                className="sr-only"
                aria-describedby={`${systemType.value}-description`}
              />
              
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${selected ? systemType.color : 'text-gray-400'} transition-colors`}>
                  {systemType.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                      {systemType.label}
                    </p>
                    {selected && (
                      <Check className="w-4 h-4 text-current" aria-hidden="true" />
                    )}
                  </div>
                  
                  <p 
                    id={`${systemType.value}-description`}
                    className="text-xs text-gray-500 mt-1"
                  >
                    {systemType.description}
                  </p>
                  
                  {showCounts && (
                    <p className="text-xs text-gray-400 mt-1">
                      Loading count...
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {selectedTypes.length === 0 
          ? 'No system types selected. All system types will be included in search.'
          : `${selectedTypes.length} system type${selectedTypes.length === 1 ? '' : 's'} selected: ${selectedTypes.join(', ')}`
        }
      </div>

      {/* Help text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Select one or more system types to filter search results. 
          Leave all unselected to include all types.
        </p>
      </div>
    </div>
  );
}

// Helper hook for using SystemTypePicker with SearchFilters
export function useSystemTypeFilter(initialTypes: WaterSystem['system_type'][] = []) {
  const [selectedTypes, setSelectedTypes] = useState<WaterSystem['system_type'][]>(initialTypes);

  const updateFilters = (filters: SearchFilters): SearchFilters => ({
    ...filters,
    systemType: selectedTypes.length > 0 ? selectedTypes : undefined
  });

  const reset = () => setSelectedTypes([]);

  return {
    selectedTypes,
    setSelectedTypes,
    updateFilters,
    reset
  };
}