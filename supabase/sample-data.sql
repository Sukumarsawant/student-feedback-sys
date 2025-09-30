-- Sample Data for Student Feedback System
-- Run this AFTER creating the schema and setting up some users

-- Sample Courses
INSERT INTO courses (course_code, course_name, department, year, semester, credits, description) VALUES
('CS101', 'Programming Fundamentals', 'Computer Science', 1, 1, 4, 'Introduction to programming concepts and basic algorithms'),
('CS201', 'Data Structures', 'Computer Science', 2, 1, 4, 'Linear and non-linear data structures and their applications'),
('CS301', 'Database Management Systems', 'Computer Science', 3, 1, 4, 'Database design, SQL, and database administration'),
('CS401', 'Software Engineering', 'Computer Science', 4, 1, 4, 'Software development methodologies and project management'),
('MATH101', 'Calculus I', 'Mathematics', 1, 1, 3, 'Differential calculus and applications'),
('MATH201', 'Linear Algebra', 'Mathematics', 2, 1, 3, 'Vector spaces, matrices, and linear transformations'),
('PHY101', 'Physics I', 'Physics', 1, 1, 3, 'Mechanics and thermodynamics'),
('ENG101', 'Technical Communication', 'English', 1, 1, 2, 'Technical writing and presentation skills');

-- Note: You'll need to manually create users through Supabase Auth first, then update their profiles
-- Sample profile updates (replace UUIDs with actual user IDs from auth.users)
-- 
-- UPDATE profiles SET 
--   full_name = 'Dr. John Smith', 
--   role = 'teacher', 
--   employee_id = 'EMP001',
--   department = 'Computer Science'
-- WHERE email = 'john.smith@college.edu';
--
-- UPDATE profiles SET 
--   full_name = 'Jane Doe', 
--   role = 'student', 
--   enrollment_number = 'STU2023001',
--   department = 'Computer Science',
--   year = 2,
--   division = 'A'
-- WHERE email = 'jane.doe@student.college.edu';
--
-- UPDATE profiles SET 
--   full_name = 'Admin User', 
--   role = 'admin', 
--   employee_id = 'ADM001',
--   department = 'Administration'
-- WHERE email = 'admin@college.edu';

-- Sample Course Assignments (assign teachers to courses)
-- Note: Replace teacher_id with actual UUIDs from profiles table
-- INSERT INTO course_assignments (course_id, teacher_id, academic_year, semester) VALUES
-- ((SELECT id FROM courses WHERE course_code = 'CS101'), 'teacher-uuid-here', '2024-25', 1),
-- ((SELECT id FROM courses WHERE course_code = 'CS201'), 'teacher-uuid-here', '2024-25', 1),
-- ((SELECT id FROM courses WHERE course_code = 'CS301'), 'teacher-uuid-here', '2024-25', 1);

-- Sample Feedback Form
-- INSERT INTO feedback_forms (title, description, course_id, academic_year, semester, start_date, end_date, created_by) VALUES
-- ('Mid-Semester Feedback - CS101', 'Please provide your feedback on the Programming Fundamentals course', 
--  (SELECT id FROM courses WHERE course_code = 'CS101'), '2024-25', 1, 
--  '2024-10-01 00:00:00+00', '2024-10-31 23:59:59+00', 'admin-uuid-here');

-- Sample Feedback Questions (add these after creating a feedback form)
-- INSERT INTO feedback_questions (form_id, question_text, question_type, options, order_number) VALUES
-- ('feedback-form-uuid-here', 'How would you rate the overall quality of this course?', 'rating', null, 1),
-- ('feedback-form-uuid-here', 'How clear were the course objectives?', 'rating', null, 2),
-- ('feedback-form-uuid-here', 'How effective was the teaching methodology?', 'rating', null, 3),
-- ('feedback-form-uuid-here', 'Which aspect of the course did you find most valuable?', 'multiple_choice', 
--  '["Lectures", "Practical sessions", "Assignments", "Course materials", "Other"]', 4),
-- ('feedback-form-uuid-here', 'What suggestions do you have for improving this course?', 'text', null, 5);

-- Instructions for setting up:
-- 1. Run the main schema file first
-- 2. Create user accounts through Supabase Auth or your app
-- 3. Update the profiles with proper roles and information
-- 4. Insert course assignments linking teachers to courses
-- 5. Create feedback forms and questions
-- 6. Students can then submit feedback responses