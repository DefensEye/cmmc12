import React, { useEffect, useState } from 'react';
import { fetchSecurityFindings, SecurityFinding } from '../data/supabase';
import { AlertTriangle, CheckCircle, XCircle, Clock, Info, RefreshCw, Shield, Database, Loader2, FileText, ListChecks } from 'lucide-react';
// --- REMOVE analyzeComplianceData and ComplianceStatus ---
// import { analyzeComplianceData } from '../services/vertexAIService';
// import { ComplianceStatus } from '../types';
// --- REMOVE ChartJS imports if Pie chart is removed later ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// --- REMOVE ComplianceReport if modal is removed later ---
import ComplianceReport from './ComplianceReport';
import { Pie } from 'react-chartjs-2';
// --- Add Card components ---
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"; // Assuming path

ChartJS.register(ArcElement, Tooltip, Legend);

// --- ADD AnalysisResult type (or import if defined elsewhere) ---
interface AnalysisResult {
  summary?: string;
  non_compliant_controls?: string[];
  recommendations?: { control_id: string; recommendation: string }[];
  error?: string;
  detail?: string; // Keep detail for potential API errors
  assessorName?: string;
  assessorCredentials?: string;
  assessmentDate?: string;
  assessmentType?: string;
  assessorComments?: string;
  detailedAssessment?: Record<string, {
    control_id: string;
    title: string;
    level: string;
    status: string;
    findings: string;
    evidence: string;
    impact: string;
    recommendation: string;
  }>;
}


const GoogleCloudFindings: React.FC = () => {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  // --- REPLACE complianceData state with ragResult ---
  // const [complianceData, setComplianceData] = useState<ComplianceStatus[]>([]);
  const [ragResult, setRagResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAnalysis, setProcessingAnalysis] = useState<boolean>(false); // Can keep or remove based on UI needs
  // --- REMOVE complianceScore and safeguardBreakdown states ---
  // const [complianceScore, setComplianceScore] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStage, setLoadingStage] = useState<string>('Initializing...');
  // const [safeguardBreakdown, setSafeguardBreakdown] = useState<Record<string, number>>({});
  // --- REMOVE showComplianceReport state if modal is removed ---
  const [showComplianceReport, setShowComplianceReport] = useState(false);

  // Force the loading screen to be visible on component mount
  useEffect(() => {
    // Reset states on component mount
    setLoading(true);
    setLoadingProgress(0);
    setLoadingStage('Initializing...');
    setRagResult(null); // Reset RAG result
    setError(null); // Reset error

    // Start the loading process
    const loadFindings = async () => {
      try {
        // Start progress simulation immediately
        let progress = 0;
        const simulateProgress = setInterval(() => {
          progress += 2;
          if (progress >= 40) {
            clearInterval(simulateProgress);
          }
          setLoadingProgress(Math.min(40, progress));
        }, 100);

        // Step 1: Database connection
        setLoadingStage('Connecting to database...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay for UX
        setLoadingProgress(10);

        // Step 2: Fetching findings
        setLoadingStage('Fetching security findings...');
        const data = await fetchSecurityFindings();
        setFindings(data);
        setLoadingProgress(50);

        // Step 3: Process with RAG Model
        if (data.length > 0) {
          setLoadingStage('Analyzing with RAG AI...'); // Update stage text
          clearInterval(simulateProgress); // Stop the simulation

          // Process the findings
          try {
            setProcessingAnalysis(true); // Indicate analysis start
            const csvData = convertFindingsToCSV(data); // Keep CSV conversion for now
            setLoadingProgress(70);

            setLoadingStage('Processing with CMMC AI...'); // Update stage text

            // --- REPLACE analyzeComplianceData with fetch to /api/analyze-rag ---
            // const results = await analyzeComplianceData(csvData);
            // setComplianceData(results);

            const response = await fetch('/api/analyze-rag', { // <--- Your RAG endpoint
              method: 'POST',
              headers: {
                'Content-Type': 'application/json', // Send as JSON
              },
              // Send CSV data within a JSON payload, adjust if your API expects raw CSV or different structure
              body: JSON.stringify({ securityDataCsv: csvData }),
            });

            if (!response.ok) {
              let errorMsg = `CMMC ANALYSIS API error! status: ${response.status}`;
              try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.error || errorMsg;
              } catch (e) { /* Ignore if response not JSON */ }
              throw new Error(errorMsg);
            }

            const ragData: AnalysisResult = await response.json();
            console.log("GoogleCloudFindings: Received CMMC analysis:", ragData);
            setRagResult(ragData); // Store the RAG result

            // Check if the RAG API itself returned an error structure
            if (ragData.error || ragData.detail) {
                 setError(ragData.error || ragData.detail || "RAG analysis failed.");
                 setRagResult(null); // Clear results on API error
            }
            // --- End of replacement ---

            setLoadingProgress(90);

            setLoadingStage('Finalizing results...');
            setTimeout(() => {
              setLoadingProgress(100);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            }, 500);
          } catch (err: any) { // Catch errors from fetch or API
            console.error('Error analyzing findings with RAG:', err);
            setError(err.message || 'Failed to analyze findings with RAG AI');
            setRagResult(null); // Clear results on error
            setLoading(false); // Stop loading on error
          } finally {
            setProcessingAnalysis(false); // Analysis finished (success or fail)
          }
        } else {
          // No findings to process
          setLoadingProgress(100);
          setTimeout(() => {
            setLoading(false);
          }, 500);
        }
      } catch (err: any) { // Catch errors from fetchSecurityFindings
        console.error('Error loading findings:', err);
        setError(err.message || 'Failed to load security findings');
        setLoading(false);
      }
    };

    loadFindings();
  }, []);

  // Function to convert security findings to CSV format for AI analysis
  // --- Keep convertFindingsToCSV function (assuming RAG API uses it) ---
  const convertFindingsToCSV = (securityFindings: SecurityFinding[]): string => {
    // Create CSV header
    const headers = ['ID', 'Category', 'Resource', 'Severity', 'State', 'Description', 'Create Time'];
    
    // Create CSV rows
    const rows = securityFindings.map(finding => {
      const description = typeof finding.source_properties === 'object' && finding.source_properties
        ? finding.source_properties.description ||
          finding.source_properties.summary ||
          finding.source_properties.title ||
          `${finding.category} finding`
        : `${finding.category || 'Security'} finding`;
      
      return [
        finding.finding_id,
        finding.category || 'Unknown',
        finding.resource_name || 'N/A',
        finding.severity || 'Unknown',
        finding.state || 'Unknown',
        description,
        finding.create_time || 'Unknown'
      ];
    });
    
    // Combine headers and rows into CSV string
    const csvData = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvData;
  };

  // Calculate compliance score based on findings
  // --- REMOVE useEffect hook that depends on non-existent complianceData ---
  // useEffect(() => {
  //   if (complianceData.length > 0) { // <-- complianceData no longer exists
  //     calculateComplianceScore();     // <-- function removed
  //     calculateSafeguardBreakdown();  // <-- function removed
  //   }
  // }, [complianceData]); // <-- complianceData no longer exists

  // --- REMOVE calculateComplianceScore function ---
  // const calculateComplianceScore = () => { ... };

  // --- REMOVE calculateSafeguardBreakdown function ---
  // const calculateSafeguardBreakdown = () => { ... };

  // --- REMOVE preparePieChartData function ---
  // const preparePieChartData = () => { ... };

  // --- REMOVE reprocessFindings function (it used analyzeComplianceData) ---
  // const reprocessFindings = async () => { ... };

  // --- REMOVE Helper functions related to old data structure ---
  // const getSeverityIcon = (severity: string | undefined) => { ... }; // Keep if needed for raw findings display, remove if not
  // const getSeverityColor = (severity: string | undefined) => { ... }; // Keep if needed for raw findings display, remove if not
  // const formatDate = (dateString: string | undefined) => { ... }; // Keep if needed for raw findings display, remove if not
  // const getDescription = (finding: SecurityFinding) => { ... }; // Keep if needed for raw findings display, remove if not

  // --- REMOVE functions calculating based on old data ---
  // const getSeverityCounts = () => { ... };
  // const severityCounts = getSeverityCounts(); // Remove usage
  // const totalFindings = findings.length; // Keep if needed

  // --- REMOVE functions calculating based on old data ---
  // const getComplianceStatusInfo = () => { ... };
  // const complianceStatus = getComplianceStatusInfo(); // Remove usage

  // --- REMOVE functions calculating based on old data ---
  // const getDomainName = (abbr: string) => { ... };

  // Render loading UI
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Loading CMMC Security Analysis
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {loadingStage}
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            {/* Loading percentage */}
            <div className="text-center font-semibold text-blue-600">
              {loadingProgress}% Complete
            </div>
            
            {/* Loading steps */}
            <div className="mt-8">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${loadingProgress >= 10 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    <Database className="h-4 w-4" />
                  </div>
                  <span className={loadingProgress >= 10 ? 'text-gray-800' : 'text-gray-400'}>
                  Initiating Threat Analysis
                  </span>
                  {loadingProgress >= 10 && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
                
                <div className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${loadingProgress >= 60 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    <Loader2 className={`h-4 w-4 ${loadingProgress >= 60 && loadingProgress < 90 ? 'animate-spin' : ''}`} />
                  </div>
                  <span className={loadingProgress >= 60 ? 'text-gray-800' : 'text-gray-400'}>
                  Performing Threat Analysis
                  </span>
                  {loadingProgress >= 90 && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
                
                <div className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${loadingProgress >= 95 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className={loadingProgress >= 95 ? 'text-gray-800' : 'text-gray-400'}>
                    Translating Security Gaps into Compliance Risks
                  </span>
                  {loadingProgress >= 100 && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The rest of your component (error state, compliance dashboard, etc.)
  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500 text-center">
          <XCircle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">{error}</p>
          <p>Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  // Actual findings display (Updated for ragResult)
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Google CMMC Security Analysis (RAG)</h1>
        {/* --- REMOVE/UPDATE Compliance Report Button --- */}
        {/* The old report relied on complianceData. Decide how to handle reporting with ragResult */}
        {/* Example: Remove button for now
        <div className="flex space-x-4">
          <button ... >
            CMMC Readiness Audit Report
          </button>
        </div>
        */}
      </div>

      {/* --- Display RAG Analysis Results --- */}
      {ragResult && !loading && (
        <div className="space-y-6">
          {/* Assessor Information */}
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                CMMC Assessment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row border-b border-gray-200 pb-4 mb-4">
                  <div className="font-semibold w-full md:w-1/3 text-gray-700">Assessor:</div>
                  <div className="w-full md:w-2/3 text-gray-800">{ragResult.assessorName}</div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-gray-200 pb-4 mb-4">
                  <div className="font-semibold w-full md:w-1/3 text-gray-700">Credentials:</div>
                  <div className="w-full md:w-2/3 text-gray-800">{ragResult.assessorCredentials}</div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-gray-200 pb-4 mb-4">
                  <div className="font-semibold w-full md:w-1/3 text-gray-700">Assessment Date:</div>
                  <div className="w-full md:w-2/3 text-gray-800">{ragResult.assessmentDate}</div>
                </div>
                <div className="flex flex-col md:flex-row border-b border-gray-200 pb-4 mb-4">
                  <div className="font-semibold w-full md:w-1/3 text-gray-700">Assessment Type:</div>
                  <div className="w-full md:w-2/3 text-gray-800">{ragResult.assessmentType}</div>
                </div>
                <div className="flex flex-col md:flex-row">
                  <div className="font-semibold w-full md:w-1/3 text-gray-700">Assessor Comments:</div>
                  <div className="w-full md:w-2/3 text-gray-800">{ragResult.assessorComments}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Assessment Findings */}
          <Card className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-xl text-gray-800 flex items-center">
                <ListChecks className="h-5 w-5 mr-2 text-blue-600" />
                Detailed Assessment Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {ragResult.detailedAssessment && Object.keys(ragResult.detailedAssessment).map((key) => {
                  const assessment = ragResult.detailedAssessment?.[key];
                  if (!assessment) return null;
                  return (
                    <div key={assessment.control_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-wrap items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {assessment.control_id}: {assessment.title}
                        </h3>
                        <div className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          assessment.status === 'Non-Compliant' ? 'bg-red-100 text-red-800' : 
                          assessment.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {assessment.status}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{assessment.level}</div>
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="font-medium text-gray-700">Findings:</div>
                          <div className="text-gray-600">{assessment.findings}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Evidence:</div>
                          <div className="text-gray-600">{assessment.evidence}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Impact:</div>
                          <div className="text-gray-600">{assessment.impact}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Recommendation:</div>
                          <div className="text-gray-600">{assessment.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* RAG Summary Card */}
          {ragResult.summary && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{ragResult.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Non-Compliant Controls Card */}
          {ragResult.non_compliant_controls && ragResult.non_compliant_controls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Potentially Non-Compliant Controls ({ragResult.non_compliant_controls.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  {ragResult.non_compliant_controls.map((controlId, index) => (
                    <li key={index}>{controlId}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Card */}
          {ragResult.recommendations && ragResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations ({ragResult.recommendations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ragResult.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <p className="font-semibold text-gray-800">Control: {rec.control_id}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* --- REMOVE Old Compliance Report Modal --- */}
      {/* {showComplianceReport && ( ... modal code ... )} */}
    </div>
  );
};

export default GoogleCloudFindings;