
DELETE FROM feedback_answers;
DELETE FROM feedback_responses;
DELETE FROM feedback_questions;
DELETE FROM feedback_forms;
DELETE FROM course_assignments;
DELETE FROM courses;
DELETE FROM profiles WHERE email != 'your-current-email@example.com'; -- Keep your current account

-- Insert CMPN Department Courses (2nd Year, 2024-25 Academic Year)
INSERT INTO courses (course_code, course_name, department, year, semester, credits, is_active) VALUES
('DBMS', 'DATABASE MANAGEMENT SYSTEMS', 'CMPN', 2, 2, 3, true),
('MP', 'MICROPROCESSOR', 'CMPN', 2, 2, 3, true),
('DT', 'DESIGN THINKING', 'CMPN', 2, 2, 2, true),
('EM3', 'ENGINEERING MATHEMATICS 3', 'CMPN', 2, 2, 3, true),
('PS', 'PRESENTATION SKILLS', 'CMPN', 2, 2, 1, true),
('AOA', 'ANALYSIS OF ALGORITHM', 'CMPN', 2, 2, 3, true);

-- Update profiles for teachers (run after creating users in Auth)
-- These updates will work once the users are created in Supabase Auth

-- Update teacher profiles with proper details
UPDATE profiles SET 
  full_name = 'Dr. Sachin Deshmukh',
  username = 'sachin.deshmukh',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T001'
WHERE email = 'sachin.deshmukh@vit.edu.in';

UPDATE profiles SET 
  full_name = 'Mrs. Suvarna Bhat',
  username = 'suvarna.bhat',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T002'
WHERE email = 'suvarna.bhat@vit.edu.in';

UPDATE profiles SET 
  full_name = 'Dr. Sachin Bojewar',
  username = 'sachin.bojewar',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T003'
WHERE email = 'sachin.bojewar@vit.edu.in';

UPDATE profiles SET 
  full_name = 'Khimya Amlani',
  username = 'khimya.amlani',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T004'
WHERE email = 'khimya.amlani@vit.edu.in';

UPDATE profiles SET 
  full_name = 'Asmita Neve',
  username = 'asmita.neve',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T005'
WHERE email = 'asmita.neve@vit.edu.in';

UPDATE profiles SET 
  full_name = 'Dr. Swapnil Sonawane',
  username = 'swapnil.sonawane',
  role = 'teacher',
  department = 'CMPN',
  employee_id = 'T006'
WHERE email = 'swapnil.sonawane@vit.edu.in';

-- Update student profile
UPDATE profiles SET 
  full_name = 'Student User',
  username = 'student',
  role = 'student',
  department = 'CMPN',
  year = 2,
  division = 'A',
  roll_no = '2301',
  enrollment_number = 'VIT2023001'
WHERE email = 'student@vit.edu.in';

-- Create course assignments (link teachers to courses)
INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'DBMS' AND p.email = 'sachin.deshmukh@vit.edu.in';

INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'MP' AND p.email = 'suvarna.bhat@vit.edu.in';

INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'DT' AND p.email = 'sachin.bojewar@vit.edu.in';

INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'EM3' AND p.email = 'khimya.amlani@vit.edu.in';

INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'PS' AND p.email = 'asmita.neve@vit.edu.in';

INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester)
SELECT 
  c.id,
  p.id,
  '2024-25',
  2
FROM courses c
JOIN profiles p ON TRUE
WHERE c.course_code = 'AOA' AND p.email = 'swapnil.sonawane@vit.edu.in';

-- Create default feedback questions for quick feedback (without forms)
-- These can be used for the "direct teacher feedback" feature

-- Verify the setup
SELECT 'Courses Created:' as status;
SELECT course_code, course_name FROM courses ORDER BY course_code;

SELECT 'Teachers Assigned:' as status;
SELECT 
  p.full_name as teacher_name,
  c.course_code,
  c.course_name
FROM course_assignments ca
JOIN profiles p ON ca.teacher_id = p.id
JOIN courses c ON ca.course_id = c.id
ORDER BY c.course_code;
