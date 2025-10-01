-- Setup Users and Profiles for Feedback System
-- Run this in Supabase SQL Editor

-- First, let's check if these profiles already exist
SELECT 
  au.email,
  au.id as user_id,
  p.role,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.role IS NULL THEN '⚠️ NO ROLE'
    ELSE '✅ HAS PROFILE & ROLE'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN (
  'sachin.deshmukh@vit.edu.in',
  'suvarna.bhat@vit.edu.in',
  'sachin.bojewar@vit.edu.in',
  'khimya.amlani@vit.edu.in',
  'asmita.neve@vit.edu.in',
  'swapnil.sonawane@vit.edu.in',
  'student@vit.edu.in',
  'admin@vit.edu.in'
)
ORDER BY au.email;

-- ============================================
-- STEP 1: Create profiles for any users that don't have them
-- ============================================
-- This will create profiles with default 'student' role and temporary full names
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)  -- Use email prefix as fallback
  ),
  'student'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.email IN (
  'sachin.deshmukh@vit.edu.in',
  'suvarna.bhat@vit.edu.in',
  'sachin.bojewar@vit.edu.in',
  'khimya.amlani@vit.edu.in',
  'asmita.neve@vit.edu.in',
  'swapnil.sonawane@vit.edu.in',
  'student@vit.edu.in',
  'admin@vit.edu.in'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Update TEACHER roles and full names
-- ============================================

-- DATABASE MANAGEMENT SYSTEMS - DR. SACHIN DESHMUKH
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Dr. Sachin Deshmukh',
    department = 'Computer Science'
WHERE email = 'sachin.deshmukh@vit.edu.in';

-- MICROPROCESSOR - MRS. SUVARNA BHAT
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Mrs. Suvarna Bhat',
    department = 'Computer Science'
WHERE email = 'suvarna.bhat@vit.edu.in';

-- DESIGN THINKING - DR. SACHIN BOJEWAR
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Dr. Sachin Bojewar',
    department = 'Computer Science'
WHERE email = 'sachin.bojewar@vit.edu.in';

-- ENGINEERING MATHEMATICS 3 - KHIMYA AMLANI
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Khimya Amlani',
    department = 'Mathematics'
WHERE email = 'khimya.amlani@vit.edu.in';

-- PRESENTATION SKILLS - ASMITA NEVE
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Asmita Neve',
    department = 'Communication'
WHERE email = 'asmita.neve@vit.edu.in';

-- ANALYSIS OF ALGORITHM - DR. SWAPNIL SONAWANE
UPDATE profiles 
SET role = 'teacher', 
    full_name = 'Dr. Swapnil Sonawane',
    department = 'Computer Science'
WHERE email = 'swapnil.sonawane@vit.edu.in';

-- ============================================
-- STEP 3: Update STUDENT role
-- ============================================
UPDATE profiles 
SET role = 'student', 
    full_name = 'Student User'
WHERE email = 'student@vit.edu.in';

-- ============================================
-- STEP 4: Update ADMIN role
-- ============================================
UPDATE profiles 
SET role = 'admin', 
    full_name = 'System Administrator'
WHERE email = 'admin@vit.edu.in';

-- ============================================
-- STEP 5: Verify all profiles are set correctly
-- ============================================
SELECT 
  email,
  full_name,
  role,
  department,
  CASE 
    WHEN role = 'teacher' THEN '👨‍🏫 TEACHER'
    WHEN role = 'student' THEN '👨‍🎓 STUDENT'
    WHEN role = 'admin' THEN '👑 ADMIN'
    ELSE '❌ INVALID ROLE'
  END as role_status
FROM profiles
WHERE email IN (
  'sachin.deshmukh@vit.edu.in',
  'suvarna.bhat@vit.edu.in',
  'sachin.bojewar@vit.edu.in',
  'khimya.amlani@vit.edu.in',
  'asmita.neve@vit.edu.in',
  'swapnil.sonawane@vit.edu.in',
  'student@vit.edu.in',
  'admin@vit.edu.in'
)
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'teacher' THEN 2
    WHEN 'student' THEN 3
  END,
  full_name;

-- ============================================
-- STEP 6: Check role distribution
-- ============================================
SELECT 
  role,
  COUNT(*) as count,
  string_agg(email, ', ') as users
FROM profiles
WHERE email IN (
  'sachin.deshmukh@vit.edu.in',
  'suvarna.bhat@vit.edu.in',
  'sachin.bojewar@vit.edu.in',
  'khimya.amlani@vit.edu.in',
  'asmita.neve@vit.edu.in',
  'swapnil.sonawane@vit.edu.in',
  'student@vit.edu.in',
  'admin@vit.edu.in'
)
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'teacher' THEN 2
    WHEN 'student' THEN 3
  END;
