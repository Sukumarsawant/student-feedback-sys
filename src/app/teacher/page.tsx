import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TeacherPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'teacher') {
    redirect('/login');
  }

  // Get courses assigned to this teacher
  const { data: assignments } = await supabase
    .from('course_assignments')
    .select(`
      *,
      courses (
        course_name,
        course_code,
        department,
        year,
        semester
      )
    `)
    .eq('teacher_id', user.id);

  const courses = assignments ?? [];

  const profileDetails = [
    { label: "Email", value: profile.email ?? "—" },
    { label: "Employee ID", value: profile.employee_id ?? "—" },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Role", value: profile.role ?? "—" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-8 text-[var(--brand-dark)] shadow-[0_35px_90px_-55px_rgba(26,20,41,0.4)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]">Teacher dashboard</p>
<<<<<<< HEAD
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--brand-dark)] sm:text-4xl">
              Hello, {profile.full_name ?? "Instructor"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[color:var(--brand-dark)]/75">
              Manage your courses, keep track of student feedback, and stay ahead of your teaching goals.
=======
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Welcome, {profile.full_name ?? "Instructor"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600">
              Manage your courses and track student feedback.
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-[color:var(--brand-dark)]/75 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/35 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Courses this term</p>
              <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">{courses.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/35 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Department</p>
              <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">{profile.department ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
<<<<<<< HEAD
          <h2 className="text-2xl font-semibold text-[var(--brand-dark)]">Your courses</h2>
          <p className="text-sm text-[color:var(--brand-dark)]/65">Overview of the courses assigned to you this term.</p>
=======
          <h2 className="text-2xl font-semibold text-slate-900">Your courses</h2>
          <p className="text-sm text-slate-500">Courses you&apos;re teaching this term.</p>
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((assignment) => (
              <article
                key={assignment.id}
                className="h-full rounded-2xl border border-[var(--brand-secondary)]/60 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand-primary)]/35 hover:shadow-[0_20px_40px_-32px_rgba(26,20,41,0.45)]"
              >
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--brand-dark)]">
                      {assignment.courses?.course_name}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--brand-dark)]/60">
                      {assignment.courses?.course_code}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {assignment.courses?.department}
                  </span>
                </header>

                <div className="mt-4 grid gap-2 text-sm text-[color:var(--brand-dark)]/75">
                  <div className="flex items-center justify-between">
                    <span>Year</span>
                    <span className="font-medium text-[var(--brand-dark)]">{assignment.courses?.year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Semester</span>
                    <span className="font-medium text-[var(--brand-dark)]">{assignment.courses?.semester}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/analytics?course=${encodeURIComponent(assignment.courses?.course_code ?? "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-600"
                  >
                    View analytics
                  </Link>
                  <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-dark)] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-dark)]"
                  >
                    Open dashboard
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--brand-secondary)]/55 bg-white/85 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-secondary)]/40 text-[color:var(--brand-dark)]/55">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
<<<<<<< HEAD
            <h3 className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">No courses assigned yet</h3>
            <p className="mt-2 text-sm text-[color:var(--brand-dark)]/65">
              Once the administrator assigns courses to you, they will appear here automatically.
=======
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No courses yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your courses will appear here once assigned by an admin.
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
            </p>
          </div>
        )}
      </section>

<<<<<<< HEAD
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[var(--brand-secondary)]/45">
        <h2 className="text-xl font-semibold text-[var(--brand-dark)]">Your profile snapshot</h2>
        <p className="mt-1 text-sm text-[color:var(--brand-dark)]/65">
          Keep these details current so students and administrators can reach you easily.
=======
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your account information.
>>>>>>> b5a7457b3c1b258306ddbeef260c40dc877f4c3d
        </p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--brand-secondary)]/50 bg-[var(--brand-secondary)]/25 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-dark)]/60">Full Name</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--brand-dark)]">{profile.full_name ?? "—"}</dd>
          </div>
          {profileDetails.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--brand-secondary)]/50 bg-[var(--brand-secondary)]/25 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-dark)]/60">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--brand-dark)]">{item.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}