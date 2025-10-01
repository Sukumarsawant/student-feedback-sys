import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AvatarUploader from "@/components/profile/AvatarUploader";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BaseProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string;
  role: string;
  department: string | null;
  enrollment_number: string | null;
  roll_no: string | null;
  employee_id: string | null;
  year: number | null;
  division: string | null;
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

interface FeedbackForm {
  id: string;
  title: string;
  description?: string | null;
  end_date?: string | null;
  course_id: string | null;
  courses?: {
    course_code: string | null;
    course_name: string | null;
  } | null;
}

interface FeedbackResponse {
  id: string;
  submitted_at: string;
  course_id: string | null;
  feedback_forms?: {
    title: string;
  } | null;
  courses?: {
    course_code: string | null;
    course_name: string | null;
  } | null;
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
      "id, full_name, role, email, username, department, enrollment_number, roll_no, employee_id, year, division, avatar_url"
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
    username: profileRow?.username ?? null,
    full_name: profileRow?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "",
    role,
    department: profileRow?.department ?? null,
    enrollment_number: profileRow?.enrollment_number ?? null,
    roll_no: profileRow?.roll_no ?? null,
    employee_id: profileRow?.employee_id ?? null,
    year: typeof profileRow?.year === "number" ? profileRow?.year : null,
    division: profileRow?.division ?? null,
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

  // Get available feedback forms for students
  let availableForms: FeedbackForm[] = [];
  let myResponses: FeedbackResponse[] = [];
  
  if (role === "student") {
    const { data: forms } = await supabase
      .from('feedback_forms')
      .select(`
        *,
        courses (
          course_name,
          course_code
        )
      `)
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    availableForms = forms ?? [];

    // Get student's submitted responses
    const { data: responses } = await supabase
      .from('feedback_responses')
      .select(`
        *,
        courses (
          course_name,
          course_code
        ),
        feedback_forms (
          title
        )
      `)
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false });

    myResponses = responses ?? [];
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 animate-fade-in">
      {/* Quick Profile Summary */}
      <section className="glass-card relative overflow-hidden rounded-3xl p-8 shadow-2xl hover-lift">
        <div className="absolute -left-16 top-12 h-40 w-40 rounded-full bg-[var(--brand-primary)]/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -right-10 bottom-12 h-44 w-44 rounded-full bg-[var(--brand-accent)]/10 blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}} />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-secondary)]/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-primary-dark)]">
              📋 Profile Center
            </p>
            <h1 className="text-4xl font-bold leading-tight text-[var(--brand-dark)]">
              {baseProfile.full_name || "Your profile"}
            </h1>
            <p className="max-w-xl text-sm text-[var(--brand-dark)]/70">
              {role === 'student' 
                ? 'Submit feedback forms and track your responses' 
                : 'Manage your profile information and view feedback analytics'}
            </p>

            <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
              <div className="glass-input p-4 rounded-xl">
                <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-dark)]/50 font-semibold">Email</dt>
                <dd className="mt-2 font-semibold text-[var(--brand-dark)] truncate">{baseProfile.email}</dd>
              </div>
              <div className="glass-input p-4 rounded-xl">
                <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-dark)]/50 font-semibold">Role</dt>
                <dd className="mt-2">
                  <span className="inline-flex rounded-full bg-[var(--brand-primary)]/15 px-3 py-1 text-sm font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                    {baseProfile.role}
                  </span>
                </dd>
              </div>
              {baseProfile.department && (
                <div className="glass-input p-4 rounded-xl">
                  <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-dark)]/50 font-semibold">Department</dt>
                  <dd className="mt-2 font-semibold text-[var(--brand-dark)]">{baseProfile.department}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="lg:sticky lg:top-24">
            <AvatarUploader
              userId={baseProfile.id}
              fullName={baseProfile.full_name}
              initialUrl={baseProfile.avatar_url}
            />
          </div>
        </div>
      </section>

      {/* Student-specific sections: Available Forms and My Responses */}
      {role === "student" && (
        <>
          {/* Available Feedback Forms */}
          <section className="glass-card rounded-3xl p-8 shadow-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-dark)]">📝 Available Feedback Forms</h2>
                <p className="mt-2 text-sm text-[var(--brand-dark)]/60">
                  Submit feedback for your courses
                </p>
              </div>
              <span className="badge text-lg px-4 py-2" data-tone="primary">
                {availableForms.length} Active
              </span>
            </div>

            {availableForms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg font-semibold text-[var(--brand-dark)]/70">No active feedback forms</p>
                <p className="text-sm text-[var(--brand-dark)]/50 mt-2">Check back later for new forms</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableForms.map((form) => (
                  <a
                    key={form.id}
                    href={`/feedback?form=${form.id}`}
                    className="glass-input rounded-2xl p-6 hover-lift transition-all hover:shadow-xl group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-[var(--brand-dark)] group-hover:text-[var(--brand-primary)] transition-colors">
                          {form.title?.replace('Mid-Semester Feedback - ', '').replace('Mid-Semester Feedback -', '') || form.courses?.course_name || 'Untitled Form'}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary)] mt-1">
                          {form.courses?.course_code || 'General'}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    
                    {form.description && (
                      <p className="text-sm text-[var(--brand-dark)]/70 mb-4 line-clamp-2">
                        {form.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-[var(--brand-dark)]/50">
                      <span>📅 Ends: {form.end_date ? new Date(form.end_date).toLocaleDateString() : 'TBD'}</span>
                      <span className="text-[var(--brand-primary)] font-semibold group-hover:underline">
                        Submit Now →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* My Submitted Responses */}
          <section className="glass-card rounded-3xl p-8 shadow-lg animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-dark)]">✅ My Submitted Responses</h2>
                <p className="mt-2 text-sm text-[var(--brand-dark)]/60">
                  Your feedback submission history
                </p>
              </div>
              <span className="badge text-lg px-4 py-2" data-tone="accent">
                {myResponses.length} Total
              </span>
            </div>

            {myResponses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-lg font-semibold text-[var(--brand-dark)]/70">No submissions yet</p>
                <p className="text-sm text-[var(--brand-dark)]/50 mt-2">Start by filling out an available form above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myResponses.map((response) => (
                  <div
                    key={response.id}
                    className="glass-input rounded-2xl p-5 hover-lift transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge" data-tone="primary">
                            {response.courses?.course_code || 'General'}
                          </span>
                          <h3 className="font-semibold text-[var(--brand-dark)]">
                            {response.feedback_forms?.title?.replace('Mid-Semester Feedback - ', '').replace('Mid-Semester Feedback -', '') || response.courses?.course_name || 'Feedback Form'}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--brand-dark)]/70">
                          {response.courses?.course_name || 'No course name'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-dark)]/50 mb-1">
                          Submitted
                        </div>
                        <div className="text-sm font-semibold text-[var(--brand-primary)]">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[var(--brand-dark)]/50">
                          {new Date(response.submitted_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Feedback statistics section */}
      <section className="glass-card rounded-3xl p-8 shadow-lg animate-slide-up animate-delay-100">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10">
            <svg className="h-6 w-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--brand-dark)]">Feedback Activity</h2>
            <p className="text-sm text-[var(--brand-dark)]/60">
              Track your feedback submissions and view insights across all your courses.
            </p>
          </div>
        </div>

        <div className={`mt-8 grid gap-5 ${role === "student" ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          <div className="glass-input rounded-2xl p-5 hover-lift">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/70">Feedback submitted</p>
            <p className="mt-3 text-3xl font-bold text-[var(--brand-primary)]">{feedbackSnapshot.totalSubmitted}</p>
            <p className="mt-2 text-xs text-[var(--brand-dark)]/50">Last: {formatDate(feedbackSnapshot.lastSubmittedAt)}</p>
          </div>
          {role === "teacher" && (
            <>
              <div className="glass-input rounded-2xl p-5 hover-lift">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/70">Feedback received</p>
                <p className="mt-3 text-3xl font-bold text-[var(--brand-primary)]">{feedbackSnapshot.totalReceived}</p>
                <p className="mt-2 text-xs text-[var(--brand-dark)]/50">Avg: {feedbackSnapshot.averageRating ?? "—"}</p>
              </div>
              <div className="glass-input rounded-2xl p-5 hover-lift">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/70">Top rating</p>
                <p className="mt-3 text-3xl font-bold text-[var(--brand-primary)]">
                  {feedbackSnapshot.ratingBreakdown.reduce((best, entry) => (entry.count > best.count ? entry : best), { rating: 0, count: 0 }).rating || "—"}
                </p>
                <p className="mt-2 text-xs text-[var(--brand-dark)]/50">Most common</p>
              </div>
            </>
          )}
          <div className="glass-input rounded-2xl p-5 hover-lift">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/70">Role</p>
            <p className="mt-3">
              <span className="inline-flex rounded-full bg-[var(--brand-primary)]/15 px-4 py-2 text-lg font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                {baseProfile.role}
              </span>
            </p>
            <p className="mt-2 text-xs text-[var(--brand-dark)]/50">Your access level</p>
          </div>
        </div>

        {role === "teacher" && feedbackSnapshot.courseSummaries.length > 0 && (
          <div className="mt-10 space-y-5 animate-slide-up animate-delay-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
                <svg className="h-5 w-5 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--brand-dark)]">Course Breakdown</h3>
            </div>
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
