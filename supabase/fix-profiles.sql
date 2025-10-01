-- Script to check and fix profiles table
-- Run this in Supabase SQL Editor

-- 1. Check existing profiles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Check if there are users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE 
    WHEN p.id IS NULL THEN 'NO PROFILE'
    ELSE 'HAS PROFILE'
  END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 3. Create missing profiles for existing users (if needed)
-- WARNING: This will create profiles with 'student' role by default
-- You'll need to manually update roles for teachers and admins after
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'student'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Update specific user roles (REPLACE WITH YOUR ACTUAL USER IDS/EMAILS)
-- Example: Update a user to teacher role
-- UPDATE profiles 
-- SET role = 'teacher'
-- WHERE email = 'teacher@vit.edu.in';

-- Example: Update a user to admin role
-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE email = 'admin@vit.edu.in';

-- 5. Verify all profiles have roles
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as profiles_with_role,
  COUNT(CASE WHEN role IS NULL THEN 1 END) as profiles_without_role
FROM profiles;

-- 6. Check role distribution
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
