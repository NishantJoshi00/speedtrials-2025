'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  RefreshCw
} from 'lucide-react';
import { getQuickStats } from '@/lib/supabase';
import type { QuickStat } from '@/types/water-system';

interface QuickStatsProps {
  className?: string;
  layout?: 'grid' | 'horizontal' | 'vertical';
  showTrends?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

interface StatCardProps {
  stat: QuickStat;
  isLoading?: boolean;
}

function StatCard({ stat, isLoading = false }: StatCardProps) {
  const getStatusIcon = () => {
    switch (stat.status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-success-500" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" aria-hidden="true" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-danger-500" aria-hidden="true" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-400" aria-hidden="true" />;
    }
  };

  const getTrendIcon = () => {
    if (!stat.trend) return null;
    
    switch (stat.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-500" aria-hidden="true" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-danger-500" aria-hidden="true" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-400" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (stat.trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = () => {
    switch (stat.status) {
      case 'good':
        return 'border-success-200 bg-success-50';
      case 'warning':
        return 'border-warning-200 bg-warning-50';
      case 'error':
        return 'border-danger-200 bg-danger-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded mb-1"></div>
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`card p-6 border-2 ${getStatusColor()} transition-colors`}>
      <div className="flex items-center justify-between mb-2">
        {getStatusIcon()}
        {getTrendIcon()}
      </div>
      
      <div className="mb-1">
        <p 
          className="text-2xl font-bold text-gray-900"
          aria-label={`${stat.label}: ${stat.value}`}
        >
          {stat.value.toLocaleString()}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          {stat.label}
        </p>
        
        {stat.trend_value !== undefined && (
          <p className={`text-xs ${getTrendColor()} flex items-center space-x-1`}>
            <span>{stat.trend_value > 0 ? '+' : ''}{stat.trend_value}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function QuickStats({
  className = "",
  layout = 'grid',
  autoRefresh = false,
  refreshInterval = 300 // 5 minutes
}: QuickStatsProps) {
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStats = async () => {
    try {
      setError(null);
      
      const data = await getQuickStats();
      
      // Transform the data into QuickStat format
      const transformedStats: QuickStat[] = [
        {
          label: 'Total Water Systems',
          value: data.totalSystems,
          status: 'good',
          trend: 'stable'
        },
        {
          label: 'Systems in Compliance',
          value: data.systemsInCompliance,
          status: data.systemsInCompliance / data.totalSystems > 0.9 ? 'good' : 'warning',
          trend: 'up'
        },
        {
          label: 'Active Violations',
          value: data.activeViolations,
          status: data.activeViolations === 0 ? 'good' : data.activeViolations > 50 ? 'error' : 'warning',
          trend: 'down'
        },
        {
          label: 'Recent Updates',
          value: data.recentUpdates,
          status: 'good',
          trend: 'stable'
        }
      ];
      
      setStats(transformedStats);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error loading quick stats:', err);
      
      // Set fallback stats
      setStats([
        { label: 'Total Water Systems', value: 'N/A', status: 'error' },
        { label: 'Systems in Compliance', value: 'N/A', status: 'error' },
        { label: 'Active Violations', value: 'N/A', status: 'error' },
        { label: 'Recent Updates', value: 'N/A', status: 'error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'vertical':
        return 'space-y-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadStats();
  };

  if (error && !stats.length) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-danger-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Statistics</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-danger-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-danger-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Statistics</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {autoRefresh && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Activity className="w-3 h-3" aria-hidden="true" />
              <span>Auto-refresh every {Math.floor(refreshInterval / 60)}m</span>
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 disabled:opacity-50"
            aria-label="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className={getLayoutClasses()}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            stat={stat}
            isLoading={loading}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning-600" aria-hidden="true" />
            <p className="text-sm text-warning-700">
              Some statistics may be outdated: {error}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {loading 
          ? 'Loading statistics...'
          : `Statistics updated. ${stats.length} metrics available.`
        }
      </div>

      {/* Additional context for screen readers */}
      <div className="sr-only">
        <h3>Statistics Summary</h3>
        <ul>
          {stats.map((stat, index) => (
            <li key={index}>
              {stat.label}: {stat.value}
              {stat.trend && `, trending ${stat.trend}`}
              {stat.status && `, status: ${stat.status}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}