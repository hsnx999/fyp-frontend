/*
  # Comprehensive Patient Analysis System

  1. New Columns for patients table
    - `date_of_birth` (date)
    - `phone_number` (text)
    - `email_address` (text)
    - `address` (text)
    - `medical_history_summary` (text)

  2. New Tables
    - `ct_analysis_results`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `analysis_id` (uuid, links analysis session)
      - `image_url` (text)
      - `prediction_type` (text)
      - `confidence` (numeric)
      - `created_at` (timestamptz)
    
    - `clinical_notes_results`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `analysis_id` (uuid, links analysis session)
      - `notes_content` (text)
      - `extracted_entities_json` (jsonb)
      - `created_at` (timestamptz)
    
    - `medications_treatments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `analysis_id` (uuid, links analysis session)
      - `medication_name` (text)
      - `dosage` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `notes` (text)
      - `created_at` (timestamptz)

  3. Updates to reports table
    - `analysis_id` (uuid, links analysis session)
    - `risk_scores_json` (jsonb)
    - `critical_findings` (boolean)
    - `status` (text)
    - `patient_id` (uuid, references patients)

  4. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
*/

-- Add new columns to patients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE patients ADD COLUMN date_of_birth DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE patients ADD COLUMN phone_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'email_address'
  ) THEN
    ALTER TABLE patients ADD COLUMN email_address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'address'
  ) THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'medical_history_summary'
  ) THEN
    ALTER TABLE patients ADD COLUMN medical_history_summary TEXT;
  END IF;
END $$;

-- Create ct_analysis_results table
CREATE TABLE IF NOT EXISTS ct_analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  analysis_id uuid NOT NULL,
  image_url TEXT,
  prediction_type TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create clinical_notes_results table
CREATE TABLE IF NOT EXISTS clinical_notes_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  analysis_id uuid NOT NULL,
  notes_content TEXT NOT NULL,
  extracted_entities_json JSONB,
  created_at timestamptz DEFAULT now()
);

-- Create medications_treatments table
CREATE TABLE IF NOT EXISTS medications_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  analysis_id uuid NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at timestamptz DEFAULT now()
);

-- Update reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'analysis_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN analysis_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'risk_scores_json'
  ) THEN
    ALTER TABLE reports ADD COLUMN risk_scores_json JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'critical_findings'
  ) THEN
    ALTER TABLE reports ADD COLUMN critical_findings BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'completed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN patient_id uuid REFERENCES patients(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE ct_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications_treatments ENABLE ROW LEVEL SECURITY;

-- RLS policies for ct_analysis_results
CREATE POLICY "Users can read own ct analysis results"
  ON ct_analysis_results
  FOR SELECT
  TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert ct analysis results"
  ON ct_analysis_results
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- RLS policies for clinical_notes_results
CREATE POLICY "Users can read own clinical notes results"
  ON clinical_notes_results
  FOR SELECT
  TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert clinical notes results"
  ON clinical_notes_results
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- RLS policies for medications_treatments
CREATE POLICY "Users can read own medications treatments"
  ON medications_treatments
  FOR SELECT
  TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert medications treatments"
  ON medications_treatments
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update medications treatments"
  ON medications_treatments
  FOR UPDATE
  TO authenticated
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));