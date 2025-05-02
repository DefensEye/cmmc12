export interface CMMCLevel1Finding {
  controlId: string;
  controlName: string;
  finding: string;
  resourceId: string;
  resourceType: string;
  severity: 'low' | 'medium' | 'high';
  complianceStatus: 'non-compliant' | 'partially-compliant' | 'compliant';
  recommendation: string;
}

export interface CMMCLevel1Analysis {
  overallScore: number;
  complianceLevel: 'Level 1';
  totalFindings: number;
  compliantCount: number;
  partiallyCompliantCount: number;
  nonCompliantCount: number;
  findings: CMMCLevel1Finding[];
  controlGaps: {
    controlId: string;
    controlName: string;
    missingControls: string[];
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
  assessorComments: string;
}
