import React from 'react';
// Keep Shield, AlertCircle. Remove TrendingUp, AlertTriangle if not used. Add FileText, ListChecks.
import { Shield, AlertCircle, FileText, ListChecks } from 'lucide-react';
// Remove date-fns import if lastUpdated is removed
// import { format } from 'date-fns';
// Remove ComplianceAnalysis, RiskLevel imports
// import { ComplianceAnalysis, RiskLevel } from '../types';
// Remove PieChart related imports
// import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- ADD AnalysisResult type (or import it) ---
interface AnalysisResult {
  summary?: string;
  non_compliant_controls?: string[];
  recommendations?: { control_id: string; recommendation: string }[];
  error?: string;
  detail?: string;
}

// --- Update props interface ---
interface RagAnalysisOverviewProps { // Renamed interface
  analysisResult: AnalysisResult | null; // Changed prop name and type
  // Optional: Add timestamp if needed
  // analysisTimestamp?: Date | string;
}

// --- REMOVE riskLevelColors ---
// const riskLevelColors: Record<RiskLevel, { bg: string; text: string }> = { ... };

// --- Rename component function ---
export const RagAnalysisOverview: React.FC<RagAnalysisOverviewProps> = ({ analysisResult }) => {
  // --- REMOVE pieData and COLORS ---
  // const pieData = [ ... ];
  // const COLORS = ['#4F46E5', '#E5E7EB'];

  // Handle null analysisResult case
  if (!analysisResult) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
        Analysis overview is not yet available.
      </div>
    );
  }

  // Handle potential errors from the backend analysis
  if (analysisResult.error || analysisResult.detail) {
     return (
       <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6 text-center text-red-700">
         <AlertCircle className="h-6 w-6 mx-auto mb-2" />
         <p className="font-semibold">Analysis Failed</p>
         <p className="text-sm">{analysisResult.error || analysisResult.detail}</p>
       </div>
     );
  }


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-indigo-600" />
          {/* --- Update Title --- */}
          <h2 className="text-2xl font-bold text-gray-900 ml-2">RAG Analysis Overview</h2>
        </div>
        {/* --- REMOVE Last updated timestamp --- */}
        {/* <span className="text-sm text-gray-500"> ... </span> */}
      </div>

      {/* --- Simplified Layout: Removed Grid, Pie Chart, Score, Risk Level --- */}
      <div className="space-y-6">

        {/* --- ADD Summary Section --- */}
        <div>
           <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" />
              Analysis Summary
           </h3>
           <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{analysisResult.summary || 'No summary provided.'}</p>
        </div>


        {/* --- REPLACE Critical Gaps with Non-Compliant Controls --- */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            Identified Non-Compliant Controls ({analysisResult.non_compliant_controls?.length || 0})
          </h3>
          {analysisResult.non_compliant_controls && analysisResult.non_compliant_controls.length > 0 ? (
             <ul className="space-y-1 bg-red-50 p-3 rounded-md max-h-32 overflow-y-auto"> {/* Added scroll */}
               {analysisResult.non_compliant_controls.map((controlId, index) => (
                 <li key={index} className="flex items-center text-sm">
                   {/* Use a smaller indicator */}
                   <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0" />
                   <span className="text-red-800 font-mono">{controlId}</span>
                 </li>
               ))}
             </ul>
          ) : (
             <p className="text-gray-500 italic text-sm ml-7">No specific non-compliant controls identified.</p>
          )}
        </div>

        {/* --- UPDATE Recommendations Section --- */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
            {/* Use ListChecks icon */}
            <ListChecks className="h-5 w-5 text-blue-600 mr-2" />
            Key Recommendations ({analysisResult.recommendations?.length || 0})
          </h3>
           {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2"> {/* Added scroll */}
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm border-l-4 border-blue-200 pl-3 py-1">
                     {/* Removed bullet point span */}
                     <div>
                        <span className="font-semibold text-blue-800 block font-mono">{rec.control_id}</span>
                        <span className="text-gray-700 mt-0.5 block">{rec.recommendation}</span>
                     </div>
                  </li>
                ))}
              </ul>
           ) : (
              <p className="text-gray-500 italic text-sm ml-7">No recommendations generated.</p>
           )}
        </div>
      </div>
    </div>
  );
};