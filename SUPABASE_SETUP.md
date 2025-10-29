# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and service role key from Settings > API

## 2. Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pjufmuhiarceoynrkiwj.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
```

## 3. Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create applications table
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your auth requirements)
CREATE POLICY "Allow all operations on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on applications" ON applications FOR ALL USING (true);
```

## 4. Authentication Setup
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs: `http://localhost:3000/auth/callback`
4. Enable email confirmations if desired

## 5. Test Users
You can create test users through the Supabase dashboard:
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Or use the registration form in your app

## 6. Test the Setup
1. Start your development server: `npm run dev`
2. Go to `/auth/register` to create a new account
3. Go to `/auth/login` to login
4. Try creating a job through the UI
5. Check your Supabase dashboard to see the data

## 7. Optional: Seed Data
You can add some test data:

```sql
INSERT INTO jobs (title, slug, department, salary_min, salary_max, status) VALUES
('Frontend Developer', 'frontend-developer', 'Engineering', 7000000, 8000000, 'ACTIVE'),
('Backend Developer', 'backend-developer', 'Engineering', 8000000, 10000000, 'ACTIVE'),
('UI/UX Designer', 'ui-ux-designer', 'Design', 6000000, 7500000, 'DRAFT');
```

## 8. API Endpoints Available
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `GET /api/jobs/[id]/candidates` - Get job candidates