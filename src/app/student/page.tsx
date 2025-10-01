import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function StudentPage() {
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

  if (!profile || profile.role !== 'student') {
    redirect('/login');
  }

  // Get available feedback forms for the student
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
    .gte('end_date', new Date().toISOString());

  const availableForms = forms ?? [];

  const profileDetails = [
    { label: "Email", value: profile.email ?? "—" },
    { label: "Enrollment number", value: profile.enrollment_number ?? "—" },
    { label: "Department", value: profile.department ?? "—" },
    { label: "Year", value: profile.year ?? "—" },
    { label: "Role", value: profile.role ?? "—" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-8 text-[var(--brand-dark)] shadow-[0_35px_90px_-55px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]">Student dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Welcome, {profile.full_name ?? "Student"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600">
              See active feedback forms and keep your details up to date.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Active feedback</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{availableForms.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--brand-secondary)]/70 bg-[var(--brand-secondary)]/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-primary-dark)]/80">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.department ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Feedback forms</h2>
          <p className="text-sm text-slate-500">Help improve your courses.</p>
        </div>

        {availableForms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {availableForms.map((form) => (
              <article
                key={form.id}
                className="h-full rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-fuchsia-200 hover:shadow-lg"
              >
                <header>
                  <h3 className="text-lg font-semibold text-slate-900">{form.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {form.courses?.course_name} · {form.courses?.course_code}
                  </p>
                </header>
                <p className="mt-4 text-sm text-slate-600 line-clamp-3">{form.description}</p>
                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    Due {form.end_date ? new Date(form.end_date).toLocaleDateString() : "soon"}
                  </span>
                  <a
                    href={`/feedback/${form.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-medium text-fuchsia-600 shadow-sm ring-1 ring-fuchsia-200 transition hover:bg-fuchsia-50"
                  >
                    Fill feedback
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No forms available</h3>
            <p className="mt-2 text-sm text-slate-500">
              Check back later for new feedback forms.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your academic information.
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