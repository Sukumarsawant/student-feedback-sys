-- Setup Feedback Forms for Existing Courses
-- Run this in Supabase SQL Editor

-- First, check what courses we have
SELECT 
  id,
  course_code,
  course_name,
  department,
  '📚 Available' as status
FROM courses
ORDER BY course_code;

-- Now let's check if there are any teachers assigned to courses
SELECT 
  c.course_code,
  c.course_name,
  p.full_name as teacher_name,
  p.email as teacher_email,
  CASE 
    WHEN ca.id IS NOT NULL THEN '✅ ASSIGNED'
    ELSE '❌ NOT ASSIGNED'
  END as assignment_status
FROM courses c
LEFT JOIN course_assignments ca ON c.id = ca.course_id
LEFT JOIN profiles p ON ca.teacher_id = p.id
ORDER BY c.course_code;

-- Assign teachers to courses if not already assigned
-- This creates the course_assignments that link teachers to courses
INSERT INTO course_assignments (teacher_id, course_id)
SELECT 
  p.id as teacher_id,
  c.id as course_id
FROM profiles p
CROSS JOIN courses c
WHERE p.role = 'teacher'
AND NOT EXISTS (
  SELECT 1 FROM course_assignments ca 
  WHERE ca.teacher_id = p.id AND ca.course_id = c.id
)
AND (
  -- Match teachers to their courses based on what you specified
  (p.email = 'sachin.deshmukh@vit.edu.in' AND (c.course_code LIKE '%DATABASE%' OR c.course_code LIKE '%DBMS%' OR c.course_name ILIKE '%database%')) OR
  (p.email = 'suvarna.bhat@vit.edu.in' AND (c.course_code LIKE '%MICRO%' OR c.course_name ILIKE '%microprocessor%')) OR
  (p.email = 'sachin.bojewar@vit.edu.in' AND c.course_name ILIKE '%design%thinking%') OR
  (p.email = 'khimya.amlani@vit.edu.in' AND (c.course_code LIKE '%MATH%' OR c.course_name ILIKE '%mathematics%')) OR
  (p.email = 'asmita.neve@vit.edu.in' AND c.course_name ILIKE '%presentation%skills%') OR
  (p.email = 'swapnil.sonawane@vit.edu.in' AND c.course_name ILIKE '%algorithm%')
);

-- Create active feedback forms for all courses
-- These forms will be available for students to fill
INSERT INTO feedback_forms (
  course_id,
  title,
  description,
  is_active,
  start_date,
  end_date,
  academic_year,
  created_by
)
SELECT 
  c.id as course_id,
  'Mid-Semester Feedback - ' || c.course_name as title,
  'Please provide your honest feedback about ' || c.course_name || ' (' || c.course_code || '). Your responses will help improve the course quality.' as description,
  true as is_active,
  NOW() as start_date,
  NOW() + INTERVAL '30 days' as end_date,
  '2024-2025' as academic_year,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1) as created_by
FROM courses c
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_forms ff 
  WHERE ff.course_id = c.id 
  AND ff.is_active = true
);

-- Verify feedback forms created
SELECT 
  ff.id,
  ff.title,
  c.course_code,
  c.course_name,
  ff.is_active,
  DATE(ff.start_date) as start_date,
  DATE(ff.end_date) as end_date,
  '✅ ACTIVE' as status
FROM feedback_forms ff
JOIN courses c ON ff.course_id = c.id
WHERE ff.is_active = true
ORDER BY c.course_code;

-- Check how many forms are available
SELECT 
  COUNT(*) as total_active_forms,
  MIN(start_date) as earliest_start,
  MAX(end_date) as latest_end,
  '🎉 Ready for Students!' as status
FROM feedback_forms
WHERE is_active = true;

-- Final verification: Show which courses have active forms
SELECT 
  c.course_code,
  c.course_name,
  COUNT(ff.id) as active_forms,
  CASE 
    WHEN COUNT(ff.id) > 0 THEN '✅ HAS FORMS'
    ELSE '❌ NO FORMS'
  END as form_status
FROM courses c
LEFT JOIN feedback_forms ff ON c.id = ff.course_id AND ff.is_active = true
GROUP BY c.id, c.course_code, c.course_name
ORDER BY c.course_code;
