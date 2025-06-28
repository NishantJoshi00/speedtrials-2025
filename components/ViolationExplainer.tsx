'use client'

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Info,
  Heart,
  Zap
} from 'lucide-react';
import { ViolationExplainerProps, WaterSystemViolation, ViolationExplanation } from '../types/water-system';

// Pre-defined explanations for common violation types (8th grade reading level)
const defaultExplanations: ViolationExplanation[] = [
  {
    violationType: 'MCL',
    plainLanguageDescription: 'A harmful substance was found above safe levels in your drinking water.',
    healthImpact: 'Drinking water with levels above the safe limit may cause health problems over time.',
    whatItMeans: 'The water system found too much of a chemical or bacteria that could make people sick.',
    whatToDoAboutIt: 'Follow any boil water notices. Consider using bottled water until the problem is fixed.',
    urgencyLevel: 'immediate',
    icon: 'heart'
  },
  {
    violationType: 'MRDL',
    plainLanguageDescription: 'Not enough disinfectant was used to kill germs in your water.',
    healthImpact: 'This could allow harmful bacteria and viruses to grow in the water system.',
    whatItMeans: 'The water system needs to add more chlorine or other chemicals to keep water safe.',
    whatToDoAboutIt: 'Boil water before drinking if advised. Contact the water system for updates.',
    urgencyLevel: 'immediate',
    icon: 'heart'
  },
  {
    violationType: 'TT',
    plainLanguageDescription: 'The water system did not follow required treatment steps to clean the water.',
    healthImpact: 'Without proper treatment, harmful substances may not be removed from your water.',
    whatItMeans: 'The water company must use specific methods to clean water. They missed some steps.',
    whatToDoAboutIt: 'Follow any safety notices from the water system. Ask when treatment will be fixed.',
    urgencyLevel: 'prompt',
    icon: 'zap'
  },
  {
    violationType: 'MONITORING',
    plainLanguageDescription: 'The water system did not test the water as often as required by law.',
    healthImpact: 'Without regular testing, problems with water quality might not be found quickly.',
    whatItMeans: 'Water must be tested regularly to make sure it stays safe. Some tests were missed.',
    whatToDoAboutIt: 'Ask the water system when testing will resume and request recent test results.',
    urgencyLevel: 'routine',
    icon: 'info'
  },
  {
    violationType: 'REPORTING',
    plainLanguageDescription: 'The water system did not report test results to the state on time.',
    healthImpact: 'This usually does not directly affect water safety, but delays important oversight.',
    whatItMeans: 'Water systems must share test results with health officials. This report was late.',
    whatToDoAboutIt: 'Continue normal water use. You can request recent test results from the water system.',
    urgencyLevel: 'routine',
    icon: 'info'
  }
];

export const ViolationExplainer: React.FC<ViolationExplainerProps> = ({
  violations,
  explanations = defaultExplanations,
  showHealthImpactFirst = true,
  className = '',
}) => {
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());

  const toggleExpanded = (violationId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
    }
    setExpandedViolations(newExpanded);
  };

  const getExplanation = (violation: WaterSystemViolation): ViolationExplanation => {
    // Find explanation by violation type, or return a generic one
    const found = explanations.find(exp => 
      violation.violationType.includes(exp.violationType) ||
      violation.violationCode.includes(exp.violationType)
    );
    
    return found || {
      violationType: 'GENERAL',
      plainLanguageDescription: 'A drinking water standard was not met.',
      healthImpact: 'This may affect the safety or quality of your drinking water.',
      whatItMeans: 'The water system did not meet a requirement set by health officials.',
      whatToDoAboutIt: 'Contact the water system for more information about this violation.',
      urgencyLevel: 'routine',
      icon: 'info'
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />;
      case 'Addressed':
        return <Clock className="w-4 h-4 text-yellow-600" aria-hidden="true" />;
      case 'Unaddressed':
        return <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />;
      case 'Archived':
        return <Archive className="w-4 h-4 text-gray-600" aria-hidden="true" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" aria-hidden="true" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'border-red-200 bg-red-50';
      case 'prompt':
        return 'border-orange-200 bg-orange-50';
      case 'routine':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getUrgencyTextColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'text-red-800';
      case 'prompt':
        return 'text-orange-800';
      case 'routine':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart className="w-5 h-5" aria-hidden="true" />;
      case 'zap':
        return <Zap className="w-5 h-5" aria-hidden="true" />;
      default:
        return <Info className="w-5 h-5" aria-hidden="true" />;
    }
  };

  // Sort violations: health-based first if requested, then by urgency
  const sortedViolations = [...violations].sort((a, b) => {
    if (showHealthImpactFirst) {
      if (a.isHealthBased && !b.isHealthBased) return -1;
      if (!a.isHealthBased && b.isHealthBased) return 1;
    }
    
    const aExp = getExplanation(a);
    const bExp = getExplanation(b);
    const urgencyOrder = { immediate: 0, prompt: 1, routine: 2 };
    return urgencyOrder[aExp.urgencyLevel] - urgencyOrder[bExp.urgencyLevel];
  });

  if (violations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Water Quality Violations Explained
        </h2>
        <span className="text-sm text-gray-600">
          {violations.length} violation{violations.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-3">
        {sortedViolations.map((violation) => {
          const explanation = getExplanation(violation);
          const isExpanded = expandedViolations.has(violation.id);
          const urgencyColors = getUrgencyColor(explanation.urgencyLevel);
          const urgencyTextColor = getUrgencyTextColor(explanation.urgencyLevel);

          return (
            <div
              key={violation.id}
              className={`border-2 rounded-lg ${urgencyColors}`}
            >
              {/* Violation Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpanded(violation.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpanded(violation.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                aria-controls={`violation-details-${violation.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Status and Health-based indicators */}
                    <div className="flex flex-col gap-1">
                      {getStatusIcon(violation.status)}
                      {violation.isHealthBased && (
                        <AlertTriangle className="w-4 h-4 text-red-600" aria-label="Health-based violation" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getIcon(explanation.icon)}
                        <h3 className={`font-medium ${urgencyTextColor}`}>
                          {explanation.plainLanguageDescription}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {violation.violationType} - {violation.violationCode}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span>Found: {new Date(violation.dateDiscovered).toLocaleDateString()}</span>
                        {violation.dateReturned && (
                          <span>Returned: {new Date(violation.dateReturned).toLocaleDateString()}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          violation.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          violation.status === 'Addressed' ? 'bg-yellow-100 text-yellow-800' :
                          violation.status === 'Unaddressed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {violation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div
                  id={`violation-details-${violation.id}`}
                  className="px-4 pb-4 border-t border-gray-200"
                >
                  <div className="pt-4 space-y-4">
                    {/* Health Impact */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Health Impact</h4>
                      <p className="text-sm text-gray-700">{explanation.healthImpact}</p>
                    </div>

                    {/* What It Means */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">What This Means</h4>
                      <p className="text-sm text-gray-700">{explanation.whatItMeans}</p>
                    </div>

                    {/* What To Do */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">What You Should Do</h4>
                      <p className="text-sm text-gray-700">{explanation.whatToDoAboutIt}</p>
                    </div>

                    {/* Technical Details */}
                    {violation.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
                        <p className="text-sm text-gray-600">{violation.description}</p>
                      </div>
                    )}

                    {/* Enforcement Actions */}
                    {violation.enforcementAction && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Enforcement Actions</h4>
                        <p className="text-sm text-gray-600">{violation.enforcementAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Understanding Water Quality Violations</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Health-based violations</strong> may directly affect your safety and require immediate attention.</p>
          <p>• <strong>Monitoring violations</strong> mean required tests were missed, but don't necessarily indicate unsafe water.</p>
          <p>• <strong>Reporting violations</strong> are paperwork issues that usually don't affect water safety.</p>
          <p>• When in doubt, contact your water system directly for the most current information.</p>
        </div>
      </div>
    </div>
  );
};

export default ViolationExplainer;