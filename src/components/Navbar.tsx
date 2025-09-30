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
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-blue-600">
            Student Feedback System
          </Link>
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-blue-600"
          >
            Student Feedback System
          </Link>

          {user && (
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
              {profile?.role === "student" && (
                <>
                  <Link href="/student" className="hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/feedback" className="hover:text-blue-600">
                    Submit Feedback
                  </Link>
                </>
              )}

              {profile?.role === "teacher" && (
                <>
                  <Link href="/teacher" className="hover:text-blue-600">
                    Dashboard
                  </Link>
                  <Link href="/teacher/manage" className="hover:text-blue-600">
                    Manage Courses
                  </Link>
                </>
              )}

              {profile?.role === "admin" && (
                <>
                  <Link href="/admin" className="hover:text-blue-600">
                    Admin Dashboard
                  </Link>
                  <Link href="/admin/teachers" className="hover:text-blue-600">
                    Manage Teachers
                  </Link>
                  <Link href="/admin/timetable" className="hover:text-blue-600">
                    Timetable
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                <span className="font-medium">{profile?.full_name || user.email}</span>
                {profile?.role && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {profile.role}
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
              >
                Student/Teacher Login
              </Link>
              <Link
                href="/admin-login"
                className="rounded-full bg-slate-900 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}