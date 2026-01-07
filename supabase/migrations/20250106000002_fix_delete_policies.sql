-- Add delete policy for profiles (users can delete their own account)
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Update models delete policy to allow deleting pending/rejected models (not just draft)
DROP POLICY IF EXISTS "Users can delete own draft models" ON models;

CREATE POLICY "Users can delete own unpublished models"
  ON models FOR DELETE
  USING (auth.uid() = author_id AND status IN ('draft', 'pending', 'rejected'));
