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

  // Get teacher rankings based on average ratings
  const { data: allTeacherRatings } = await supabase
    .from('feedback_responses')
    .select(`
      teacher_id,
      profiles!feedback_responses_teacher_id_fkey (
        full_name,
        department
      ),
      feedback_answers!inner (
        answer_rating
      )
    `)
    .not('teacher_id', 'is', null);

  // Calculate average ratings per teacher
  interface TeacherRating {
    teacher_id: string;
    full_name: string;
    department: string | null;
    avg_rating: number;
    total_responses: number;
    rank: number;
  }

  const teacherStatsMap = new Map<string, { ratings: number[]; full_name: string; department: string | null }>();
  
  if (allTeacherRatings) {
    allTeacherRatings.forEach((response: any) => {
      if (!response.teacher_id || !response.profiles) return;
      
      const teacherId = response.teacher_id;
      const teacherName = response.profiles.full_name || 'Unknown';
      const dept = response.profiles.department;
      
      if (!teacherStatsMap.has(teacherId)) {
        teacherStatsMap.set(teacherId, { ratings: [], full_name: teacherName, department: dept });
      }
      
      const stats = teacherStatsMap.get(teacherId)!;
      
      if (response.feedback_answers && Array.isArray(response.feedback_answers)) {
        response.feedback_answers.forEach((answer: any) => {
          if (typeof answer.answer_rating === 'number') {
            stats.ratings.push(answer.answer_rating);
          }
        });
      }
    });
  }

  // Convert to array and calculate averages
  const teacherRankings: TeacherRating[] = Array.from(teacherStatsMap.entries())
    .map(([teacher_id, stats]) => ({
      teacher_id,
      full_name: stats.full_name,
      department: stats.department,
      avg_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length 
        : 0,
      total_responses: stats.ratings.length,
      rank: 0 // Will be calculated next
    }))
    .filter(t => t.total_responses > 0) // Only include teachers with responses
    .sort((a, b) => b.avg_rating - a.avg_rating); // Sort by rating descending

  // Assign ranks
  teacherRankings.forEach((teacher, index) => {
    teacher.rank = index + 1;
  });

  // Find current teacher's rank
  const currentTeacherRank = teacherRankings.find(t => t.teacher_id === user.id);
  const totalTeachers = teacherRankings.length;

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
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--brand-dark)] sm:text-4xl">
              Hello, {profile.full_name ?? "Instructor"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[color:var(--brand-dark)]/75">
              Manage your courses, keep track of student feedback, and stay ahead of your teaching goals.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-[color:var(--brand-dark)]/75 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Courses this term</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{courses.length}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.department ?? "—"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-[var(--brand-dark)]">Your courses</h2>
          <p className="text-sm text-[color:var(--brand-dark)]/65">Overview of the courses assigned to you this term.</p>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((assignment, index) => {
              const colors = [
                { border: 'border-blue-200', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', badge: 'bg-blue-100 text-blue-700' },
                { border: 'border-purple-200', bg: 'bg-gradient-to-br from-purple-50 to-violet-50', badge: 'bg-purple-100 text-purple-700' },
                { border: 'border-teal-200', bg: 'bg-gradient-to-br from-teal-50 to-emerald-50', badge: 'bg-teal-100 text-teal-700' },
                { border: 'border-rose-200', bg: 'bg-gradient-to-br from-rose-50 to-pink-50', badge: 'bg-rose-100 text-rose-700' },
                { border: 'border-amber-200', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', badge: 'bg-amber-100 text-amber-700' },
                { border: 'border-indigo-200', bg: 'bg-gradient-to-br from-indigo-50 to-blue-50', badge: 'bg-indigo-100 text-indigo-700' },
              ];
              const colorScheme = colors[index % colors.length];
              return (
              <article
                key={assignment.id}
                className={`h-full rounded-2xl border ${colorScheme.border} ${colorScheme.bg} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
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
                  <span className={`rounded-full ${colorScheme.badge} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
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
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--brand-secondary)]/55 bg-white/85 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-secondary)]/40 text-[color:var(--brand-dark)]/55">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">No courses assigned yet</h3>
            <p className="mt-2 text-sm text-[color:var(--brand-dark)]/65">
              Once the administrator assigns courses to you, they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      {/* Teacher Rankings Section */}
      {teacherRankings.length > 0 && (
        <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Teacher Rankings</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your performance compared to {totalTeachers} teacher{totalTeachers !== 1 ? 's' : ''} with ratings
              </p>
            </div>
            {currentTeacherRank && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Your Rank</p>
                  <p className="text-3xl font-bold text-indigo-600">#{currentTeacherRank.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Your Rating</p>
                  <p className="text-3xl font-bold text-amber-500">{currentTeacherRank.avg_rating.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {!currentTeacherRank && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
              <p className="text-sm text-amber-800">
                ℹ️ You don't have any ratings yet. Once students provide feedback, your ranking will appear here.
              </p>
            </div>
          )}

          {/* Top 10 Leaderboard */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-4">
              🏆 Top Performers
            </h3>
            {teacherRankings.slice(0, 10).map((teacher, index) => {
              const isCurrentTeacher = teacher.teacher_id === user.id;
              const medals = ['🥇', '🥈', '🥉'];
              const medal = index < 3 ? medals[index] : null;
              
              return (
                <div
                  key={teacher.teacher_id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    isCurrentTeacher
                      ? 'border-indigo-300 bg-indigo-100 ring-2 ring-indigo-400 shadow-md'
                      : 'border-slate-200 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                      isCurrentTeacher
                        ? 'bg-indigo-600 text-white'
                        : index < 3
                        ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {medal || `#${teacher.rank}`}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrentTeacher ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {teacher.full_name}
                        {isCurrentTeacher && <span className="ml-2 text-xs font-medium text-indigo-600">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {teacher.department || 'No Department'} • {teacher.total_responses} response{teacher.total_responses !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className={`text-lg font-bold ${isCurrentTeacher ? 'text-indigo-700' : 'text-slate-900'}`}>
                          {teacher.avg_rating.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">/ 5.00</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show current teacher if not in top 10 */}
            {currentTeacherRank && currentTeacherRank.rank > 10 && (
              <>
                <div className="flex items-center justify-center py-2">
                  <div className="text-xs text-slate-400">• • •</div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-indigo-300 bg-indigo-100 p-4 ring-2 ring-indigo-400 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                      #{currentTeacherRank.rank}
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-900">
                        {currentTeacherRank.full_name}
                        <span className="ml-2 text-xs font-medium text-indigo-600">(You)</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentTeacherRank.department || 'No Department'} • {currentTeacherRank.total_responses} response{currentTeacherRank.total_responses !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-lg font-bold text-indigo-700">
                          {currentTeacherRank.avg_rating.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">/ 5.00</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-800">
              💡 <strong>Rankings update in real-time</strong> based on student feedback ratings. Higher ratings and more responses improve your position.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[var(--brand-secondary)]/45">
        <h2 className="text-xl font-semibold text-[var(--brand-dark)]">Your profile snapshot</h2>
        <p className="mt-1 text-sm text-[color:var(--brand-dark)]/65">
          Keep these details current so students and administrators can reach you easily.
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