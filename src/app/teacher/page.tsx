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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Courses</h2>
            
            {assignments && assignments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {assignment.courses?.course_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Course Code: {assignment.courses?.course_code}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Department: {assignment.courses?.department}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Year {assignment.courses?.year}, Semester {assignment.courses?.semester}
                      </p>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          View Feedback
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                          Reports
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You have no courses assigned for this semester.
                </p>
              </div>
            )}
          </div>

          {/* Teacher Info Card */}
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
                <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.employee_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.department}</dd>
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