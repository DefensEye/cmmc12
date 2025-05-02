import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CMMCLevel1Analysis } from '@/types/cmmc';
import { format } from 'date-fns';

interface DashboardProps {
  analysisData: CMMCLevel1Analysis | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold text-gray-800 mb-4">CMMC Level 1 Compliance Dashboard</div>
        <div className="text-gray-500">
          Upload your security findings to start the compliance assessment.
        </div>
      </div>
    );
  }

  const { 
    overallScore, 
    complianceLevel, 
    totalFindings, 
    nonCompliantCount, 
    partiallyCompliantCount, 
    findings, 
    controlGaps, 
    assessorComments 
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
          <div className="text-4xl font-bold text-blue-600">{Math.round(overallScore)}%</div>
          <div className="text-gray-500">CMMC Level {complianceLevel}</div>
          <div className="mt-4 flex gap-2">
            <Badge variant="default">Total Findings: {totalFindings}</Badge>
            <Badge variant="outline">Non-Compliant: {nonCompliantCount}</Badge>
            <Badge variant="secondary">Partially Compliant: {partiallyCompliantCount}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Findings Overview */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Findings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {findings.slice(0, 6).map((finding: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{finding.controlName}</div>
                    <div className="text-sm text-gray-500">{finding.resourceType}</div>
                  </div>
                  <Badge variant={getSeverityBadgeVariant(finding.severity)}>
                    {finding.severity}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {finding.finding}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Gaps */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Control Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {controlGaps.slice(0, 3).map((gap: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{gap.controlName}</div>
                  <div className="text-sm text-gray-500">{gap.controlId}</div>
                </div>
                <Badge variant={getSeverityBadgeVariant(gap.severity)}>
                  {gap.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessor Comments */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Assessor Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {assessorComments}
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFindings.map(finding => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onClick={setSelectedFinding}
              />
            ))}
          </div>
        )}
      </main>

      {selectedFinding && (
        <FindingDetails
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          onSaveConfig={handleSaveConfig}
        />
      )}
    </div>
  );
};