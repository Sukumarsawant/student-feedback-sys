import Link from "next/link";
import Image from "next/image";
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

  let profileRole: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    profile = data;
    profileRole = data?.role ?? user.user_metadata?.role ?? null;
    dashboardHref = roleRouteMap[(profileRole ?? "").toLowerCase()] ?? "/student";
  }

  const exploreHref = !user
    ? "/login"
    : (profileRole ?? "").toLowerCase() === "student"
    ? "/feedback"
    : "/analytics";

  const exploreLabel = !user
    ? "Explore feedback forms"
    : (profileRole ?? "").toLowerCase() === "student"
    ? "Explore feedback forms"
    : "Open analytics";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
      {/* Hero Section with Classroom Background */}
      <section className="relative overflow-hidden rounded-[44px] border border-[var(--brand-secondary)]/50 shadow-[0_40px_90px_-55px_rgba(26,20,41,0.45)] sm:px-12 sm:py-24 px-8 py-16">
        {/* Classroom Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero/classroom.jpg"
            alt="VIT Classroom"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-dark)]/85 via-[var(--brand-dark)]/75 to-[var(--brand-primary)]/60" />
        </div>

        <div className="relative z-10 flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-primary)] shadow-lg backdrop-blur-sm">
              VIT - DBMS project
            </div>
            <h1 className="text-4xl font-bold leading-snug text-white sm:text-5xl drop-shadow-lg">
              A campus feedback studio that to replace forms.
            </h1>
            <p className="text-base leading-relaxed text-white/95 sm:text-lg font-medium drop-shadow-md">
              why the hassle to fill google forms ?
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={dashboardHref} className="btn btn-primary">
                {user ? "Go to your dashboard" : "Start collecting feedback"}
              </Link>
              <Link
                href={exploreHref}
                className="btn"
              >
                {exploreLabel}
              </Link>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md px-4 py-3 shadow-xl">
                <dt className="text-xs uppercase tracking-[0.28em] text-white/90 font-semibold">students using</dt>
                <dd className="text-xl font-bold text-white">100+</dd>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md px-4 py-3 shadow-xl">
                <dt className="text-xs uppercase tracking-[0.28em] text-white/90 font-semibold">dept included</dt>
                <dd className="text-xl font-bold text-white">1</dd>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md px-4 py-3 shadow-xl">
                <dt className="text-xs uppercase tracking-[0.28em] text-white/90 font-semibold">Teachers</dt>
                <dd className="text-xl font-bold text-white">6</dd>
              </div>
            </dl>

            {profile?.full_name && (
              <p className="text-xs uppercase tracking-[0.4em] text-white/90 font-semibold">
                Welcome back, {profile.full_name}
              </p>
            )}
          </div>

          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 -z-10 blur-[60px]">
              <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-white/30" />
              <div className="absolute inset-y-0 right-0 w-1/2 rounded-full bg-[var(--brand-accent)]/40" />
            </div>

            <div className="relative flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 backdrop-blur-md p-4 pr-8 shadow-2xl">
                <Image
                  src="/images/vit/vitimg.jpeg"
                  alt="Preview of VIT dashboard"
                  width={400}
                  height={320}
                  className="h-auto w-full rounded-xl"
                  priority
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white shadow-lg">
                  credits: VIT 
                </div>
              </div>

              <div className="flex items-center justify-center rounded-3xl border border-white/40 bg-white/95 backdrop-blur-md p-6 shadow-2xl">
                <Image
                  src="/images/vit/VIT.png"
                  alt="VIT Logo"
                  width={400}
                  height={100}
                  className="h-auto w-full max-w-[280px] object-contain"
                  priority
                />
              </div>
            </div>

            <div className="absolute -right-6 top-4 hidden rotate-[3deg] rounded-2xl border-2 border-white/60 bg-white/98 backdrop-blur-md px-4 py-3 shadow-xl lg:block max-w-[200px]">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-sm">★</span>
                ))}
              </div>
              <p className="text-xs font-semibold text-[var(--brand-dark)] leading-relaxed">
                "Best feedback system I've used at VIT!"
              </p>
              <p className="text-[10px] font-bold text-[var(--brand-primary)] mt-2 uppercase tracking-wider">
                - Student, CMPN
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="space-y-8">
        <div className="flex flex-col gap-3 text-center">
          <span className="inline-flex w-fit mx-auto items-center gap-2 rounded-full bg-[var(--brand-primary)]/10 px-4 py-1 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary)]">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl font-bold text-[var(--brand-dark)]">Simple Steps to Better Feedback</h2>
          <p className="max-w-2xl mx-auto text-lg font-medium text-[var(--brand-dark)]">
            Get started in minutes. No complicated setup required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Sign In",
              description: "Login with your VIT email. Students, teachers, and admins all have their own portals.",
              icon: "👤",
              color: "from-blue-500 to-indigo-600"
            },
            {
              step: "2",
              title: "Create or Fill Forms",
              description: "Teachers launch feedback forms. Students receive instant notifications and submit responses.",
              icon: "📝",
              color: "from-purple-500 to-pink-600"
            },
            {
              step: "3",
              title: "View Analytics",
              description: "Teachers get live dashboards with response rates, sentiment analysis, and actionable insights.",
              icon: "📊",
              color: "from-green-500 to-emerald-600"
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="glass-card rounded-3xl p-8 hover-lift border-2 border-white relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
              
              {/* Content */}
              <div className="relative space-y-4">
                {/* Icon and Step Number */}
                <div className="flex items-center justify-between">
                  <div className="text-5xl">{item.icon}</div>
                  <div className={`h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white font-bold text-xl shadow-lg`}>
                    {item.step}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-[var(--brand-dark)]">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-base font-medium text-[var(--brand-dark)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Slider Section */}
      <section id="reviews" className="space-y-8">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-secondary)]/60 px-4 py-1 text-xs font-bold tracking-[0.2em] text-[var(--brand-dark)]">
            WHAT PEOPLE SAY
          </span>
          <h2 className="text-4xl font-bold text-[var(--brand-dark)]">Real Feedback from Real Users</h2>
          <p className="max-w-2xl text-lg font-medium text-[var(--brand-dark)]">
            See what students and teachers think about FeebMEbacK
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Priya Sharma",
              role: "Student, 2nd Year CMPN",
              rating: 5,
              review: "Finally, a feedback system that actually works! Super easy to share thoughts about courses without any hassle.",
              color: "from-blue-50 to-indigo-50"
            },
            {
              name: "Dr. Rajesh Kumar",
              role: "Professor, Computer Science",
              rating: 5,
              review: "Love how I can see real-time responses. Helps me adjust my teaching methods instantly. Game changer!",
              color: "from-purple-50 to-pink-50"
            },
            {
              name: "Amit Patel",
              role: "Student, 3rd Year",
              rating: 4,
              review: "Clean interface, quick submissions. Feels modern and actually respects my time. Would recommend.",
              color: "from-green-50 to-emerald-50"
            },
            {
              name: "Mrs. Sunita Desai",
              role: "Teacher, Mathematics",
              rating: 5,
              review: "The analytics dashboard is brilliant. I can spot patterns and improve my classes based on solid data.",
              color: "from-yellow-50 to-orange-50"
            },
            {
              name: "Rohan Mehta",
              role: "Student, 1st Year",
              rating: 5,
              review: "No more boring forms! This makes giving feedback feel natural, like having a real conversation.",
              color: "from-red-50 to-rose-50"
            },
            {
              name: "Prof. Kavita Singh",
              role: "Head of Department",
              rating: 5,
              review: "Managing feedback across departments used to be chaos. Now everything is organized and accessible.",
              color: "from-cyan-50 to-blue-50"
            }
          ].map((review, index) => (
            <div 
              key={index} 
              className={`glass-card rounded-2xl p-6 hover-lift bg-gradient-to-br ${review.color} border-2 border-white`}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-xl ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-[var(--brand-dark)] text-base font-medium mb-6 leading-relaxed">
                "{review.review}"
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--brand-dark)]/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-lg font-bold text-[var(--brand-primary)]">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[var(--brand-dark)]">{review.name}</p>
                  <p className="text-sm font-medium text-[var(--brand-dark)]">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link 
            href="/reviews" 
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-[var(--brand-primary-dark)] transition hover-lift"
          >
            See All Reviews →
          </Link>
        </div>
      </section>
    </div>
  );
}

