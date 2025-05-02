-- Create security_findings table
CREATE TABLE IF NOT EXISTS security_findings (
    finding_id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resource_name TEXT,
    state TEXT DEFAULT 'ACTIVE',
    source_properties JSONB,
    cmmc_domain TEXT,
    cmmc_practice TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_security_findings_category ON security_findings(category);
CREATE INDEX IF NOT EXISTS idx_security_findings_severity ON security_findings(severity);
CREATE INDEX IF NOT EXISTS idx_security_findings_create_time ON security_findings(create_time);

-- Insert some sample data
INSERT INTO security_findings (
    finding_id,
    category,
    severity,
    description,
    resource_name,
    cmmc_domain,
    cmmc_practice
) VALUES
    ('AC-001', 'AC', 'HIGH', 'Multiple cloud storage resources with overly permissive access controls', 'Storage Bucket 1', 'AC', 'AC.1.001'),
    ('AC-002', 'AC', 'MEDIUM', 'No evidence of principle of least privilege implementation', 'IAM Policy 1', 'AC', 'AC.1.002'),
    ('SC-001', 'SC', 'CRITICAL', 'Insufficient monitoring of network boundaries', 'Network Security Group 1', 'SC', 'SC.1.175'),
    ('IA-001', 'IA', 'HIGH', 'Inadequate user identification mechanisms', 'User Account 1', 'IA', 'IA.1.076'),
    ('CM-001', 'CM', 'MEDIUM', 'Default security configurations detected', 'VM Instance 1', 'CM', 'CM.2.064'); 