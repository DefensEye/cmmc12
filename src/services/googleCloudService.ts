import { createClient } from '@supabase/supabase-js';

// --- Existing Supabase Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// --- End of Supabase Setup ---

// --- Define Interfaces for RAG Backend Responses ---
interface UploadResponse {
  status?: string;
  columns?: string[];
  error?: string;
}

interface AnalysisResult {
  overall_score?: number;
  summary?: string;
  non_compliant_controls?: string[];
  recommendations?: { control_id: string; recommendation: string }[];
  error?: string; // For backend errors during analysis
  detail?: string; // For FastAPI HTTPExceptions
}
// --- End of Interfaces ---


// --- Existing Supabase Functions ---

/**
 * Synchronizes security findings from Google Cloud to Supabase
 * 
 * Triggers the sync-security-findings Edge Function to fetch and store
 * security findings for a specific user.
 * 
 * @param {string} userId - The ID of the user to sync findings for
 * @returns {Promise<Object>} The sync results containing success status and data
 * @throws {Error} If the sync operation fails
 */
export const syncSecurityFindings = async (userId: string) => {
  try {
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error('Failed to get user session');
    }

    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/sync-security-findings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sync security findings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing security findings:', error);
    throw error;
  }
};

/**
 * Retrieves security findings for a specific user
 * 
 * Fetches findings from the Supabase security_findings table,
 * ordered by severity and detection date.
 * 
 * @param {string} userId - The ID of the user to fetch findings for
 * @returns {Promise<Array>} Array of security findings
 * @throws {Error} If the database query fails
 */
export const getSecurityFindings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('security_findings')
      .select('*')
      .eq('user_id', userId)
      .order('severity', { ascending: false })
      .order('last_detected', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching security findings:', error);
    throw error;
  }
};

// --- End of Existing Supabase Functions ---


// --- NEW: Functions for RAG Model Backend (FastAPI) ---

// Use environment variable for backend URL or default
const ragBackendUrl = import.meta.env.VITE_RAG_BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * Uploads a findings CSV file to the RAG backend for a specific user.
 *
 * @param {File} file - The CSV file containing findings data.
 * @param {string} userId - The unique identifier for the user session.
 * @returns {Promise<UploadResponse>} The result from the upload endpoint.
 * @throws {Error} If the upload fails.
 */
// Define the base URL for your backend API if not already done
// const API_BASE_URL = 'http://localhost:8000'; // Or your actual backend URL

export const uploadFindingsForAnalysis = async (file: File, userId: string): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  // If your backend needs the user_id in the form data, uncomment the next line
  // formData.append("user_id", userId);

  // --- Change this URL path to your actual upload+analyze endpoint ---
  const response = await fetch(`/upload_and_analyze/`, { // <<< CORRECTED ENDPOINT
    method: 'POST',
    body: formData,
    // Add headers if needed (e.g., Authorization)
  });

  if (!response.ok) {
    let errorMsg = `File upload failed with status: ${response.status}`;
    try {
        const errorData = await response.json();
        // Use the specific error detail from the backend if available
        errorMsg = errorData.detail || errorData.error || errorMsg;
    } catch(e) {
        errorMsg = `${errorMsg}. ${response.statusText || 'Server did not return a valid error message.'}`;
    }
    console.error("Upload error details:", errorMsg);
    throw new Error(errorMsg);
  }

  console.log(`File ${file.name} uploaded successfully for user ${userId}. Backend processing initiated.`);
  // Assuming this endpoint handles both upload and triggers analysis,
  // we might not get analysis results back immediately here.
  // The getComplianceAnalysis function will likely poll or fetch the results later.
};

// --- Verify the endpoint for getComplianceAnalysis ---
// Ensure this function points to the correct backend endpoint that retrieves
// the analysis results after processing is complete.
export const getComplianceAnalysis = async (userId: string): Promise<any> => { // Use specific type like AnalysisResult
    // --- !!! CHECK AND UPDATE THIS ENDPOINT IF NEEDED !!! ---
    // Example: Maybe it should include the filename or a job ID?
    // Example: const response = await fetch(`/api/analysis_results/?user_id=${userId}`);
    const response = await fetch(`/get_analysis/?user_id=${userId}`, { // <<< VERIFY THIS ENDPOINT
        method: 'GET', // Or POST, depending on your backend
        headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
        },
    });

    if (!response.ok) {
        let errorMsg = `Failed to get analysis results with status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch(e) {
            errorMsg = `${errorMsg}. ${response.statusText || 'Server did not return a valid error message.'}`;
        }
        console.error("Analysis fetch error details:", errorMsg);
        throw new Error(errorMsg);
    }

    return await response.json();
};

// --- REMOVE the duplicate definition below ---
/*
/**
 * Triggers compliance analysis on the RAG backend for a specific user.
 *
 * @param {string} userId - The unique identifier for the user session (must match the upload).
 * @returns {Promise<AnalysisResult>} The analysis results from the backend.
 * @throws {Error} If the analysis request fails.
 */
/* // --- Keep this version (or the correct one) ---  // <<< REMOVE THIS COMMENT BLOCK
export const getComplianceAnalysis = async (userId: string): Promise<AnalysisResult> => { // <<< REMOVE THIS FUNCTION DEFINITION
    // Ensure this endpoint and method are correct for your backend
    const response = await fetch(`/get_analysis/?user_id=${userId}`, {
        method: 'GET', // Or 'POST' if required
        headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
        },
    });

    if (!response.ok) {
        let errorMsg = `Failed to get analysis results with status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch(e) {
            errorMsg = `${errorMsg}. ${response.statusText || 'Server did not return a valid error message.'}`;
        }
        console.error("Analysis fetch error details:", errorMsg);
        throw new Error(errorMsg);
    }

    return await response.json();
};
*/ // <<< REMOVE THIS COMMENT BLOCK


// --- REMOVE the duplicate definition below ---
/*
 * @throws {Error} If the analysis request fails.
 */
/* // export const getComplianceAnalysis = async (userId: string): Promise<AnalysisResult> => { // <<< DELETE THIS BLOCK // <<< REMOVE THIS FUNCTION DEFINITION
//   const formData = new FormData();
//   formData.append('user_id', userId);

  try {
    const response = await fetch(`${ragBackendUrl}/analyze_compliance/`, {
      method: 'POST',
      body: formData,
    });

    const result: AnalysisResult = await response.json();

    if (!response.ok) {
      // Handle potential error formats from FastAPI
      const errorMsg = result.error || result.detail || `Analysis failed with status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (error: any) {
    console.error('Error getting compliance analysis:', error);
    // Re-throw the error but ensure it's an Error object
    throw new Error(error.message || 'Unknown error during compliance analysis.');
  }
};
*/ // <<< REMOVE THIS FUNCTION DEFINITION

// --- End of NEW Functions ---