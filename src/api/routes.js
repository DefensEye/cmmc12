import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server directory
const envPath = path.resolve(__dirname, '../../server/.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: 'public'
      }
    });
    console.log('Supabase client initialized successfully in routes');
  } catch (error) {
    console.error('Error initializing Supabase client in routes:', error);
  }
} else {
  console.warn('Supabase credentials missing in routes. Will fallback to CSV processing only.');
}

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get detailed analysis for compliance dashboard
router.post('/analyze-detailed', authenticateUser, async (req, res) => {
  try {
    const { fileName } = req.body;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }

    // Fetch security findings from Supabase
    const { data: findings, error } = await supabase
      .from('security_findings')
      .select('*')
      .order('create_time', { ascending: false });

    if (error) throw error;

    // Analyze findings and generate compliance data
    const analysisResult = {
      fileName,
      overallScore: 75, // This will be calculated based on findings
      compliantCount: 0,
      partialCount: 0,
      nonCompliantCount: 0,
      domainDistribution: [
        {
          domainId: "AC",
          domainName: "Access Control",
          compliantCount: 0,
          partialCount: 0,
          nonCompliantCount: 0
        },
        {
          domainId: "AU",
          domainName: "Audit and Accountability",
          compliantCount: 0,
          partialCount: 0,
          nonCompliantCount: 0
        },
        {
          domainId: "CM",
          domainName: "Configuration Management",
          compliantCount: 0,
          partialCount: 0,
          nonCompliantCount: 0
        },
        {
          domainId: "IA",
          domainName: "Identification and Authentication",
          compliantCount: 0,
          partialCount: 0,
          nonCompliantCount: 0
        },
        {
          domainId: "SC",
          domainName: "System and Communications Protection",
          compliantCount: 0,
          partialCount: 0,
          nonCompliantCount: 0
        }
      ],
      priorityGaps: [],
      summary: "Initial compliance analysis based on security findings"
    };

    // Process findings and update compliance data
    findings.forEach(finding => {
      // Update domain distribution based on finding category
      const domain = analysisResult.domainDistribution.find(d => 
        d.domainId === finding.cmmc_domain
      );
      
      if (domain) {
        if (finding.severity === 'HIGH' || finding.severity === 'CRITICAL') {
          domain.nonCompliantCount++;
        } else if (finding.severity === 'MEDIUM') {
          domain.partialCount++;
        } else {
          domain.compliantCount++;
        }
      }

      // Add to priority gaps if severity is high or critical
      if (finding.severity === 'HIGH' || finding.severity === 'CRITICAL') {
        analysisResult.priorityGaps.push({
          control_id: finding.cmmc_practice || finding.finding_id,
          priority: finding.severity,
          effort: 'High Effort',
          recommendation: finding.description || 'No recommendation available',
          potential_impact: 'High impact on compliance'
        });
      }
    });

    // Calculate overall counts
    analysisResult.domainDistribution.forEach(domain => {
      analysisResult.compliantCount += domain.compliantCount;
      analysisResult.partialCount += domain.partialCount;
      analysisResult.nonCompliantCount += domain.nonCompliantCount;
    });

    // Calculate overall score
    const totalFindings = analysisResult.compliantCount + 
                         analysisResult.partialCount + 
                         analysisResult.nonCompliantCount;
    
    if (totalFindings > 0) {
      analysisResult.overallScore = Math.round(
        ((analysisResult.compliantCount + (analysisResult.partialCount * 0.5)) / 
        totalFindings) * 100
      );
    }

    // Generate summary based on findings
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    
    analysisResult.summary = `Based on the analysis of ${totalFindings} security findings, your system shows ${analysisResult.overallScore < 70 ? 'partial' : 'substantial'} compliance with CMMC Level 2 requirements. ${criticalCount > 0 ? `${criticalCount} critical and ${highCount} high severity issues require immediate attention.` : highCount > 0 ? `${highCount} high severity issues require prompt attention.` : ''} Several areas need focus, particularly in access control (AC) and system protection (SC) domains.`;

    res.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze-detailed:', error);
    res.status(500).json({ error: 'Failed to analyze findings' });
  }
});

// Get security findings
router.get('/security-findings', authenticateUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }

    const { data: findings, error } = await supabase
      .from('security_findings')
      .select('*')
      .order('create_time', { ascending: false });

    if (error) throw error;
    res.json(findings);
  } catch (error) {
    console.error('Error fetching security findings:', error);
    res.status(500).json({ error: 'Failed to fetch security findings' });
  }
});

export default router; 