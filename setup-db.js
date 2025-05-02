import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server directory
const envPath = path.resolve(__dirname, 'server', '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

// Try both standard and Vite prefixed environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Environment Check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('SUPABASE_KEY:', supabaseKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\nMissing Supabase credentials. Checked for:');
  console.error('- SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('- SUPABASE_KEY or VITE_SUPABASE_KEY or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('\nInitializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Connected to Supabase');

    // First, test the connection by trying to read the security_findings table
    console.log('\nTesting existing table...');
    const { data: existingData, error: readError } = await supabase
      .from('security_findings')
      .select('*')
      .limit(1);

    if (!readError) {
      console.log('✓ security_findings table exists');
      console.log('Sample data:', existingData);
      return; // Table exists, no need to create
    }

    console.log('\nCreating security_findings table...');
    // Read and execute SQL script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'create_security_findings_table.sql'), 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error('Error executing SQL:', error);
            // Try direct query if RPC fails
            const { error: directError } = await supabase.query(statement);
            if (directError) {
              console.error('Error with direct query:', directError);
            } else {
              console.log('✓ SQL executed successfully (direct)');
            }
          } else {
            console.log('✓ SQL executed successfully (RPC)');
          }
        } catch (err) {
          console.error('Error executing statement:', err);
        }
      }
    }

    // Verify the table was created
    const { data, error } = await supabase
      .from('security_findings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error verifying table:', error);
    } else {
      console.log('\n✓ Table verification successful');
      if (data && data.length > 0) {
        console.log('Sample data:', data[0]);
      }
    }

  } catch (err) {
    console.error('Setup error:', err);
  }
}

setupDatabase(); 