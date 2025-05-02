import { SecurityCenterClient } from '@google-cloud/security-center';

// Configuration for Google Cloud
const config = {
  projectId: process.env.GOOGLE_PROJECT_ID || 'd5assistant',
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY || ''
  }
};

// Organization ID for Security Command Center
const organizationId = process.env.GOOGLE_ORGANIZATION_ID || '382379904232';

// Initialize Security Center client
const securityCenter = new SecurityCenterClient(config);

// Export the function to make this a module
export async function syncSecurityFindings() {
  try {
    const [findings] = await securityCenter.listFindings({
      parent: `organizations/${organizationId}`,
      filter: 'state="ACTIVE"'
    });
    
    return findings;
  } catch (error) {
    console.error('Error fetching security findings:', error);
    throw error;
  }
}