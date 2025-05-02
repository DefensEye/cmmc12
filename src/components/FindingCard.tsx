import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Finding } from '../types';

const severityColors = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-blue-100 text-blue-800'
};

const statusIcons = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle
};

interface FindingCardProps {
  finding: Finding;
  onClick: (finding: Finding) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, onClick }) => {
  const SeverityIcon = finding.severity === 'CRITICAL' ? AlertTriangle : AlertCircle;
  const StatusIcon = statusIcons[finding.status];

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(finding)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <SeverityIcon className={`w-5 h-5 ${finding.severity === 'CRITICAL' ? 'text-red-600' : 'text-gray-600'} mr-2`} />
          <h3 className="text-lg font-semibold text-gray-900">{finding.title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColors[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-2">{finding.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium mr-2">CMMC Control:</span>
          {finding.cmmcControl}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <StatusIcon className="w-4 h-4 mr-1" />
          {finding.status}
        </div>
        <span className="text-gray-400">
          {format(new Date(finding.discoveredAt), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};

import { FileText } from 'lucide-react'; // Using a generic icon

// Define a new interface for the props, matching the recommendation structure
interface Recommendation {
  control_id: string;
  recommendation: string;
}

interface RecommendationCardProps { // Renamed interface for clarity
  recommendation: Recommendation; // Changed prop name and type
  onClick?: (recommendation: Recommendation) => void; // Optional onClick
}

// Renamed component function for clarity (optional but recommended)
// export const FindingCard: React.FC<FindingCardProps> = ({ finding, onClick }) => {
export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onClick }) => { // Changed function signature
  // Removed SeverityIcon and StatusIcon logic

  // Determine if onClick handler is provided to set cursor style
  const hasClickHandler = !!onClick;
  const cardClasses = `bg-white rounded-lg shadow-md p-6 transition-shadow ${hasClickHandler ? 'hover:shadow-lg cursor-pointer' : ''}`;


  return (
    <div
      className={cardClasses} // Use dynamic classes
      onClick={() => onClick?.(recommendation)} // Call onClick if provided
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-600 mr-2" /> {/* Generic Icon */}
          {/* Display Control ID as the main identifier */}
          <h3 className="text-lg font-semibold text-gray-900">{recommendation.control_id}</h3>
        </div>
        {/* Removed Severity Badge */}
      </div>

      <div className="mb-4">
         {/* Display Recommendation text as the description */}
        <p className="text-gray-600 text-sm mb-2">{recommendation.recommendation}</p>
        {/* Removed CMMC Control line (already shown in title) */}
      </div>

      {/* Removed Status and Date footer */}
    </div>
  );
};

// It's recommended to rename the file to RecommendationCard.tsx as well.