import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string; // Load from Vite's env
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string; // Load from Vite's env

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'private',
  },
});
export interface UserRecord {
  user_id: string;
  user_name: string;
  user_email: string;
  uploaded_file_name?: string;
  file_uploaded_at?: string;
}

// Function to insert or update user record
export async function upsertUserRecord(record: UserRecord) {
  const userId = uuidv4();
  
  const { data, error } = await supabase
  .from('users')
  .upsert([{ ...record, user_id: userId }], { 
    onConflict: 'user_id',
  });

  if (error) {
    console.error('Error upserting user record:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

// Interface for security findings with your actual database columns
// Add these to your existing supabase.ts file

// Interface for security findings
export interface SecurityFinding {
  finding_id: string;
  category?: string;
  resource_name?: string;
  severity?: string;
  state?: string;
  event_time?: string;
  create_time?: string;
  update_time?: string;
  source_properties?: any;
  parent_name?: string;
  raw_finding?: any;
}

// Function to fetch security findings
export async function fetchSecurityFindings(): Promise<SecurityFinding[]> {
  const { data, error } = await supabase
    .from('security_findings')
    .select('*')
    .order('create_time', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch security findings: ${error.message}`);
  }
  return data as SecurityFinding[];
}

// Updated interface to match your CMMC database schema
export interface DBCMMCControl {
  Domain: string;
  Level: number;
  ID: string;
  ShortName: string;
  Requirement: string;
  References: string;
}

// Function to fetch all CMMC controls
export async function fetchCMMCControls(): Promise<DBCMMCControl[]> {
  const { data, error } = await supabase
    .from('CMMC') // Your table name
    .select('*')
    .order('ID');

  if (error) {
    throw new Error(`Failed to fetch CMMC controls: ${error.message}`);
  }
  return data as DBCMMCControl[];
}

// Function to fetch controls by domain
export async function fetchControlsByDomain(domain: string): Promise<DBCMMCControl[]> {
  const { data, error } = await supabase
    .from('CMMC')
    .select('*')
    .eq('Domain', domain)
    .order('ID');

  if (error) {
    throw new Error(`Failed to fetch controls for domain ${domain}: ${error.message}`);
  }
  return data as DBCMMCControl[];
}

// Function to fetch controls by level
export async function fetchControlsByLevel(level: number): Promise<DBCMMCControl[]> {
  const { data, error } = await supabase
    .from('CMMC')
    .select('*')
    .eq('Level', level)
    .order('ID');

  if (error) {
    throw new Error(`Failed to fetch controls for level ${level}: ${error.message}`);
  }
  return data as DBCMMCControl[];
}

// Function to search controls
export async function searchControls(searchTerm: string): Promise<DBCMMCControl[]> {
  const { data, error } = await supabase
    .from('CMMC')
    .select('*')
    .or(`ShortName.ilike.%${searchTerm}%,Requirement.ilike.%${searchTerm}%`)
    .order('ID');

  if (error) {
    throw new Error(`Failed to search controls with term "${searchTerm}": ${error.message}`);
  }
  return data as DBCMMCControl[];
}


  
