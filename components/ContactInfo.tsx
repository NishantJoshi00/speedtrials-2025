import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { ContactInfoProps } from '@/types/water-system';

export const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  systemName,
  emergencyMode = false,
  className = '',
}) => {
  const [copiedItem, setCopiedItem] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatPhone = (phone: string): string => {
    // Remove non-digits and format as (XXX) XXX-XXXX
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const createMailtoLink = (email: string, subject: string): string => {
    const encodedSubject = encodeURIComponent(subject);
    return `mailto:${email}?subject=${encodedSubject}`;
  };

  const createMapsLink = (address: any): string => {
    if (!address) return '';
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    return `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
  };

  const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      aria-label={`Copy ${label}`}
    >
      {copiedItem === label ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Contact Information
        </h2>
        
        {emergencyMode && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  Health-based violations detected - Contact the water system immediately
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Emergency Contact (if available and emergency mode) */}
        {emergencyMode && contact.emergencyPhone && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              Emergency Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <a
                  href={`tel:${contact.emergencyPhone}`}
                  className="flex items-center gap-2 text-red-700 hover:text-red-900 font-medium"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{formatPhone(contact.emergencyPhone)}</span>
                </a>
                <CopyButton text={contact.emergencyPhone} label="emergency phone" />
              </div>
              <p className="text-xs text-red-600">
                Call this number for urgent water safety concerns
              </p>
            </div>
          </div>
        )}

        {/* Primary Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            {contact.name || systemName} Water System
          </h3>
          
          <div className="space-y-3">
            {/* Contact Person */}
            {contact.name && contact.title && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4" /> {/* Spacer for alignment */}
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.title}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {contact.phone && (
              <div className="flex items-center justify-between">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{formatPhone(contact.phone)}</span>
                </a>
                <CopyButton text={contact.phone} label="phone" />
              </div>
            )}

            {/* Email */}
            {contact.email && (
              <div className="flex items-center justify-between">
                <a
                  href={createMailtoLink(contact.email, `Water Quality Inquiry - ${systemName}`)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{contact.email}</span>
                </a>
                <CopyButton text={contact.email} label="email" />
              </div>
            )}

            {/* Address */}
            {contact.address && (
              <div className="flex items-start justify-between">
                <a
                  href={createMapsLink(contact.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-blue-600 hover:text-blue-800"
                >
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm">
                    <div>{contact.address.street}</div>
                    <div>{contact.address.city}, {contact.address.state} {contact.address.zipCode}</div>
                  </div>
                  <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" aria-hidden="true" />
                </a>
                <CopyButton 
                  text={`${contact.address.street}, ${contact.address.city}, ${contact.address.state} ${contact.address.zipCode}`} 
                  label="address" 
                />
              </div>
            )}

            {/* Website */}
            {contact.websiteUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={contact.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Visit Website</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Call Button */}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors
                  ${emergencyMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {emergencyMode ? 'Call Now' : 'Call Water System'}
              </a>
            )}

            {/* Email Button */}
            {contact.email && (
              <a
                href={createMailtoLink(
                  contact.email, 
                  emergencyMode 
                    ? `URGENT: Water Safety Concern - ${systemName}`
                    : `Water Quality Inquiry - ${systemName}`
                )}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Send Email
              </a>
            )}
          </div>

          {/* Best Times to Contact */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">When to Contact</p>
                <div className="text-blue-800 space-y-1">
                  {emergencyMode ? (
                    <>
                      <p>• <strong>Immediately</strong> if you have health concerns about your water</p>
                      <p>• During business hours for non-emergency questions</p>
                      <p>• Use emergency number for after-hours urgent issues</p>
                    </>
                  ) : (
                    <>
                      <p>• During regular business hours (typically 8 AM - 5 PM)</p>
                      <p>• For questions about water quality test results</p>
                      <p>• To report water quality concerns or taste/odor issues</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Need more help?</strong> You can also contact the Georgia Department of Public Health 
              or EPA's Safe Drinking Water Hotline at{' '}
              <a href="tel:8004264791" className="text-blue-600 hover:text-blue-800">
                (800) 426-4791
              </a>{' '}
              for additional information about water quality standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;