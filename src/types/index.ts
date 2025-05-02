// Add these interfaces to your existing types.ts file

/**
 * Interface for Google Security Center findings
 */
export interface Finding {
  name: string;
  category?: string;
  description?: string;
  severity?: string;
  state?: string;
  resourceName?: string;
  createTime?: Date;
  eventTime?: Date;
  sourceProperties?: Record<string, any>;
  parent?: string;
}

/**
 * Configuration for Security Center client
 */
export interface SecurityCenterConfig {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

// Your existing interfaces remain unchanged
export interface CMMCDomain {
  id: string;
  name: string;
  description: string;
}

export interface CMMCPractice {
  id: string;
  domainId: string;
  name: string;
  description: string;
  level: number;
}

export interface ComplianceStatus {
  practiceId: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  score: number;
  gap: string;
  recommendation: string;
  insights?: string[];
  threePAOAssessment?: {
    status: 'pass' | 'fail' | 'partial';
    notes: string;
  };
}

export interface DomainComplianceScore {
  domainId: string;
  domainName: string;
  compliancePercentage: number;
  practices: {
    practiceId: string;
    practiceName: string;
    status: ComplianceStatus['status'];
    score: number;
  }[];
}

export interface UploadedFileData {
  id: string;
  name: string;
  uploadDate: Date;
  complianceStatuses: ComplianceStatus[];
}

