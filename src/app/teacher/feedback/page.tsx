import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FeedbackResponse {
  id: string;
  rating: number | null;
  is_anonymous: boolean;
  submitted_at: string;
  student_id: string;
  course_id: string | null;
  teacher_id: string | null;
  form_id: string | null;
  courses: {
    course_code: string | null;
    course_name: string | null;
  } | null;
  profiles: {
    full_name: string | null;
    enrollment_number: string | null;
  } | null;
  feedback_forms: {
    title: string | null;
  } | null;
  feedback_answers: Array<{
    answer_text: string | null;
    answer_rating: number | null;
    feedback_questions: {
      question_text: string | null;
      question_type: string | null;
    } | null;
  }>;
}

export default async function TeacherFeedbackPage() {
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

  // Get all feedback responses for this teacher's courses
  const { data: responses } = await supabase
    .from('feedback_responses')
    .select(`
      *,
      courses (
        course_code,
        course_name
      ),
      profiles (
        full_name,
        enrollment_number
      ),
      feedback_forms (
        title
      ),
      feedback_answers (
        answer_text,
        answer_rating,
        feedback_questions (
          question_text,
          question_type
        )
      )
    `)
    .eq('teacher_id', user.id)
    .order('submitted_at', { ascending: false });

  const feedbackResponses: FeedbackResponse[] = responses ?? [];

  // Calculate statistics
  const totalResponses = feedbackResponses.length;
  const averageRating = feedbackResponses.length > 0
    ? feedbackResponses.reduce((sum, r) => sum + (r.rating || 0), 0) / feedbackResponses.filter(r => r.rating).length
    : 0;
  
  // Group by course
  const courseGroups = feedbackResponses.reduce((acc, response) => {
    const courseCode = response.courses?.course_code || 'Unknown';
    if (!acc[courseCode]) {
      acc[courseCode] = {
        courseName: response.courses?.course_name || 'Unknown Course',
        responses: []
      };
    }
    acc[courseCode].responses.push(response);
    return acc;
  }, {} as Record<string, { courseName: string; responses: FeedbackResponse[] }>);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      {/* Header Section */}
      <section className="overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/60 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 shadow-[0_35px_90px_-55px_rgba(26,20,41,0.4)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link 
              href="/teacher"
              className="inline-flex items-center text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)] mb-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold leading-tight text-[var(--brand-dark)] sm:text-4xl">
              Student Feedback
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[color:var(--brand-dark)]/75">
              View and analyze feedback from your students to improve your teaching methods.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-blue-200 bg-blue-100/60 px-6 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-900/70">Total Responses</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">{totalResponses}</p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-100/60 px-6 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-900/70">Avg Rating</p>
              <p className="mt-2 text-2xl font-bold text-purple-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Responses by Course */}
      {Object.entries(courseGroups).length > 0 ? (
        Object.entries(courseGroups).map(([courseCode, { courseName, responses }]) => (
          <section key={courseCode} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--brand-dark)]">{courseName}</h2>
                <p className="text-sm text-[color:var(--brand-dark)]/60">{courseCode} • {responses.length} responses</p>
              </div>
            </div>

            <div className="space-y-4">
              {responses.map((response) => (
                <article
                  key={response.id}
                  className="rounded-2xl border border-[var(--brand-secondary)]/60 bg-white/90 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {response.is_anonymous ? '?' : response.profiles?.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--brand-dark)]">
                          {response.is_anonymous ? 'Anonymous Student' : response.profiles?.full_name || 'Student'}
                        </p>
                        {!response.is_anonymous && response.profiles?.enrollment_number && (
                          <p className="text-xs text-[color:var(--brand-dark)]/60">
                            {response.profiles.enrollment_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {response.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < response.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-[color:var(--brand-dark)]/60">
                        {new Date(response.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Display answers */}
                  {response.feedback_answers && response.feedback_answers.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-[var(--brand-secondary)]/30">
                      {response.feedback_answers.map((answer, idx) => (
                        <div key={idx}>
                          {answer.feedback_questions?.question_text && (
                            <p className="text-sm font-medium text-[var(--brand-dark)]/80 mb-1">
                              {answer.feedback_questions.question_text}
                            </p>
                          )}
                          {answer.answer_text && (
                            <p className="text-sm text-[color:var(--brand-dark)]/70 bg-gray-50 rounded-lg p-3">
                              {answer.answer_text}
                            </p>
                          )}
                          {answer.answer_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${i < answer.answer_rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="rounded-3xl border border-dashed border-[var(--brand-secondary)]/55 bg-white/85 p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-secondary)]/40 text-[color:var(--brand-dark)]/55">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--brand-dark)]">No feedback yet</h3>
          <p className="mt-2 text-sm text-[color:var(--brand-dark)]/65">
            Student feedback will appear here once they submit their responses.
          </p>
        </section>
      )}
    </div>
  );
}
