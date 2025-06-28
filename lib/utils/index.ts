import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * This helps avoid conflicts and ensures the last class wins
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with proper locale support and abbreviations
 */
export function formatNumber(
  value: number,
  options: {
    style?: 'decimal' | 'currency' | 'percent';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
    locale?: string;
  } = {}
): string {
  const {
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    currency = 'USD',
    notation = 'standard',
    locale = 'en-US',
  } = options;

  return new Intl.NumberFormat(locale, {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
    currency: style === 'currency' ? currency : undefined,
    notation,
  }).format(value);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompactNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format dates with various options and locale support
 */
export function formatDate(
  date: Date | string | number,
  options: {
    style?: 'full' | 'long' | 'medium' | 'short';
    includeTime?: boolean;
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    locale?: string;
    timeZone?: string;
  } = {}
): string {
  const {
    style = 'medium',
    includeTime = false,
    timeStyle = 'short',
    locale = 'en-US',
    timeZone = 'America/New_York', // Georgia timezone
  } = options;

  const dateObj = new Date(date);

  if (includeTime) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: style,
      timeStyle,
      timeZone,
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: style,
    timeZone,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: {
    locale?: string;
    numeric?: 'always' | 'auto';
  } = {}
): string {
  const { locale = 'en-US', numeric = 'auto' } = options;
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric });
  
  const units: Array<[string, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ];
  
  for (const [unit, duration] of units) {
    if (Math.abs(diffInMs) >= duration) {
      return rtf.format(Math.round(diffInMs / duration), unit as Intl.RelativeTimeFormatUnit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone an object (simple implementation for basic use cases)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    Object.keys(obj).forEach(key => {
      (clonedObj as any)[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
}

/**
 * Generate a random ID
 */
export function generateId(prefix = '', length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${result}` : result;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert camelCase or PascalCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case or snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Remove empty values from an object
 */
export function removeEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (!isEmpty(value)) {
      result[key as keyof T] = value;
    }
  });
  
  return result;
}

/**
 * Group array items by a key
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple criteria
 */
export function sortBy<T>(
  array: T[],
  ...criteria: Array<keyof T | ((item: T) => any)>
): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      let aValue: any;
      let bValue: any;
      
      if (typeof criterion === 'function') {
        aValue = criterion(a);
        bValue = criterion(b);
      } else {
        aValue = a[criterion];
        bValue = b[criterion];
      }
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
    }
    return 0;
  });
}

/**
 * Calculate percentage with proper rounding
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals = 1
): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two numbers
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get browser info for analytics and debugging
 */
export function getBrowserInfo() {
  if (!isBrowser()) return null;
  
  const { userAgent } = navigator;
  const isChrome = userAgent.includes('Chrome');
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !isChrome;
  const isEdge = userAgent.includes('Edge');
  
  return {
    userAgent,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
  };
}

/**
 * Download data as a file
 */
export function downloadFile(
  data: string | Blob,
  filename: string,
  mimeType = 'text/plain'
): void {
  if (!isBrowser()) return;
  
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch {
    return false;
  }
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoffFactor?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoffFactor = 2,
    maxDelay = 10000,
  } = options;
  
  let lastError: any;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === retries) {
        throw lastError;
      }
      
      const currentDelay = Math.min(delay * Math.pow(backoffFactor, i), maxDelay);
      await sleep(currentDelay);
    }
  }
  
  throw lastError;
}