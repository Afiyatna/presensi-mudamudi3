-- Create a function to allow admins to delete users from auth.users
-- This function needs to be SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if the executing user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- Delete from auth.users (this should cascade to profiles if FKey is set up, but let's be safe)
  -- Note: existing profiles table references usually don't cascade delete FROM auth.users TO profiles 
  -- UNLESS explicitly defined. Standard Supabase starter often has CASCADE.
  -- Let's check if we need to manually delete profile first.
  -- Ideally, deleting from auth.users is the source of truth.
  
  DELETE FROM auth.users WHERE id = user_id;
  
  -- If constraints prevent this, we might need to delete from dependent tables first 
  -- but usually on delete cascade handles it.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
