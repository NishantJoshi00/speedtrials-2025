import React, { useState } from 'react';
import {
  SystemStatusBadge,
  SystemCard,
  SystemDetails,
  ViolationExplainer,
  ContactInfo,
  WaterSystem,
  WaterSystemViolation,
} from '../index';

// Sample data for demonstration
const sampleViolations: WaterSystemViolation[] = [
  {
    id: '1',
    violationType: 'MCL',
    violationCode: 'MCL-TOTAL_COLIFORM',
    description: 'Total coliform bacteria detected above maximum contaminant level',
    dateDiscovered: '2024-05-15',
    dateReturned: null,
    status: 'Unaddressed',
    isHealthBased: true,
    healthImpact: 'May cause gastrointestinal illness',
    publicNotification: true,
    enforcementAction: 'Mandatory monitoring increased',
  },
  {
    id: '2',
    violationType: 'MONITORING',
    violationCode: 'MON-ROUTINE_MAJOR',
    description: 'Failed to conduct required monthly monitoring for chlorine residual',
    dateDiscovered: '2024-04-20',
    dateReturned: '2024-05-01',
    status: 'Resolved',
    isHealthBased: false,
    publicNotification: false,
  },
];

const sampleWaterSystem: WaterSystem = {
  id: 'GA-001-2024',
  name: 'Downtown Atlanta Water Authority',
  systemNumber: 'GA0130001',
  systemType: 'CWS',
  status: 'Active',
  county: 'Fulton',
  region: 'Metro Atlanta',
  populationServed: 450000,
  primarySourceType: 'Surface Water - Chattahoochee River',
  riskLevel: 'high_risk',
  lastInspectionDate: '2024-04-15',
  violations: sampleViolations,
  contact: {
    name: 'Dr. Sarah Mitchell',
    title: 'Water Quality Manager',
    phone: '404-555-0123',
    email: 'sarah.mitchell@atlantawater.gov',
    address: {
      street: '1350 Spring St NW',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
    },
    emergencyPhone: '404-555-0911',
    websiteUrl: 'https://www.atlantawater.gov',
  },
  serviceArea: {
    cities: ['Atlanta', 'Sandy Springs', 'Dunwoody', 'Brookhaven'],
    counties: ['Fulton', 'DeKalb'],
  },
};

const sampleSafeSystem: WaterSystem = {
  ...sampleWaterSystem,
  id: 'GA-002-2024',
  name: 'Savannah Water & Sewer',
  systemNumber: 'GA0330001',
  county: 'Chatham',
  region: 'Coastal Georgia',
  populationServed: 150000,
  riskLevel: 'no_violations',
  violations: [],
  serviceArea: {
    cities: ['Savannah', 'Pooler', 'Tybee Island'],
    counties: ['Chatham'],
  },
};

export const SampleUsage: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<WaterSystem | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'details'>('cards');

  const systems = [sampleWaterSystem, sampleSafeSystem];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Georgia Water Quality Dashboard
          </h1>
          <p className="text-gray-600 readable-text">
            Find information about your local water system, including safety status, 
            violations, and contact details for water quality concerns.
          </p>
        </header>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'details'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Water Systems in Your Area
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {systems.map((system) => (
                  <SystemCard
                    key={system.id}
                    system={system}
                    onClick={(sys) => {
                      setSelectedSystem(sys);
                      setViewMode('details');
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Standalone Status Badge Examples */}
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Status Badge Examples
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">No Violations</h3>
                  <SystemStatusBadge
                    riskLevel="no_violations"
                    violationCount={0}
                    healthBasedViolations={0}
                  />
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Low Risk</h3>
                  <SystemStatusBadge
                    riskLevel="low_risk"
                    violationCount={2}
                    healthBasedViolations={0}
                  />
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Medium Risk</h3>
                  <SystemStatusBadge
                    riskLevel="medium_risk"
                    violationCount={3}
                    healthBasedViolations={1}
                  />
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">High Risk</h3>
                  <SystemStatusBadge
                    riskLevel="high_risk"
                    violationCount={5}
                    healthBasedViolations={3}
                  />
                </div>
              </div>
            </section>

            {/* Standalone Violation Explainer */}
            <section className="bg-white rounded-lg p-6">
              <ViolationExplainer
                violations={sampleViolations}
                explanations={[]}
                showHealthImpactFirst={true}
              />
            </section>

            {/* Standalone Contact Info */}
            <section className="bg-white rounded-lg p-6">
              <ContactInfo
                contact={sampleWaterSystem.contact}
                systemName={sampleWaterSystem.name}
                emergencyMode={true}
              />
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-lg">
            <SystemDetails
              system={selectedSystem || sampleWaterSystem}
              onClose={() => {
                setSelectedSystem(null);
                setViewMode('cards');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleUsage;