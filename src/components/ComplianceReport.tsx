import React, { useState } from 'react';
// --- REMOVE ComplianceStatus import ---
// import { ComplianceStatus } from '../types';
// --- REMOVE Vertex AI Service import ---
// import { generateComplianceReport } from '../services/vertexAIService';
// --- Keep necessary icons, remove Loader if generation button is removed ---
import { FileText, Download, AlertCircle, ListChecks } from 'lucide-react'; // Added AlertCircle, ListChecks

// --- ADD AnalysisResult type (or import it) ---
interface AnalysisResult {
  summary?: string;
  non_compliant_controls?: string[];
  recommendations?: { control_id: string; recommendation: string }[];
  error?: string;
  detail?: string;
}


/**
 * Props interface for the ComplianceReport component
 */
interface ComplianceReportProps {
  // --- CHANGE Prop to accept AnalysisResult ---
  // complianceData: ComplianceStatus[];
  analysisResult: AnalysisResult | null;

  // --- REMOVE cmmcLevel prop ---
  // cmmcLevel?: 'Level 1' | 'Level 2' | 'Level 3';
}

/**
 * ComplianceReport component that displays and allows downloading
 * a report based on the pre-computed RAG analysis results.
 *
 * @param analysisResult - The result object from the RAG analysis
 */
const ComplianceReport: React.FC<ComplianceReportProps> = ({
  analysisResult,
  // --- REMOVE cmmcLevel prop ---
  // cmmcLevel = 'Level 3',
}) => {
  // --- REMOVE report state ---
  // const [report, setReport] = useState<string | null>(null);
  // --- REMOVE isGenerating state ---
  // const [isGenerating, setIsGenerating] = useState(false);

  // State for controlling the expanded/collapsed view of the report
  const [isExpanded, setIsExpanded] = useState(false); // Keep this

  // --- REMOVE handleGenerateReport function ---
  // const handleGenerateReport = async () => { ... };

  /**
   * Constructs a markdown string from the analysis results.
   */
  const generateMarkdownFromResults = (): string => {
    if (!analysisResult) return '';

    let md = `# Compliance Analysis Report\n\n`;

    // Add Summary
    md += `## Analysis Summary\n`;
    md += `${analysisResult.summary || 'No summary provided.'}\n\n`;

    // Add Non-Compliant Controls
    md += `## Identified Non-Compliant Controls (${analysisResult.non_compliant_controls?.length || 0})\n`;
    if (analysisResult.non_compliant_controls && analysisResult.non_compliant_controls.length > 0) {
      analysisResult.non_compliant_controls.forEach(control => {
        md += `- ${control}\n`;
      });
    } else {
      md += `No specific non-compliant controls identified.\n`;
    }
    md += `\n`;

    // Add Recommendations
    md += `## Recommendations (${analysisResult.recommendations?.length || 0})\n`;
    if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
      analysisResult.recommendations.forEach(rec => {
        md += `### ${rec.control_id}\n`;
        md += `${rec.recommendation}\n\n`;
      });
    } else {
      md += `No recommendations generated.\n`;
    }

    return md;
  };


  /**
   * Handles downloading the generated report as a markdown file
   */
  const handleDownloadReport = () => {
    // --- Generate markdown content on demand ---
    const reportContent = generateMarkdownFromResults();
    if (!reportContent) return;

    // Create a blob from the report content
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rag-compliance-report.md'; // Updated filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- REMOVE renderMarkdown function or adapt if needed, simpler to use JSX directly ---
  // const renderMarkdown = (markdown: string) => { ... };

  // --- Helper to render the report content using JSX ---
  const renderReportContent = () => {
    if (!analysisResult) return null;

    // Handle potential errors from the backend analysis
    if (analysisResult.error || analysisResult.detail) {
       return (
         <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center text-red-700">
           <AlertCircle className="h-6 w-6 mx-auto mb-2" />
           <p className="font-semibold">Analysis Failed</p>
           <p className="text-sm">{analysisResult.error || analysisResult.detail}</p>
         </div>
       );
    }

    return (
      <div className="space-y-6">
        {/* Summary Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
             <FileText className="h-5 w-5 mr-2 text-indigo-600" /> Analysis Summary
          </h3>
          <p className="text-gray-600 bg-gray-100 p-3 rounded text-sm">{analysisResult.summary || 'No summary provided.'}</p>
        </div>

        {/* Non-Compliant Controls Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
             <AlertCircle className="h-5 w-5 mr-2 text-red-600" /> Identified Non-Compliant Controls ({analysisResult.non_compliant_controls?.length || 0})
          </h3>
          {analysisResult.non_compliant_controls && analysisResult.non_compliant_controls.length > 0 ? (
            <ul className="list-disc list-inside bg-red-50 p-3 rounded space-y-1 max-h-40 overflow-y-auto">
              {analysisResult.non_compliant_controls.map((controlId) => (
                <li key={controlId} className="text-red-800 text-sm font-mono">{controlId}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm ml-7">No specific non-compliant controls identified.</p>
          )}
        </div>

        {/* Recommendations Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
             <ListChecks className="h-5 w-5 mr-2 text-blue-600" /> Recommendations ({analysisResult.recommendations?.length || 0})
          </h3>
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {analysisResult.recommendations.map((rec, index) => (
                <li key={index} className="border p-3 rounded bg-blue-50">
                  <strong className="block text-blue-800 font-mono text-sm">{rec.control_id}:</strong>
                  <p className="text-gray-700 text-sm mt-1">{rec.recommendation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm ml-7">No recommendations generated.</p>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {/* Report header with action buttons */}
      <div className="flex justify-between items-center mb-6">
        {/* --- Update Title --- */}
        <h3 className="text-lg font-medium text-gray-700">RAG Compliance Analysis Report</h3>

        <div className="flex space-x-2">
          {/* Download button - enabled if analysisResult exists and has no error */}
          {analysisResult && !analysisResult.error && !analysisResult.detail && (
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          )}

          {/* --- REMOVE Generate/Regenerate report button --- */}
          {/* <button onClick={handleGenerateReport} ... > ... </button> */}
        </div>
      </div>

      {/* Report content area */}
      {/* --- Check analysisResult instead of report state --- */}
      {analysisResult ? (
        <div className="border rounded-md p-4 bg-gray-50">
          {/* Report content with conditional height limit */}
          {/* --- Use JSX renderer instead of renderMarkdown --- */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px]' : 'max-h-60'}`}> {/* Adjusted max-h */}
            {renderReportContent()}
          </div>

          {/* Gradient fade-out for collapsed view */}
          {!isExpanded && (analysisResult.summary || analysisResult.non_compliant_controls?.length || analysisResult.recommendations?.length) && ( // Only show fade if content exists
            <div className="relative mt-[-2rem] h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
          )}

          {/* Show more/less toggle button - only if content exists and might be truncated */}
           {(analysisResult.summary || analysisResult.non_compliant_controls?.length || analysisResult.recommendations?.length) && (
             <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
             >
               {isExpanded ? 'Show Less' : 'Show More'}
             </button>
           )}
        </div>
      ) : (
        // Placeholder when no analysis result is provided yet
        <div className="text-center py-8 border border-dashed rounded-md">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            {/* --- Update Placeholder Text --- */}
            Compliance analysis results will appear here once processed.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplianceReport;
