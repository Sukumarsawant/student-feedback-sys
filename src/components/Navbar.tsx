"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type Profile = {
  role: string;
  full_name?: string;
} | null;

export default function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <nav className="border-b px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-bold text-blue-600">
          Student Feedback System
        </Link>
        <div className="text-gray-500">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-blue-600">
          Student Feedback System
        </Link>
        
        {user && (
          <>
            {profile?.role === 'student' && (
              <>
                <Link href="/student" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/feedback" className="text-gray-700 hover:text-blue-600">
                  Submit Feedback
                </Link>
              </>
            )}
            
            {profile?.role === 'teacher' && (
              <>
                <Link href="/teacher" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/teacher/manage" className="text-gray-700 hover:text-blue-600">
                  Manage Courses
                </Link>
              </>
            )}
            
            {profile?.role === 'admin' && (
              <>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin Dashboard
                </Link>
                <Link href="/admin/teachers" className="text-gray-700 hover:text-blue-600">
                  Manage Teachers
                </Link>
                <Link href="/admin/timetable" className="text-gray-700 hover:text-blue-600">
                  Timetable
                </Link>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              Welcome, {profile?.full_name || user.email}
              {profile?.role && (
                <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {profile.role}
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              Student/Teacher Login
            </Link>
            <Link 
              href="/admin-login" 
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Admin Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}