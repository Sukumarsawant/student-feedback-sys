import Link from "next/link";

import { leadershipTeam } from "@/data/team";
import { MemberCard } from "@/components/team/MemberCard";

export default function LeadershipPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16 text-[var(--brand-dark)] sm:px-10">
      <section className="relative overflow-hidden rounded-[40px] border border-[var(--brand-secondary)]/50 bg-[radial-gradient(circle_at_top,_rgba(53,71,212,0.12),_transparent_55%),linear-gradient(140deg,_rgba(255,255,255,0.95),_rgba(246,222,172,0.35))] px-8 py-14 shadow-[0_35px_80px_-45px_rgba(26,20,41,0.45)] sm:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4 sm:max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-primary-dark)] shadow-[0_10px_24px_-18px_rgba(26,20,41,0.6)]">
              Team · Leadership
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[var(--brand-dark)] sm:text-4xl">
              Stewards of roadmap reality, ritual design, and decision clarity.
            </h1>
            <p className="text-base leading-relaxed text-[color:var(--brand-dark)]/75">
              From ideation workshops to governance cadences, this crew curates the problems we solve and the pace we pursue. Peek into their rituals, research anchors, and open collaboration invites.
            </p>
          </div>
          <Link
            href="/team/builders"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/40 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary-dark)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            Meet the product builders →
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {leadershipTeam.map((member) => (
          <MemberCard key={member.name} member={member} tone="primary" />
        ))}
      </section>

      <section className="rounded-[32px] border border-[var(--brand-secondary)]/45 bg-white/95 px-8 py-10 shadow-[0_26px_70px_-48px_rgba(26,20,41,0.4)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 lg:max-w-3xl">
            <h2 className="text-2xl font-semibold text-[var(--brand-dark)]">How to collaborate with leadership</h2>
            <ul className="space-y-3 text-sm text-[color:var(--brand-dark)]/80">
              <li>• Share campus processes we should shadow or map.</li>
              <li>• Request roadmap alignment workshops or design critiques.</li>
              <li>• Coordinate beta programs for new analytics and dashboards.</li>
            </ul>
          </div>
          <Link
            href="mailto:feedback@campus.edu?subject=Leadership%20collaboration"
            className="btn btn-secondary"
          >
            Start a collaboration thread
          </Link>
        </div>
      </section>
    </div>
  );
}
