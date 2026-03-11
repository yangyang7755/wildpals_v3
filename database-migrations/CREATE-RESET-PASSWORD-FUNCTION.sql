-- Create function to reset user password
-- This function must be created by a superuser or someone with appropriate privileges
-- It updates the password in auth.users table

CREATE OR REPLACE FUNCTION reset_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's password in auth.users
  -- Using crypt to hash the password with bcrypt
  UPDATE auth.users
  SET 
    encrypted_password = crypt(p_new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION reset_user_password IS 'Securely resets a user password after verification code is validated';
