/*
  # Create security findings table

  1. New Tables
    - `security_findings`
      - `id` (uuid, primary key)
      - `finding_id` (text, unique) - Google Cloud finding ID
      - `title` (text) - Finding title/name
      - `description` (text) - Detailed description
      - `severity` (text) - Finding severity level
      - `status` (text) - Current status
      - `category` (text) - Finding category/type
      - `resource_name` (text) - Affected resource
      - `first_detected` (timestamptz) - When the finding was first detected
      - `last_detected` (timestamptz) - Last time the finding was detected
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp
      - `user_id` (uuid) - Reference to users table
      
  2. Security
    - Enable RLS on security_findings table
    - Add policies for authenticated users to read their findings
*/

CREATE TABLE IF NOT EXISTS security_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL,
  status text NOT NULL,
  category text,
  resource_name text,
  first_detected timestamptz NOT NULL,
  last_detected timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(user_id) NOT NULL
);

-- Enable RLS
ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own findings"
  ON security_findings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own findings"
  ON security_findings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own findings"
  ON security_findings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_findings_updated_at
  BEFORE UPDATE
  ON security_findings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();