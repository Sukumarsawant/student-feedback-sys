"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEACHER_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN ?? "teachers.feedback.local";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student');
  const [teacherLoginName, setTeacherLoginName] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const trimmedTeacherLogin = teacherLoginName.trim();
  const teacherPreviewUsername = trimmedTeacherLogin.toLowerCase().replace(/[^a-z0-9]/g, '');
  const shouldShowTeacherPreview =
    loginRole === 'teacher' &&
    trimmedTeacherLogin.length > 0 &&
    !trimmedTeacherLogin.includes('@') &&
    teacherPreviewUsername.length > 0;

  function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error("Request timed out after 5s")), ms);
      promise
        .then((value) => {
          clearTimeout(id);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        let loginEmail = email.trim();
        let loginPassword = password;

        if (loginRole === 'teacher') {
          const identifier = teacherLoginName.trim();
          if (!identifier) {
            throw new Error('Enter your teacher username or email to sign in.');
          }

          const providedPassword = teacherPassword.trim();

          if (identifier.includes('@')) {
            loginEmail = identifier.toLowerCase();
            if (!providedPassword) {
              throw new Error('Enter your teacher password to sign in.');
            }
            loginPassword = providedPassword;
          } else {
            const sanitized = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!sanitized) {
              throw new Error('Enter a valid teacher username (letters and numbers only).');
            }
            loginEmail = `${sanitized}@${TEACHER_EMAIL_DOMAIN}`;
            loginPassword = providedPassword || sanitized;
          }
        }

        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword
          }),
          5000
        );

        if (error) throw error;

        // Get user profile to redirect to appropriate dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user?.id)
          .single();

        const resolvedRole = (profile?.role || data.user?.user_metadata?.role || "").toString().toLowerCase();

        if (!resolvedRole) {
          throw new Error('No role assigned to this account. Contact the administrator.');
        }

        if (resolvedRole === 'admin') {
          router.push('/admin');
        } else if (resolvedRole === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      } else {
        // Sign up - SIMPLIFIED VERSION
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: role,
                department: department,
                enrollment_number: role === 'student' ? enrollmentNumber : null,
                year: role === 'student' ? year : null
              }
            }
          }),
          5000
        );

        if (error) throw error;

        if (data.user) {
          setMessage("Account created successfully! Please check your email to verify your account.");
          // The trigger will automatically create the profile
          // No manual profile insertion needed
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#6366f11a,_transparent_60%),radial-gradient(circle_at_bottom,_#8b5cf614,_transparent_55%),linear-gradient(120deg,_#0f172a,_#1e1b4b_45%,_#312e81_70%,_#1e40af)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-start justify-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden max-w-xl flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.65)] backdrop-blur lg:flex">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-100">
            Student feedback system
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Share insights, elevate courses, celebrate great teaching.
          </h1>
          <p className="text-base leading-relaxed text-indigo-100/80">
            Every response helps teachers tailor their sessions, departments refine curricula, and classmates succeed. Sign in to continue the conversation—or create an account and join the loop of continuous improvement.
          </p>
          <div className="mt-auto grid gap-4 text-sm text-indigo-50/80">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="font-medium text-white">Fast dual-mode sign in</p>
              <p>Switch between student and teacher login tailored to your role.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="font-medium text-white">Secure profiles</p>
              <p>Profiles sync automatically with Supabase so details stay current.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-md flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-8 shadow-[0_20px_40px_-20px_rgba(30,64,175,0.45)] backdrop-blur">
            <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-indigo-200/60 blur-3xl" />
            <div className="absolute -bottom-28 left-16 h-40 w-40 rounded-full bg-purple-200/60 blur-3xl" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
                {isLogin ? "Sign in" : "Create account"}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                {isLogin ? "Welcome back" : "Let’s get you set up"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isLogin
                  ? "Access your personalised dashboard in just a couple of clicks."
                  : "Create a student profile to start sharing feedback instantly."}
              </p>
            </div>

            <form className="relative mt-8 space-y-6" onSubmit={handleAuth}>
              <div className="space-y-5">
                {!isLogin ? (
                  <>
                    <div>
                      <label htmlFor="fullName" className="text-sm font-medium text-slate-600">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="text-sm font-medium text-slate-600">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="student">Student</option>
                      </select>
                      <p className="mt-2 text-xs text-slate-500">
                        Teacher accounts are provisioned by the administration team.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="department" className="text-sm font-medium text-slate-600">
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="">Select department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="English">English</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="enrollmentNumber" className="text-sm font-medium text-slate-600">
                          Enrollment number
                        </label>
                        <input
                          id="enrollmentNumber"
                          name="enrollmentNumber"
                          type="text"
                          value={enrollmentNumber}
                          onChange={(e) => setEnrollmentNumber(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="year" className="text-sm font-medium text-slate-600">
                          Year
                        </label>
                        <select
                          id="year"
                          name="year"
                          value={year}
                          onChange={(e) => setYear(parseInt(e.target.value))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value={1}>1st year</option>
                          <option value={2}>2nd year</option>
                          <option value={3}>3rd year</option>
                          <option value={4}>4th year</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-slate-600">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-slate-600">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="loginRole" className="text-sm font-medium text-slate-600">
                        Sign in as
                      </label>
                      <select
                        id="loginRole"
                        name="loginRole"
                        value={loginRole}
                        onChange={(e) => {
                          const nextRole = e.target.value as 'student' | 'teacher';
                          setLoginRole(nextRole);
                          if (nextRole === 'student') {
                            setTeacherLoginName('');
                            setTeacherPassword('');
                          } else {
                            setPassword('');
                          }
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>

                    {loginRole === 'student' ? (
                      <>
                        <div>
                          <label htmlFor="email" className="text-sm font-medium text-slate-600">
                            Email address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="text-sm font-medium text-slate-600">
                            Password
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="teacherUsername" className="text-sm font-medium text-slate-600">
                            Teacher username or email
                          </label>
                          <input
                            id="teacherUsername"
                            name="teacherUsername"
                            type="text"
                            required
                            value={teacherLoginName}
                            onChange={(e) => setTeacherLoginName(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          {shouldShowTeacherPreview && (
                            <p className="mt-2 text-xs text-slate-500">
                              We’ll sign you in as <span className="font-semibold text-slate-700">{`${teacherPreviewUsername}@${TEACHER_EMAIL_DOMAIN}`}</span>.
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="teacherPassword" className="text-sm font-medium text-slate-600">
                            Password
                          </label>
                          <input
                            id="teacherPassword"
                            name="teacherPassword"
                            type="password"
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="Leave blank if it matches your username"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Admins can reset your password. Leave this blank if you use the default (username) password.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-600 shadow-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-600 shadow-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
              </button>

              <div className="space-y-3 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLoginRole('student');
                    setTeacherLoginName('');
                    setTeacherPassword('');
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">or</p>
                <Link
                  href="/admin-login"
                  className="inline-flex items-center justify-center text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                >
                  Admin login →
                </Link>
              </div>
            </form>
          </div>
          <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.35em] text-indigo-100/70 lg:text-left">
            Powered by Supabase · Secure sessions by Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
