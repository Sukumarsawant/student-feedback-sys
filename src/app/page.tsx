import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const roleRouteMap: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role: string; full_name?: string } | null = null;
  let dashboardHref = "/login";

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
    dashboardHref = roleRouteMap[data?.role ?? ""] ?? "/student";
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--brand-secondary)]/40 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)]/60 to-white px-8 py-16 shadow-[0_45px_80px_-60px_rgba(99,122,185,0.85)] sm:px-12 sm:py-20">
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-[var(--brand-accent)]/20 blur-3xl" />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6 text-white drop-shadow-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
              Empower every voice
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A vibrant feedback loop built for campuses that never stop improving.
            </h1>
            <p className="text-base leading-relaxed text-white/90">
              Merge DBMS precision with human insights. Collect structured responses, surface trends for teachers, and give administrators the clarity to act faster.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={dashboardHref} className="btn btn-secondary">
                {user ? "Go to your dashboard" : "Get started"}
              </Link>
              <Link
                href={user ? "/feedback" : "/login"}
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore feedback forms
              </Link>
            </div>

            {profile?.full_name && (
              <p className="text-xs uppercase tracking-[0.4em] text-white/80">
                Welcome back, {profile.full_name}
              </p>
            )}
          </div>

          <div className="glass-panel relative flex w-full max-w-sm flex-col gap-5 rounded-3xl px-8 py-10 text-[var(--brand-dark)]">
            <span className="badge bg-white text-[var(--brand-dark)]">
              Why it matters
            </span>
            <p className="text-lg font-semibold">
              &ldquo;I can build forms, share them with my class, and watch feedback trends in real time.&rdquo;
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <p>Teachers see form responses across courses instantly.</p>
              <p>Admins get a top-down view of engagement and sentiment.</p>
              <p>Students trust in transparent, action-oriented improvements.</p>
            </div>
            <Link
              href="/teacher"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:text-[var(--brand-primary-dark)]"
            >
              See the teacher experience →
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-10">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-secondary)]/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-dark)]/80">
            Built for each role
          </span>
          <h2 className="text-3xl font-semibold text-[var(--brand-dark)]">What can you do with Student Feedback?</h2>
          <p className="max-w-2xl text-base text-slate-600">
            Streamline campus communication with curated tooling for students, teachers, and administrators. Database-backed automation keeps records accurate and auditable.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              title: "Students",
              description: "Share constructive feedback, track active forms, and stay in the loop with course updates.",
              cta: { href: "/feedback", label: "Submit feedback" },
              accent: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
            },
            {
              title: "Teachers",
              description: "Launch forms, monitor responses, and convert insights into classroom experiments.",
              cta: { href: "/teacher", label: "Teacher dashboard" },
              accent: "bg-[var(--brand-accent)]/15 text-[var(--brand-accent)]",
            },
            {
              title: "Administrators",
              description: "Oversee departments, assign teachers, and keep timetables aligned with student sentiment.",
              cta: { href: "/admin", label: "Admin workspace" },
              accent: "bg-[var(--brand-secondary)]/25 text-[var(--brand-dark)]",
            },
          ].map((card) => (
            <div key={card.title} className="flex h-full flex-col gap-6 rounded-3xl border border-[var(--brand-secondary)]/40 bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className={`badge ${card.accent}`}>{card.title}</span>
              <p className="text-sm text-slate-600">{card.description}</p>
              <Link
                href={card.cta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:text-[var(--brand-primary-dark)]"
              >
                {card.cta.label} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-[var(--brand-secondary)]/40 bg-white/90 p-10 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <span className="badge bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
            Teacher spotlight
          </span>
          <h3 className="text-2xl font-semibold text-[var(--brand-dark)]">
            Launch feedback forms in minutes and watch responses stream in.
          </h3>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                1
              </span>
              Draft targeted forms from curated templates or start from scratch.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                2
              </span>
              Share forms with assigned courses—students get instant notifications.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-xs font-semibold text-[var(--brand-primary)]">
                3
              </span>
              Analyse dashboards that surface response rates, sentiment, and action items.
            </li>
          </ul>
        </div>
        <div className="glass-panel flex flex-col justify-between gap-6 rounded-3xl p-7">
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-[var(--brand-dark)]">Live response snapshot</p>
            <p>Teachers see submissions roll in with sorted highlights and anonymised summaries.</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-[var(--brand-secondary)]/45 px-4 py-3 text-[var(--brand-dark)]">
              <span>Average satisfaction</span>
              <strong>4.6 / 5</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[var(--brand-primary)]/15 px-4 py-3 text-[var(--brand-primary)]">
              <span>Responses this week</span>
              <strong>128</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[var(--brand-accent)]/20 px-4 py-3 text-[var(--brand-dark)]">
              <span>Follow-up actions</span>
              <strong>6 scheduled</strong>
            </div>
          </div>
          <Link
            href="/teacher"
            className="btn btn-primary justify-center"
          >
            View teacher dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

