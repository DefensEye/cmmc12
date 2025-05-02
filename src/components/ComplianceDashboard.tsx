"use client";


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CMMCLevel1Analysis } from '@/types/cmmc';

interface DashboardProps {
  analysisData: CMMCLevel1Analysis | null;
}

export const ComplianceDashboard: React.FC<DashboardProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold text-foreground mb-4">CMMC Level 1 Compliance Dashboard</div>
        <div className="text-muted-foreground">
          Upload your security findings to start the compliance assessment.
        </div>
      </div>
    );
  }

  const { 
    overallScore, 
    nonCompliantCount, 
    findings 
  } = analysisData;

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'outline';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Compliance Score Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Compliance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">{Math.round(overallScore)}%</div>
          <div className="text-muted-foreground">CMMC Level 1</div>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline">Non-Compliant: {nonCompliantCount}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Non-Compliant Practices */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Non-Compliant Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings
              .filter(finding => finding.complianceStatus === 'non-compliant')
              .slice(0, 5)
              .map((finding, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{finding.controlName}</div>
                      <div className="text-sm text-muted-foreground">{finding.resourceType}</div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {finding.finding}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Non-Compliant Findings */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Non-Compliant Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings
              .filter(finding => finding.complianceStatus === 'non-compliant')
              .slice(0, 5)
              .map((finding, index) => (
                <div key={index} className="p-4 bg-background rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{finding.controlName}</h3>
                      <p className="text-sm text-muted-foreground">Control ID: {finding.controlId}</p>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(finding.severity)}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Resource Type:</h4>
                    <p className="text-muted-foreground">{finding.resourceType}</p>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Description:</h4>
                    <p className="text-muted-foreground line-clamp-2">{finding.finding}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}