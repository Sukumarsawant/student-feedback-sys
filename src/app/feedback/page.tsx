"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

type TeacherOption = {
  id: string;
  teacherId: string | null;
  courseCode: string;
  courseName: string;
  instructorName: string;
  courseId: string | null;
};

type FeedbackFormState = {
  rating: number;
  comments: string;
  is_anonymous: boolean;
};

type AssignmentRow = {
  id: string;
  teacher_id: string | null;
  course_id: string | null;
  courses:
    | {
        course_code: string | null;
        course_name: string | null;
      }
    | Array<{
        course_code: string | null;
        course_name: string | null;
      }>
    | null;
};

export default function FeedbackPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get('course_id');
  const [form, setForm] = useState<FeedbackFormState>({
    rating: 5,
    comments: "",
    is_anonymous: false,
  });
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const selectedTeacher = teacherOptions.find((option) => option.id === selectedTeacherId);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = (profile?.role || user.user_metadata?.role || "").toString().toLowerCase();

    if (role && role !== 'student') {
      router.replace('/analytics');
      return;
    }

    setAuthorized(true);
  }, [supabase, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadTeacherOptions = useCallback(async () => {
    if (!authorized) {
      return;
    }

    setLoadingOptions(true);
    setOptionsError(null);

    const { data: assignments, error: assignmentsError } = await supabase
      .from("course_assignments")
      .select("id, teacher_id, course_id, courses ( course_code, course_name )")
      .order("created_at", { ascending: true })
      .returns<AssignmentRow[]>();

    if (assignmentsError) {
      setTeacherOptions([]);
      setSelectedTeacherId("");
      setOptionsError("Unable to load course list. Please try again later.");
      setLoadingOptions(false);
      return;
    }

    const teacherIds = Array.from(
      new Set((assignments ?? []).map((assignment) => assignment.teacher_id).filter((id): id is string => Boolean(id)))
    );

    const teacherNameMap = new Map<string, string>();

    if (teacherIds.length > 0) {
      const { data: teacherProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);

      teacherProfiles?.forEach((profile) => {
        if (profile?.id) {
          teacherNameMap.set(profile.id, profile.full_name ?? "Faculty");
        }
      });
    }

    const normalized = (assignments ?? [])
      .map((assignment) => {
        const courseRecord = Array.isArray(assignment.courses)
          ? assignment.courses[0] ?? null
          : assignment.courses ?? null;
        const courseCode = courseRecord?.course_code ?? "";
        const courseName = courseRecord?.course_name ?? "Untitled course";
        const teacherId = assignment.teacher_id ?? null;
        const courseId = assignment.course_id ?? null;
        const instructorName = teacherId ? teacherNameMap.get(teacherId) ?? "Faculty" : "Faculty";

        return {
          id: assignment.id as string,
          teacherId,
          courseId,
          courseCode,
          courseName,
          instructorName,
        } satisfies TeacherOption;
      })
      .filter((option) => option.courseCode || option.courseName);

    setTeacherOptions(normalized);
    setSelectedTeacherId((current) => {
      if (normalized.length === 0) {
        return "";
      }

      // If URL has course_id, try to select that course
      if (urlCourseId) {
        const matchingOption = normalized.find((option) => option.courseId === urlCourseId);
        if (matchingOption) {
          return matchingOption.id;
        }
      }

      return normalized.some((option) => option.id === current) ? current : normalized[0].id;
    });

    setLoadingOptions(false);
  }, [authorized, supabase, urlCourseId]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    loadTeacherOptions();
  }, [authorized, loadTeacherOptions]);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    console.log('🚀 Form submission started');
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!selectedTeacher) {
        console.log('❌ No teacher selected');
        setError("Please choose a teacher before submitting your feedback.");
        return;
      }

      console.log('📝 Selected teacher:', selectedTeacher);
      console.log('🔐 Getting user session...');

      const { data: sessionData, error: authError } = await supabase.auth.getUser();
      
      console.log('🔐 Session data received:', sessionData ? 'User found' : 'No user');
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        setError('Authentication error. Please try logging in again.');
        return;
      }

      const user = sessionData.user;
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        router.replace("/login");
        return;
      }

      console.log('✅ User authenticated:', user.id);

      const requestBody = {
        courseCode: selectedTeacher.courseCode,
        courseName: selectedTeacher.courseName,
        instructorName: selectedTeacher.instructorName,
        rating: form.rating,
        comments: form.comments || null,
        isAnonymous: form.is_anonymous,
      };

      console.log('📤 Sending feedback:', requestBody);

      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      const payload = await response.json();
      console.log('📥 Response payload:', payload);

      if (!response.ok) {
        const message = typeof payload?.error === "string" ? payload.error : "Failed to submit feedback.";
        console.log('❌ Submission failed:', message);
        setError(message);
        return;
      }

      console.log('✅ Feedback submitted successfully!');
      setSuccess(true);
      setForm({ rating: 5, comments: "", is_anonymous: false });
      setSelectedTeacherId(teacherOptions[0]?.id ?? "");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('❌ Error during submission:', error);
      setError(errorMessage);
    } finally {
      console.log('🏁 Form submission complete, resetting button');
      setSubmitting(false);
    }
  }

  if (!authorized) {
    return (
      <div className="mx-auto flex h-[60vh] w-full max-w-4xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200/70 bg-white/80 px-10 py-12 text-slate-600 shadow-[0_25px_60px_-30px_rgba(79,70,229,0.35)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-[var(--brand-primary)] text-[var(--brand-primary)]">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.364 5.364l-2.828-2.828M8.464 8.464 5.636 5.636m12.728 0-2.828 2.828M8.464 15.536l-2.828 2.828" />
            </svg>
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--brand-primary)]">Loading</p>
          <p className="text-sm text-slate-500">Loading feedback form…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-8 text-[var(--brand-dark)] shadow-[0_35px_80px_-45px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]">Submit feedback</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              How are your courses going?
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600">
              Your feedback helps teachers know what&apos;s working and what needs improvement.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-yellow-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-semibold">Your rating</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{form.rating}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-700 font-semibold">Courses</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{loadingOptions ? "—" : teacherOptions.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <form
          className="relative space-y-8 rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_25px_50px_-25px_rgba(79,70,229,0.35)] backdrop-blur"
          onSubmit={submitFeedback}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Select a course</h2>
              <p className="text-sm text-slate-500">
                Pick the course you want to give feedback on.
              </p>
            </div>

            <div className="grid gap-3">
              {loadingOptions && (
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 text-sm text-slate-500">
                  <svg className="h-5 w-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.364 5.364l-2.828-2.828M8.464 8.464 5.636 5.636m12.728 0-2.828 2.828M8.464 15.536l-2.828 2.828" />
                  </svg>
                  Loading courses…
                </div>
              )}

              {!loadingOptions && optionsError && (
                <div className="flex flex-col gap-3 rounded-3xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-600">
                  <p>{optionsError}</p>
                  <button
                    type="button"
                    onClick={() => loadTeacherOptions()}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingOptions && !optionsError && teacherOptions.length === 0 && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-700">
                  No courses found. Contact your academic office if this seems wrong.
                </div>
              )}

              {!loadingOptions && !optionsError && teacherOptions.map((option) => {
                const isSelected = selectedTeacherId === option.id;
                return (
                  <label
                    key={option.id}
                    className={`relative flex cursor-pointer flex-col rounded-3xl border p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg focus-within:-translate-y-0.5 focus-within:border-indigo-300 focus-within:shadow-lg ${
                      isSelected ? "border-indigo-500 bg-indigo-50/70 shadow-lg" : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="teacher"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setSelectedTeacherId(option.id)}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-4">
                      <span>
                        <span className="text-base font-semibold text-slate-900">{option.courseName}</span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.3em] text-slate-500">{option.courseCode}</span>
                        <span className="mt-3 block text-sm text-slate-600">{option.instructorName}</span>
                      </span>
                      {isSelected && (
                        <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white shadow-sm">
                          ✓
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="rating" className="text-sm font-semibold text-slate-700">
                Overall rating
              </label>
              <select
                id="rating"
                name="rating"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value={1}>1 — Poor</option>
                <option value={2}>2 — Fair</option>
                <option value={3}>3 — Good</option>
                <option value={4}>4 — Very good</option>
                <option value={5}>5 — Excellent</option>
              </select>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-700">Submit anonymously?</span>
              <label
                htmlFor="is_anonymous"
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-200"
              >
                <span className="text-sm text-slate-600">
                  Hide your name from instructors.
                </span>
                <input
                  id="is_anonymous"
                  name="is_anonymous"
                  type="checkbox"
                  checked={form.is_anonymous}
                  onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="comments" className="text-sm font-semibold text-slate-700">
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={5}
              placeholder="Tell us what&apos;s working and what could be better."
              value={form.comments ?? ""}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-xs text-slate-400">Specific examples are most helpful.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-600 shadow-sm">
              Thank you! Your feedback has been submitted.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loadingOptions || !selectedTeacherId}
            className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="-ml-1 mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting…
              </>
            ) : (
              "Submit feedback"
            )}
          </button>
        </form>

        <aside className="flex flex-col gap-6 rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-6 text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Your feedback matters</h3>
            <p className="text-sm">
              Teachers use your input to improve their courses.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-secondary)]/30 p-4 text-sm">
            <h4 className="font-semibold text-slate-900">Anonymous submissions</h4>
            <p>
              If you choose anonymous, your name won&apos;t be shown to instructors.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-secondary)]/30 p-4 text-sm">
            <h4 className="font-semibold text-slate-900">Questions?</h4>
            <p>
              Contact your class representative or the academic office.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}