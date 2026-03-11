-- Function to confirm user email (requires elevated privileges)
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Update the email_confirmed_at timestamp in auth.users
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION confirm_user_email(UUID) TO authenticated;

COMMENT ON FUNCTION confirm_user_email IS 'Confirms user email after OTP verification';
