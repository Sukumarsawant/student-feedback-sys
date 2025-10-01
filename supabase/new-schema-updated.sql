-- Updated Student Feedback System Database Schema
-- Run this script in your Supabase SQL Editor

-- First, drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS feedback_answers CASCADE;
DROP TABLE IF EXISTS feedback_responses CASCADE;
DROP TABLE IF EXISTS feedback_questions CASCADE;
DROP TABLE IF EXISTS feedback_forms CASCADE;
DROP TABLE IF EXISTS course_assignments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  enrollment_number TEXT,
  roll_no TEXT,
  employee_id TEXT,
  department TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  division TEXT,
  avatar_url TEXT,
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
  credits INTEGER DEFAULT 3,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course assignments (teachers to courses)
CREATE TABLE course_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  semester INTEGER CHECK (semester >= 1 AND semester <= 2) DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, teacher_id, academic_year, semester)
);

-- Feedback forms
CREATE TABLE feedback_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester INTEGER CHECK (semester >= 1 AND semester <= 2),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback questions
CREATE TABLE feedback_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES feedback_forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('rating', 'multiple_choice', 'text')),
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback responses
CREATE TABLE feedback_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES feedback_forms(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, course_id, teacher_id, student_id)
);

-- Feedback answers
CREATE TABLE feedback_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  response_id UUID REFERENCES feedback_responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES feedback_questions(id) ON DELETE CASCADE,
  answer_rating INTEGER CHECK (answer_rating >= 1 AND answer_rating <= 5),
  answer_text TEXT,
  answer_choice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_year_semester ON courses(year, semester);
CREATE INDEX idx_course_assignments_teacher ON course_assignments(teacher_id);
CREATE INDEX idx_course_assignments_course ON course_assignments(course_id);
CREATE INDEX idx_feedback_forms_course ON feedback_forms(course_id);
CREATE INDEX idx_feedback_forms_teacher ON feedback_forms(teacher_id);
CREATE INDEX idx_feedback_forms_active ON feedback_forms(is_active);
CREATE INDEX idx_feedback_questions_form ON feedback_questions(form_id);
CREATE INDEX idx_feedback_responses_student ON feedback_responses(student_id);
CREATE INDEX idx_feedback_responses_teacher ON feedback_responses(teacher_id);
CREATE INDEX idx_feedback_answers_response ON feedback_answers(response_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'), 
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_forms_updated_at BEFORE UPDATE ON feedback_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses policies  
CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers and admins can view all courses" ON courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Course assignments policies
CREATE POLICY "Anyone can view course assignments" ON course_assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can insert their assignments" ON course_assignments FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

-- Feedback forms policies
CREATE POLICY "Students can view active forms" ON feedback_forms FOR SELECT 
  USING (is_active = true);
CREATE POLICY "Teachers can view their forms" ON feedback_forms FOR SELECT 
  USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can create forms" ON feedback_forms FOR INSERT 
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can update their forms" ON feedback_forms FOR UPDATE 
  USING (teacher_id = auth.uid());

-- Feedback questions policies
CREATE POLICY "Anyone can view questions for accessible forms" ON feedback_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM feedback_forms 
    WHERE feedback_forms.id = feedback_questions.form_id 
    AND (feedback_forms.is_active = true OR feedback_forms.teacher_id = auth.uid())
  )
);
CREATE POLICY "Teachers can manage questions for their forms" ON feedback_questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM feedback_forms 
    WHERE feedback_forms.id = feedback_questions.form_id 
    AND feedback_forms.teacher_id = auth.uid()
  )
);

-- Feedback responses policies
CREATE POLICY "Students can insert own responses" ON feedback_responses FOR INSERT 
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can view own responses" ON feedback_responses FOR SELECT 
  USING (student_id = auth.uid());
CREATE POLICY "Teachers can view responses to their courses" ON feedback_responses FOR SELECT 
  USING (teacher_id = auth.uid());
CREATE POLICY "Admins can view all responses" ON feedback_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feedback answers policies
CREATE POLICY "Students can insert answers for their responses" ON feedback_answers FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM feedback_responses WHERE id = feedback_answers.response_id AND student_id = auth.uid())
  );
CREATE POLICY "Anyone can view answers for accessible responses" ON feedback_answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM feedback_responses fr
    WHERE fr.id = feedback_answers.response_id 
    AND (fr.student_id = auth.uid() OR fr.teacher_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
