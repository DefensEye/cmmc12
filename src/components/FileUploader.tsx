import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle, Loader2 } from "lucide-react"; // Added Loader2
// --- REMOVE Vertex AI Service Import ---
// import { analyzeComplianceData } from "../services/vertexAIService";
// --- ADD RAG Backend Service Imports ---
import { uploadFindingsForAnalysis, getComplianceAnalysis } from "../services/googleCloudService";
// Import the upsert function and your authentication method
import { upsertUserRecord } from "../data/supabase";
import { getCurrentUser } from "../services/firebaseService";
import { DetailedAnalysisResult } from "../types/analysis"; // Import the detailed type if applicable

// Define the expected result structure from our RAG backend service
// Use DetailedAnalysisResult if that's what getComplianceAnalysis returns
interface AnalysisResult extends DetailedAnalysisResult {
  // Keep existing fields if needed, or rely solely on DetailedAnalysisResult
  // summary?: string;
  // non_compliant_controls?: string[];
  // recommendations?: { control_id: string; recommendation: string }[];
  error?: string;
  detail?: string;
}

interface FileUploaderProps {
  // Update callback to expect DetailedAnalysisResult
  onFileProcessed?: (results: DetailedAnalysisResult, fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileProcessed,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>(''); // For more detailed feedback

  // --- REMOVE processMultipleFiles function ---
  // const processMultipleFiles = async (acceptedFiles: File[]) => { ... };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      setError(null);
      setProcessingStage('Starting...');

      try {
        const user = getCurrentUser();
        if (!user || !user.uid) {
          throw new Error("User not authenticated.");
        }
        const userId = user.uid;

        setProcessingStage(`Uploading ${file.name}...`);
        // Step 1: Upload file and get analysis results
        const uploadResponse = await uploadFindingsForAnalysis(file, userId);

        // Check for errors in the response
        if (uploadResponse.error || uploadResponse.detail) {
          throw new Error(uploadResponse.error || uploadResponse.detail || "Analysis retrieval failed.");
        }

        const analysisResults = uploadResponse.analysis_results;
        const supabaseRecordId = uploadResponse.supabase_record_id;

        setProcessingStage('Saving record...');
        // Step 3: Update user record in Supabase
        await upsertUserRecord({
          user_id: userId,
          user_name: user.displayName || user.email?.split('@')[0] || 'Unknown',
          user_email: user.email || '',
          uploaded_file_name: file.name,
          file_uploaded_at: new Date().toISOString(),
          analysis_summary: analysisResults.summary,
          analysis_details: analysisResults,
        });

        setProcessingStage('Processing complete.');
        // Step 4: Call the callback with results
        if (onFileProcessed) {
          onFileProcessed(analysisResults, file.name);
        }

      } catch (err: any) {
        console.error("Error processing file:", err);
        setError(err.message || "Failed to process file. Please check the console and try again.");
      } finally {
        setIsProcessing(false);
        setProcessingStage('');
      }
    },
    [onFileProcessed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    // --- Set multiple to false ---
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out ${ // Added transition
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        } ${isProcessing ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`} // Adjusted processing style
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <>
              {/* Use Loader2 for a cleaner spinner */}
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-lg font-medium text-gray-700">
                Processing...
              </p>
              {/* Show current stage */}
              <p className="text-sm text-gray-500">{processingStage}</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-blue-500" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Drop the CSV file here" // Updated text for single file
                  : "Drag and drop your CSV file here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse file</p> {/* Updated text */}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          {/* Display the error state */}
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;