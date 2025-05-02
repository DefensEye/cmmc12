export interface PracticeDetail {
  id: string;
  title: string;
  description: string;
  status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Assessed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  effort: 'High Effort' | 'Medium Effort' | 'Low Effort';
  recommendations?: string[];
  evidence?: string[];
}

export interface DomainCompliance {
  id: string;
  name: string;
  score: number;
  status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Assessed';
  practices: PracticeDetail[];
  findings?: string[];
  recommendations?: string[];
}

export interface RecommendationDetail {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  effort: 'High Effort' | 'Medium Effort' | 'Low Effort';
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string;
  assignedTo?: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  resourceName: string;
  resourceType: string;
  location: string;
  findingTime: string;
}

export interface PriorityGap {
  control_id: string;
  timing: string;
  effort: string;
  priority: string;
  recommendation: string;
  potential_impact: string;
}

export interface DetailedAnalysisResult {
  overallScore: number;
  complianceLevel: 'Level 1' | 'Level 2' | 'Level 3';
  domainDistribution: DomainCompliance[];
  criticalGaps: string[];
  priorityGaps: PriorityGap[];
  recommendations: RecommendationDetail[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdated: string;
  totalFindings: number;
  compliantCount: number;
  nonCompliantCount: number;
  partiallyCompliantCount: number;
  findings: SecurityFinding[];
}
