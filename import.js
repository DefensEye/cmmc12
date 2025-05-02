// import.js - Fixed to properly populate all fields
import { config } from 'dotenv';
import { SecurityCenterClient } from '@google-cloud/security-center';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
config();

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting import process...');
  
  try {
    // Set the credentials file path to your existing file
    const credentialsPath = path.join(__dirname, 'd5assistant-6c0b4c1a871e.json');
    
    // Set environment variable to point to credentials file
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log(`Using credentials file: ${credentialsPath}`);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
    
    // First, check the table structure
    console.log('Checking table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('security_findings')
      .select('*')
      .limit(1);
    
    let tableColumns = [];
    
    if (tableError) {
      console.error('Error querying table:', tableError);
      console.log('Will try to insert with minimal fields');
      tableColumns = ['finding_id', 'category', 'resource_name', 'severity', 'state', 
                      'event_time', 'create_time', 'update_time', 'source_properties', 
                      'parent_name', 'raw_finding']; // Assume all fields exist
    } else {
      if (tableData && tableData.length > 0) {
        tableColumns = Object.keys(tableData[0]);
        console.log('Available table columns:', tableColumns);
      } else {
        console.log('Table exists but has no rows. Will try with all fields.');
        tableColumns = ['finding_id', 'category', 'resource_name', 'severity', 'state', 
                        'event_time', 'create_time', 'update_time', 'source_properties', 
                        'parent_name', 'raw_finding']; // Assume all fields exist
      }
    }
    
    // Initialize Security Center client
    console.log('Initializing Security Center client...');
    const securityCenter = new SecurityCenterClient({
      keyFilename: credentialsPath,
      projectId: 'd5assistant'
    });
    console.log('Security Center client initialized');
    
    // Get the organization ID from environment variables
    const organizationId = process.env.GOOGLE_ORGANIZATION_ID;
    if (!organizationId) {
      throw new Error('Missing GOOGLE_ORGANIZATION_ID environment variable');
    }
    console.log(`Using organization ID: ${organizationId}`);
    
    // Use the organization ID in the parent path
    const parent = `organizations/${organizationId}/sources/-`;  // Using wildcard (-) for source_id
    console.log(`Using parent: ${parent}`);
    
    // Get findings - increase pageSize to get more findings
    console.log('Fetching findings...');
    const [findings] = await securityCenter.listFindings({
      parent: parent,
      filter: 'state="ACTIVE"',
      pageSize: 100 // Increased to get more findings
    });
    
    console.log(`Found ${findings.length} findings`);
    
    // Process all findings
    if (findings.length > 0) {
      // Process all findings
      const processedFindings = findings.map(finding => {
        // Try to extract a finding ID safely
        let findingId = 'unknown';
        
        if (finding.name) {
          const findingIdMatch = finding.name.match(/findings\/(.+)$/);
          findingId = findingIdMatch ? findingIdMatch[1] : finding.name;
        } else if (finding.finding && finding.finding.name) {
          const findingIdMatch = finding.finding.name.match(/findings\/(.+)$/);
          findingId = findingIdMatch ? findingIdMatch[1] : finding.finding.name;
        } else {
          // Generate a random ID if we can't find one
          findingId = `unknown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
        
        // Create a base object with all possible fields - using the more flexible approach from test-import.js
        const allFields = {
          finding_id: findingId,
          category: (finding.category || finding.finding?.category || ''),
          resource_name: (finding.resourceName || finding.finding?.resourceName || ''),
          severity: (finding.severity || finding.finding?.severity || ''),
          state: (finding.state || finding.finding?.state || ''),
          event_time: finding.eventTime ? 
            new Date(parseInt(finding.eventTime.seconds) * 1000).toISOString() : 
            finding.finding?.eventTime ? 
              new Date(parseInt(finding.finding.eventTime.seconds) * 1000).toISOString() : 
              new Date().toISOString(),
          create_time: finding.createTime ? 
            new Date(parseInt(finding.createTime.seconds) * 1000).toISOString() : 
            finding.finding?.createTime ? 
              new Date(parseInt(finding.finding.createTime.seconds) * 1000).toISOString() : 
              new Date().toISOString(),
          update_time: new Date().toISOString(),
          source_properties: JSON.stringify(finding.sourceProperties || finding.finding?.sourceProperties || {}),
          parent_name: (finding.parent || finding.finding?.parent || ''),
          raw_finding: JSON.stringify(finding)
        };
        
        // Filter to only include fields that exist in the table
        const processedFinding = {};
        for (const column of tableColumns) {
          if (column in allFields) {
            processedFinding[column] = allFields[column];
          }
        }
        
        return processedFinding;
      });
      
      console.log(`Processed ${processedFindings.length} findings`);
      
      // Log a sample processed finding to verify fields
      if (processedFindings.length > 0) {
        console.log('Sample processed finding:');
        console.log(processedFindings[0]);
      }
      
      // Insert findings in batches to avoid request size limits
      const batchSize = 20;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < processedFindings.length; i += batchSize) {
        const batch = processedFindings.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(processedFindings.length/batchSize)} (${batch.length} findings)`);
        
        try {
          const { data, error } = await supabase
            .from('security_findings')
            .upsert(batch, { onConflict: 'finding_id' });
          
          if (error) {
            console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
            errorCount += batch.length;
          } else {
            console.log(`Successfully inserted/updated batch ${Math.floor(i/batchSize) + 1}`);
            successCount += batch.length;
          }
        } catch (batchError) {
          console.error(`Exception inserting batch ${Math.floor(i/batchSize) + 1}:`, batchError);
          errorCount += batch.length;
        }
      }
      
      console.log(`Import summary: ${successCount} findings successfully inserted/updated, ${errorCount} errors`);
    } else {
      console.log('No findings to process');
    }
    
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

main();