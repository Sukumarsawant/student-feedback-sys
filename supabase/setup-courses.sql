-- Setup Courses for Feedback System
-- Run this in Supabase SQL Editor

-- Insert courses based on the teachers you provided
INSERT INTO courses (course_code, course_name, department, credits, semester, year)
VALUES
  -- Computer Science Courses
  ('CS301', 'Database Management Systems', 'Computer Science', 4, 'Fall', 3),
  ('CS302', 'Microprocessor', 'Computer Science', 4, 'Fall', 3),
  ('CS303', 'Design Thinking', 'Computer Science', 3, 'Fall', 2),
  ('CS304', 'Analysis of Algorithm', 'Computer Science', 4, 'Fall', 3),
  
  -- Mathematics Course
  ('MATH301', 'Engineering Mathematics 3', 'Mathematics', 4, 'Fall', 3),
  
  -- Communication Course
  ('COMM201', 'Presentation Skills', 'Communication', 2, 'Fall', 2)
ON CONFLICT (course_code) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  department = EXCLUDED.department,
  credits = EXCLUDED.credits,
  semester = EXCLUDED.semester,
  year = EXCLUDED.year;

-- Verify courses created
SELECT 
  course_code,
  course_name,
  department,
  credits,
  '✅ CREATED' as status
FROM courses
WHERE course_code IN ('CS301', 'CS302', 'CS303', 'CS304', 'MATH301', 'COMM201')
ORDER BY course_code;

-- Now assign teachers to their courses
-- First, let's check the teacher IDs
SELECT 
  id,
  email,
  full_name,
  '🎓 Ready to assign' as status
FROM profiles
WHERE role = 'teacher'
ORDER BY full_name;

-- Create course assignments (run this after checking teacher IDs above)
-- You may need to adjust the teacher IDs based on the actual IDs from your database

-- We'll use a more flexible approach with email matching
INSERT INTO course_assignments (teacher_id, course_id)
SELECT 
  p.id as teacher_id,
  c.id as course_id
FROM profiles p
CROSS JOIN courses c
WHERE p.role = 'teacher'
AND (
  -- DATABASE MANAGEMENT SYSTEMS - DR. SACHIN DESHMUKH
  (p.email = 'sachin.deshmukh@vit.edu.in' AND c.course_code = 'CS301') OR
  
  -- MICROPROCESSOR - MRS. SUVARNA BHAT
  (p.email = 'suvarna.bhat@vit.edu.in' AND c.course_code = 'CS302') OR
  
  -- DESIGN THINKING - DR. SACHIN BOJEWAR
  (p.email = 'sachin.bojewar@vit.edu.in' AND c.course_code = 'CS303') OR
  
  -- ENGINEERING MATHEMATICS 3 - KHIMYA AMLANI
  (p.email = 'khimya.amlani@vit.edu.in' AND c.course_code = 'MATH301') OR
  
  -- PRESENTATION SKILLS - ASMITA NEVE
  (p.email = 'asmita.neve@vit.edu.in' AND c.course_code = 'COMM201') OR
  
  -- ANALYSIS OF ALGORITHM - DR. SWAPNIL SONAWANE
  (p.email = 'swapnil.sonawane@vit.edu.in' AND c.course_code = 'CS304')
)
ON CONFLICT (teacher_id, course_id) DO NOTHING;

-- Verify course assignments
SELECT 
  c.course_code,
  c.course_name,
  p.full_name as teacher_name,
  p.email as teacher_email,
  '✅ ASSIGNED' as status
FROM course_assignments ca
JOIN courses c ON ca.course_id = c.id
JOIN profiles p ON ca.teacher_id = p.id
WHERE c.course_code IN ('CS301', 'CS302', 'CS303', 'CS304', 'MATH301', 'COMM201')
ORDER BY c.course_code;

-- Final summary
SELECT 
  COUNT(DISTINCT c.id) as total_courses,
  COUNT(DISTINCT ca.id) as total_assignments,
  COUNT(DISTINCT ca.teacher_id) as teachers_assigned,
  '🎉 Setup Complete!' as status
FROM courses c
LEFT JOIN course_assignments ca ON c.id = ca.id
WHERE c.course_code IN ('CS301', 'CS302', 'CS303', 'CS304', 'MATH301', 'COMM201');
