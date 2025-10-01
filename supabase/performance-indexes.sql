-- Performance Optimization: Add indexes for frequently queried columns
-- Run this in your Supabase SQL Editor to improve query performance

-- Index for profiles lookups (used in every auth check)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index for feedback responses queries (heavily used in analytics and profile pages)
CREATE INDEX IF NOT EXISTS idx_feedback_responses_student_id ON feedback_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_teacher_id ON feedback_responses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_course_id ON feedback_responses(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_submitted_at ON feedback_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_form_id ON feedback_responses(form_id);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_feedback_responses_teacher_course 
  ON feedback_responses(teacher_id, course_id) WHERE teacher_id IS NOT NULL;

-- Index for feedback answers (used in joins)
CREATE INDEX IF NOT EXISTS idx_feedback_answers_response_id ON feedback_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_feedback_answers_question_id ON feedback_answers(question_id);

-- Index for feedback forms queries
CREATE INDEX IF NOT EXISTS idx_feedback_forms_course_id ON feedback_forms(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_is_active ON feedback_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_feedback_forms_end_date ON feedback_forms(end_date);

-- Composite index for active forms
CREATE INDEX IF NOT EXISTS idx_feedback_forms_active_course 
  ON feedback_forms(course_id, is_active) WHERE is_active = true;

-- Index for course assignments
CREATE INDEX IF NOT EXISTS idx_course_assignments_student_id ON course_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_teacher_id ON course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_course_id ON course_assignments(course_id);

-- Index for courses
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);

-- Analyze tables to update statistics
ANALYZE profiles;
ANALYZE feedback_responses;
ANALYZE feedback_answers;
ANALYZE feedback_forms;
ANALYZE course_assignments;
ANALYZE courses;

-- Create a materialized view for analytics (optional - for heavy analytics queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_teacher_course_stats AS
SELECT 
  fr.teacher_id,
  fr.course_id,
  c.course_code,
  c.course_name,
  c.department,
  COUNT(fr.id) as response_count,
  AVG(fa.answer_rating) as avg_rating,
  MAX(fr.submitted_at) as last_response_at
FROM feedback_responses fr
JOIN courses c ON c.id = fr.course_id
LEFT JOIN feedback_answers fa ON fa.response_id = fr.id
WHERE fr.teacher_id IS NOT NULL
  AND fa.answer_rating IS NOT NULL
GROUP BY fr.teacher_id, fr.course_id, c.course_code, c.course_name, c.department;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_teacher_stats_teacher 
  ON mv_teacher_course_stats(teacher_id);

-- Refresh materialized view (run this periodically or set up a cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_teacher_course_stats;

-- Grant permissions (adjust if needed)
GRANT SELECT ON mv_teacher_course_stats TO authenticated;
