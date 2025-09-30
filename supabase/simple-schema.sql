-- Simple Student Feedback System Database Schema
-- This version bypasses RLS issues during development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS feedback_answers;
DROP TABLE IF EXISTS feedback_responses;
DROP TABLE IF EXISTS feedback_questions;
DROP TABLE IF EXISTS feedback_forms;
DROP TABLE IF EXISTS course_assignments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS profiles;

-- Profiles table (extends auth.users) - SIMPLIFIED
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  enrollment_number TEXT,
  employee_id TEXT,
  department TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  division TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  semester INTEGER CHECK (semester >= 1 AND semester <= 2),
  credits INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS for development (you can enable later)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Function to handle user profile creation (SIMPLIFIED)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample courses
INSERT INTO courses (course_code, course_name, department, year, semester, credits, description) 
VALUES 
  ('CS101', 'Introduction to Programming', 'Computer Science', 1, 1, 4, 'Basic programming concepts'),
  ('CS201', 'Data Structures', 'Computer Science', 2, 1, 4, 'Data structures and algorithms'),
  ('CS301', 'Database Systems', 'Computer Science', 3, 1, 4, 'Database design and management'),
  ('MATH101', 'Calculus I', 'Mathematics', 1, 1, 3, 'Introduction to calculus'),
  ('PHYS101', 'Physics I', 'Physics', 1, 1, 3, 'Mechanics and thermodynamics')
ON CONFLICT (course_code) DO NOTHING;