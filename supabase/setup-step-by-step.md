# Step-by-Step User Setup Guide

Run these queries **ONE AT A TIME** in Supabase SQL Editor.

## QUERY 1: Check Current Status
**Copy and paste this, then click RUN:**

```sql
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
```

---

## QUERY 2: Create Missing Profiles
**Only run this if Query 1 showed "❌ NO PROFILE" for any users:**

```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
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
```

---

## QUERY 3: Update All Teachers at Once
**Run this single query to set all 6 teachers:**

```sql
UPDATE profiles 
SET 
  role = 'teacher',
  full_name = CASE email
    WHEN 'sachin.deshmukh@vit.edu.in' THEN 'Dr. Sachin Deshmukh'
    WHEN 'suvarna.bhat@vit.edu.in' THEN 'Mrs. Suvarna Bhat'
    WHEN 'sachin.bojewar@vit.edu.in' THEN 'Dr. Sachin Bojewar'
    WHEN 'khimya.amlani@vit.edu.in' THEN 'Khimya Amlani'
    WHEN 'asmita.neve@vit.edu.in' THEN 'Asmita Neve'
    WHEN 'swapnil.sonawane@vit.edu.in' THEN 'Dr. Swapnil Sonawane'
  END,
  department = CASE email
    WHEN 'khimya.amlani@vit.edu.in' THEN 'Mathematics'
    WHEN 'asmita.neve@vit.edu.in' THEN 'Communication'
    ELSE 'Computer Science'
  END
WHERE email IN (
  'sachin.deshmukh@vit.edu.in',
  'suvarna.bhat@vit.edu.in',
  'sachin.bojewar@vit.edu.in',
  'khimya.amlani@vit.edu.in',
  'asmita.neve@vit.edu.in',
  'swapnil.sonawane@vit.edu.in'
);
```

---

## QUERY 4: Set Student Role
**Run this:**

```sql
UPDATE profiles 
SET role = 'student', 
    full_name = 'Student User'
WHERE email = 'student@vit.edu.in';
```

---

## QUERY 5: Set Admin Role
**Run this:**

```sql
UPDATE profiles 
SET role = 'admin', 
    full_name = 'System Administrator'
WHERE email = 'admin@vit.edu.in';
```

---

## QUERY 6: Verify Everything is Set
**Run this final check:**

```sql
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
```

---

## Expected Final Result:
You should see:
- ✅ 1 admin (admin@vit.edu.in)
- ✅ 6 teachers (all professors)
- ✅ 1 student (student@vit.edu.in)

All with proper names and roles! 🎉
