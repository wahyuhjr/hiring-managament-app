-- Supabase Database Schema
-- Jalankan query ini di SQL Editor Supabase

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
  salary_min INTEGER NOT NULL,
  salary_max INTEGER NOT NULL,
  currency TEXT DEFAULT 'IDR',
  application_form JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create applications table
CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Allow authenticated users to read jobs
CREATE POLICY "Allow authenticated users to read jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert jobs
CREATE POLICY "Allow authenticated users to insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update jobs
CREATE POLICY "Allow authenticated users to update jobs" ON jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete jobs
CREATE POLICY "Allow authenticated users to delete jobs" ON jobs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow authenticated users to read applications
CREATE POLICY "Allow authenticated users to read applications" ON applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert applications
CREATE POLICY "Allow authenticated users to insert applications" ON applications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update applications
CREATE POLICY "Allow authenticated users to update applications" ON applications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete applications
CREATE POLICY "Allow authenticated users to delete applications" ON applications
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data
INSERT INTO jobs (title, slug, department, salary_min, salary_max, status, description) VALUES
('Frontend Developer', 'frontend-developer', 'Engineering', 7000000, 8000000, 'ACTIVE', 'We are looking for a skilled Frontend Developer to join our team and help build amazing user experiences.'),
('Backend Developer', 'backend-developer', 'Engineering', 8000000, 10000000, 'ACTIVE', 'Join our backend team to build scalable and robust server-side applications.'),
('UI/UX Designer', 'ui-ux-designer', 'Design', 6000000, 7500000, 'DRAFT', 'Create beautiful and intuitive user interfaces for our products.'),
('Product Manager', 'product-manager', 'Product', 9000000, 12000000, 'ACTIVE', 'Lead product strategy and work with cross-functional teams to deliver great products.'),
('Data Scientist', 'data-scientist', 'Data', 8000000, 11000000, 'DRAFT', 'Analyze data and build machine learning models to drive business insights.');

-- 10. Insert sample applications
INSERT INTO applications (job_id, form_data, status) VALUES
((SELECT id FROM jobs WHERE slug = 'frontend-developer'), 
 '{"full_name": "John Doe", "email": "john@example.com", "phone_number": "081234567890", "domicile": "Jakarta", "gender": "Male", "linkedin_link": "https://linkedin.com/in/johndoe"}'::jsonb, 
 'PENDING'),
((SELECT id FROM jobs WHERE slug = 'frontend-developer'), 
 '{"full_name": "Jane Smith", "email": "jane@example.com", "phone_number": "081234567891", "domicile": "Bandung", "gender": "Female", "linkedin_link": "https://linkedin.com/in/janesmith"}'::jsonb, 
 'PENDING'),
((SELECT id FROM jobs WHERE slug = 'backend-developer'), 
 '{"full_name": "Bob Johnson", "email": "bob@example.com", "phone_number": "081234567892", "domicile": "Surabaya", "gender": "Male", "linkedin_link": "https://linkedin.com/in/bobjohnson"}'::jsonb, 
 'REVIEWED');

-- 11. Create view for job statistics
CREATE VIEW job_stats AS
SELECT 
  j.id,
  j.title,
  j.department,
  j.status,
  COUNT(a.id) as total_applications,
  COUNT(CASE WHEN a.status = 'PENDING' THEN 1 END) as pending_applications,
  COUNT(CASE WHEN a.status = 'REVIEWED' THEN 1 END) as reviewed_applications,
  COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as accepted_applications,
  COUNT(CASE WHEN a.status = 'REJECTED' THEN 1 END) as rejected_applications
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.department, j.status;

-- 12. Grant permissions
GRANT ALL ON jobs TO authenticated;
GRANT ALL ON applications TO authenticated;
GRANT SELECT ON job_stats TO authenticated;
