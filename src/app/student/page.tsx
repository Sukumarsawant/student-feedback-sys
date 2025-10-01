import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  const availableForms = forms ?? [];

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
        title,
        description
      )
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false });

  const myResponses = responses ?? [];

  // Profile details for future use
  // const profileDetails = [
  //   { label: "Email", value: profile.email ?? "—" },
  //   { label: "Enrollment number", value: profile.enrollment_number ?? "—" },
  //   { label: "Department", value: profile.department ?? "—" },
  //   { label: "Year", value: profile.year ?? "—" },
  //   { label: "Role", value: profile.role ?? "—" },
  // ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* SVG Filter for Blob Button Effect */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo"></feColorMatrix>
            <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
          </filter>
        </defs>
      </svg>

      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-white/95 p-8 text-[var(--brand-dark)] shadow-[0_35px_90px_-55px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]">Student dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Welcome, {profile.full_name ?? "Student"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600">
              Stay informed about active feedback forms and keep your academic details up to date.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-700 font-semibold">Active feedback</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{availableForms.length}</p>
            </div>
            <div className="rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-700 font-semibold">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.department ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Feedback Forms */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Available feedback forms</h2>
          <p className="text-sm text-slate-500">Complete these to help improve your courses.</p>
        </div>

        {availableForms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {availableForms.map((form, index) => {
              // Harmonious color palette - soft pastels that work well together
              const colorSchemes = [
                { border: 'border-blue-200', bg: 'bg-gradient-to-br from-blue-50/80 to-cyan-50/80', hover: 'hover:border-blue-300', accent: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
                { border: 'border-purple-200', bg: 'bg-gradient-to-br from-purple-50/80 to-violet-50/80', hover: 'hover:border-purple-300', accent: 'text-purple-600', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
                { border: 'border-teal-200', bg: 'bg-gradient-to-br from-teal-50/80 to-emerald-50/80', hover: 'hover:border-teal-300', accent: 'text-teal-600', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700' },
                { border: 'border-rose-200', bg: 'bg-gradient-to-br from-rose-50/80 to-pink-50/80', hover: 'hover:border-rose-300', accent: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700' },
                { border: 'border-amber-200', bg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/80', hover: 'hover:border-amber-300', accent: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
                { border: 'border-indigo-200', bg: 'bg-gradient-to-br from-indigo-50/80 to-blue-50/80', hover: 'hover:border-indigo-300', accent: 'text-indigo-600', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-700' },
              ];
              const colorScheme = colorSchemes[index % colorSchemes.length];
              
              return (
              <article
                key={form.id}
                className={`h-full rounded-2xl border ${colorScheme.border} ${colorScheme.bg} backdrop-blur-sm p-6 shadow-md transition-all duration-300 hover:-translate-y-2 ${colorScheme.hover} hover:shadow-xl`}
              >
                <header>
                  <h3 className="text-lg font-bold text-slate-900">{form.courses?.course_name}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorScheme.badgeBg} ${colorScheme.badgeText}`}>
                    {form.courses?.course_code}
                  </span>
                </header>
                <p className="mt-4 text-sm text-slate-600 line-clamp-3">{form.description}</p>
                <footer className="mt-6 flex flex-wrap items-center justify-end gap-3 text-sm">
                  <a
                    href={`/feedback?form_id=${form.id}&course_id=${form.course_id}`}
                    className="blob-btn"
                  >
                    Fill Feedback
                    <span className="blob-btn__inner">
                      <span className="blob-btn__blobs">
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                        <span className="blob-btn__blob"></span>
                      </span>
                    </span>
                  </a>
                </footer>
              </article>
            )})}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No feedback forms available</h3>
            <p className="mt-2 text-sm text-slate-500">
              When your instructors publish new forms they will show up here—check back soon.
            </p>
          </div>
        )}
      </section>

      {/* My Submitted Responses Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">My submitted responses</h2>
          <span className="inline-flex rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-700">
            {myResponses.length} Total
          </span>
        </div>

        {myResponses.length > 0 ? (
          <div className="space-y-3">
            {myResponses.map((response, index) => {
              // Alternate between warm gradient colors for submitted responses
              const responseColors = [
                { bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600' },
                { bg: 'bg-gradient-to-r from-violet-50 to-purple-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', accent: 'text-violet-600' },
                { bg: 'bg-gradient-to-r from-sky-50 to-blue-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', accent: 'text-sky-600' },
              ];
              const colorScheme = responseColors[index % responseColors.length];
              
              return (
              <article
                key={response.id}
                className={`rounded-2xl border ${colorScheme.border} ${colorScheme.bg} p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${colorScheme.badge}`}>
                        {response.courses?.course_code || 'General'}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {response.courses?.course_name || 'Course'}
                      </h3>
                    </div>
                    {response.feedback_forms?.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {response.feedback_forms.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                      Submitted
                    </div>
                    <div className={`text-sm font-semibold ${colorScheme.accent}`}>
                      {new Date(response.submitted_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(response.submitted_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </article>
            )})}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No submissions yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your completed feedback forms will appear here. Start by filling out an available form above!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}