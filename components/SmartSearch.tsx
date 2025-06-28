'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Building, Globe } from 'lucide-react';
import { searchWaterSystems, getAutocompleteSuggestions } from '@/lib/supabase';
import type { SearchResult, SearchFilters, AutocompleteOption } from '@/types/water-system';

interface SmartSearchProps {
  onResults: (results: SearchResult[], query: string) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  placeholder?: string;
  filters?: SearchFilters;
  className?: string;
}

interface UseDebounceReturn {
  debouncedValue: string;
  isDebouncing: boolean;
}

function useDebounce(value: string, delay: number): UseDebounceReturn {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue, isDebouncing };
}

export default function SmartSearch({
  onResults,
  onLoading,
  onError,
  placeholder = "Search water systems, cities, or counties...",
  filters = {},
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  const { debouncedValue: debouncedQuery, isDebouncing } = useDebounce(query, 300);

  // Load autocomplete suggestions
  const loadSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await getAutocompleteSuggestions(searchQuery, 8);
      const mappedSuggestions: AutocompleteOption[] = results.map(item => ({
        value: item.value,
        label: item.label,
        type: item.type,
        subtitle: item.type === 'system' ? 'Water System' : 
                 item.type === 'city' ? 'City' : 'County'
      }));
      setSuggestions(mappedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onResults([], '');
      return;
    }

    setIsSearching(true);
    onLoading(true);
    onError(null);

    try {
      const { data: results } = await searchWaterSystems(searchQuery, filters, 50);
      onResults(results, searchQuery);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      onError(errorMessage);
      onResults([], searchQuery);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  }, [filters, onResults, onLoading, onError]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: AutocompleteOption) => {
    setQuery(suggestion.label);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Focus back to input for accessibility
    inputRef.current?.focus();
    
    // Perform search
    performSearch(suggestion.label);
  }, [performSearch]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionSelect(suggestions[selectedIndex]);
    } else {
      setIsOpen(false);
      performSearch(query);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          setIsOpen(false);
          performSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onResults([], '');
    onError(null);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) return; // Only load when debouncing is complete
    loadSuggestions(debouncedQuery);
  }, [debouncedQuery, loadSuggestions, query]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const getTypeIcon = (type: AutocompleteOption['type']) => {
    switch (type) {
      case 'system':
        return <Building className="w-4 h-4" aria-hidden="true" />;
      case 'city':
        return <MapPin className="w-4 h-4" aria-hidden="true" />;
      case 'county':
        return <Globe className="w-4 h-4" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const showSuggestions = isOpen && suggestions.length > 0;
  const showLoading = isDebouncing || isSearching;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search 
              className={`h-5 w-5 transition-colors ${
                showLoading ? 'text-primary-500 animate-pulse' : 'text-gray-400'
              }`} 
              aria-hidden="true" 
            />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(suggestions.length > 0)}
            placeholder={placeholder}
            className="input pl-10 pr-10 text-base sm:text-sm"
            aria-label="Search water systems"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby="search-description"
            role="combobox"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </button>
          )}
        </div>

        <div id="search-description" className="sr-only">
          Use the search box to find water systems by name, city, or county. 
          Use arrow keys to navigate suggestions and Enter to select.
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul
            ref={suggestionsRef}
            role="listbox"
            aria-label="Search suggestions"
            className="py-1"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.value}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={`px-3 py-2 cursor-pointer flex items-center space-x-3 hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`flex-shrink-0 ${
                  index === selectedIndex ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.label}
                  </div>
                  {suggestion.subtitle && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.subtitle}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading indicator for screen readers */}
      {showLoading && (
        <div className="sr-only" role="status" aria-live="polite">
          Searching...
        </div>
      )}
    </div>
  );
}