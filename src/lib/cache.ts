/**
 * Server-side caching utilities for improved performance
 * Uses Next.js unstable_cache for server-side data caching
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache user profile data for 5 minutes
 * This prevents repeated DB queries for the same user
 */
export const getCachedUserProfile = unstable_cache(
  async (userId: string, supabase: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },
  ['user-profile'],
  {
    revalidate: 300, // 5 minutes
    tags: ['profile']
  }
);

/**
 * Cache course list for 10 minutes
 * Courses don't change frequently
 */
export const getCachedCourses = unstable_cache(
  async (supabase: any) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_code');
    
    if (error) throw error;
    return data;
  },
  ['courses-list'],
  {
    revalidate: 600, // 10 minutes
    tags: ['courses']
  }
);

/**
 * Cache active feedback forms for 2 minutes
 * These change more frequently
 */
export const getCachedActiveForms = unstable_cache(
  async (supabase: any) => {
    const { data, error } = await supabase
      .from('feedback_forms')
      .select(`
        *,
        courses (
          course_code,
          course_name,
          department
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  ['active-forms'],
  {
    revalidate: 120, // 2 minutes
    tags: ['feedback-forms']
  }
);

/**
 * Cache user assignments for 5 minutes
 */
export const getCachedUserAssignments = unstable_cache(
  async (userId: string, role: string, supabase: any) => {
    const column = role === 'student' ? 'student_id' : 'teacher_id';
    
    const { data, error } = await supabase
      .from('course_assignments')
      .select(`
        id,
        courses (
          id,
          course_code,
          course_name,
          department,
          year,
          semester
        )
      `)
      .eq(column, userId);
    
    if (error) throw error;
    return data;
  },
  ['user-assignments'],
  {
    revalidate: 300, // 5 minutes
    tags: ['assignments']
  }
);

/**
 * Cache department stats for 15 minutes
 * Used in admin dashboards
 */
export const getCachedDepartmentStats = unstable_cache(
  async (supabase: any) => {
    // This would contain your complex aggregation queries
    const { data, error } = await supabase
      .rpc('get_department_statistics'); // Create this RPC function in Supabase
    
    if (error) throw error;
    return data;
  },
  ['department-stats'],
  {
    revalidate: 900, // 15 minutes
    tags: ['analytics', 'stats']
  }
);

/**
 * Helper to invalidate cache by tag
 * Usage: revalidateCacheTag('profile') after updating user profile
 */
export { revalidateTag } from 'next/cache';
