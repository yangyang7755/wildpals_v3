-- Create table for password reset verification codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  invalidated BOOLEAN DEFAULT FALSE
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);

-- Add unique constraint to ensure only one active code per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_reset_code_per_user 
  ON password_reset_codes(user_id) 
  WHERE verified = FALSE AND invalidated = FALSE;

-- Enable RLS
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reset codes (needed when user requests reset)
CREATE POLICY "Allow insert for password reset"
  ON password_reset_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select reset codes (needed during verification)
CREATE POLICY "Allow select for password reset"
  ON password_reset_codes
  FOR SELECT
  USING (true);

-- Allow anyone to update reset codes (for attempts tracking and marking as verified)
CREATE POLICY "Allow update for password reset"
  ON password_reset_codes
  FOR UPDATE
  WITH CHECK (true);

COMMENT ON TABLE password_reset_codes IS 'Stores password reset verification codes';
COMMENT ON COLUMN password_reset_codes.code IS '4-digit verification code for password reset';
COMMENT ON COLUMN password_reset_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN password_reset_codes.invalidated IS 'True when user requests a new code';
