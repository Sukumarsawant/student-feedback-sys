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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {profile.full_name}</span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Feedback Forms</h2>
            
            {forms && forms.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {forms.map((form) => (
                  <div key={form.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Course: {form.courses?.course_name} ({form.courses?.course_code})
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {form.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Due: {new Date(form.end_date).toLocaleDateString()}
                        </span>
                        <a
                          href={`/feedback/${form.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Fill Feedback
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback forms available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no active feedback forms for you to fill.
                </p>
              </div>
            )}
          </div>

          {/* Student Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Enrollment Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.enrollment_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Year</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.year}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.role}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}