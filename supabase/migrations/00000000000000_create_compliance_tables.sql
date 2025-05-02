-- Create compliance_data table
CREATE TABLE IF NOT EXISTS compliance_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_name TEXT NOT NULL,
    overall_score INTEGER NOT NULL DEFAULT 0,
    compliance_level TEXT NOT NULL DEFAULT 'Level 1',
    risk_level TEXT NOT NULL DEFAULT 'LOW',
    total_findings INTEGER NOT NULL DEFAULT 0,
    compliant_count INTEGER NOT NULL DEFAULT 0,
    non_compliant_count INTEGER NOT NULL DEFAULT 0,
    partially_compliant_count INTEGER NOT NULL DEFAULT 0,
    domain_distribution JSONB,
    critical_gaps JSONB,
    recommendations JSONB,
    finding_ids UUID[] DEFAULT '{}', -- Array of security finding IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create view to join compliance data with security findings
CREATE OR REPLACE VIEW public.compliance_with_findings AS
SELECT 
    cd.*,
    sf.*
FROM compliance_data cd
LEFT JOIN LATERAL (
    SELECT 
        jsonb_agg(jsonb_build_object(
            'id', sf.id,
            'title', sf.title,
            'description', sf.description,
            'severity', sf.severity,
            'category', sf.category,
            'resource_name', sf.resource_name,
            'resource_type', sf.resource_type,
            'location', sf.location,
            'finding_time', sf.finding_time
        )) as findings
    FROM private.security_findings sf
    WHERE sf.id = ANY(cd.finding_ids)
    GROUP BY cd.id
) sf ON true;

-- Create domain_compliance table
CREATE TABLE IF NOT EXISTS domain_compliance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    compliance_data_id UUID REFERENCES compliance_data(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Not Assessed',
    findings JSONB,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create practice_details table
CREATE TABLE IF NOT EXISTS practice_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain_id UUID REFERENCES domain_compliance(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Not Assessed',
    priority TEXT NOT NULL DEFAULT 'Low',
    effort TEXT NOT NULL DEFAULT 'Low Effort',
    recommendations TEXT[],
    evidence TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create recommendation_details table
CREATE TABLE IF NOT EXISTS recommendation_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    compliance_data_id UUID REFERENCES compliance_data(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'Low',
    effort TEXT NOT NULL DEFAULT 'Low Effort',
    status TEXT NOT NULL DEFAULT 'Not Started',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_compliance_data_file_name ON compliance_data(file_name);
CREATE INDEX IF NOT EXISTS idx_compliance_data_finding_ids ON compliance_data USING GIN (finding_ids);
CREATE INDEX IF NOT EXISTS idx_domain_compliance_compliance_data_id ON domain_compliance(compliance_data_id);
CREATE INDEX IF NOT EXISTS idx_practice_details_domain_id ON practice_details(domain_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_details_compliance_data_id ON recommendation_details(compliance_data_id);

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_compliance_data_updated_at
    BEFORE UPDATE ON compliance_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_compliance_updated_at
    BEFORE UPDATE ON domain_compliance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_details_updated_at
    BEFORE UPDATE ON practice_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendation_details_updated_at
    BEFORE UPDATE ON recommendation_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
