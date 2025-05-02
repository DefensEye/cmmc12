import React, { useState, useEffect } from 'react';
import { Settings, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import * as vertexAIService from "../services/vertexAIService";
import { syncSecurityFindings } from '../services/googleCloudService';
import { useAuth } from './AuthContext';


interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceAccountCredentials {
  project_id: string;
  private_key: string;
  client_email: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState<ServiceAccountCredentials | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load saved credentials from localStorage if available
    const savedCredentials = localStorage.getItem('gcpServiceAccountCredentials');
    if (savedCredentials) {
      try {
        setCredentials(JSON.parse(savedCredentials));
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const parsedCredentials = JSON.parse(fileContent);
      
      // Validate required fields
      if (!parsedCredentials.project_id || !parsedCredentials.private_key || !parsedCredentials.client_email) {
        throw new Error('Invalid service account credentials file. Missing required fields.');
      }

      setCredentials(parsedCredentials);
      localStorage.setItem('gcpServiceAccountCredentials', fileContent);
      setConnectionStatus('idle');
      setErrorMessage('');
    } catch (error) {
      console.error('Error reading credentials file:', error);
      setErrorMessage('Invalid credentials file format. Please upload a valid service account JSON file.');
      setConnectionStatus('error');
    }
  };

  const handleTestConnection = async () => {
    if (!credentials || !currentUser) {
      setErrorMessage('Please upload credentials and ensure you are logged in');
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Test Vertex AI connection
      const isVertexConnected = await vertexAIService.testVertexAIConnection(credentials.private_key);
      
      if (!isVertexConnected) {
        throw new Error('Connection to Vertex AI failed');
      }

      // Test security findings sync
      await syncSecurityFindings(currentUser.uid);
      
      setConnectionStatus('success');
    } catch (error) {
      console.error('Connection test failed:', error);
      // Display the actual system error instead of a generic message
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setConnectionStatus('error');
    }
  };

  const handleSyncFindings = async () => {
    if (!credentials || !currentUser) {
      setErrorMessage('Please upload credentials and ensure you are logged in');
      return;
    }

    setIsSyncing(true);
    setErrorMessage('');

    try {
      const result = await syncSecurityFindings(currentUser.uid);
      console.log('Sync result:', result);
      setErrorMessage('');
    } catch (error) {
      console.error('Error syncing findings:', error);
      // Display the actual system error here too
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-500" />
            Google Cloud Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Service Account Credentials Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Account Credentials
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="credentials-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload credentials file</span>
                    <input
                      id="credentials-upload"
                      name="credentials-upload"
                      type="file"
                      accept="application/json"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">JSON service account key file</p>
              </div>
            </div>
          </div>

          {/* Status Display */}
          {credentials && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Project ID: {credentials.project_id}
              </p>
              <p className="text-sm text-gray-600 truncate">
                Service Account: {credentials.client_email}
              </p>
            </div>
          )}

          {/* Error Display */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing' || !credentials}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                connectionStatus === 'testing'
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {connectionStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </button>

            <button
              onClick={handleSyncFindings}
              disabled={isSyncing || !credentials || connectionStatus !== 'success'}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isSyncing || !credentials || connectionStatus !== 'success'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Findings...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>

          {/* Connection Status */}
          {connectionStatus === 'success' && (
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Connected successfully</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

export { SettingsPanel }