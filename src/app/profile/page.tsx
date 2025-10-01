import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AvatarUploader from "@/components/profile/AvatarUploader";
import { createClient } from "@supabase/supabase-js";

interface BaseProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string | null;
  enrollment_number: string | null;
  employee_id: string | null;
  year: number | null;
  avatar_url: string | null;
}

interface FeedbackSnapshot {
  totalSubmitted: number;
  lastSubmittedAt: string | null;
  totalReceived: number;
  averageRating: number | null;
  ratingBreakdown: Array<{ rating: number; count: number }>;
  recentComments: Array<{ id: string; courseCode: string | null; comment: string; createdAt: string; rating: number }>;
  courseSummaries: Array<{
    courseCode: string;
    courseName: string | null;
    responses: number;
    averageRating: number | null;
  }>;
}

type Assignment = {
  id: string;
  course: {
    course_code: string | null;
    course_name: string | null;
  } | null;
};

type AssignmentRow = {
  id: string;
  courses:
    | {
        course_code: string | null;
        course_name: string | null;
      }
    | {
        course_code: string | null;
        course_name: string | null;
      }[]
    | null;
};

type ResponseRow = {
  id: string;
  course_id: string;
  teacher_id: string | null;
  submitted_at: string;
  courses: {
    course_code: string | null;
    course_name: string | null;
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
    throw new Error("Supabase service credentials missing for profile analytics.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString();
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, email, department, enrollment_number, employee_id, year, avatar_url"
    )
    .eq("id", user.id)
    .single();

  const role = (profileRow?.role || user.user_metadata?.role || "").toString().toLowerCase();

  if (!role) {
    redirect("/login");
  }

  const baseProfile: BaseProfile = {
    id: user.id,
    email: profileRow?.email ?? user.email ?? "",
    full_name: profileRow?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "",
    role,
    department: profileRow?.department ?? null,
    enrollment_number: profileRow?.enrollment_number ?? null,
    employee_id: profileRow?.employee_id ?? null,
    year: typeof profileRow?.year === "number" ? profileRow?.year : null,
    avatar_url: profileRow?.avatar_url ?? (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata?.avatar_url : null),
  };

  const feedbackSnapshot: FeedbackSnapshot = {
    totalSubmitted: 0,
    lastSubmittedAt: null,
    totalReceived: 0,
    averageRating: null,
    ratingBreakdown: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
    recentComments: [],
    courseSummaries: [],
  };

  if (role === "student") {
    const { data: submitted } = await supabase
      .from("feedback_responses")
      .select("id, submitted_at")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });

    if (submitted?.length) {
      feedbackSnapshot.totalSubmitted = submitted.length;
      feedbackSnapshot.lastSubmittedAt = submitted[0]?.submitted_at ?? null;
    }
  }

  if (role === "teacher" || role === "admin") {
    const { data: assignmentsData } = await supabase
      .from("course_assignments")
      .select("id, courses(course_code, course_name)")
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
            }
          : null,
      } satisfies Assignment;
    });

    const courseCodes = assignments
      .map((assignment) => assignment.course?.course_code)
      .filter((code): code is string => !!code);
    const courseCodeSet = new Set(courseCodes);

    let responsesQuery = supabaseAdmin
      .from("feedback_responses")
      .select(
        `id,
         course_id,
         submitted_at,
         courses ( course_code, course_name ),
         answers:feedback_answers (
           answer_rating,
           answer_text,
           question:feedback_questions ( question_type )
         )`
      )
      .order("submitted_at", { ascending: false });

    if (role === "teacher") {
      responsesQuery = responsesQuery.eq("teacher_id", user.id);
    }

    const { data: responseRows } = await responsesQuery.returns<ResponseRow[]>();

    const filteredRows = (responseRows ?? []).filter((row) => {
      if (!courseCodeSet.size) {
        return true;
      }
      const code = row.courses?.course_code ?? null;
      return code ? courseCodeSet.has(code) : false;
    });

    const normalizedResponses = filteredRows.map((row) => {
      const ratingAnswer = row.answers?.find((answer) => typeof answer.answer_rating === "number" && !Number.isNaN(answer.answer_rating));
      const commentAnswer = row.answers?.find((answer) => typeof answer.answer_text === "string" && answer.answer_text.trim().length > 0);

      return {
        id: row.id,
        courseCode: row.courses?.course_code ?? null,
        courseName: row.courses?.course_name ?? null,
        submittedAt: row.submitted_at,
        rating: ratingAnswer?.answer_rating ?? null,
        comment: commentAnswer?.answer_text ?? null,
      };
    });

    if (normalizedResponses.length > 0) {
      const ratingTotals = new Map<number, number>();
      const courseTotals = new Map<
        string,
        { courseName: string | null; responses: number; ratingSum: number }
      >();
      let ratingSum = 0;

      normalizedResponses.forEach((row) => {
        if (typeof row.rating === "number" && !Number.isNaN(row.rating)) {
          ratingSum += row.rating;
          ratingTotals.set(row.rating, (ratingTotals.get(row.rating) ?? 0) + 1);
        }

        if (row.comment) {
          feedbackSnapshot.recentComments.push({
            id: row.id,
            comment: row.comment,
            courseCode: row.courseCode,
            createdAt: row.submittedAt,
            rating: row.rating ?? 0,
          });
        }

        const code = row.courseCode ?? "Unassigned";
        const existing = courseTotals.get(code) ?? {
          courseName:
            row.courseName ?? assignments.find((assignment) => assignment.course?.course_code === code)?.course?.course_name ?? null,
          responses: 0,
          ratingSum: 0,
        };

        existing.responses += 1;
        if (typeof row.rating === "number" && !Number.isNaN(row.rating)) {
          existing.ratingSum += row.rating;
        }
        courseTotals.set(code, existing);
      });

      feedbackSnapshot.totalReceived = normalizedResponses.length;
      feedbackSnapshot.averageRating = normalizedResponses.length
        ? Number((ratingSum / normalizedResponses.length).toFixed(2))
        : null;
      feedbackSnapshot.ratingBreakdown = feedbackSnapshot.ratingBreakdown.map((entry) => ({
        rating: entry.rating,
        count: ratingTotals.get(entry.rating) ?? 0,
      }));
      feedbackSnapshot.recentComments = feedbackSnapshot.recentComments.slice(0, 6);
      feedbackSnapshot.courseSummaries = Array.from(courseTotals.entries()).map(([code, info]) => ({
        courseCode: code,
        courseName: info.courseName,
        responses: info.responses,
        averageRating: info.responses ? Number((info.ratingSum / info.responses).toFixed(2)) : null,
      }));
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-primary-dark)]/85 to-[#1a2255] p-10 text-white shadow-[0_35px_70px_-40px_rgba(32,41,102,0.8)]">
        <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -right-10 bottom-12 h-44 w-44 rounded-full bg-[var(--brand-accent)]/25 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              Profile center
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {baseProfile.full_name || "Your profile"}
            </h1>
            <p className="max-w-xl text-sm text-white/85">
              Manage how you appear across the Student Feedback platform and keep your academic information up to date.
            </p>
            <dl className="mt-6 grid gap-4 text-sm text-white/90 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Email</dt>
                <dd className="mt-1 font-medium">{baseProfile.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Role</dt>
                <dd className="mt-1 font-medium">{baseProfile.role}</dd>
              </div>
              {baseProfile.department && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Department</dt>
                  <dd className="mt-1 font-medium">{baseProfile.department}</dd>
                </div>
              )}
              {baseProfile.enrollment_number && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Enrollment</dt>
                  <dd className="mt-1 font-medium">{baseProfile.enrollment_number}</dd>
                </div>
              )}
              {baseProfile.employee_id && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Employee ID</dt>
                  <dd className="mt-1 font-medium">{baseProfile.employee_id}</dd>
                </div>
              )}
              {baseProfile.year && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-white/60">Year</dt>
                  <dd className="mt-1 font-medium">Year {baseProfile.year}</dd>
                </div>
              )}
            </dl>
          </div>

          <AvatarUploader
            userId={baseProfile.id}
            fullName={baseProfile.full_name}
            initialUrl={baseProfile.avatar_url}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--brand-secondary)]/50 bg-white/95 p-8 shadow-[0_25px_60px_-35px_rgba(22,39,85,0.45)]">
        <h2 className="text-xl font-semibold text-[var(--brand-dark,#111029)]">Activity snapshot</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick stats tailored to your role so you always know what happened last.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-highlight)]/80 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Feedback submitted</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--brand-primary)]">{feedbackSnapshot.totalSubmitted}</p>
            <p className="mt-1 text-xs text-slate-500">Last entry: {formatDate(feedbackSnapshot.lastSubmittedAt)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-highlight)]/80 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Feedback received</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--brand-primary)]">{feedbackSnapshot.totalReceived}</p>
            <p className="mt-1 text-xs text-slate-500">Average rating: {feedbackSnapshot.averageRating ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-highlight)]/80 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Top rating</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--brand-primary)]">
              {feedbackSnapshot.ratingBreakdown.reduce((best, entry) => (entry.count > best.count ? entry : best), { rating: 0, count: 0 }).rating || "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Most common score</p>
          </div>
          <div className="rounded-2xl border border-[var(--brand-secondary)]/60 bg-[var(--brand-highlight)]/80 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Role</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--brand-primary)]">{baseProfile.role}</p>
            <p className="mt-1 text-xs text-slate-500">Stay consistent & updated</p>
          </div>
        </div>

        {feedbackSnapshot.courseSummaries.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Course breakdown</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {feedbackSnapshot.courseSummaries.map((course) => (
                <div key={course.courseCode} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{course.courseName ?? course.courseCode}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{course.courseCode}</p>
                    </div>
                    <span className="badge" data-tone="primary">
                      {course.averageRating ?? "—"}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[var(--brand-primary)]"
                      style={{ width: `${Math.min(100, course.averageRating ? (course.averageRating / 5) * 100 : 0)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Responses: {course.responses}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedbackSnapshot.recentComments.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">Recent feedback highlights</h3>
            <div className="grid gap-3">
              {feedbackSnapshot.recentComments.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"
                >
                  <header className="flex items-center justify-between gap-3">
                    <span className="badge" data-tone="accent">
                      {item.courseCode ?? "General"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--brand-primary)]">Rating {item.rating}</span>
                  </header>
                  <p className="mt-3 text-sm text-slate-600">{item.comment}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">{formatDate(item.createdAt)}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
