'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Shield, FileText, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { RecentActivityItem } from '@/types/water-system';

interface RecentActivityProps {
  onSystemSelect?: (pwsid: string, systemName: string) => void;
  className?: string;
  maxItems?: number;
  showRefresh?: boolean;
  filterDays?: number;
}

interface ActivityItemProps {
  item: RecentActivityItem;
  onSystemSelect?: (pwsid: string, systemName: string) => void;
}

function ActivityItem({ item, onSystemSelect }: ActivityItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'violation':
        return <AlertTriangle className="w-4 h-4" aria-hidden="true" />;
      case 'enforcement':
        return <Shield className="w-4 h-4" aria-hidden="true" />;
      case 'system_update':
        return <FileText className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'violation':
        return 'Violation';
      case 'enforcement':
        return 'Enforcement';
      case 'system_update':
        return 'System Update';
      default:
        return 'Activity';
    }
  };

  const getStatusColor = () => {
    switch (item.type) {
      case 'violation':
        return item.severity === 'High' 
          ? 'text-danger-600 bg-danger-50' 
          : item.severity === 'Medium'
          ? 'text-warning-600 bg-warning-50'
          : 'text-gray-600 bg-gray-50';
      case 'enforcement':
        return 'text-primary-600 bg-primary-50';
      case 'system_update':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSystemClick = () => {
    if (onSystemSelect) {
      onSystemSelect(item.pwsid, item.system_name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSystemSelect) {
      e.preventDefault();
      handleSystemClick();
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-1 rounded-full ${getStatusColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {getTypeLabel()}
            </span>
            {item.severity && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                item.severity === 'High' 
                  ? 'bg-danger-100 text-danger-800'
                  : item.severity === 'Medium'
                  ? 'bg-warning-100 text-warning-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.severity}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-900 mb-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSystemClick}
              onKeyDown={handleKeyDown}
              className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none focus:underline flex items-center space-x-1"
              aria-label={`View details for ${item.system_name}`}
            >
              <span className="truncate max-w-[200px]">{item.system_name}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            </button>
            
            <time 
              dateTime={item.date}
              className="text-xs text-gray-500"
              title={new Date(item.date).toLocaleString()}
            >
              {formatDate(item.date)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecentActivity({
  onSystemSelect,
  className = "",
  maxItems = 10,
  showRefresh = true,
  filterDays = 30
}: RecentActivityProps) {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filterDays);

      // Get recent violations
      const { data: violations, error: violationsError } = await supabase
        .from('violations')
        .select(`
          id,
          pwsid,
          violation_type,
          violation_category,
          severity,
          compl_per_begin_date,
          description
        `)
        .gte('compl_per_begin_date', cutoffDate.toISOString())
        .order('compl_per_begin_date', { ascending: false })
        .limit(maxItems);

      // Get system names separately to avoid complex joins
      let systemNames: Record<string, string> = {};
      if (violations && violations.length > 0) {
        const pwsids = Array.from(new Set(violations.map(v => v.pwsid)));
        const { data: systems } = await supabase
          .from('water_systems')
          .select('pwsid, system_name')
          .in('pwsid', pwsids);
        
        if (systems) {
          systemNames = systems.reduce((acc, system) => {
            acc[system.pwsid] = system.system_name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      if (violationsError) {
        throw new Error(`Error loading violations: ${violationsError.message}`);
      }

      // Transform violations to activity items
      const violationActivities: RecentActivityItem[] = (violations || []).map(violation => ({
        id: violation.id,
        type: 'violation',
        system_name: systemNames[violation.pwsid] || 'Unknown System',
        pwsid: violation.pwsid,
        description: violation.description || `${violation.violation_type} violation`,
        date: violation.compl_per_begin_date,
        severity: violation.severity as RecentActivityItem['severity']
      }));

      // Get recent system updates (if you have a system updates table)
      // For now, we'll simulate this with recent violations
      const recentUpdates: RecentActivityItem[] = [];

      // Combine and sort all activities
      const allActivities = [...violationActivities, ...recentUpdates]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, maxItems);

      setActivities(allActivities);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent activity';
      setError(errorMessage);
      console.error('Error loading recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivity();
  }, [maxItems, filterDays]);

  const handleRefresh = () => {
    loadRecentActivity();
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
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
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 disabled:opacity-50"
            aria-label="Refresh recent activity"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-500 text-sm">
            No recent activity in the last {filterDays} days
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              item={activity}
              onSystemSelect={onSystemSelect}
            />
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {loading 
          ? 'Loading recent activity...'
          : `Showing ${activities.length} recent activity item${activities.length === 1 ? '' : 's'}`
        }
      </div>
    </div>
  );
}