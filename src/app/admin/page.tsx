import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/admin-login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/admin-login');
  }

  // Get some stats for the admin dashboard
  const { data: courseCount } = await supabase
    .from('courses')
    .select('id', { count: 'exact' });

  const { data: studentCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', 'student');

  const { data: teacherCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', 'teacher');

  const { data: activeFormsCount } = await supabase
    .from('feedback_forms')
    .select('id', { count: 'exact' })
    .eq('is_active', true);

  const totalCourses = courseCount?.length ?? 0;
  const totalStudents = studentCount?.length ?? 0;
  const totalTeachers = teacherCount?.length ?? 0;
  const totalActiveForms = activeFormsCount?.length ?? 0;

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses,
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: (
        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      label: "Total Teachers",
      value: totalTeachers,
      icon: (
        <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: "Active Forms",
      value: totalActiveForms,
      icon: (
        <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    { title: "Create Course", description: "Add a new course to the system." },
    { title: "New Form", description: "Set up a feedback form." },
    { title: "Assign Teachers", description: "Link teachers to courses." },
    { title: "View Reports", description: "See feedback trends." },
  ];

  const infoItems = [
    { label: "Full Name", value: profile.full_name ?? "—" },
    { label: "Email", value: profile.email ?? "—" },
    { label: "Employee ID", value: profile.employee_id ?? "—" },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Role", value: profile.role ?? "—" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-8 text-[var(--brand-dark)] shadow-[0_35px_90px_-55px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Welcome, {profile.full_name ?? "Administrator"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600">
              Your feedback system overview.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{profile.role}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.department ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Employee ID</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.employee_id ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Active forms</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{totalActiveForms}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
              <span className="rounded-full bg-slate-100 p-3">
                {item.icon}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
            <p className="text-sm text-slate-500">Common tasks at your fingertips.</p>
          </div>
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            Coming soon
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              className="h-full rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <h3 className="text-base font-semibold text-slate-900">{action.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your account information.
        </p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {infoItems.map((item) => (
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