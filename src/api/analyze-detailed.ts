import { supabase } from '../../../lib/supabase';
import { DetailedAnalysisResult } from '../../../types/analysis';

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();
    
    if (!fileName) {
      return new Response(JSON.stringify({ error: 'File name is required' }), {
        status: 400,
      });
    }

    // Fetch compliance data with security findings
    const { data, error } = await supabase
      .from('compliance_with_findings')
      .select('*')
      .eq('file_name', fileName)
      .single();

    if (error) {
      console.error('Error fetching compliance data:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch compliance data' }), {
        status: 500,
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'No compliance data found for this file' }), {
        status: 404,
      });
    }

    // Transform Supabase data to DetailedAnalysisResult format
    const analysisResult: DetailedAnalysisResult = {
      overallScore: data.overall_score || 0,
      domainDistribution: Array.isArray(data.domain_distribution) ? 
        data.domain_distribution.map(domain => ({
          name: domain.name || 'Unknown',
          score: domain.score || 0,
          status: domain.status || 'Not Assessed',
          findings: domain.findings || [],
          recommendations: domain.recommendations || []
        })) : [],
      criticalGaps: Array.isArray(data.critical_gaps) ? data.critical_gaps : [],
      recommendations: Array.isArray(data.recommendations) ? 
        data.recommendations.map(rec => ({
          title: rec.title || 'Unknown',
          description: rec.description || '',
          priority: rec.priority || 'Low',
          effort: rec.effort || 'Low Effort',
          status: rec.status || 'Not Started'
        })) : [],
      riskLevel: data.risk_level || 'LOW',
      lastUpdated: data.updated_at || new Date().toISOString(),
      complianceLevel: data.compliance_level || 'Level 1',
      totalFindings: data.total_findings || 0,
      compliantCount: data.compliant_count || 0,
      nonCompliantCount: data.non_compliant_count || 0,
      partiallyCompliantCount: data.partially_compliant_count || 0,
      securityFindings: Array.isArray(data.findings) ? 
        data.findings.map(finding => ({
          id: finding.id,
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          category: finding.category,
          resourceName: finding.resource_name,
          resourceType: finding.resource_type,
          location: finding.location,
          findingTime: finding.finding_time
        })) : []
    };

    return new Response(JSON.stringify(analysisResult));
  } catch (error) {
    console.error('Error in analyze-detailed endpoint:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
