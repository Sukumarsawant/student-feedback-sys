"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      const resolvedRole = (profile?.role || data.user?.user_metadata?.role || "").toString().toLowerCase();

      if (resolvedRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin credentials required.');
      }

      router.push('/admin');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#ef44441c,_transparent_60%),radial-gradient(circle_at_bottom,_#f973161a,_transparent_55%),linear-gradient(135deg,_#020617,_#111827_45%,_#1e293b_70%,_#0f172a)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start justify-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden max-w-lg flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.65)] backdrop-blur lg:flex">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-rose-100">
            Admin control panel
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Keep the academic ecosystem humming with clarity.
          </h1>
          <p className="text-base leading-relaxed text-rose-100/80">
            Verify feedback insights, curate teacher accounts, and oversee timetables in one streamlined dashboard tailored for administrators.
          </p>
          <div className="mt-auto grid gap-4 text-sm text-rose-50/80">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="font-medium text-white">Strong governance</p>
              <p>Only admins with validated credentials can access these controls.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="font-medium text-white">Real-time oversight</p>
              <p>Stay informed with live stats and automated teacher provisioning.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-md flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/90 p-8 shadow-[0_20px_40px_-20px_rgba(239,68,68,0.45)] backdrop-blur">
            <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-rose-200/60 blur-3xl" />
            <div className="absolute -bottom-28 left-16 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-rose-100 px-4 py-1 text-xs font-medium uppercase tracking-wide text-rose-700">
                Admin login
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">Welcome, administrator</h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your secure credentials to access the control room. Sessions are protected with Supabase and rotate automatically.
              </p>
            </div>

            <form className="relative mt-8 space-y-6" onSubmit={handleAdminLogin}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-600">
                    Admin email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    placeholder="admin@university.edu"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-medium text-slate-600">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-400/40 transition hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in as admin'}
              </button>

              <div className="text-center text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                >
                  ← Back to student/teacher login
                </Link>
              </div>
            </form>
          </div>
          <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.35em] text-rose-100/70 lg:text-left">
            Elevated permissions · Every action is audited
          </p>
        </div>
      </div>
    </div>
  );
}