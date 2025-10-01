import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Assignment = {
  id: string;
  course: {
    course_code: string | null;
    course_name: string | null;
    department: string | null;
  } | null;
};

type AssignmentRow = {
  id: string;
  courses:
    | {
        course_code: string | null;
        course_name: string | null;
        department: string | null;
      }
    | {
        course_code: string | null;
        course_name: string | null;
        department: string | null;
      }[]
    | null;
};

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResponseRow = {
  id: string;
  course_id: string;
  teacher_id: string | null;
  submitted_at: string;
  is_anonymous: boolean | null;
  courses: {
    course_code: string | null;
    course_name: string | null;
    department: string | null;
  } | null;
  teacher: {
    id: string;
    full_name: string | null;
  } | null;
  answers: Array<{
    answer_rating: number | null;
    answer_text: string | null;
    question: {
      question_type: string | null;
    } | null;
  }> | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return date.toLocaleString();
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, role, full_name, department")
    .eq("id", user.id)
    .single();

  const role = (profileRow?.role || user.user_metadata?.role || "").toString().toLowerCase();

  if (!role) {
    redirect("/login");
  }

  if (role === "student") {
    redirect("/feedback");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const selectedCourse = typeof resolvedSearchParams?.course === "string" ? resolvedSearchParams.course : null;

  const { data: assignmentsData } = await supabase
    .from("course_assignments")
    .select("id, courses(course_code, course_name, department)")
    .eq("teacher_id", user.id)
    .returns<AssignmentRow[]>();

  const assignments: Assignment[] = (assignmentsData ?? []).map((assignment) => {
    const course = Array.isArray(assignment.courses)
      ? assignment.courses[0] ?? null
      : assignment.courses ?? null;

    return {
      id: assignment.id as string,
      course: course
        ? {
            course_code: course.course_code ?? null,
            course_name: course.course_name ?? null,
            department: course.department ?? null,
          }
        : null,
    } satisfies Assignment;
  });

  const teacherCourseCodes = assignments
    .map((assignment) => assignment.course?.course_code)
    .filter((code): code is string => Boolean(code));

  const supabaseAdmin = createSupabaseAdminClient();

  // Build the query conditionally before executing
  let responsesQuery = supabaseAdmin
    .from("feedback_responses")
    .select(
      `id,
       course_id,
       teacher_id,
       submitted_at,
       is_anonymous,
       courses ( course_code, course_name, department ),
       teacher:profiles!feedback_responses_teacher_id_fkey ( id, full_name ),
       answers:feedback_answers (
         answer_rating,
         answer_text,
         question:feedback_questions ( question_type )
       )`
    )
    .order("submitted_at", { ascending: false });

  // Apply filters before executing the query
  if (role === "teacher") {
    responsesQuery = responsesQuery.eq("teacher_id", user.id);
  }

  if (selectedCourse) {
    responsesQuery = responsesQuery.eq("courses.course_code", selectedCourse);
  } else if (role === "teacher" && teacherCourseCodes.length > 0) {
    responsesQuery = responsesQuery.in("courses.course_code", teacherCourseCodes);
  }

  // Execute the query with type assertion
  const { data: responsesData } = await responsesQuery.returns<ResponseRow[]>();

  const normalizedResponses = (responsesData ?? []).map((row) => {
    const ratingAnswer = row.answers?.find((answer) => typeof answer.answer_rating === "number" && !Number.isNaN(answer.answer_rating));
    const commentAnswer = row.answers?.find((answer) => typeof answer.answer_text === "string" && answer.answer_text.trim().length > 0);

    return {
      id: row.id,
      courseId: row.course_id,
      courseCode: row.courses?.course_code ?? null,
      courseName: row.courses?.course_name ?? null,
      department: row.courses?.department ?? null,
      rating: ratingAnswer?.answer_rating ?? null,
      comment: commentAnswer?.answer_text ?? null,
      submittedAt: row.submitted_at,
      teacherName: row.teacher?.full_name ?? null,
      isAnonymous: Boolean(row.is_anonymous),
    };
  });

  const totalResponses = normalizedResponses.length;
  const ratingDistribution = new Map<number, number>();
  let ratingSum = 0;

  normalizedResponses.forEach((response) => {
    if (typeof response.rating === "number" && !Number.isNaN(response.rating)) {
      ratingSum += response.rating;
      ratingDistribution.set(response.rating, (ratingDistribution.get(response.rating) ?? 0) + 1);
    }
  });

  const averageRating = totalResponses ? Number((ratingSum / totalResponses).toFixed(2)) : null;
  const latestResponse = normalizedResponses[0] ?? null;

  const courseSummary = new Map<
    string,
    {
      courseName: string | null;
      department: string | null;
      responses: number;
      ratingSum: number;
    }
  >();

  normalizedResponses.forEach((response) => {
    const code = response.courseCode ?? "Unassigned";
    const existing = courseSummary.get(code) ?? {
      courseName: response.courseName ?? assignments.find((assignment) => assignment.course?.course_code === code)?.course?.course_name ?? null,
      department: response.department ?? assignments.find((assignment) => assignment.course?.course_code === code)?.course?.department ?? null,
      responses: 0,
      ratingSum: 0,
    };

    existing.responses += 1;
    if (typeof response.rating === "number" && !Number.isNaN(response.rating)) {
      existing.ratingSum += response.rating;
    }
    courseSummary.set(code, existing);
  });

  const courseCards = Array.from(courseSummary.entries()).map(([code, data]) => ({
    code,
    name: data.courseName ?? code,
    department: data.department,
    responses: data.responses,
    averageRating: data.responses ? Number((data.ratingSum / data.responses).toFixed(2)) : null,
  }));

  const teacherBreakdown = new Map<
    string,
    {
      responses: number;
      ratingSum: number;
    }
  >();

  if (role === "admin") {
    normalizedResponses.forEach((response) => {
      const name = response.teacherName ?? "Unassigned";
      const existing = teacherBreakdown.get(name) ?? { responses: 0, ratingSum: 0 };
      existing.responses += 1;
      if (typeof response.rating === "number" && !Number.isNaN(response.rating)) {
        existing.ratingSum += response.rating;
      }
      teacherBreakdown.set(name, existing);
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-10 text-[var(--brand-dark)] shadow-[0_35px_90px_-55px_rgba(15,23,42,0.35)]">
        <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-[var(--brand-secondary)]/50 blur-3xl" />
        <div className="absolute -left-20 bottom-4 h-40 w-40 rounded-full bg-[var(--brand-accent)]/35 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-secondary)]/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-primary-dark)]">
              {role === "admin" ? "Institution analytics" : "Teacher analytics"}
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {role === "admin" ? "Feedback insights across campus" : `Welcome back, ${profileRow?.full_name ?? "Teacher"}`}
            </h1>
            <p className="max-w-xl text-sm text-slate-600">
              Track sentiment, surface standout courses, and turn comments into experiments. These numbers update live as students submit their feedback.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Total responses</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalResponses}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Average rating</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{averageRating ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-7 shadow-[0_25px_70px_-45px_rgba(28,44,99,0.5)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Rating distribution</h2>
            {latestResponse && (
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Last response · {formatDateTime(latestResponse.submittedAt)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution.get(rating) ?? 0;
              const width = totalResponses ? Math.max(6, (count / totalResponses) * 100) : 0;
              return (
                <div key={rating} className="flex items-center gap-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-sm font-semibold text-[var(--brand-primary)]">
                    {rating}
                  </span>
                  <div className="flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-[var(--brand-primary)] transition-[width]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-slate-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-7 shadow-[0_25px_70px_-45px_rgba(28,44,99,0.5)]">
          <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
          <p className="text-sm text-slate-500"><font color="black">Focus on a specific course to isolate responses.</font></p>
          <div className="space-y-2 text-sm">
            <a
              href="/analytics"
              className={`block rounded-2xl border px-4 py-2 transition ${
                !selectedCourse
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                  : "border-slate-200 text-slate-600 hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)]"
              }`}
            >
             <font color="black"> All courses</font>
            </a>
            {courseCards.map((course) => (
              <a
              
                key={course.code}
                href={`/analytics?course=${encodeURIComponent(course.code)}`}
                className={`block rounded-2xl border px-4 py-2 transition ${
                  selectedCourse === course.code
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                    : "border-slate-200 text-slate-600 hover:border-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)]"
                }`}
              >
                <font color="black">{course.name} · {course.responses} responses</font>
              </a>
            ))}
          </div>
        </div>
      </section>

      {courseCards.length > 0 && (
        <section className="rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-7 shadow-[0_25px_70px_-45px_rgba(28,44,99,0.5)]">
          <h2 className="text-xl font-semibold text-slate-900">Course performance</h2>
          <p className="mt-1 text-sm text-slate-500">Identify standout classrooms and where support is needed.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {courseCards.map((course) => (
              <article key={course.code} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <header className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{course.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{course.code}</p>
                    {course.department && (
                      <p className="mt-1 text-xs text-slate-500">{course.department}</p>
                    )}
                  </div>
                  <span className="badge" data-tone="primary">
                    {course.averageRating ?? "—"}
                  </span>
                </header>
                <p className="mt-4 text-sm text-slate-600">{course.responses} responses collected.</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {normalizedResponses.filter((row) => row.comment).length > 0 && (
        <section className="rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-7 shadow-[0_25px_70px_-45px_rgba(28,44,99,0.5)]">
          <h2 className="text-xl font-semibold text-slate-900">Comment stream</h2>
          <p className="mt-1 text-sm text-slate-500">Recent qualitative feedback to review with your team.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {normalizedResponses
              .filter((row) => row.comment)
              .slice(0, 8)
              .map((row) => (
                <article key={row.id} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                  <header className="flex items-center justify-between gap-4">
                    <span className="badge" data-tone="accent">
                      {row.courseCode ?? "General"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--brand-primary)]">
                      Rating {row.rating ?? "—"}
                    </span>
                  </header>
                  <p className="mt-3 text-sm text-slate-600">{row.comment}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                    {formatDateTime(row.submittedAt)}
                  </p>
                </article>
              ))}
          </div>
        </section>
      )}

      {role === "admin" && teacherBreakdown.size > 0 && (
        <section className="rounded-3xl border border-[var(--brand-secondary)]/70 bg-white/95 p-7 shadow-[0_25px_70px_-45px_rgba(28,44,99,0.5)]">
          <h2 className="text-xl font-semibold text-slate-900">Instructor leaderboard</h2>
          <p className="mt-1 text-sm text-slate-500">Compare engagement across departments to plan recognition and follow-ups.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from(teacherBreakdown.entries()).map(([name, info]) => (
              <article key={name} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <header className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
                  <span className="badge" data-tone="primary">
                    {info.responses ? Number((info.ratingSum / info.responses).toFixed(2)) : "—"}
                  </span>
                </header>
                <p className="mt-3 text-sm text-slate-600">{info.responses} responses logged.</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
