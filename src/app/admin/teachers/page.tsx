"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  department: string;
  created_at: string;
}

export default function TeacherManagement() {
  const supabase = createSupabaseBrowserClient();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    department: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "English",
    "Administration"
  ];

  const fetchTeachers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  async function handleCreateTeacher(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      // Get the current user session for authorization
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!user || !session) {
        throw new Error('You must be logged in to create teachers');
      }

      const response = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          employeeId: formData.employeeId,
          department: formData.department
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create teacher');
      }

      const credentialInfo = result.credentials
        ? ` Username: ${result.credentials.username} | Password: ${result.credentials.password}`
        : '';

      setSuccess(`${result.message}.${credentialInfo}`.trim());
      setFormData({
        fullName: "",
        employeeId: "",
        department: ""
      });
      setShowCreateForm(false);
      fetchTeachers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex h-[60vh] w-full max-w-4xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200/70 bg-white/80 px-10 py-12 text-slate-600 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.4)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-indigo-500 text-indigo-500">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.364 5.364l-2.828-2.828M8.464 8.464L5.636 5.636m12.728 0l-2.828 2.828M8.464 15.536l-2.828 2.828" />
            </svg>
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-indigo-500">Loading</p>
          <p className="text-sm text-slate-500">Fetching the latest teacher roster…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Admin tools</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Teacher management hub
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-indigo-50/90">
              Provision new instructors, keep departments in sync, and maintain a clean roster with automatically generated credentials.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-indigo-100/90">Total teachers</p>
              <p className="text-2xl font-semibold text-white">{teachers.length}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-indigo-100/90">Departments covered</p>
              <p className="text-2xl font-semibold text-white">{new Set(teachers.map((t) => t.department || "Unassigned")).size}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Roster controls</h2>
          <p className="text-sm text-slate-500">Create or review teachers with a couple of clicks—credentials are ready to share instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-1 focus:ring-offset-indigo-600"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            Create new teacher
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/90 px-6 py-4 text-sm font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 px-6 py-4 text-sm font-medium text-emerald-600 shadow-sm">
          {success}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-8 shadow-[0_25px_60px_-25px_rgba(76,29,149,0.55)] backdrop-blur">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700">
                Quick add
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">Create a teacher account</h2>
              <p className="text-sm text-slate-500">
                We’ll auto-generate the login credentials from the teacher’s first name. Share them securely right after creation.
              </p>
            </div>

            <form onSubmit={handleCreateTeacher} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Full name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Employee ID</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Department</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create teacher'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-2 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-900">All teachers ({teachers.length})</h3>
          <p className="text-sm text-slate-500">Default teacher password is <span className="font-semibold text-slate-700">123456</span>. Coordinate with admin support before changing.</p>
        </div>

        {teachers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m-7 8h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="mt-4 text-lg font-semibold text-slate-900">No teachers yet</h4>
            <p className="mt-2 text-sm text-slate-500">Create the first teacher account to kickstart onboarding.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/80">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Employee ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="transition hover:bg-indigo-50/40">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {teacher.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.employee_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                        {teacher.department || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}