"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type TeacherOption = {
  id: string;
  courseCode: string;
  courseName: string;
  instructorName: string;
};

type FeedbackFormState = {
  rating: number;
  comments: string;
  is_anonymous: boolean;
};

const teacherOptions: TeacherOption[] = [
  {
    id: "dbms",
    courseCode: "DBMS",
    courseName: "Database Management Systems",
    instructorName: "Dr. Sachin Deshmukh",
  },
  {
    id: "microprocessor",
    courseCode: "MP",
    courseName: "Microprocessor",
    instructorName: "Mrs. Suvarna Bhat",
  },
  {
    id: "design-thinking",
    courseCode: "DT",
    courseName: "Design Thinking",
    instructorName: "Dr. Sachin Bojewar",
  },
  {
    id: "ematics-3",
    courseCode: "EM3",
    courseName: "Engineering Mathematics 3",
    instructorName: "Khimya Amlani",
  },
  {
    id: "presentation-skills",
    courseCode: "PS",
    courseName: "Presentation Skills",
    instructorName: "Asmita Neve",
  },
  {
    id: "analysis-of-algorithm",
    courseCode: "AOA",
    courseName: "Analysis of Algorithm",
    instructorName: "Dr. Swapnil Sonawane",
  },
];

export default function FeedbackPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [form, setForm] = useState<FeedbackFormState>({
    rating: 5,
    comments: "",
    is_anonymous: false,
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const selectedTeacher = teacherOptions.find((option) => option.id === selectedTeacherId);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!selectedTeacher) {
        setError("Please choose a teacher before submitting your feedback.");
        setSubmitting(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      
      const { error } = await supabase.from("feedback").insert({
        student_id: user.id,
        course_code: selectedTeacher.courseCode,
        instructor_name: selectedTeacher.instructorName,
        rating: form.rating,
        comments: form.comments || null,
        is_anonymous: form.is_anonymous,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setForm({ rating: 5, comments: "", is_anonymous: false });
        setSelectedTeacherId("");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Feedback studio</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Tell us how your learning experience feels right now.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-indigo-50/90">
              Your insights spotlight what works—and what needs a tune-up. The more you share, the better we can co-create remarkable classrooms.
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-indigo-50/80">Average rating submitted</p>
              <p className="text-2xl font-semibold text-white">{form.rating}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-indigo-50/80">Active educators</p>
              <p className="text-2xl font-semibold text-white">{teacherOptions.length}</p>
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
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700">
                Step 1 · Pick a course
              </p>
              <h2 className="text-xl font-semibold text-slate-900">Which course or instructor are you rating?</h2>
              <p className="text-sm text-slate-500">
                Choose the classroom experience you’d like to review today. You can submit again for different teachers anytime.
              </p>
            </div>

            <div className="grid gap-3">
              {teacherOptions.map((option) => {
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
                <option value={1}>1 — Needs serious work</option>
                <option value={2}>2 — Needs improvement</option>
                <option value={3}>3 — Solid, room to grow</option>
                <option value={4}>4 — Strong experience</option>
                <option value={5}>5 — Exceptional learning</option>
              </select>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold text-slate-700">Submit anonymously?</span>
              <label
                htmlFor="is_anonymous"
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-200"
              >
                <span className="text-sm text-slate-600">
                  Hide your name from instructors—admins will still see aggregated data.
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
              placeholder="Share what resonated, what didn’t, or suggestions to improve the class experience."
              value={form.comments ?? ""}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-xs text-slate-400">Pro tip: Specific examples help instructors respond faster.</p>
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
            disabled={submitting}
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

        <aside className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-indigo-950/80 p-6 text-indigo-50 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.6)] backdrop-blur">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-100/80">
              Why it matters
            </p>
            <h3 className="text-lg font-semibold">Your words become action items.</h3>
            <p className="text-sm text-indigo-100/80">
              Faculty leads review sentiment weekly and turn suggestions into experiments. Standout feedback is celebrated in monthly retros.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4">
            <h4 className="text-sm font-semibold">Need anonymity?</h4>
            <p className="text-sm text-indigo-100/80">
              All submissions are stored securely. If you opt in for anonymity, only admins see aggregated metrics—never your name.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4">
            <h4 className="text-sm font-semibold">Want to follow up?</h4>
            <p className="text-sm text-indigo-100/80">
              Drop a note to your class representative or email the academic office with the form ID for deeper conversations.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}