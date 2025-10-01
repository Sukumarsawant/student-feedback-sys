# Performance Optimization Guide

## 🚀 Issues Fixed

### Before Optimization:
- ❌ Login timeouts on Netlify
- ❌ Slow profile page loads (5-10+ seconds)
- ❌ Middleware making DB queries on every request
- ❌ No database indexes causing full table scans
- ❌ No caching strategy

### After Optimization:
- ✅ Removed DB query from middleware (uses session metadata)
- ✅ Increased timeout from 5s to 15s
- ✅ Added database indexes for frequently queried columns
- ✅ Implemented server-side caching with Next.js
- ✅ Added loading skeleton for better UX
- ✅ Profile page now caches for 30 seconds

---

## 📋 Steps to Apply Fixes

### 1. **Update Supabase Database Indexes** (CRITICAL)

Run the SQL script in your Supabase dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `supabase/performance-indexes.sql`
3. Execute the SQL script
4. This adds indexes to:
   - `profiles` (role, email)
   - `feedback_responses` (student_id, teacher_id, course_id, submitted_at, form_id)
   - `feedback_answers` (response_id, question_id)
   - `feedback_forms` (course_id, is_active, end_date)
   - `course_assignments` (student_id, teacher_id, course_id)
   - `courses` (course_code, department)

**Why this matters:** Without indexes, every query does a full table scan. With 1000+ rows, this causes 5-10 second delays.

---

### 2. **Ensure User Metadata Contains Role**

Make sure when users sign up or login, their role is stored in `user_metadata`:

```typescript
// During signup:
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      role: 'student', // or 'teacher', 'admin'
      full_name: fullName,
      // ... other metadata
    }
  }
});

// During profile creation trigger (Supabase function):
// Update user metadata when profile is created
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  to_jsonb(NEW.role)
)
WHERE id = NEW.id;
```

---

### 3. **Create Supabase Database Function** (Optional but Recommended)

For analytics queries, create an RPC function in Supabase:

```sql
-- Create function for department statistics
CREATE OR REPLACE FUNCTION get_department_statistics()
RETURNS TABLE (
  department TEXT,
  total_students BIGINT,
  total_teachers BIGINT,
  total_responses BIGINT,
  avg_rating NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.department,
    COUNT(DISTINCT fr.student_id) as total_students,
    COUNT(DISTINCT ca.teacher_id) as total_teachers,
    COUNT(fr.id) as total_responses,
    ROUND(AVG(fa.answer_rating), 2) as avg_rating
  FROM courses c
  LEFT JOIN feedback_responses fr ON fr.course_id = c.id
  LEFT JOIN course_assignments ca ON ca.course_id = c.id
  LEFT JOIN feedback_answers fa ON fa.response_id = fr.id
  WHERE fa.answer_rating IS NOT NULL
  GROUP BY c.department
  ORDER BY c.department;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_department_statistics() TO authenticated;
```

---

### 4. **Environment Variables**

Ensure these are set in Netlify:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_VIT_EMAIL_DOMAIN=vit.edu.in
NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN=vit.edu.in
```

---

### 5. **Build Configuration**

In `netlify.toml`, ensure proper build settings:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### 6. **Deploy Changes**

```bash
git add .
git commit -m "perf: optimize database queries and add caching"
git push origin master
```

Netlify will auto-deploy.

---

## 🔍 Performance Monitoring

### Check Query Performance in Supabase:

1. Go to Supabase Dashboard → Database → Query Performance
2. Look for slow queries (> 100ms)
3. Add indexes as needed

### Check if Indexes are Working:

```sql
-- Check if index is being used
EXPLAIN ANALYZE 
SELECT * FROM feedback_responses WHERE student_id = 'some-uuid';

-- Should show "Index Scan" not "Seq Scan"
```

---

## 🎯 Expected Performance Improvements

| Metric | Before | After |
|--------|--------|-------|
| Login time | 5-10s (often timeout) | 1-2s |
| Profile page load | 8-15s | 2-3s (first load), <1s (cached) |
| Middleware overhead | 200-500ms per request | 5-10ms per request |
| Dashboard loads | 3-5s | 1-2s |

---

## 🐛 Troubleshooting

### If still slow:

1. **Check Supabase region**: Ensure it's close to your Netlify deployment region
2. **Check RLS policies**: Complex policies can slow queries - simplify if possible
3. **Check row count**: If tables have 10k+ rows, consider pagination
4. **Check network**: Test from different locations (use Netlify Analytics)

### If indexes aren't working:

```sql
-- Check if indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'feedback_responses', 'feedback_answers');

-- If missing, re-run performance-indexes.sql
```

### If caching issues:

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# In production, trigger re-deploy in Netlify
```

---

## 📊 Using the Cache System

```typescript
import { getCachedUserProfile, revalidateTag } from '@/lib/cache';

// Get cached profile
const profile = await getCachedUserProfile(userId, supabase);

// After updating profile, invalidate cache
await supabase.from('profiles').update({ ... });
revalidateTag('profile'); // Force re-fetch on next request
```

---

## 🚀 Next Steps for Further Optimization

1. **Enable Supabase Connection Pooling** (Supabase Pro)
2. **Use Edge Functions** for real-time data
3. **Implement Redis caching** for session data
4. **Use CDN** for static assets
5. **Enable Supabase Realtime** only where needed
6. **Optimize images** with next/image

---

## 📝 Summary

The main bottlenecks were:

1. **Missing database indexes** → Added comprehensive indexes
2. **Middleware DB queries** → Removed, use session metadata
3. **No caching** → Implemented Next.js caching
4. **Short timeouts** → Increased to 15s
5. **No loading states** → Added loading skeletons

Apply the SQL script first (step 1), then deploy. Performance should improve dramatically.
