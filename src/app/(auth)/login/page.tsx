"use client";

import { useEffect, useState, Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const VIT_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_VIT_EMAIL_DOMAIN ?? "vit.edu.in";
const TEACHER_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN ?? VIT_EMAIL_DOMAIN;
const DEFAULT_TEACHER_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_TEACHER_PASSWORD ?? "123456";

function LoginPageContent() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [activeLoginRole, setActiveLoginRole] = useState<'student' | 'teacher'>(() => {
    const roleParam = searchParams.get("role");
    return roleParam === "teacher" ? "teacher" : "student";
  });
  const [teacherLoginName, setTeacherLoginName] = useState("");
  const [teacherPassword, setTeacherPassword] = useState(DEFAULT_TEACHER_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const trimmedTeacherLogin = teacherLoginName.trim();
  const teacherPreviewUsername = trimmedTeacherLogin.toLowerCase().replace(/[^a-z0-9]/g, "");
  const shouldShowTeacherPreview =
    activeLoginRole === "teacher" &&
    trimmedTeacherLogin.length > 0 &&
    !trimmedTeacherLogin.includes("@") &&
    teacherPreviewUsername.length > 0;

  useEffect(() => {
    const paramRole = searchParams.get("role");
    if (paramRole === "teacher" || paramRole === "student") {
      setActiveLoginRole(paramRole);
    }
  }, [searchParams]);

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
        let loginEmail = "";
        let loginPassword = "";

        if (activeLoginRole === "teacher") {
          const identifier = teacherLoginName.trim();
          if (!identifier) {
            throw new Error("Enter your teacher username or email to sign in.");
          }

          const preparedPassword = teacherPassword.trim();
          if (!preparedPassword) {
            throw new Error("Enter your teacher password to sign in.");
          }

          if (identifier.includes("@")) {
            const normalizedTeacherEmail = identifier.toLowerCase();
            if (!normalizedTeacherEmail.endsWith(`@${TEACHER_EMAIL_DOMAIN}`)) {
              throw new Error(`Teacher accounts must use @${TEACHER_EMAIL_DOMAIN} email addresses.`);
            }
            loginEmail = normalizedTeacherEmail;
          } else {
            const sanitized = identifier.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (!sanitized) {
              throw new Error("Enter a valid teacher username (letters and numbers only).");
            }
            loginEmail = `${sanitized}@${TEACHER_EMAIL_DOMAIN}`;
          }

          loginPassword = preparedPassword;
        } else {
          const normalizedStudentEmail = studentEmail.trim().toLowerCase();
          if (!normalizedStudentEmail) {
            throw new Error("Enter your student email to sign in.");
          }
          if (!normalizedStudentEmail.endsWith(`@${VIT_EMAIL_DOMAIN}`)) {
            throw new Error(`Please sign in with your institutional email (…@${VIT_EMAIL_DOMAIN}).`);
          }

          const normalizedPassword = studentPassword.trim();
          if (!normalizedPassword) {
            throw new Error("Enter your password to sign in.");
          }

          loginEmail = normalizedStudentEmail;
          loginPassword = normalizedPassword;
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', data.user?.id)
          .single();

        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        console.log('User metadata:', data.user?.user_metadata);

        // Try multiple sources for role
        let resolvedRole = '';
        
        if (profile?.role) {
          resolvedRole = profile.role.toLowerCase();
        } else if (data.user?.user_metadata?.role) {
          resolvedRole = data.user.user_metadata.role.toLowerCase();
        } else if (data.user?.app_metadata?.role) {
          resolvedRole = data.user.app_metadata.role.toLowerCase();
        }

        if (!resolvedRole) {
          throw new Error(`No role assigned to this account. Contact the administrator. User ID: ${data.user?.id}`);
        }

        // Redirect based on role
        if (resolvedRole === 'admin') {
          router.push('/admin');
        } else if (resolvedRole === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      } else {
        // Sign up - SIMPLIFIED VERSION
        const trimmedEmail = signupEmail.trim().toLowerCase();
        if (!trimmedEmail.endsWith(`@${VIT_EMAIL_DOMAIN}`)) {
          throw new Error(`Use your institutional email ending with @${VIT_EMAIL_DOMAIN} to sign up.`);
        }

        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: trimmedEmail,
            password: signupPassword,
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(53,71,212,0.16),_transparent_65%),radial-gradient(circle_at_bottom,_rgba(232,96,79,0.16),_transparent_60%),linear-gradient(120deg,_#fdf9ef,_#f6deac_45%,_#f3e3c2_72%,_#f9f6f1)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-start justify-center gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
  <div className="hidden max-w-xl flex-1 flex-col gap-6 rounded-3xl border border-white/35 bg-white/25 p-10 text-[var(--foreground)] shadow-[0_30px_70px_-35px_rgba(26,20,41,0.45)] backdrop-blur lg:flex">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-primary-dark)]">
            FeebMEbacK
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Share insights, elevate courses, celebrate great teaching.
          </h1>
          <p className="text-base leading-relaxed text-[color:var(--brand-dark)]/80">
            Every response helps teachers tailor their sessions, departments refine curricula, and classmates succeed. Sign in to continue the conversation—or create an account and join the loop of continuous improvement.
          </p>
          <div className="mt-auto grid gap-4 text-sm text-[color:var(--brand-dark)]/75">
            <div className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3">
              <p className="font-medium text-[var(--brand-dark)]">Fast dual-mode sign in</p>
              <p>Switch between student and teacher login tailored to your role.</p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3">
              <p className="font-medium text-[var(--brand-dark)]">Secure profiles</p>
              <p>Profiles sync automatically with Supabase so details stay current.</p>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-md flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/55 bg-white/92 p-8 shadow-[0_24px_60px_-28px_rgba(37,46,135,0.45)] backdrop-blur">
            <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-[color-mix(in_srgb,_var(--brand-primary)_55%,_white_45%)] blur-3xl" />
            <div className="absolute -bottom-28 left-16 h-40 w-40 rounded-full bg-[color-mix(in_srgb,_var(--brand-secondary)_60%,_white_40%)] blur-3xl" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-[var(--brand-secondary)] px-4 py-1 text-xs font-medium uppercase tracking-wide text-[var(--brand-primary-dark)]">
                {isLogin ? "Sign in" : "Create account"}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-[var(--brand-dark)]">
                {isLogin ? "Welcome back" : "Let’s get you set up"}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--brand-dark)]/65">
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
                      <label htmlFor="fullName" className="text-sm font-medium text-[color:var(--brand-dark)]/75">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-[var(--brand-secondary)]/60 bg-white px-4 py-3 text-sm font-medium text-[var(--brand-dark)] shadow-sm transition focus:border-[var(--brand-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/25"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="text-sm font-medium text-[color:var(--brand-dark)]/75">
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
                      <label htmlFor="signupEmail" className="text-sm font-medium text-slate-600">
                        Email address
                      </label>
                      <input
                        id="signupEmail"
                        name="signupEmail"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Only VIT institutional accounts are accepted (example: yourname
                        <span className="font-semibold text-slate-700">@{VIT_EMAIL_DOMAIN}</span>
                        ).
                      </p>
                    </div>

                    <div>
                      <label htmlFor="signupPassword" className="text-sm font-medium text-slate-600">
                        Password
                      </label>
                      <input
                        id="signupPassword"
                        name="signupPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Sign in as</span>
                      <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                        {[
                          { value: "student" as const, label: "Student" },
                          { value: "teacher" as const, label: "Teacher" }
                        ].map((option) => {
                          const isActive = activeLoginRole === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setActiveLoginRole(option.value);
                                setError(null);
                                setMessage(null);
                                if (option.value === "student") {
                                  setTeacherLoginName("");
                                  setTeacherPassword(DEFAULT_TEACHER_PASSWORD);
                                } else {
                                  setStudentPassword("");
                                }
                              }}
                              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                                isActive
                                  ? "bg-white text-slate-900 shadow-sm"
                                  : "text-slate-600 hover:bg-white/70"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {activeLoginRole === "student" ? (
                      <>
                        <div>
                          <label htmlFor="studentEmail" className="text-sm font-medium text-slate-600">
                            Email address
                          </label>
                          <input
                            id="studentEmail"
                            name="studentEmail"
                            type="email"
                            autoComplete="email"
                            required
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Sign in with your
                            <span className="font-semibold text-slate-700"> @{VIT_EMAIL_DOMAIN}</span> student email.
                          </p>
                        </div>

                        <div>
                          <label htmlFor="studentPassword" className="text-sm font-medium text-slate-600">
                            Password
                          </label>
                          <input
                            id="studentPassword"
                            name="studentPassword"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={studentPassword}
                            onChange={(e) => setStudentPassword(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                            required
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Default teacher password is
                            <span className="font-semibold text-slate-700"> {DEFAULT_TEACHER_PASSWORD}</span> (update with admin support if changed).
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
                    setActiveLoginRole("student");
                    setTeacherLoginName('');
                    setTeacherPassword(DEFAULT_TEACHER_PASSWORD);
                    setStudentEmail('');
                    setStudentPassword('');
                    setSignupEmail('');
                    setSignupPassword('');
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
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
