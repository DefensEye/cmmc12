-- Create an RPC function to get security findings from the private schema
CREATE OR REPLACE FUNCTION get_security_findings(limit_count integer DEFAULT 50)
RETURNS SETOF private.security_findings
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM private.security_findings
  ORDER BY create_time DESC
  LIMIT limit_count;
$$; 