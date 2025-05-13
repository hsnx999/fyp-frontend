/*
  # Initial schema setup for ThoraScan

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `age` (integer, required)
      - `gender` (text, required)
      - `status` (text, required)
      - `diagnosis` (text, required)
      - `last_visit` (timestamptz, default now)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `patients` table
    - Add policies for authenticated users to:
      - Read their own patients
      - Create new patients
      - Update their own patients
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  status text NOT NULL,
  diagnosis text NOT NULL,
  last_visit timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own patients
CREATE POLICY "Users can read own patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to create patients
CREATE POLICY "Users can create patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own patients
CREATE POLICY "Users can update own patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();