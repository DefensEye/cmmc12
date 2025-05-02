import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('Environment Variables Check:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Found' : 'Missing');
console.log('All env vars:', Object.keys(process.env));

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from dist directory
const distPath = path.join(__dirname, '../dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// Root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Initialize Supabase
let supabase = null;

// Middleware to initialize Supabase for each request
app.use((req, res, next) => {
  const url = process.env.VITE_SUPABASE_URL || req.headers['x-supabase-url'];
  const key = process.env.VITE_SUPABASE_ANON_KEY || req.headers['x-supabase-key'];

  if (url && key) {
    try {
      supabase = createClient(url, key, {
        db: {
          schema: 'private'
        }
      });
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      res.status(500).json({ error: 'Failed to initialize Supabase client' });
      return;
    }
  } else {
    console.warn('Supabase credentials missing. Will fallback to CSV processing only.');
  }
  next();
});

// Initialize LLM (using a placeholder for now)
const analyzeFindingsWithLLM = async (findings) => {
  try {
    // Convert findings to a format suitable for the LLM
    const formattedFindings = findings.map(finding => {
      let description = "No description available";
      
      // Handle source_properties which might be a string or object
      if (finding.source_properties) {
        if (typeof finding.source_properties === 'string') {
          try {
            // Try to parse if it's a JSON string
            const sourceProps = JSON.parse(finding.source_properties);
            if (sourceProps.summary_message && sourceProps.summary_message.stringValue) {
              description = sourceProps.summary_message.stringValue;
            }
          } catch (e) {
            // If parsing fails, use the string as is
            description = finding.source_properties.substring(0, 100) + '...';
          }
        } else if (typeof finding.source_properties === 'object') {
          description = finding.source_properties.description || 
                       finding.source_properties.summary || 
                       finding.source_properties.title || 
                       `${finding.category} finding`;
        }
      }
      
      return {
        id: finding.finding_id,
        category: finding.category || 'Unknown',
        resource: finding.resource_name || 'N/A',
        severity: finding.severity || 'Unknown',
        state: finding.state || 'Unknown',
        description: description,
        createdAt: finding.create_time || 'Unknown'
      };
    });

    console.log(`Analyzing ${formattedFindings.length} security findings with LLM`);
    console.log('Sample finding for analysis:', JSON.stringify(formattedFindings[0], null, 2));
    
    // For now, return the mock data with dynamic counts based on real findings
    const result = structureMockResults(formattedFindings);
    return result;
  } catch (error) {
    console.error('Error in LLM analysis:', error);
    throw new Error(`LLM analysis failed: ${error.message}`);
  }
};

// Helper function to parse CSV data
const parseCSV = (csvData) => {
  if (!csvData) return [];
  
  const lines = csvData.trim().split('\n');
  if (lines.length <= 1) return [];
  
  // Get headers from first line
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Parse each line into an object
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const finding = {};
    
    headers.forEach((header, index) => {
      finding[header] = values[index];
    });
    
    return {
      finding_id: finding.id || `finding-${Math.random().toString(36).substring(2, 15)}`,
      category: finding.category || 'Unknown',
      resource_name: finding.resource || 'N/A',
      severity: finding.severity || 'MEDIUM',
      state: finding.state || 'ACTIVE',
      create_time: finding.create_time || new Date().toISOString(),
      source_properties: {
        description: finding.description || 'No description provided'
      }
    };
  });
};

// Function to structure mock results with dynamic data from findings
const structureMockResults = (findings) => {
  // Count findings by severity
  const severityCounts = findings.reduce((acc, finding) => {
    const severity = finding.severity.toUpperCase();
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  
  // Generate dynamic distribution based on findings
  const highCount = severityCounts['HIGH'] || 0;
  const criticalCount = severityCounts['CRITICAL'] || 0;
  const mediumCount = severityCounts['MEDIUM'] || 0;
  const lowCount = severityCounts['LOW'] || 0;
  const totalCount = findings.length;
  
  // Calculate mock compliance scores based on severity
  const severeIssues = highCount + criticalCount * 2;
  const compliancePercentage = Math.max(30, Math.min(90, 90 - (severeIssues * 5)));
  
  const compliantCount = Math.floor(totalCount * (compliancePercentage / 100));
  const partialCount = Math.floor(totalCount * 0.2);
  const nonCompliantCount = totalCount - compliantCount - partialCount;
  
  // Determine overall score (0-100)
  const overallScore = Math.max(0, Math.min(100, Math.floor(compliancePercentage)));
  
  // Generate summary with actual finding counts
  const summary = `Based on the analysis of ${totalCount} security findings, your system shows ${overallScore < 70 ? 'partial' : 'substantial'} compliance with CMMC Level 2 requirements. ${criticalCount > 0 ? `${criticalCount} critical and ${highCount} high severity issues require immediate attention.` : highCount > 0 ? `${highCount} high severity issues require prompt attention.` : ''} Several areas need focus, particularly in access control (AC) and system protection (SC) domains.`;
  
  return {
    summary,
    overallScore,
    compliantCount,
    partialCount,
    nonCompliantCount,
    fileName: "supabase-security-findings.json",
    assessorName: "Jane Wilson, CMMC-PA",
    assessorCredentials: "CMMC Provisional Assessor, Certified Information Systems Security Professional (CISSP), Certified Ethical Hacker (CEH)",
    assessmentDate: new Date().toISOString().split('T')[0],
    assessmentType: "Initial CMMC Level 2 Assessment",
    domainDistribution: [
      {
        domainId: "AC",
        domainName: "Access Control",
        compliantCount: Math.floor(compliantCount * 0.2),
        partialCount: Math.floor(partialCount * 0.3),
        nonCompliantCount: Math.floor(nonCompliantCount * 0.4)
      },
      {
        domainId: "AU",
        domainName: "Audit and Accountability",
        compliantCount: Math.floor(compliantCount * 0.3),
        partialCount: Math.floor(partialCount * 0.2),
        nonCompliantCount: Math.floor(nonCompliantCount * 0.1)
      },
      {
        domainId: "CM",
        domainName: "Configuration Management",
        compliantCount: Math.floor(compliantCount * 0.2),
        partialCount: Math.floor(partialCount * 0.4),
        nonCompliantCount: Math.floor(nonCompliantCount * 0.2)
      },
      {
        domainId: "IA",
        domainName: "Identification and Authentication",
        compliantCount: Math.floor(compliantCount * 0.2),
        partialCount: Math.floor(partialCount * 0.1),
        nonCompliantCount: Math.floor(nonCompliantCount * 0.2)
      },
      {
        domainId: "SC",
        domainName: "System and Communications Protection",
        compliantCount: Math.floor(compliantCount * 0.1),
        partialCount: Math.floor(partialCount * 0.3),
        nonCompliantCount: Math.floor(nonCompliantCount * 0.5)
      }
    ],
    // Rest of mock data structure
    non_compliant_controls: [
      "AC.1.001", "AC.1.002", "AC.2.016", "AC.3.017", 
      "AU.2.041", "CM.2.061", "CM.2.064", 
      "IA.1.076", "IA.2.078", 
      "SC.1.175", "SC.2.179", "SC.3.180", "SC.3.183", "SC.3.187"
    ],
    detailedAssessment: {
      "AC.1.001": {
        control_id: "AC.1.001",
        title: "Limit information system access to authorized users, processes acting on behalf of authorized users, or devices",
        level: "Level 1",
        status: "Non-Compliant",
        findings: "Multiple cloud storage resources were found with overly permissive access controls. User accounts have unnecessarily elevated privileges across 6 identified resources. No formal access control policy was identified.",
        evidence: "Security scanning detected public access permissions on 3 storage buckets containing potentially sensitive information. Administrative access granted to standard user accounts.",
        impact: "Critical - Potential unauthorized access to sensitive information",
        recommendation: "Implement role-based access control (RBAC) for all cloud resources. Limit administrative privileges to only necessary personnel."
      },
      // other control assessments remain the same
      "AC.1.002": {
        control_id: "AC.1.002", 
        title: "Limit information system access to the types of transactions and functions that authorized users are permitted to execute",
        level: "Level 1",
        status: "Non-Compliant",
        findings: "No evidence of principle of least privilege implementation. Users have access to functions beyond their operational needs.",
        evidence: "Multiple service accounts with excessive permissions. Development accounts with production data access.",
        impact: "High - Increased attack surface through unnecessary permissions",
        recommendation: "Implement function-level access controls. Create permission groups based on job responsibilities and apply least privilege principles."
      },
      "AC.2.016": {
        control_id: "AC.2.016",
        title: "Control the flow of CUI in accordance with approved authorizations",
        level: "Level 2",
        status: "Non-Compliant",
        findings: "No controls in place to monitor or restrict data flow between security domains. CUI data potentially accessible across unauthorized system boundaries.",
        evidence: "Network security configuration lacks appropriate segmentation and data flow controls.",
        impact: "High - Uncontrolled CUI data flow across security boundaries",
        recommendation: "Implement network segmentation, data flow controls, and monitor for unauthorized data transfers."
      },
      "IA.1.076": {
        control_id: "IA.1.076",
        title: "Identify information system users, processes acting on behalf of users, or devices",
        level: "Level 1",
        status: "Non-Compliant",
        findings: "Inadequate user identification mechanisms. Shared accounts detected in multiple systems.",
        evidence: "Audit logs show multiple IPs accessing the same generic account credentials.",
        impact: "Critical - Inability to track user actions to specific individuals",
        recommendation: "Implement unique identification for all users. Eliminate shared accounts. Enforce account naming conventions."
      },
      "SC.1.175": {
        control_id: "SC.1.175",
        title: "Monitor, control, and protect organizational communications at external boundaries and key internal boundaries",
        level: "Level 1",
        status: "Non-Compliant",
        findings: "Insufficient monitoring of network boundaries. No evidence of boundary protection between network segments.",
        evidence: "Firewall configurations show minimal traffic filtering. No intrusion detection/prevention systems in place.",
        impact: "Critical - Potential undetected breach attempts and lateral movement",
        recommendation: "Implement boundary protection controls including firewalls, IDS/IPS, and network monitoring solutions."
      }
    },
    priorityGaps: [
      {
        control_id: "AC.1.001",
        priority: "Critical",
        effort: "Medium Effort",
        recommendation: "Implement access control policies to limit system access to authorized users. Current findings show unrestricted access to several cloud resources.",
        potential_impact: "Unauthorized access could lead to data breaches and compromise sensitive information."
      },
      {
        control_id: "SC.3.180",
        priority: "High",
        effort: "High Effort",
        recommendation: "Employ architectural designs and software development techniques that promote effective information security within organizational systems. Current cloud configuration lacks defense-in-depth strategies.",
        potential_impact: "Without proper security architecture, attackers may bypass single layer defenses and gain access to protected resources."
      },
      {
        control_id: "CM.2.064",
        priority: "Medium",
        effort: "Low Effort",
        recommendation: "Establish and enforce security configuration settings for information technology products. Several instances were detected with default or weak security configurations.",
        potential_impact: "Improperly configured systems may have vulnerabilities that can be easily exploited."
      }
    ],
    recommendations: [
      {
        control_id: "AC.1.001",
        recommendation: "Implement role-based access control (RBAC) for all cloud resources. Limit administrative privileges to only those users requiring such access."
      },
      {
        control_id: "SC.3.180",
        recommendation: "Redesign cloud architecture to implement defense-in-depth strategies. Consider adding network segmentation, firewalls, and intrusion detection systems."
      },
      {
        control_id: "CM.2.064",
        recommendation: "Apply security hardening guidelines to all cloud resources. Develop and implement standard security configurations for common resources."
      },
      {
        control_id: "IA.1.076",
        recommendation: "Implement multi-factor authentication for all user accounts, especially for accounts with administrative privileges."
      },
      {
        control_id: "SC.1.175",
        recommendation: "Implement encryption for all data at rest and in transit. Ensure proper key management practices are followed."
      }
    ],
    assessorComments: "As a CMMC Third-party Assessor, I've evaluated your security posture against CMMC Level 1 and Level 2 requirements. The assessment reveals significant gaps in your implementation of basic safeguards, particularly in Access Control (AC) and System and Communications Protection (SC) domains. These issues must be addressed before certification can be granted. Based on the findings, I recommend focusing on implementing proper access controls, establishing network boundary protection, and enforcing least privilege principles as immediate priorities."
  };
};



// API endpoint for CMMC analysis using Supabase data
app.post('/api/analyze-rag', async (req, res) => {
  try {
    console.log('Received request to analyze GCP security findings for CMMC Level 1');
    
    const { securityDataCsv } = req.body;
    let securityFindings = parseCSV(securityDataCsv);
    
    // Try to fetch from Supabase if client is initialized
    if (supabase) {
      try {
        // Query security_findings table directly from private schema with explicit schema reference
        console.log('Querying security_findings from private schema');
        const { data, error } = await supabase
          .from('security_findings')
          .select('*')
          .order('create_time', { ascending: false })
          .limit(50); // Limit to 50 findings to avoid too much data
          
        if (error) {
          console.error('Error querying security_findings:', error);
          // Will try an alternative approach with explicit schema
          try {
            console.log('Trying with rpc function instead...');
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'get_security_findings',
              { limit_count: 50 }
            );
            
            if (rpcError) {
              console.error('Error using rpc function:', rpcError);
              // Will fall back to CSV processing
            } else {
              securityFindings = rpcData || [];
              console.log(`Retrieved ${securityFindings.length} findings from Supabase via RPC`);
            }
          } catch (rpcError) {
            console.error('Error with RPC approach:', rpcError);
            // Will fall back to CSV processing
          }
        } else {
          securityFindings = data || [];
          console.log(`Retrieved ${securityFindings.length} findings from Supabase`);
        }
      } catch (dbError) {
        console.error('Error fetching from Supabase:', dbError);
        // Will fall back to CSV processing
      }
    } else {
      console.log('Supabase not initialized, using CSV data only');
    }
    
    // If no findings from Supabase or Supabase error, use CSV data from request
    if (securityFindings.length === 0 && req.body && req.body.securityDataCsv) {
      // Parse CSV data (simplified parsing for example purposes)
      const csvLines = req.body.securityDataCsv.trim().split('\n');
      const headers = csvLines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      securityFindings = csvLines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const finding = {};
        
        headers.forEach((header, index) => {
          finding[header.toLowerCase().replace(/\s/g, '_')] = values[index] || null;
        });
        
        return {
          finding_id: finding.id || `mock-${Math.random().toString(36).substring(2, 15)}`,
          category: finding.category || 'Unknown',
          resource_name: finding.resource || 'N/A',
          severity: finding.severity || 'MEDIUM',
          state: finding.state || 'ACTIVE',
          create_time: finding.create_time || new Date().toISOString(),
          source_properties: {
            description: finding.description || 'No description provided'
          }
        };
      });
      
      console.log(`Parsed ${securityFindings.length} findings from CSV data`);
    }
    
    // If we have findings, analyze them with LLM
    if (securityFindings.length > 0) {
      // Analyze findings for CMMC Level 1
      const analysisResult = await analyzeCMMCLevel1(securityFindings);
      
      res.json(analysisResult);
    } else {
      // No findings to analyze
      res.status(400).json({ 
        error: 'No security findings available for analysis',
        detail: 'Please ensure security findings are loaded in the database or provide valid CSV data.'
      });
    }
  } catch (error) {
    console.error('Error analyzing security data:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      detail: error.message
    });
  }
});

// GET endpoint for chatbot
app.get('/api/chatbot', (req, res) => {
  res.json({
    message: "This is a GET endpoint for the chatbot. Please use POST to send messages.",
    timestamp: new Date().toISOString()
  });
});

// GET endpoint for analyze-rag
app.get('/api/analyze-rag', (req, res) => {
  res.json({
    message: "This is a GET endpoint for analyze-rag. Please use POST to send data for analysis.",
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - http://localhost:${PORT}/api/analyze-rag`);
}); 