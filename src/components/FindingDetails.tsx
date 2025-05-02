import React from 'react';
// Removed unused icons: AlertTriangle, Clock, CheckCircle
import { X, FileText } from 'lucide-react'; // Keep X, add FileText for generic icon
// Removed unused import: Finding type
// Removed unused import: format from date-fns

// Define the structure for a single recommendation
interface Recommendation {
  control_id: string;
  recommendation: string;
}

// Update the props interface
interface RecommendationDetailsProps { // Renamed interface
  recommendation: Recommendation; // Changed prop name and type
  onClose: () => void;
}

// Rename the component function for clarity
export const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({ recommendation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Added padding */}
      {/* Increased max-width slightly, adjusted max-height */}
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            {/* Display Control ID as the title */}
            <div className="flex items-center">
               <FileText className="h-6 w-6 mr-2 text-blue-600" /> {/* Generic Icon */}
               <h2 className="text-xl font-semibold text-gray-800">Recommendation for: {recommendation.control_id}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close details" // Added aria-label for accessibility
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Removed severity/status/date block */}
          {/* <div className="flex items-center space-x-4"> ... </div> */}

          <div className="space-y-6">
            {/* Removed Description section (recommendation text serves this purpose) */}
            {/* <div> ... </div> */}

            {/* Removed CMMC Control section (already in title) */}
            {/* <div> ... </div> */}

            {/* Removed 3PAO Assessment section */}
            {/* <div> ... </div> */}

            {/* Display the Recommendation Text */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Generated Recommendation</h3>
              <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none"> {/* Added prose for better text formatting */}
                 <p className="text-gray-800">{recommendation.recommendation}</p>
              </div>
            </div>

            {/* Removed hardcoded Remediation Steps section */}
            {/* <div> ... </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

// It's recommended to rename the file to RecommendationDetails.tsx as well.