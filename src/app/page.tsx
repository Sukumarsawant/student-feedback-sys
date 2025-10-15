import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import StepsSlider from "@/components/StepsSlider";
import IntroWrapper from "@/components/IntroWrapper";
import ClientProviders from "@/components/ClientProviders";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
    : { data: null };

  const dashboardHref = profile
    ? profile.role === "student"
      ? "/student"
      : profile.role === "teacher"
        ? "/teacher"
        : profile.role === "admin"
          ? "/admin"
          : "/"
    : "/login";

  const exploreHref = user ? "/reviews" : "/team";
  const exploreLabel = user ? "Explore Reviews" : "Meet the Team";

  return (
    <IntroWrapper>
      <ClientProviders>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
      <section className="animated-gradient-card-hero relative overflow-hidden rounded-[44px] shadow-[0_40px_90px_-55px_rgba(26,20,41,0.45)] sm:px-12 sm:py-24 px-8 py-16">
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
              VIT -  project
            </div>
            <h1 className="text-4xl font-bold leading-snug text-white sm:text-5xl drop-shadow-lg">
              A campus feedback studio to replace forms.
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
                &ldquo;Best feedback system I&apos;ve used at VIT!&rdquo;
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

        {/* Steps Slider */}
        <StepsSlider />
      </section>

      {/* Reviews Slider Section */}
      <section id="reviews" className="space-y-8">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-secondary)]/60 px-4 py-1 text-xs font-bold tracking-[0.2em] text-[var(--brand-dark)]">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl font-bold text-[var(--brand-dark)]">What People Think</h2>
          <p className="max-w-2xl text-lg font-medium text-[var(--brand-dark)]">
            Hear from students and teachers using FeedMEbacK
          </p>
        </div>

        {/* First Row - Infinite Moving Cards (Right to Left) */}
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />

        {/* Second Row - Infinite Moving Cards (Left to Right) */}
        <InfiniteMovingCards
          items={testimonialsRow2}
          direction="left"
          speed="slow"
        />

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

      {/* Old vs New Comparison Gallery - Bigger and at the end */}
      <section className="space-y-8 py-16">
        <div className="flex flex-col gap-3 text-center">
          <span className="inline-flex w-fit mx-auto items-center gap-2 rounded-full bg-[var(--brand-accent)]/20 px-4 py-1 text-xs font-bold tracking-[0.2em] text-[var(--brand-dark)]">
            BEFORE & AFTER
          </span>
          <h2 className="text-4xl font-bold text-[var(--brand-dark)]">See the Transformation</h2>
          <p className="max-w-2xl mx-auto text-lg font-medium text-[var(--brand-dark)]">
            Hover to reveal the difference between old forms and our modern interface
          </p>
        </div>

        <div className="flex justify-center">
          <div className="comparison-gallery">
            <Image
              src="/images/old.png"
              alt="Old Google Forms Interface"
              width={1600}
              height={900}
              className="comparison-img"
              priority
            />
            <Image
              src="/images/new.png"
              alt="New Modern Feedback Interface"
              width={1600}
              height={900}
              className="comparison-img"
              priority
            />
          </div>
        </div>
      </section>
    </div>
      </ClientProviders>
    </IntroWrapper>
  );
}

const testimonials = [
  {
    quote: "This feedback system changed how we collect student responses. The interface is so smooth and the insights are invaluable for improving our courses!",
    name: "Dr. Ananya Iyer",
    title: "Professor, Computer Engineering"
  },
  {
    quote: "Finally, a platform that makes feedback feel natural. No more awkward Google Forms. This is exactly what modern education needs!",
    name: "Rahul Verma",
    title: "Student, 3rd Year CMPN"
  },
  {
    quote: "The analytics dashboard helps me understand student sentiment in real-time. I can adjust my teaching approach based on actual data. Revolutionary!",
    name: "Prof. Meera Nair",
    title: "Department Head, Mathematics"
  },
  {
    quote: "Love how anonymous yet meaningful the feedback is. I can share honest thoughts without hesitation. The UI is gorgeous too!",
    name: "Sneha Kulkarni",
    title: "Student, 2nd Year"
  },
  {
    quote: "Managing feedback across multiple departments was chaos before. This platform brings everything together beautifully. Highly recommend!",
    name: "Dr. Vikram Singh",
    title: "Dean, Engineering Faculty"
  },
  {
    quote: "The best part? It's actually fun to use! Giving feedback doesn't feel like a chore anymore. Clean, fast, and effective.",
    name: "Arjun Deshmukh",
    title: "Student, 1st Year"
  },
  {
    quote: "I've tried many feedback tools, but this one stands out. The user experience is phenomenal and the data visualization is top-notch!",
    name: "Prof. Kavita Reddy",
    title: "Associate Professor, IT"
  },
  {
    quote: "As a student representative, I appreciate how this makes our voices heard. The system is transparent and our feedback actually matters.",
    name: "Priya Joshi",
    title: "Student Council Member"
  },
];

const testimonialsRow2 = [
  {
    quote: "The response rate has doubled since we switched to this platform. Students actually enjoy giving feedback now. That says it all!",
    name: "Dr. Rajesh Gupta",
    title: "Professor, Electronics"
  },
  {
    quote: "Super intuitive design! I filled out my first feedback in under 2 minutes. No confusing questions, just straightforward and simple.",
    name: "Aditya Sharma",
    title: "Student, 2nd Year EXTC"
  },
  {
    quote: "The real-time analytics help me identify struggling students early. This tool has genuinely improved my classroom outcomes.",
    name: "Dr. Sunita Rao",
    title: "Senior Lecturer, Physics"
  },
  {
    quote: "Love the mobile-friendly interface! I can give feedback on the go, right after class when my thoughts are fresh. Super convenient.",
    name: "Neha Patil",
    title: "Student, 3rd Year MECH"
  },
  {
    quote: "Finally, a feedback system that respects everyone's time. No endless forms, no confusion. Just clean, effective communication.",
    name: "Prof. Amit Deshpande",
    title: "Head, Civil Engineering"
  },
  {
    quote: "The anonymity feature gives me confidence to share honest feedback. I know my input will help improve the learning experience for everyone.",
    name: "Karan Shah",
    title: "Student, 1st Year IT"
  },
  {
    quote: "Implementing this across our institute was seamless. The support team was amazing and teachers adapted to it in no time!",
    name: "Dr. Pooja Mehta",
    title: "Academic Coordinator"
  },
  {
    quote: "This is the future of educational feedback. Modern, efficient, and actually enjoyable to use. Can't imagine going back to old methods!",
    name: "Riya Khanna",
    title: "Student, 4th Year CMPN"
  },
];
