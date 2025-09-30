import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

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
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100/90">Teacher dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              Hello, {profile.full_name ?? "Instructor"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-emerald-50/90">
              Manage your courses, keep track of student feedback, and stay ahead of your teaching goals.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-emerald-100/90">Courses this term</p>
              <p className="text-lg font-semibold text-white">{courses.length}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-emerald-100/90">Department</p>
              <p className="text-lg font-semibold text-white">{profile.department ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Your courses</h2>
          <p className="text-sm text-slate-500">Overview of the courses assigned to you this term.</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((assignment) => (
              <article
                key={assignment.id}
                className="h-full rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
              >
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {assignment.courses?.course_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.courses?.course_code}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {assignment.courses?.department}
                  </span>
                </header>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Year</span>
                    <span className="font-medium text-slate-900">{assignment.courses?.year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Semester</span>
                    <span className="font-medium text-slate-900">{assignment.courses?.semester}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    View feedback
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
                  >
                    Reports
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No courses assigned yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Once the administrator assigns courses to you, they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Your profile snapshot</h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep these details current so students and administrators can reach you easily.
        </p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{profile.full_name ?? "—"}</dd>
          </div>
          {profileDetails.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{item.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}