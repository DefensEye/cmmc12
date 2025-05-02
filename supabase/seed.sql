-- Insert sample compliance data
INSERT INTO compliance_data (
    file_name,
    overall_score,
    compliance_level,
    risk_level,
    total_findings,
    compliant_count,
    non_compliant_count,
    partially_compliant_count,
    domain_distribution,
    critical_gaps,
    recommendations
) VALUES (
    'sample-compliance-report.pdf',
    75,
    'Level 1',
    'MEDIUM',
    25,
    15,
    5,
    5,
    '[
        {
            "name": "Access Control",
            "score": 80,
            "status": "Partially Compliant"
        },
        {
            "name": "Configuration Management",
            "score": 70,
            "status": "Partially Compliant"
        },
        {
            "name": "System and Information Integrity",
            "score": 90,
            "status": "Compliant"
        }
    ]'::jsonb,
    '[
        "Unencrypted data at rest in multiple storage systems",
        "Missing multi-factor authentication for privileged accounts",
        "Inadequate audit logging and monitoring capabilities"
    ]'::jsonb,
    '[
        {
            "title": "Implement Multi-Factor Authentication",
            "description": "Configure MFA for all privileged accounts",
            "priority": "High",
            "effort": "Medium Effort"
        },
        {
            "title": "Enable Encryption",
            "description": "Encrypt all sensitive data at rest",
            "priority": "Critical",
            "effort": "High Effort"
        }
    ]'::jsonb
);

-- Insert sample domain compliance
INSERT INTO domain_compliance (
    compliance_data_id,
    name,
    score,
    status,
    findings,
    recommendations
) VALUES (
    (SELECT id FROM compliance_data WHERE file_name = 'sample-compliance-report.pdf'),
    'Access Control',
    80,
    'Partially Compliant',
    '[
        "Weak password policies",
        "Missing account lockout mechanism"
    ]'::jsonb,
    '[
        {
            "title": "Strengthen Password Policies",
            "description": "Implement strong password requirements"
        },
        {
            "title": "Add Account Lockout",
            "description": "Configure account lockout after failed attempts"
        }
    ]'::jsonb
);

-- Insert sample practice details
INSERT INTO practice_details (
    domain_id,
    title,
    description,
    status,
    priority,
    effort,
    recommendations,
    evidence
) VALUES (
    (SELECT id FROM domain_compliance WHERE name = 'Access Control'),
    'Password Management',
    'Password management practices and policies',
    'Partially Compliant',
    'High',
    'Medium Effort',
    ARRAY['Implement password rotation policy', 'Enforce password complexity requirements'],
    ARRAY['Current password policy document', 'Password complexity requirements']
);

-- Insert sample recommendations
INSERT INTO recommendation_details (
    compliance_data_id,
    title,
    description,
    priority,
    effort,
    status,
    due_date,
    assigned_to
) VALUES (
    (SELECT id FROM compliance_data WHERE file_name = 'sample-compliance-report.pdf'),
    'Implement MFA',
    'Configure multi-factor authentication for all privileged accounts',
    'High',
    'Medium Effort',
    'Not Started',
    '2025-05-30T00:00:00Z',
    'security-team@example.com'
);
