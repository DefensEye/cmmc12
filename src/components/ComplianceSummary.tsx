import React from 'react';
// Keep Shield, AlertCircle. Remove ChevronRight, BarChart3 if not used. Add ListChecks, FileText.
import { Shield, AlertCircle, ListChecks, FileText } from 'lucide-react';
// Remove ComplianceSummaryType import
// import { ComplianceSummary as ComplianceSummaryType } from '../types';
// Remove date-fns import if lastUpdated is removed
// import { format } from 'date-fns';
// Import the RAG analysis result type (assuming it's defined/exported elsewhere or define it here)
interface AnalysisResult {
  summary?: string;
  non_compliant_controls?: string[];
  recommendations?: { control_id: string; recommendation: string }[];
  error?: string;
  detail?: string;
}

// Update props interface
interface RagAnalysisSummaryProps { // Renamed interface
  analysisResult: AnalysisResult | null; // Changed prop name and type
  // Optional: Add a prop for when the analysis was run if needed
  // analysisTimestamp?: Date | string;
}

// Rename component function
export const RagAnalysisSummary: React.FC<RagAnalysisSummaryProps> = ({ analysisResult }) => {

  // Handle null analysisResult case
  if (!analysisResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Analysis results are not yet available.
      </div>
    );
  }

  // Handle potential errors from the backend analysis
  if (analysisResult.error || analysisResult.detail) {
     return (
       <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 text-center text-red-700">
         <AlertCircle className="h-6 w-6 mx-auto mb-2" />
         <p className="font-semibold">Analysis Failed</p>
         <p className="text-sm">{analysisResult.error || analysisResult.detail}</p>
       </div>
     );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-indigo-600" />
          {/* Update title */}
          <h2 className="text-2xl font-bold text-gray-900 ml-2">RAG Compliance Analysis</h2>
        </div>
        {/* Remove last updated timestamp */}
        {/* <span className="text-sm text-gray-500"> ... </span> */}
      </div>

      {/* --- REMOVE Overall Score and Domain Scores Grid --- */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> ... </div> */}

      {/* --- ADD Section for RAG Summary --- */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
           <FileText className="h-5 w-5 mr-2 text-indigo-600" />
           AI-Generated Summary
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
           <p className="text-gray-700 text-sm">{analysisResult.summary || 'No summary provided.'}</p>
        </div>
      </div>

      {/* --- ADD Section for Non-Compliant Controls --- */}
      <div className="mb-8">
         <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Identified Non-Compliant Controls ({analysisResult.non_compliant_controls?.length || 0})
         </h3>
         {analysisResult.non_compliant_controls && analysisResult.non_compliant_controls.length > 0 ? (
            <div className="bg-red-50 p-4 rounded-lg max-h-40 overflow-y-auto"> {/* Added scroll */}
               <ul className="list-disc list-inside space-y-1">
                  {analysisResult.non_compliant_controls.map((controlId) => (
                     <li key={controlId} className="text-red-800 text-sm font-mono">{controlId}</li>
                  ))}
               </ul>
            </div>
         ) : (
            <p className="text-gray-500 italic text-sm ml-7">No specific non-compliant controls identified.</p>
         )}
      </div>


      {/* --- UPDATE Recommendations Section --- */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
           <ListChecks className="h-5 w-5 mr-2 text-blue-600" />
           AI-Generated Recommendations ({analysisResult.recommendations?.length || 0})
        </h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2"> {/* Added scroll */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
             analysisResult.recommendations.map((rec, index) => (
               // Consider making this clickable to show RecommendationDetails modal
               <div key={index} className="flex items-start p-3 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                 {/* Icon can represent the control family or just be generic */}
                 {/* <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" /> */}
                 <div>
                    <span className="font-semibold text-blue-800 text-sm block font-mono">{rec.control_id}</span>
                    <span className="text-gray-700 text-sm mt-1 block">{rec.recommendation}</span>
                 </div>
               </div>
             ))
          ) : (
             <p className="text-gray-500 italic text-sm ml-7">No recommendations generated.</p>
          )}
        </div>
      </div>

      {/* --- REMOVE Detailed Report Button --- */}
      {/* <div className="mt-6 flex justify-end"> ... </div> */}
    </div>
  );
};