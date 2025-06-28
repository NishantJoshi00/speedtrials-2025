import React from 'react';
import { Users, MapPin, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { SystemCardProps } from '@/types/water-system';
import SystemStatusBadge from './SystemStatusBadge';

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  onClick,
  className = '',
}) => {
  const healthBasedViolations = system.violations.filter(v => v.isHealthBased).length;
  const totalViolations = system.violations.length;
  const unaddressedViolations = system.violations.filter(
    v => v.status === 'Unaddressed'
  ).length;

  const formatPopulation = (population: number): string => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K`;
    }
    return population.toString();
  };

  const formatSystemType = (type: string): string => {
    const typeMap = {
      'CWS': 'Community Water System',
      'NCWS': 'Non-Community Water System',
      'TNCWS': 'Transient Non-Community Water System',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(system);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 
        hover:border-blue-300 hover:shadow-md transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${system.name} water system` : undefined}
    >
      {/* Header with system name and status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {system.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            System #{system.systemNumber} • {formatSystemType(system.systemType)}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <SystemStatusBadge
            riskLevel={system.riskLevel}
            violationCount={totalViolations}
            healthBasedViolations={healthBasedViolations}
            size="sm"
          />
        </div>
      </div>

      {/* Key information grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{system.county} County</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Users className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
          <span>Serves {formatPopulation(system.populationServed)} people</span>
        </div>

        {system.lastInspectionDate && (
          <div className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <span>
              Last inspected: {new Date(system.lastInspectionDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Violation summary - only show if violations exist */}
      {totalViolations > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {healthBasedViolations > 0 && (
                <AlertTriangle 
                  className="w-4 h-4 text-red-500 flex-shrink-0" 
                  aria-hidden="true"
                />
              )}
              <span className="text-sm font-medium text-gray-900">
                {totalViolations} violation{totalViolations === 1 ? '' : 's'}
                {healthBasedViolations > 0 && (
                  <span className="text-red-600 ml-1">
                    ({healthBasedViolations} health-based)
                  </span>
                )}
              </span>
            </div>
            
            {unaddressedViolations > 0 && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {unaddressedViolations} unaddressed
              </span>
            )}
          </div>

          {healthBasedViolations > 0 && (
            <p className="text-xs text-red-700 mt-2">
              This system has health-based violations that may affect water safety.
            </p>
          )}
        </div>
      )}

      {/* Service area summary */}
      {system.serviceArea && system.serviceArea.cities.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Serves:</span>{' '}
            {system.serviceArea.cities.slice(0, 3).join(', ')}
            {system.serviceArea.cities.length > 3 && 
              ` and ${system.serviceArea.cities.length - 3} more areas`
            }
          </p>
        </div>
      )}

      {/* Click indicator */}
      {onClick && (
        <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-200">
          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
            View Details
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </span>
        </div>
      )}
    </div>
  );
};

export default SystemCard;