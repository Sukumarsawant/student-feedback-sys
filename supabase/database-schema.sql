-- Student Feedback System Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  enrollment_number TEXT,
  employee_id TEXT,
  department TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  division TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  semester INTEGER CHECK (semester >= 1 AND semester <= 2),
  credits INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course assignments (teachers to courses)
CREATE TABLE IF NOT EXISTS course_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester INTEGER CHECK (semester >= 1 AND semester <= 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, teacher_id, academic_year, semester)
);

-- Feedback forms
CREATE TABLE IF NOT EXISTS feedback_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester INTEGER CHECK (semester >= 1 AND semester <= 2),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback questions
CREATE TABLE IF NOT EXISTS feedback_questions (
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
CREATE TABLE IF NOT EXISTS feedback_responses (
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
CREATE TABLE IF NOT EXISTS feedback_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  response_id UUID REFERENCES feedback_responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES feedback_questions(id) ON DELETE CASCADE,
  answer_rating INTEGER CHECK (answer_rating >= 1 AND answer_rating <= 5),
  answer_text TEXT,
  answer_choice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_year_semester ON courses(year, semester);
CREATE INDEX IF NOT EXISTS idx_course_assignments_teacher ON course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_course ON course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_course ON feedback_forms(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_active ON feedback_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_feedback_questions_form ON feedback_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_student ON feedback_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_teacher ON feedback_responses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_answers_response ON feedback_answers(response_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- RLS Policies for profiles (Fixed for registration)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' AND policyname = 'Everyone can view active courses'
  ) THEN
    CREATE POLICY "Everyone can view active courses" ON courses
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' AND policyname = 'Admins can manage courses'
  ) THEN
    CREATE POLICY "Admins can manage courses" ON courses
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policies for course_assignments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_assignments' AND policyname = 'Teachers can view their assignments'
  ) THEN
    CREATE POLICY "Teachers can view their assignments" ON course_assignments
      FOR SELECT USING (teacher_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_assignments' AND policyname = 'Admins can manage course assignments'
  ) THEN
    CREATE POLICY "Admins can manage course assignments" ON course_assignments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policies for feedback_forms
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_forms' AND policyname = 'Students can view active forms for their courses'
  ) THEN
    CREATE POLICY "Students can view active forms for their courses" ON feedback_forms
      FOR SELECT USING (
        is_active = true 
        AND start_date <= NOW() 
        AND end_date >= NOW()
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'student'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_forms' AND policyname = 'Teachers can view forms for their courses'
  ) THEN
    CREATE POLICY "Teachers can view forms for their courses" ON feedback_forms
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM course_assignments ca
          JOIN profiles p ON p.id = auth.uid()
          WHERE ca.course_id = feedback_forms.course_id 
          AND ca.teacher_id = auth.uid()
          AND p.role = 'teacher'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_forms' AND policyname = 'Admins can manage feedback forms'
  ) THEN
    CREATE POLICY "Admins can manage feedback forms" ON feedback_forms
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policies for feedback_questions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_questions' AND policyname = 'Users can view questions for accessible forms'
  ) THEN
    CREATE POLICY "Users can view questions for accessible forms" ON feedback_questions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM feedback_forms ff
          WHERE ff.id = feedback_questions.form_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_questions' AND policyname = 'Admins can manage feedback questions'
  ) THEN
    CREATE POLICY "Admins can manage feedback questions" ON feedback_questions
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policies for feedback_responses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_responses' AND policyname = 'Students can view their own responses'
  ) THEN
    CREATE POLICY "Students can view their own responses" ON feedback_responses
      FOR SELECT USING (student_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_responses' AND policyname = 'Students can insert their own responses'
  ) THEN
    CREATE POLICY "Students can insert their own responses" ON feedback_responses
      FOR INSERT WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'student'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_responses' AND policyname = 'Teachers can view non-anonymous responses for their courses'
  ) THEN
    CREATE POLICY "Teachers can view non-anonymous responses for their courses" ON feedback_responses
      FOR SELECT USING (
        teacher_id = auth.uid()
        AND is_anonymous = false
        AND EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'teacher'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_responses' AND policyname = 'Admins can view all responses'
  ) THEN
    CREATE POLICY "Admins can view all responses" ON feedback_responses
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policies for feedback_answers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_answers' AND policyname = 'Users can view answers for accessible responses'
  ) THEN
    CREATE POLICY "Users can view answers for accessible responses" ON feedback_answers
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM feedback_responses fr
          WHERE fr.id = feedback_answers.response_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_answers' AND policyname = 'Students can insert answers for their responses'
  ) THEN
    CREATE POLICY "Students can insert answers for their responses" ON feedback_answers
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM feedback_responses fr
          WHERE fr.id = feedback_answers.response_id 
          AND fr.student_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_forms_updated_at ON feedback_forms;
CREATE TRIGGER update_feedback_forms_updated_at BEFORE UPDATE ON feedback_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();