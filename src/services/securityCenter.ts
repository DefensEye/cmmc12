import { Finding, SecurityCenterConfig } from '../types';

const API_BASE_URL = 'https://your-backend-service.com/api';

export const initializeSecurityCenter = async (config: SecurityCenterConfig): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/security-center/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize security center');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Security Center client:', error);
    return false;
  }
};

export const fetchSecurityFindings = async (organizationId: string): Promise<Finding[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/security-center/findings?organizationId=${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch findings');
    }

    const findings = await response.json();
    return findings;
  } catch (error) {
    console.error('Failed to fetch security findings:', error);
    throw error;
  }
};

// REMOVE THESE LOCAL DECLARATIONS
// export interface SecurityCenterConfig {
//   // Configuration properties
// }
// 
// export interface Finding {
//   id: string;
//   description: string;
//   severity: string;
// }