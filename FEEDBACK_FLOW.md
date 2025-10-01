# Student Feedback System - Flow Documentation

## Overview
The feedback system enables students to submit feedback, teachers to view feedback for their courses, and admins to see all feedback with analytics.

## Database Schema (Already Set Up)

### Key Tables
- **profiles**: User data (student/teacher/admin roles)
- **courses**: Course catalog
- **course_assignments**: Links teachers to courses
- **feedback_responses**: Student feedback entries
  - Links to: student_id, teacher_id, course_id
  - Contains: rating, comments, is_anonymous flag

### How It Works

#### 1. Student Submits Feedback (`/feedback`)
**Flow:**
- Student logs in → redirected to `/feedback`
- System loads all active course assignments
- Student selects a course/teacher combination
- Student fills form: rating (1-5), comments, anonymous option
- POST to `/api/feedback/submit`
- Creates `feedback_responses` record with:
  - `student_id`: Current user
  - `teacher_id`: Selected teacher
  - `course_id`: Selected course
  - `rating`, `comments`, `is_anonymous`

**Database RLS Policy:**
```sql
-- Students can insert their own responses
CREATE POLICY "Students can insert their own responses" ON feedback_responses
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

#### 2. Teacher Views Feedback (`/teacher` → `/analytics`)
**Flow:**
- Teacher logs in → sees `/teacher` dashboard
- Lists all assigned courses from `course_assignments`
- Clicks "View analytics" → goes to `/analytics?course=COURSE_CODE`
- System queries `feedback_responses` WHERE `teacher_id = current_teacher_id`
- Can filter by specific course

**Database RLS Policy:**
```sql
-- Teachers can view responses for their courses
CREATE POLICY "Teachers can view responses for their courses" ON feedback_responses
  FOR SELECT USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
```

#### 3. Admin Views All Feedback (`/admin` → `/analytics`)
**Flow:**
- Admin logs in → sees `/admin` dashboard
- Can navigate to `/analytics` (no course filter needed)
- System queries ALL `feedback_responses` (no teacher_id restriction)
- Sees aggregated data across all teachers and courses

**Database RLS Policy:**
```sql
-- Admins can view all responses
CREATE POLICY "Admins can view all responses" ON feedback_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Current System Status

### ✅ What's Working
1. Database schema with proper RLS policies
2. Student feedback submission flow
3. Teacher can view their course feedback
4. Admin can view all feedback
5. Role-based navigation and access control

### 🎨 UI/UX Improvements Done
1. ✅ Removed team section from homepage
2. ✅ Simplified navbar (removed team links)
3. ✅ Improved navbar contrast and readability:
   - Stronger background (95% opacity)
   - Better active state styling
   - Higher contrast text colors
4. ✅ Updated color palette (removed blue+grey combos)

## API Endpoints

### `/api/feedback/submit` (POST)
**Request Body:**
```json
{
  "courseCode": "CS301",
  "courseName": "Database Management Systems",
  "instructorName": "Dr. Smith",
  "rating": 5,
  "comments": "Great course!",
  "isAnonymous": false
}
```

**Process:**
1. Validates user is logged in
2. Looks up course by code
3. Finds course assignment (teacher for that course)
4. Creates feedback_responses record
5. Returns success/error

## Testing the Flow

### 1. As Student
```
1. Register/Login as student
2. Go to /feedback
3. Select a course/teacher
4. Fill rating and comments
5. Submit
6. Check success message
```

### 2. As Teacher
```
1. Login as teacher
2. Go to /teacher
3. See assigned courses
4. Click "View analytics"
5. See feedback for your courses only
```

### 3. As Admin
```
1. Login as admin
2. Go to /admin
3. Click "Analytics pulse" or go to /analytics
4. See ALL feedback across all teachers
5. Filter by course if needed
```

## Verification Queries (Run in Supabase SQL Editor)

```sql
-- Check if feedback was submitted
SELECT 
  fr.id,
  fr.rating,
  fr.is_anonymous,
  p_student.full_name as student_name,
  p_teacher.full_name as teacher_name,
  c.course_name,
  fr.submitted_at
FROM feedback_responses fr
JOIN profiles p_student ON fr.student_id = p_student.id
JOIN profiles p_teacher ON fr.teacher_id = p_teacher.id
JOIN courses c ON fr.course_id = c.id
ORDER BY fr.submitted_at DESC
LIMIT 10;

-- Check course assignments
SELECT 
  ca.id,
  c.course_code,
  c.course_name,
  p.full_name as teacher_name
FROM course_assignments ca
JOIN courses c ON ca.course_id = c.id
JOIN profiles p ON ca.teacher_id = p.id;
```

## Next Steps

1. **Test the flow end-to-end:**
   - Create test student, teacher, admin accounts
   - Assign teacher to a course
   - Submit feedback as student
   - Verify teacher sees it
   - Verify admin sees it

2. **If issues occur:**
   - Check RLS policies are enabled
   - Verify course_assignments exist
   - Check user roles in profiles table
   - Review browser console for API errors

## Color Palette (Updated)

```css
--background: #f9f6f1;
--foreground: #1a1429;
--brand-primary: #3547d4; /* Blue */
--brand-primary-dark: #252e87;
--brand-secondary: #f6deac; /* Warm beige */
--brand-accent: #e8604f; /* Coral red */
--brand-dark: #1a1429; /* Deep purple-black */
```

All low-contrast blue+grey combinations have been replaced with this accessible palette.
