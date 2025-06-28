import React from 'react';
import { 
  X, 
  Users, 
  MapPin, 
  Calendar, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Building,
  Droplets 
} from 'lucide-react';
import { SystemDetailsProps } from '../types/water-system';
import SystemStatusBadge from './SystemStatusBadge';
import ContactInfo from './ContactInfo';
import ViolationExplainer from './ViolationExplainer';

export const SystemDetails: React.FC<SystemDetailsProps> = ({
  system,
  onClose,
  className = '',
}) => {
  const healthBasedViolations = system.violations.filter(v => v.isHealthBased).length;
  const totalViolations = system.violations.length;
  
  const violationsByStatus = {
    unaddressed: system.violations.filter(v => v.status === 'Unaddressed'),
    addressed: system.violations.filter(v => v.status === 'Addressed'),
    resolved: system.violations.filter(v => v.status === 'Resolved'),
    archived: system.violations.filter(v => v.status === 'Archived'),
  };

  const formatPopulation = (population: number): string => {
    return population.toLocaleString();
  };

  const formatSystemType = (type: string): string => {
    const typeMap = {
      'CWS': 'Community Water System',
      'NCWS': 'Non-Community Water System', 
      'TNCWS': 'Transient Non-Community Water System',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Addressed':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Unaddressed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Archived':
        return <Archive className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`bg-white ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {system.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              System #{system.systemNumber} • {formatSystemType(system.systemType)}
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close system details"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-4">
          <SystemStatusBadge
            riskLevel={system.riskLevel}
            violationCount={totalViolations}
            healthBasedViolations={healthBasedViolations}
            size="lg"
          />
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 space-y-8">
        {/* System Overview */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-sm text-gray-600">Population Served</span>
                  <p className="font-medium text-gray-900">{formatPopulation(system.populationServed)} people</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium text-gray-900">{system.county} County, {system.region}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-sm text-gray-600">Primary Water Source</span>
                  <p className="font-medium text-gray-900">{system.primarySourceType}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-sm text-gray-600">System Status</span>
                  <p className="font-medium text-gray-900">{system.status}</p>
                </div>
              </div>

              {system.lastInspectionDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-sm text-gray-600">Last Inspection</span>
                    <p className="font-medium text-gray-900">
                      {new Date(system.lastInspectionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Area */}
          {system.serviceArea && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Service Area</h3>
              {system.serviceArea.cities.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Cities/Areas: </span>
                  <span className="text-sm text-gray-900">{system.serviceArea.cities.join(', ')}</span>
                </div>
              )}
              {system.serviceArea.counties.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Counties: </span>
                  <span className="text-sm text-gray-900">{system.serviceArea.counties.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Health-Based Violations Alert */}
        {healthBasedViolations > 0 && (
          <section>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Health-Based Violations Detected
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    This water system has {healthBasedViolations} violation{healthBasedViolations === 1 ? '' : 's'} that may affect your health. 
                    These violations require immediate attention and monitoring.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Violations Section */}
        {totalViolations > 0 ? (
          <section>
            <ViolationExplainer 
              violations={system.violations}
              explanations={[]} // Would be populated from a database
              showHealthImpactFirst={true}
            />
          </section>
        ) : (
          <section>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" aria-hidden="true" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    No Active Violations
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    This water system is currently meeting all federal and state drinking water standards.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Information */}
        <section>
          <ContactInfo 
            contact={system.contact}
            systemName={system.name}
            emergencyMode={healthBasedViolations > 0}
          />
        </section>

        {/* Additional Actions */}
        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What You Can Do</h2>
          <div className="space-y-3">
            {healthBasedViolations > 0 ? (
              <>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Follow any boil water notices or drinking water advisories. 
                    Contact the water system for current status and safety instructions.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Consider using bottled water or an appropriate water filter until violations are resolved.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  Your water system is meeting safety standards. Continue normal water use and stay informed 
                  about any future updates.
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>
                For the most up-to-date information about your water quality, contact your water system directly 
                or visit the Georgia Department of Public Health website.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SystemDetails;