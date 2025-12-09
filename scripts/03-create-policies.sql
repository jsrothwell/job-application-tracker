-- Create policy to allow users to see only their own applications
CREATE POLICY "Users can view their own applications"
  ON job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own applications
CREATE POLICY "Users can insert their own applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own applications
CREATE POLICY "Users can update their own applications"
  ON job_applications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own applications
CREATE POLICY "Users can delete their own applications"
  ON job_applications
  FOR DELETE
  USING (auth.uid() = user_id);
